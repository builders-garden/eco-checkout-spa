"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import {
  chainIdToChain,
  chainIdToChainName,
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
import { useEffect } from "react";
import { useSelectedTokens } from "@/hooks/useSelectedTokens";
import { ChainImages } from "@/lib/enums";

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const [recipient] = useQueryState("recipient");
  const [amount] = useQueryState("amount");
  const [desiredNetwork] = useQueryState("network");
  const [desiredToken] = useQueryState("token");
  const [redirect] = useQueryState("redirect");
  const { userBalances, isLoadingUserBalances, isFirstFetch } = useUserBalances(
    address,
    desiredNetwork
  );
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

  const networkName = chainIdToChainName(Number(desiredNetwork ?? 1));

  const isConnectedAndFetched =
    isConnected && !!address && !isLoadingUserBalances && !isFirstFetch;

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-10 gap-10"
      >
        {/* Payment Summary */}
        <div className="flex flex-col justify-start items-start p-5 gap-[30px] border border-secondary-foreground rounded-[10px]">
          {/* Header */}
          <h1 className="text-xl font-bold">Payment Summary</h1>

          {/* Info */}
          <div className="flex flex-col w-full gap-4">
            {/* Recipient */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Recipient</p>
              <p className="text-[16px] font-semibold">
                {truncateAddress(recipient ?? emptyAddress)}
              </p>
            </div>
            {/* To Chain */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">To Chain</p>
              <div className="flex justify-center items-center gap-1.5">
                <p className="text-[16px] font-semibold">{networkName}</p>
                <img
                  src={
                    ChainImages[
                      chainIdToChain(
                        Number(desiredNetwork),
                        true
                      ) as keyof typeof ChainImages
                    ]
                  }
                  alt={desiredNetwork ?? ""}
                  className="size-5"
                />
              </div>
            </div>
          </div>

          <Separator className="w-full" />

          <div className="flex flex-col w-full gap-4">
            {/* Total */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-semibold">Total</p>
              <p className="text-[16px] font-semibold">
                ${amountDue.toFixed(2)}
              </p>
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
            <div className="flex flex-col justify-center items-start w-full gap-2">
              <TokensSelector
                userAssets={userBalances}
                amountDue={amountDue}
                selectedTokens={selectedTokens}
                setSelectedTokens={setSelectedTokens}
                selectedTotal={selectedTotal ?? 0}
                visible={isConnectedAndFetched}
              />
              <AccountButton visible={isConnectedAndFetched} />
            </div>

            {/* Connect Button */}
            <ActionsButton
              isLoading={isLoadingUserBalances}
              selectedTokens={selectedTokens}
              destinationToken={desiredToken ?? ""}
              destinationChain={Number(desiredNetwork)}
              redirect={redirect ?? ""}
              selectedTotal={selectedTotal ?? 0}
              amountDue={amountDue}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
