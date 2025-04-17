"use client";

import { AnimatePresence } from "framer-motion";
import { PageState } from "@/lib/enums";
import { RecapContainer } from "@/components/custom-ui/recap-container/recap-container";
import { CheckoutContainer } from "@/components/custom-ui/checkout-container.tsx/checkout-container";
import TransactionsContainer from "@/components/custom-ui/transactions-container/transactions-container";
import { usePageState } from "@/hooks/usePageState";
import { MissingParamsContainer } from "@/components/custom-ui/missing-params-container";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useCardTransitions } from "@/hooks/useCardTransitions";

export default function Home() {
  // Payment Params
  const { areAllPaymentParamsValid } = usePaymentParams();

  // Page State
  const { pageState, setPageState } = usePageState(areAllPaymentParamsValid);

  // Card Transitions
  // Must be handled in the parent component to avoid
  // re-rendering and resetting the of the animation state
  const { animationState } = useCardTransitions();

  // Create Intent & get optimized quotes
  // const { intents, optimizedIntents } = useCreateIntents({
  //   selectedTokens,
  //   paymentParams,
  //   areAllPaymentParamsValid,
  // });

  // Create Simple Intent
  // const { intents: simpleIntents, optimizedIntents: simpleOptimizedIntents } =
  //   useCreateSimpleIntents({
  //     selectedTokens,
  //     destinationChainID: Number(network ?? "1"),
  //     recipient: (recipient ?? EMPTY_ADDRESS) as Hex,
  //     desiredToken: token ?? "",
  //   });

  // TODO: Remove these logs in production
  // useEffect(() => {
  //   console.log("simpleIntents", simpleIntents);
  // }, [simpleIntents]);

  // useEffect(() => {
  //   console.log("simpleOptimizedIntents", simpleOptimizedIntents);
  // }, [simpleOptimizedIntents]);

  // useEffect(() => {
  //   console.log("intents", intents);
  // }, [intents]);

  // useEffect(() => {
  //   console.log("intents", intents);
  // }, [intents]);

  return (
    <main className="flex relative flex-col items-center justify-center min-h-screen py-6">
      <AnimatePresence mode="wait" custom={pageState.current}>
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
        ) : (
          <CheckoutContainer
            key="checkout-container"
            pageState={pageState}
            setPageState={setPageState}
            animationState={animationState}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
