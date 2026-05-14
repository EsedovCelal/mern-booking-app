import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useParams, Link } from "react-router-dom";
import {
  AiFillCheckCircle,
  AiOutlineCalendar,
  AiOutlineUser,
} from "react-icons/ai";

const CompletePayment = () => {
  const { paymentId } = useParams();

  const {
    data: hotel,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fetchCompletedPayment", paymentId],
    queryFn: () => apiClient.fetchCompletedPayment(paymentId as string),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-500">
          Something went wrong!
        </h2>
        <p>We couldn't find your payment details. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-50 p-6 border-b border-green-100 flex flex-col items-center text-center">
          <AiFillCheckCircle className="text-green-500 text-6xl mb-2" />
          <h1 className="text-3xl font-bold text-slate-800">
            Booking Confirmed!
          </h1>
          <p className="text-slate-600 mt-1">
            Your stay at <span className="font-semibold">{hotel.name}</span> is
            all set.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 border-r border-slate-200">
            <img
              src={hotel.imageUrls[0]}
              alt={hotel.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold">{hotel.name}</h2>
            <p className="text-slate-500 text-sm">
              {hotel.city}, {hotel.country}
            </p>

            <div className="mt-4 flex gap-2">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ★
                </span>
              ))}
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {hotel.type}
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-50">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">
              Stay Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AiOutlineUser className="text-slate-400 text-xl" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Guests
                  </p>
                  <p className="text-sm">
                    {hotel.adultCount} Adults, {hotel.childCount} Children
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AiOutlineCalendar className="text-slate-400 text-xl" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Status
                  </p>
                  <p className="text-sm font-medium text-green-700">
                    Payment Successful
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-600 font-medium">Total Paid:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${hotel.pricePerNight}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/my-bookings"
                  className="bg-blue-600 text-white text-center py-2 rounded font-bold hover:bg-blue-700 transition"
                >
                  View My Bookings
                </Link>
                <Link
                  to="/search"
                  className="text-blue-600 text-center py-2 text-sm font-bold hover:underline"
                >
                  Back to Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletePayment;
