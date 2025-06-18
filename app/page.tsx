"use client";

import { AnimatePresence } from "framer-motion";
import { PaymentPageState } from "@/lib/enums";
import { CheckoutContainer } from "@/components/custom-ui/payment/checkout-container/checkout-container";
import TransactionsContainer from "@/components/custom-ui/payment/transactions-container/transactions-container";
import { usePaymentPageState } from "@/hooks/use-payment-page-state";
import { MissingParamsContainer } from "@/components/custom-ui/payment/missing-params-container/missing-params-container";
import { useCardTransitions } from "@/hooks/use-card-transitions";
import PaymentCompletedContainer from "@/components/custom-ui/payment/payment-completed-container/payment-completed-container";
import { InfoFooter } from "@/components/custom-ui/info-footer";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { Loader } from "@/components/custom-ui/loader";

export default function Home() {
  // Page State
  const { paymentPageState, setPaymentPageState } = usePaymentPageState();

  // Payment Params
  const { isDoingFirstValidation } = usePaymentParams();

  // Card Transitions State
  // Must be handled in the parent component to avoid
  // re-rendering and resetting of the animation state
  const { animationState } = useCardTransitions();

  return (
    <main className="flex relative flex-col items-center justify-start sm:justify-center min-h-screen h-auto sm:pt-6 sm:pb-14 overflow-y-auto [background-image:radial-gradient(#00000009_1px,transparent_1px)] [background-size:16px_16px]">
      <AnimatePresence mode="wait" custom={paymentPageState}>
        {isDoingFirstValidation ? (
          <Loader key="loader" />
        ) : paymentPageState.current === PaymentPageState.MISSING_PARAMS ? (
          <MissingParamsContainer
            key="missing-params-container"
            setPaymentPageState={setPaymentPageState}
          />
        ) : paymentPageState.current === PaymentPageState.TRANSACTIONS ? (
          <TransactionsContainer
            key="transactions-container"
            setPaymentPageState={setPaymentPageState}
          />
        ) : paymentPageState.current === PaymentPageState.PAYMENT_COMPLETED ? (
          <PaymentCompletedContainer key="payment-completed-container" />
        ) : (
          <CheckoutContainer
            key="checkout-container"
            paymentPageState={paymentPageState}
            setPaymentPageState={setPaymentPageState}
            animationState={animationState}
          />
        )}
      </AnimatePresence>
      <InfoFooter />
    </main>
  );
}
