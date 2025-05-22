import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PageState } from "@/lib/enums";
import { PageStateType } from "@/lib/types";
import { useEffect, useState } from "react";

export const usePageState = () => {
  const { areAllPaymentParamsValid, isDoingFirstValidation } =
    usePaymentParams();

  const [pageState, setPageState] = useState<PageStateType>({
    current: null,
    previous: null,
  });

  useEffect(() => {
    if (isDoingFirstValidation) {
      setPageState({
        current: null,
        previous: null,
      });
    }
    setPageState({
      current: areAllPaymentParamsValid
        ? PageState.CHECKOUT
        : PageState.MISSING_PARAMS,
      previous: null,
    });
  }, [areAllPaymentParamsValid]);

  // A function to handle Page State Change
  const handlePageStateChange = (newPageState: PageState) => {
    setPageState((prev) => ({
      current: newPageState,
      previous: prev.current,
    }));
  };

  return { pageState, setPageState: handlePageStateChange };
};
