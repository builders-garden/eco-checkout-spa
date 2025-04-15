"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence } from "framer-motion";
import { useUserBalances } from "@/hooks/useUserBalances";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useSelectedTokens } from "@/hooks/useSelectedTokens";
import { useCardTransitions } from "@/hooks/useCardTransitions";
import { PageState } from "@/lib/enums";
import { RecapContainer } from "@/components/custom-ui/recap-container/recap-container";
import { CheckoutContainer } from "@/components/custom-ui/checkout-container.tsx/checkout-container";
import { useCreateIntents } from "@/hooks/useCreateIntents";
import { EMPTY_ADDRESS } from "@/lib/constants";
import { Hex } from "viem";
import TransactionsContainer from "@/components/custom-ui/transactions-container/transactions-container";

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
  const [pageState, setPageState] = useState<PageState>(PageState.CHECKOUT);

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

  // Create Intent
  const { intents } = useCreateIntents({
    selectedTokens,
    destinationChainID: Number(desiredNetwork ?? "1"),
    recipient: (recipient ?? EMPTY_ADDRESS) as Hex,
    desiredToken: desiredToken ?? "",
  });

  // TODO: Remove these logs in production
  // useEffect(() => {
  //   console.log("intents", intents);
  // }, [intents]);

  // useEffect(() => {
  //   console.log("userBalances", userBalances);
  // }, [userBalances]);

  // useEffect(() => {
  //   console.log("selectedTokens", selectedTokens);
  // }, [selectedTokens]);

  useEffect(() => {
    console.log(
      "pageState",
      pageState,
      "\npageState === PageState.TRANSACTIONS",
      pageState === PageState.TRANSACTIONS
    );
  }, [pageState]);

  return (
    <main className="flex relative flex-col items-center justify-center min-h-screen py-6">
      <AnimatePresence mode="wait" initial={false}>
        {pageState === PageState.PAYMENT_RECAP ? (
          <RecapContainer
            key="recap-container"
            recipient={recipient ?? ""}
            desiredNetwork={desiredNetwork ?? "1"}
            amountDue={amountDue}
            selectedTokens={selectedTokens}
            selectedTotal={selectedTotal}
            pageState={pageState}
            setPageState={setPageState}
          />
        ) : pageState === PageState.TRANSACTIONS ? (
          <TransactionsContainer
            key="transactions-container"
            setPageState={setPageState}
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
            selectedTotal={selectedTotal}
            animationState={animationState}
            pageState={pageState}
            setPageState={setPageState}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
