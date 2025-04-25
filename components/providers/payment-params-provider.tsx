import { PaymentParamsValidator } from "@/lib/classes/PaymentParamsValidator";
import { ValidatedPaymentParams } from "@/lib/types";
import { useQueryState } from "nuqs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const PaymentParamsContext = createContext<
  PaymentParamsContextType | undefined
>(undefined);

export type PaymentParamsContextType = {
  paymentParams: ValidatedPaymentParams;
  areAllPaymentParamsValid: boolean;
};

export const usePaymentParams = () => {
  const context = useContext(PaymentParamsContext);
  if (!context) {
    throw new Error(
      "usePaymentParams must be used within a PaymentParamsProvider"
    );
  }
  return context;
};

export const PaymentParamsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [recipient] = useQueryState("recipient");
  const [amount] = useQueryState("amount");
  const [network] = useQueryState("network");
  const [token] = useQueryState("token");
  const [redirect] = useQueryState("redirect");

  // Query Params Information State
  const [paymentParams, setPaymentParams] = useState<ValidatedPaymentParams>(
    PaymentParamsValidator.validatePaymentParams({
      recipient,
      amountDue: amount,
      desiredNetworkId: network,
      desiredToken: token,
      redirect,
    })
  );

  // Query Params Information Update Effect
  useEffect(() => {
    setPaymentParams(
      PaymentParamsValidator.validatePaymentParams({
        recipient,
        amountDue: amount,
        desiredNetworkId: network,
        desiredToken: token,
        redirect,
      })
    );
  }, [recipient, amount, network, token, redirect]);

  // Check if all payment info is valid (every value is not null)
  const areAllPaymentParamsValid = useMemo(() => {
    return Object.entries(paymentParams).every(([key, value]) => {
      if (key === "redirect") return true; // Skip validation for redirect
      return Boolean(value);
    });
  }, [paymentParams]);

  const value = useMemo(
    () => ({
      paymentParams,
      areAllPaymentParamsValid,
    }),
    [paymentParams, areAllPaymentParamsValid]
  );

  return (
    <PaymentParamsContext.Provider value={value}>
      {children}
    </PaymentParamsContext.Provider>
  );
};
