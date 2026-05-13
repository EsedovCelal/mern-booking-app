export type UserType = {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type HotelType = {
  _id: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageUrls: string[];
  lastUpdated: Date;
  bookings: BookingType[];
};
export type BookingType = {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  paymentMethod: "stripe" | "paypal";
  paymentIntentStripeId?: string;
  paypalOrderId?: string;
};

export type HotelSearchResponse = {
  data: HotelType[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type StripePaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  totalCost: number;
};

export type PayPalLink = {
  href: string;
  rel: "self" | "payer-action" | string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
};

export type PayPalCreateOrderResponse = {
  id: string;
  status: "PAYER_ACTION_REQUIRED" | "CREATED" | "APPROVED" | "COMPLETED";
  payment_source: {
    paypal: Record<string, unknown>;
  };
  links: PayPalLink[];
};

export type PayPalCaptureResponse = {
  status: string;
  id: string;
};
