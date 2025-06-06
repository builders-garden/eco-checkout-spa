import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { CheckoutPageState } from "@/lib/enums";
import { CheckoutPageStateType } from "@/lib/types";
import { useEffect, useState } from "react";

export const useCheckoutPageState = () => {
  const { areAllPaymentParamsValid, isDoingFirstValidation } =
    usePaymentParams();

  const [checkoutPageState, setCheckoutPageState] =
    useState<CheckoutPageStateType>({
      current: null,
      previous: null,
    });

  useEffect(() => {
    if (isDoingFirstValidation) {
      setCheckoutPageState({
        current: null,
        previous: null,
      });
    }
    setCheckoutPageState({
      current: areAllPaymentParamsValid
        ? CheckoutPageState.CHECKOUT
        : CheckoutPageState.MISSING_PARAMS,
      previous: null,
    });
  }, [areAllPaymentParamsValid]);

  // A function to handle Page State Change
  const handleCheckoutPageStateChange = (newPageState: CheckoutPageState) => {
    setCheckoutPageState((prev) => ({
      current: newPageState,
      previous: prev.current,
    }));
  };

  return {
    checkoutPageState,
    setCheckoutPageState: handleCheckoutPageStateChange,
  };
};
