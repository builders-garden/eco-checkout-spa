"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import { ActionsButton } from "@/components/custom-ui/actions-button";
import { AccountButton } from "@/components/custom-ui/account-button";
import { useUserBalances } from "@/hooks/useUserBalances";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useSelectedTokens } from "@/hooks/useSelectedTokens";
import { PaymentSummary } from "@/components/custom-ui/payment-summary";
import { ConnectWalletInfo } from "@/components/custom-ui/connect-wallet-info";

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const [recipient] = useQueryState("recipient");
  const [amount] = useQueryState("amount");
  const [desiredNetwork] = useQueryState("network");
  const [desiredToken] = useQueryState("token");
  const [redirect] = useQueryState("redirect");
  const { userBalances, isLoadingUserBalances, hasFetchedUserBalances } =
    useUserBalances(address, desiredNetwork);
  const amountDue = Number(amount ?? "0.00");

  const { selectedTokens, selectedTotal, setSelectedTokens } =
    useSelectedTokens(userBalances, amountDue);

  // TODO: Remove these logs in production
  useEffect(() => {
    console.log(userBalances);
  }, [userBalances]);

  useEffect(() => {
    console.log(selectedTokens);
  }, [selectedTokens]);

  const isConnectedAndFetched =
    isConnected &&
    !!address &&
    !isLoadingUserBalances &&
    hasFetchedUserBalances;

  return (
    <main className="flex relative flex-col items-center justify-center h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-9 border border-secondary-foreground rounded-[8px] overflow-hidden"
      >
        {/* Payment Summary */}
        <PaymentSummary
          key="payment-summary"
          recipient={recipient ?? ""}
          desiredNetworkId={desiredNetwork ?? "1"}
          amountDue={amountDue}
        />

        {/* Connect Wallet Info */}
        <AnimatePresence mode="wait">
          {!isConnectedAndFetched && (
            <ConnectWalletInfo key="connect-wallet-info" />
          )}
        </AnimatePresence>

        {/* Account Button */}
        <AnimatePresence mode="wait">
          {isConnectedAndFetched && <AccountButton key="account-button" />}
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
