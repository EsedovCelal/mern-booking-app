import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({
      bookings: {
        $elemMatch: {
          userId: req.userId,
        },
      },
    });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId,
      );

      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

router.get("/:paymentId", verifyToken, async (req: Request, res: Response) => {
  console.log("Fetching completed payment with ID:", req.params.paymentId);
  const completedPayment = await Hotel.find({
    bookings: {
      $elemMatch: {
        paypalOrderId: req.params.paymentId,
      },
    },
  });

  res.json(completedPayment[0]);
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

export default router;
