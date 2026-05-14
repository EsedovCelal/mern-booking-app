import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useSearchContext } from "../contexts/SearchContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeCardElement } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";
import type { BookingFormData } from "../forms/BookingForm/BookingForm";
import type {
  StripePaymentIntentResponse,
  UserType,
} from "../../../backend/src/shared/types";
import PayPalPayment from "../components/PayPalPayment";
import { ThreeDot } from "react-loading-indicators";

const Booking = () => {
  const [selectedPayment, setSelectedPayment] = useState<"stripe" | "paypal">(
    "stripe",
  );
  const { stripePromise } = useAppContext();
  const search = useSearchContext();
  const { hotelId } = useParams();

  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  useEffect(() => {
    if (search.checkIn && search.checkOut) {
      const nights = Math.abs(
        (search.checkOut.getTime() - search.checkIn.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      setNumberOfNights(Math.ceil(nights));
    }
  }, [search.checkIn, search.checkOut]);

  const { data: paymentIntentData } = useQuery({
    queryKey: ["createPaymentIntent"],
    queryFn: () =>
      apiClient.createPaymentIntent(
        hotelId as string,
        numberOfNights.toString(),
      ),
    enabled: !!hotelId && numberOfNights > 0,
  });

  const { data: PaypalPaymentIntent } = useQuery({
    queryKey: ["createPayPalOrder"],
    queryFn: () =>
      apiClient.createPayPalOrder({
        hotelId: hotelId as string,
        numberOfNights,
      }),
    enabled: !!hotelId && numberOfNights > 0,
  });
  console.log("PaypalPaymentIntent", PaypalPaymentIntent);

  const { data: hotel } = useQuery({
    queryKey: ["fetchHotelById"],
    queryFn: () => apiClient.fetchHotelById(hotelId as string),
    enabled: !!hotelId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["fetchCurrentUser"],
    queryFn: apiClient.fetchCurrentUser,
  });

  if (!hotel) {
    return <></>;
  }
  const StripeBookingForm = ({
    currentUser,
    paymentIntent,
  }: {
    currentUser: UserType;
    paymentIntent: StripePaymentIntentResponse;
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { showToast } = useAppContext();

    const { mutate: bookRoom, isPending: isLoading } = useMutation({
      mutationFn: apiClient.createRoomBooking,
      onSuccess: () => showToast({ message: "Booking saved", type: "SUCCESS" }),
      onError: () =>
        showToast({ message: "Error saving booking", type: "ERROR" }),
    });

    const handleStripeSubmit = async (formData: BookingFormData) => {
      if (!stripe || !elements) return;

      const result = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement) as StripeCardElement,
          },
        },
      );

      if (result.paymentIntent?.status === "succeeded") {
        bookRoom({
          ...formData,
          paymentMethod: "stripe",
          paymentIntentStripeId: result.paymentIntent.id,
        });
      }
    };

    return (
      <BookingForm
        currentUser={currentUser}
        paymentIntent={paymentIntent}
        onSubmit={handleStripeSubmit}
        isLoading={isLoading}
        paymentMethod={selectedPayment}
      >
        <CardElement
          id="payment-element"
          className="border rounded-md p-2 text-sm"
        />
      </BookingForm>
    );
  };
  const PayPalBookingForm = ({
    currentUser,
    PaypalPaymentIntent,
    numberOfNights,
  }: {
    currentUser: UserType;
    PaypalPaymentIntent: {
      orderId: string;
      totalCost: number;
    };
    numberOfNights: number;
  }) => {
    const { showToast } = useAppContext();
    const search = useSearchContext();
    const { mutate: bookRoom, isPending: isLoading } = useMutation({
      mutationFn: apiClient.createRoomBooking,
      onSuccess: () => showToast({ message: "Booking saved", type: "SUCCESS" }),
      onError: () =>
        showToast({ message: "Error saving booking", type: "ERROR" }),
    });

    const handlePayPalApprove = (orderId: string) => {
      bookRoom({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        hotelId: hotelId as string,
        totalCost: PaypalPaymentIntent.totalCost,
        checkIn: search.checkIn.toISOString(),
        checkOut: search.checkOut.toISOString(),
        adultCount: search.adultCount.toString(),
        childCount: search.childCount.toString(),
        paymentMethod: "paypal",
        paypalOrderId: orderId,
      });
    };

    return (
      <BookingForm
        currentUser={currentUser}
        paymentIntent={PaypalPaymentIntent}
        onSubmit={async () => {}}
        isLoading={isLoading}
        paymentMethod={selectedPayment}
      >
        <PayPalPayment
          numberOfNights={numberOfNights}
          onApproveSuccess={handlePayPalApprove}
          hotelId={hotelId as string}
        />
      </BookingForm>
    );
  };
  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <BookingDetailsSummary
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        adultCount={search.adultCount}
        childCount={search.childCount}
        numberOfNights={numberOfNights}
        hotel={hotel}
      />

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPayment("stripe")}
            className={`flex-1 p-3 border-2 rounded-lg font-semibold transition-colors ${
              selectedPayment === "stripe"
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            💳 Credit Card
          </button>
          <button
            onClick={() => setSelectedPayment("paypal")}
            className={`flex-1 p-3 border-2 rounded-lg font-semibold transition-colors ${
              selectedPayment === "paypal"
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            🅿️ PayPal
          </button>
        </div>
        {selectedPayment === "stripe" &&
          (currentUser && paymentIntentData ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: paymentIntentData.clientSecret }}
              key={paymentIntentData.clientSecret}
            >
              <StripeBookingForm
                currentUser={currentUser}
                paymentIntent={paymentIntentData}
              />
            </Elements>
          ) : (
            <div className="flex justify-center items-center h-full w-full">
              <ThreeDot variant="bounce" color="#c8d5c8" size="medium" />
            </div>
          ))}
        {selectedPayment === "paypal" &&
          (currentUser && PaypalPaymentIntent ? (
            <PayPalBookingForm
              currentUser={currentUser}
              PaypalPaymentIntent={PaypalPaymentIntent}
              numberOfNights={numberOfNights}
            />
          ) : (
            <div className="flex justify-center items-center h-full w-full">
              <ThreeDot variant="bounce" color="#4753e6" size="medium" />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Booking;
