import { PageState } from "@/lib/enums";
import { PageStateType } from "@/lib/types";
import { useState } from "react";

export const usePageState = (areAllPaymentParamsValid: boolean) => {
  const [pageState, setPageState] = useState<PageStateType>({
    current: areAllPaymentParamsValid
      ? PageState.CHECKOUT
      : PageState.MISSING_PARAMS,
    previous: null,
  });

  // A function to handle Page State Change
  const handlePageStateChange = (newPageState: PageState) => {
    setPageState((prev) => ({
      current: newPageState,
      previous: prev.current,
    }));
  };

  return { pageState, setPageState: handlePageStateChange };
};
