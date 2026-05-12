import {
  PayPalScriptProvider,
  PayPalButtons,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";

type Props = {
  numberOfNights: number;
  pricePerNight: number;
};

const PayPalPayment = ({ numberOfNights, pricePerNight }: Props) => {
  const navigate = useNavigate();
  const vitePaypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const initialOptions = { clientId: vitePaypalClientId };
  const styles: PayPalButtonsComponentProps["style"] = {
    shape: "rect",
    layout: "vertical",
  };
  const onCreateOrder = async () => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        body: JSON.stringify({ numberOfNights, pricePerNight }),
        headers: {
          "Content-Type": "Application/json",
        },
      });
      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.log("Error creating a Paypal order:", error);
      throw error;
    }
  };

  const onApprove = async (data: {
    orderID: string;
    payerID?: string | null | undefined;
    paymentID?: string | null | undefined;
    billingToken?: string | null | undefined;
    facilitatorAccessToken?: string;
  }) => {
    try {
      if (!data.orderID) throw new Error("Invalid order ID");

      const response = await fetch(
        `/api/paypal/capture-payment/${data.orderID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      navigate("/complete-payment");
    } catch (error) {
      console.log("Error verifying Paypal order.", error);
      navigate("/cancel-payment");
    }
  };

  const onError = (error: Record<string, unknown>) => {
    console.error("PayPal error", error);
    navigate("/cancel-payment");
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={styles}
        createOrder={onCreateOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};
export default PayPalPayment;
