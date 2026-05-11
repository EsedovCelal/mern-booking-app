import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";
import got from "got";

import type { PayPalCreateOrderResponse } from "../shared/types";
import { access } from "fs";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);
const paypalBaseUrl = process.env.PAYPAL_BASEURL as string;
const paypalClientId = process.env.PAYPAL_CLIENTID as string;
const paypalSecret = process.env.PAYPAL_SECRET as string;
const paypalRedirectBaseUrl = process.env.PAYPAL_REDIRECT_BASE_URL;

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOption = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOption = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOption = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOption = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1",
    );

    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);
    const total = await Hotel.find(query).sort(sortOption).countDocuments();

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  },
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }

    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "gbp",
      metadata: {
        hotelId: hotelId as string,
        userId: req.userId,
      },
    });

    if (!paymentIntent.client_secret) {
      return res.status(500).json({ message: "Error creating payment intent" });
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };
    res.send(response);
  },
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string,
      );

      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status} `,
        });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
      };

      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.hotelId },
        {
          $push: { bookings: newBooking },
        },
        { new: true },
      );

      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }

      await hotel.save();

      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice),
    };
  }
  return constructedQuery;
};

const getAccessTokenPaypal = async () => {
  try {
    const response = await got.post(`${paypalBaseUrl}/v1/oauth2/token`, {
      form: {
        grant_type: "client_credentials",
      },
      username: paypalClientId,
      password: paypalSecret,
    });

    const data = JSON.parse(response.body);
    const newAccessToken = data.access_token;
    return newAccessToken;
  } catch (error) {
    throw new Error(error as string);
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessTokenPaypal();

    const response = await got.post(`${paypalBaseUrl}/v2/checkout/orders`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      json: {
        intent: "CAPTURE",
        purchase_units: [
          {
            items: [
              {
                name: "Volatility Grid",
                description:
                  "Interactive volatilities dashboard for cryptocurrencies.",
                quantity: "1",
                unit_amount: {
                  currency_code: "USD",
                  value: "50.00",
                },
              },
            ],
            amount: {
              currency_code: "USD",
              value: "50.00",
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: "50.00",
                },
              },
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              payment_method_selected: "PAYPAL",
              brand_name: "StayNest",
              shipping_preference: "NO_SHIPPING",
              locale: "en-US",
              user_action: "PAY_NOW",
              return_url: `${paypalRedirectBaseUrl}/complete-payment`,
              cancel_url: `${paypalRedirectBaseUrl}/cancel-payment`,
            },
          },
        },
      },
      responseType: "json",
    });

    console.log(response.body);
    const body = response.body as PayPalCreateOrderResponse;
    const orderId = body.id;

    return res.status(200).json({ orderId });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Paypal Error", error.message);
    }
    res.status(500).json({ error: "internal server error." });
  }
};

const capturePayment = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessTokenPaypal();

    const { paymentId } = req.params;

    const response = await got.post(
      `${paypalBaseUrl}/v2/checkout/orders${paymentId}/capture`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "json",
      },
    );

    const paymentData = response.body;

    console.log(paymentData);
    /* 
    if (paymentData.status !== "COMPLETED") {
      return res
        .status(400)
        .json({ error: "Paypal payment incomplete or failed" });
    }

    const email = "esedov.celal@mail.com";
    const daysToExtend = 30;
    const currentDate = new Date();
    const tierEndAt = new Date(
      currentDate.setDate(currentDate.getDate() + daysToExtend),
    );

    return res.status(200).json({
      message: "succes",
      users: {
        email,
        tier: "pro",
        tierEndAt,
      },
    }); */
  } catch (err) {
    res.status(500).json({ err: "Internal server error." });
  }
};

router.post("/createorder", createOrder);
router.get("/capturepayment/:paymentId", capturePayment);

export default router;
