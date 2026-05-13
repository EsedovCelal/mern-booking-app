import { useForm } from "react-hook-form";
import type { UserType } from "../../../../backend/src/shared/types";
import { useSearchContext } from "../../contexts/SearchContext";
import { useParams } from "react-router-dom";

type Props = {
  currentUser: UserType;
  paymentIntent: {
    totalCost: number;
    paymentIntentId?: string;
    orderId?: string;
  };
  onSubmit: (formData: BookingFormData) => Promise<void>;
  children?: React.ReactNode;
  isLoading?: boolean;
  paymentMethod: "stripe" | "paypal";
};

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  adultCount: string;
  childCount: string;
  checkIn: string;
  checkOut: string;
  hotelId: string;
  totalCost: number;

  paymentMethod: "stripe" | "paypal";
  paymentIntentStripeId?: string;
  paypalOrderId?: string;
};

const BookingForm = ({
  currentUser,
  paymentIntent,
  onSubmit,
  children,
  isLoading,
  paymentMethod,
}: Props) => {
  const search = useSearchContext();
  const { hotelId } = useParams();

  const { register, handleSubmit } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      adultCount: search.adultCount.toString(),
      childCount: search.childCount.toString(),
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      hotelId,
      totalCost: paymentIntent.totalCost,
      paymentIntentStripeId: paymentIntent.paymentIntentId,
      paypalOrderId: paymentIntent.orderId,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-5 rounded-lg border border-slate-300 p-5"
    >
      <span className="text-3xl font-bold ">Confirm You Details</span>
      <div className="grid grid-cols-1 gap-6 ">
        <label className="text-grey-700 text-sm font-bold flex-1">
          First Name
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-grey-700 bg-gray-200 font-bold"
            type="text"
            readOnly
            disabled
            {...register("firstName")}
          />
        </label>
        <label className="text-grey-700 text-sm font-bold flex-1">
          Last Name
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-grey-700 bg-gray-200 font-bold"
            type="text"
            readOnly
            disabled
            {...register("lastName")}
          />
        </label>
        <label className="text-grey-700 text-sm font-bold flex-1">
          Email
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-grey-700 bg-gray-200 font-bold"
            type="text"
            readOnly
            disabled
            {...register("email")}
          />
        </label>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Your Price summary</h2>
        <div className="bg-blue-200 p-4 rounded-md">
          <div className="font-semibold text-lg">
            Total Cost: ${paymentIntent.totalCost?.toFixed(2)}
          </div>
          <div className="text-xs">Includes taxes and charges</div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Payment Details </h3>
        {children}
      </div>
      {paymentMethod === "stripe" && (
        <div className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-md disabled:bg-grey-500"
          >
            {isLoading ? "Saving..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </form>
  );
};

export default BookingForm;
