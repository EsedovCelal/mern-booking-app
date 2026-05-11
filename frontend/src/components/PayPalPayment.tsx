import {
  PayPalScriptProvider,
  PayPalButtons,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useNavigate } from "react-router-dom";

const PayPalPayment = () => {
  const navigate = useNavigate();
  const vitePaypalClientId = import.meta.env.VITE_PAYPAL_CLIENTID;

  const initialOptions = { clientId: vitePaypalClientId };
  const styles: PayPalButtonsComponentProps["style"] = {
    shape: "rect",
    layout: "vertical",
  };

  const { data: orderId } = useQuery({
    queryKey: ["getPaypalId"],
    queryFn: () => apiClient.createdPaypalId(),
  });

  const { data: onApprove.orderID } = useQuery({
    queryKey: ["OnApprovePaypal"],
    queryFn: () => apiClient.onApprovePaypal(orderId),
  });

  const onError = (error: Record<string, unknown>) => {
    console.error("PayPal error", error);
    navigate("cancel-payment");
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={styles}
        createOrder={() => orderId}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};
export default PayPalPayment;
