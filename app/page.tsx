"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import { ActionsButton } from "@/components/custom-ui/actions-button";
import { ConnectedWalletButton } from "@/components/custom-ui/connected-wallet-button";
import { useUserBalances } from "@/hooks/useUserBalances";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useSelectedTokens } from "@/hooks/useSelectedTokens";
import { PaymentSummary } from "@/components/custom-ui/payment-summary";
import { ConnectWalletInfo } from "@/components/custom-ui/connect-wallet-info";
import { useStateTransitions } from "@/hooks/useStateTransitions";
import { CheckoutFlowStates } from "@/lib/enums";
import { PaymentMethodCard } from "@/components/custom-ui/payment-method-card";

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

  const {
    selectedTokens,
    selectedTotal,
    setSelectedTokens,
    optimizedSelection,
  } = useSelectedTokens(userBalances, amountDue);

  const { animationState } = useStateTransitions(
    isLoadingUserBalances,
    hasFetchedUserBalances
  );

  // TODO: Remove these logs in production
  useEffect(() => {
    console.log(userBalances);
  }, [userBalances]);

  useEffect(() => {
    console.log(selectedTokens);
  }, [selectedTokens]);

  return (
    <main className="flex relative flex-col items-center justify-center min-h-screen py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
      >
        {/* Payment Summary */}
        <PaymentSummary
          key="payment-summary"
          recipient={recipient ?? ""}
          desiredNetworkId={desiredNetwork ?? "1"}
          amountDue={amountDue}
        />

        {/* Single AnimatePresence to control both components */}
        <AnimatePresence mode="wait">
          {animationState === CheckoutFlowStates.CONNECT_WALLET && (
            <ConnectWalletInfo key="connect-wallet-info" />
          )}
          {animationState === CheckoutFlowStates.SELECT_PAYMENT_METHOD && (
            <>
              <ConnectedWalletButton key="connected-wallet-button" />
              <PaymentMethodCard
                amountDue={amountDue}
                selectedTokens={selectedTokens}
                setSelectedTokens={setSelectedTokens}
                selectedTotal={selectedTotal}
                userAssets={userBalances}
                optimizedSelection={optimizedSelection}
              />
            </>
          )}
        </AnimatePresence>

        {/* Connect Button */}
        <ActionsButton
          key="actions-button"
          isLoading={isLoadingUserBalances}
          selectedTokens={selectedTokens}
          destinationToken={desiredToken ?? ""}
          destinationChain={Number(desiredNetwork)}
          redirect={redirect ?? ""}
          selectedTotal={selectedTotal ?? 0}
          amountDue={amountDue}
        />
      </motion.div>
    </main>
  );
}
