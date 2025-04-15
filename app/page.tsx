"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence } from "framer-motion";
import { useUserBalances } from "@/hooks/useUserBalances";
import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { useSelectedTokens } from "@/hooks/useSelectedTokens";
import { useCardTransitions } from "@/hooks/useCardTransitions";
import { PageStates } from "@/lib/enums";
import { RecapContainer } from "@/components/custom-ui/recap-container/recap-container";
import { CheckoutContainer } from "@/components/custom-ui/checkout-container.tsx/checkout-container";

export default function Home() {
  const { address } = useAppKitAccount();
  const [recipient] = useQueryState("recipient");
  const [amount] = useQueryState("amount");
  const [desiredNetwork] = useQueryState("network");
  const [desiredToken] = useQueryState("token");
  const [redirect] = useQueryState("redirect");
  const { userBalances, isLoadingUserBalances, hasFetchedUserBalances } =
    useUserBalances(address, desiredNetwork);
  const amountDue = Number(amount ?? "0.00");

  // Page State
  const [pageState, setPageState] = useState<PageStates | null>(
    PageStates.CHECKOUT
  );

  // Selected Tokens & optimized selection
  const {
    selectedTokens,
    selectedTotal,
    setSelectedTokens,
    optimizedSelection,
  } = useSelectedTokens(userBalances, amountDue);

  // Card Transitions
  const { animationState } = useCardTransitions(
    isLoadingUserBalances,
    hasFetchedUserBalances
  );

  // TODO: Remove these logs in production
  // useEffect(() => {
  //   console.log("userBalances", userBalances);
  // }, [userBalances]);

  // useEffect(() => {
  //   console.log("selectedTokens", selectedTokens);
  // }, [selectedTokens]);

  return (
    <main className="flex relative flex-col items-center justify-center min-h-screen py-6">
      <AnimatePresence mode="wait">
        {pageState === PageStates.PAYMENT_RECAP ? (
          <RecapContainer
            key="recap-container"
            recipient={recipient ?? ""}
            desiredNetwork={desiredNetwork ?? "1"}
            amountDue={amountDue}
            setPageState={setPageState}
            selectedTokens={selectedTokens}
            selectedTotal={selectedTotal}
            pageState={pageState}
            desiredToken={desiredToken ?? ""}
            redirect={redirect ?? ""}
          />
        ) : (
          <CheckoutContainer
            key="checkout-container"
            recipient={recipient ?? ""}
            desiredNetwork={desiredNetwork ?? "1"}
            amountDue={amountDue}
            selectedTokens={selectedTokens}
            setSelectedTokens={setSelectedTokens}
            userBalances={userBalances}
            optimizedSelection={optimizedSelection}
            isLoadingUserBalances={isLoadingUserBalances}
            pageState={pageState}
            setPageState={setPageState}
            desiredToken={desiredToken ?? ""}
            redirect={redirect ?? ""}
            selectedTotal={selectedTotal}
            animationState={animationState}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
