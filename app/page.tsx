"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PageState } from "@/lib/enums";
import { RecapContainer } from "@/components/custom-ui/recap-container/recap-container";
import { CheckoutContainer } from "@/components/custom-ui/checkout-container.tsx/checkout-container";
import TransactionsContainer from "@/components/custom-ui/transactions-container/transactions-container";
import { usePageState } from "@/hooks/use-page-state";
import { MissingParamsContainer } from "@/components/custom-ui/missing-params-container/missing-params-container";
import { useCardTransitions } from "@/hooks/use-card-transitions";
import PaymentCompletedContainer from "@/components/custom-ui/payment-completed-container/payment-completed-container";
import { InfoIcon } from "lucide-react";
import { InfoFooter } from "@/components/custom-ui/info-footer";

export default function Home() {
  // Page State
  const { pageState, setPageState } = usePageState();

  // Card Transitions State
  // Must be handled in the parent component to avoid
  // re-rendering and resetting of the animation state
  const { animationState } = useCardTransitions();

  return (
    <main className="flex relative flex-col items-center justify-start sm:justify-center min-h-screen h-auto sm:pt-6 sm:pb-14 overflow-y-auto">
      <AnimatePresence mode="wait" custom={pageState}>
        {pageState.current === PageState.MISSING_PARAMS ? (
          <MissingParamsContainer
            key="missing-params-container"
            setPageState={setPageState}
          />
        ) : pageState.current === PageState.PAYMENT_RECAP ? (
          <RecapContainer
            key="recap-container"
            pageState={pageState}
            setPageState={setPageState}
          />
        ) : pageState.current === PageState.TRANSACTIONS ? (
          <TransactionsContainer
            key="transactions-container"
            setPageState={setPageState}
          />
        ) : pageState.current === PageState.PAYMENT_COMPLETED ? (
          <PaymentCompletedContainer key="payment-completed-container" />
        ) : (
          <CheckoutContainer
            key="checkout-container"
            pageState={pageState}
            setPageState={setPageState}
            animationState={animationState}
          />
        )}
      </AnimatePresence>
      <InfoFooter />
    </main>
  );
}
