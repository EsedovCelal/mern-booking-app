import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";

const Detail = () => {
  const { hotelId } = useParams();
  const { data: hotel } = useQuery({
    queryKey: ["fetchHotelById"],
    queryFn: () => apiClient.fetchHotelById(hotelId as string),

    enabled: !!hotelId,
  });
  if (!hotel) {
    return <></>;
  }
  return (
    <div className="space-y-6 px-4 md:px-0">
      <div>
        <span className="flex">
          {Array.from({ length: hotel.starRating }).map((_, index) => (
            <AiFillStar className="fill-yellow-400" key={index} />
          ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
      </div>
      <div
        className={`${hotel.imageUrls.length === 1 && "lg:grid-cols-1"} ${hotel.imageUrls.length === 2 && "lg:grid-cols-2"} ${hotel.imageUrls.length >= 3 && "lg:grid-cols-3"} grid grid-col-1 gap-4`}
      >
        {hotel.imageUrls.map((image, index) => (
          <div className="h-[300px]" key={index}>
            <img
              src={image}
              alt={hotel.name}
              className="rounded-md w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {hotel.facilities.map((facility, index) => (
          <div className="border border-slate-300 rounded-sm p-3" key={index}>
            {facility}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="whitespace-pre-line pb-3 lg:pr-3">
          {hotel.description}
        </div>
        <div className="h-fit">
          <GuestInfoForm
            hotelId={hotel._id}
            pricePerNight={hotel.pricePerNight}
          />
        </div>
      </div>
    </div>
  );
};

export default Detail;
