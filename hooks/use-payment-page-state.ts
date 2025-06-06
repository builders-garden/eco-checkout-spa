import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PaymentPageState } from "@/lib/enums";
import { CheckoutPageStateType } from "@/lib/types";
import { useEffect, useState } from "react";

export const usePaymentPageState = () => {
  const { areAllPaymentParamsValid, isDoingFirstValidation } =
    usePaymentParams();

  const [paymentPageState, setPaymentPageState] =
    useState<CheckoutPageStateType>({
      current: null,
      previous: null,
    });

  useEffect(() => {
    if (isDoingFirstValidation) {
      setPaymentPageState({
        current: null,
        previous: null,
      });
    }
    setPaymentPageState({
      current: areAllPaymentParamsValid
        ? PaymentPageState.CHECKOUT
        : PaymentPageState.MISSING_PARAMS,
      previous: null,
    });
  }, [areAllPaymentParamsValid]);

  // A function to handle Page State Change
  const handlePaymentPageStateChange = (newPageState: PaymentPageState) => {
    setPaymentPageState((prev) => ({
      current: newPageState,
      previous: prev.current,
    }));
  };

  return {
    paymentPageState,
    setPaymentPageState: handlePaymentPageStateChange,
  };
};
