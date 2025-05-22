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
  isDoingFirstValidation: boolean;
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
  const [showFees] = useQueryState("show-fees");

  // Query Params Information State
  const [paymentParams, setPaymentParams] = useState<ValidatedPaymentParams>({
    recipient: null,
    amountDue: null,
    desiredNetworkId: null,
    desiredToken: null,
    redirect: null,
    showFees: false,
  });
  const [isDoingFirstValidation, setIsDoingFirstValidation] = useState(true);

  // Query Params Information Update Effect
  useEffect(() => {
    PaymentParamsValidator.validatePaymentParams({
      recipient,
      amountDue: amount,
      desiredNetworkId: network,
      desiredToken: token,
      redirect,
      showFees,
    })
      .then((validatedPaymentParams) => {
        setPaymentParams(validatedPaymentParams);
        setTimeout(() => {
          setIsDoingFirstValidation(false);
        }, 500);
      })
      .catch(() => {
        setIsDoingFirstValidation(false);
      });
  }, [recipient, amount, network, token, redirect, showFees]);

  // Check if all payment info is valid (every value is not null)
  const areAllPaymentParamsValid = useMemo(() => {
    if (!paymentParams) return false;
    return Object.entries(paymentParams).every(([key, value]) => {
      // Skip validation for redirect and showFees because they are optional
      if (key === "redirect" || key === "showFees") return true;
      return Boolean(value);
    });
  }, [paymentParams]);

  const value = useMemo(
    () => ({
      paymentParams: paymentParams,
      areAllPaymentParamsValid,
      isDoingFirstValidation,
    }),
    [paymentParams, areAllPaymentParamsValid, isDoingFirstValidation]
  );

  return (
    <PaymentParamsContext.Provider value={value}>
      {children}
    </PaymentParamsContext.Provider>
  );
};
