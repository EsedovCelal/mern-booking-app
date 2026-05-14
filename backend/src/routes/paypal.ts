import express, { Request, Response } from "express";
import got from "got";

import type {
  PayPalCreateOrderResponse,
  PayPalCaptureResponse,
} from "../shared/types";

const paypalBaseUrl = process.env.PAYPAL_BASE_URL as string;
const paypalClientId = process.env.PAYPAL_CLIENT_ID as string;
const paypalSecret = process.env.PAYPAL_SECRET as string;
const paypalRedirectBaseUrl = process.env.PAYPAL_REDIRECT_BASE_URL;
const router = express.Router();
import Hotel from "../models/hotel";

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
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }

    const { numberOfNights } = req.body;
    const totalCost = numberOfNights * hotel.pricePerNight;

    const getId = await got.post(`${paypalBaseUrl}/v2/checkout/orders`, {
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
                quantity: numberOfNights,
                unit_amount: {
                  currency_code: "USD",
                  value: hotel.pricePerNight,
                },
              },
            ],
            amount: {
              currency_code: "USD",
              value: totalCost.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: totalCost,
                },
              },
            },
          },
        ],
        application_context: {
          return_url: `${paypalRedirectBaseUrl}/complete-payment/${hotelId}`,
          cancel_url: `${paypalRedirectBaseUrl}/cancel-payment/`,
          brand_name: "StayNest",
          locale: "en-US",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      },
      responseType: "json",
    });

    const body = getId.body as PayPalCreateOrderResponse;
    const response = {
      orderId: body.id,
      totalCost,
      hotel,
    };

    res.send(response);
  } catch (error) {
    if (error instanceof got.HTTPError) {
      console.log(
        "PayPal HTTP Error:",
        JSON.stringify(error.response.body, null, 2),
      );
      return res.status(422).json({ error: error.response.body });
    }

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
      `${paypalBaseUrl}/v2/checkout/orders/${paymentId}/capture`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "json",
      },
    );

    const paymentData = response.body as PayPalCaptureResponse;

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
      message: "success",
      users: {
        email,
        tier: "pro",
        tierEndAt,
      },
    });
  } catch (err) {
    res.status(500).json({ err: "Internal server error." });
  }
};

router.post("/create-order/:hotelId", createOrder);
router.get("/capture-payment/:paymentId", capturePayment);

export default router;
