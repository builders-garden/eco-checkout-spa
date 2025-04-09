"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import {
  chainIdToChainName,
  formatTokenAmount,
  truncateAddress,
} from "@/lib/utils";
import { Separator } from "@/components/shadcn-ui/separator";
import { emptyAddress } from "@/lib/constants";
import { cn } from "@/lib/shadcn/utils";
import { TokensSelector } from "@/components/custom-ui/tokens-selector";
import { ActionsButton } from "@/components/custom-ui/actions-button";
import { AccountButton } from "@/components/custom-ui/account-button";
import { useUserBalances } from "@/hooks/useUserBalances";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { UserAsset } from "@/lib/types";

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const [recipient] = useQueryState("recipient");
  const [amount] = useQueryState("amount");
  const [network] = useQueryState("network");
  const [token] = useQueryState("token");
  const [redirect] = useQueryState("redirect");
  const { userBalances, isLoadingUserBalances, isFirstFetch } = useUserBalances(
    address,
    network
  );
  const [selectedTokens, setSelectedTokens] = useState<UserAsset[]>([]);

  // Keep adding tokens until the amount due is reached
  useEffect(() => {
    const amountDue = Number(amount);
    let selectedArray: UserAsset[] = [];
    for (const asset of userBalances) {
      if (
        selectedArray.reduce((acc, curr) => acc + formatTokenAmount(curr), 0) <
        amountDue
      ) {
        selectedArray.push(asset);
      }
    }
    setSelectedTokens(selectedArray);
  }, [userBalances]);

  // TODO: Remove this in production
  useEffect(() => {
    console.log(userBalances);
  }, [userBalances]);

  useEffect(() => {
    console.log(selectedTokens);
  }, [selectedTokens]);

  const networkName = chainIdToChainName(Number(network ?? 1));

  const isConnectedAndFetched =
    isConnected && !!address && !isLoadingUserBalances && !isFirstFetch;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-screen gap-3"
    >
      <div className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-10 gap-10">
        {/* Payment Summary */}
        <div className="flex flex-col justify-start items-start p-5 gap-[30px] border border-secondary-foreground rounded-[10px]">
          {/* Header */}
          <h1 className="text-xl font-bold">Payment Summary</h1>

          {/* Info */}
          <div className="flex flex-col w-full gap-4">
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Amount</p>
              <p className="text-[16px] font-semibold">${amount ?? "0.00"}</p>
            </div>
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">To Chain</p>
              <p className="text-[16px] font-semibold">{networkName}</p>
            </div>
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Recipient</p>
              <p className="text-[16px] font-semibold">
                {truncateAddress(recipient ?? emptyAddress)}
              </p>
            </div>
          </div>

          <Separator className="w-full" />

          <div className="flex flex-col w-full gap-4">
            {/* Fees and Total */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Fees</p>
              <p className="text-[16px] font-semibold">$0.00</p>
            </div>
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-semibold">Total</p>
              <p className="text-[16px] font-semibold">${amount ?? "0.00"}</p>
            </div>
          </div>
        </div>

        {/* Connect Wallet / Token Selection */}
        <motion.div className="flex flex-col justify-center items-center w-full gap-5">
          {/* Header */}
          <div className="flex flex-col justify-center w-full items-center text-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isConnectedAndFetched ? "connected" : "disconnected"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-semibold">
                  {isConnectedAndFetched
                    ? "Select payment method"
                    : "Connect Wallet"}
                </h1>
                <p className="text-secondary text-[16px]">
                  {isConnectedAndFetched
                    ? "Choose one or more payment method from your wallet"
                    : "Connect your wallet to proceed with payment"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Token Selection */}
          <div
            className={cn(
              "flex flex-col justify-center items-center w-full",
              isConnectedAndFetched && "gap-2"
            )}
          >
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isConnectedAndFetched ? "auto" : 0,
                opacity: isConnectedAndFetched ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-center items-start w-full gap-2 overflow-hidden"
            >
              <h1 className="text-[16px] font-semibold">Select Token</h1>
              <TokensSelector
                userAssets={userBalances}
                amountDue={amount ?? "0.00"}
                selectedTokens={selectedTokens}
                setSelectedTokens={setSelectedTokens}
              />
              <AccountButton />
            </motion.div>

            {/* Connect Button */}
            <ActionsButton
              isLoading={isLoadingUserBalances}
              selectedTokens={selectedTokens}
              destinationToken={token ?? ""}
              destinationChain={Number(network)}
              redirect={redirect ?? ""}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
