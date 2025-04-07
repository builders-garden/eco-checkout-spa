"use client";

import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import { truncateAddress } from "@/lib/utils";
import { Separator } from "@/components/shadcn-ui/separator";
import { emptyAddress } from "@/lib/constants";
import { useWalletClient } from "wagmi";
import { CustomConnectButton } from "@/components/custom-ui/custom-connect-button";
import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/shadcn/utils";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Chain, TokenBalance } from "@/lib/relayoor/types";
import { TokensSelector } from "@/components/custom-ui/tokens-selector";

export default function Home() {
  const { data: walletClient } = useWalletClient();
  const [recipient] = useQueryState("recipient");
  const [amount] = useQueryState("amount");
  const [network] = useQueryState("network");
  const [token] = useQueryState("token");
  const [redirect] = useQueryState("redirect");

  const { data: userBalances, isLoading: isLoadingUserBalances } = useQuery({
    queryKey: ["userBalances"],
    queryFn: async () => {
      const response = await ky
        .get<Record<Chain, TokenBalance[]>>(
          `/api/user-balances?userAddress=${walletClient?.account.address}`
        )
        .json();
      return response;
    },
    enabled: !!walletClient?.account.address,
  });

  const isConnected =
    !!walletClient?.account.address && !!userBalances && !isLoadingUserBalances;

  useEffect(() => {
    console.log("state", isConnected, userBalances);
  }, [isConnected, userBalances]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-screen gap-3"
    >
      <ConnectButton />
      <div className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-10 gap-10">
        {/* Payment Summary */}
        <div className="flex flex-col justify-start items-start p-5 gap-[30px] border border-secondary-foreground rounded-[10px]">
          {/* Header */}
          <h1 className="text-xl font-bold">Payment Summary</h1>

          {/* Info */}
          <div className="flex flex-col w-full gap-4">
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Amount</p>
              <p className="text-[16px] font-semibold">{amount ?? "0"}</p>
            </div>
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">To Chain</p>
              <p className="text-[16px] font-semibold">
                {network ?? "Ethereum"}
              </p>
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
              <p className="text-[16px] font-semibold">12.00008 USDC</p>
            </div>
          </div>
        </div>

        {/* Connect Wallet / Token Selection */}
        <motion.div className="flex flex-col justify-center items-center w-full gap-5">
          {/* Header */}
          <div className="flex flex-col justify-center w-full items-center text-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isConnected ? "connected" : "disconnected"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-semibold">
                  {isConnected ? "Select payment method" : "Connect Wallet"}
                </h1>
                <p className="text-secondary text-[16px]">
                  {isConnected
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
              isConnected && "gap-5"
            )}
          >
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isConnected ? "auto" : 0,
                opacity: isConnected ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-center items-start w-full gap-2 overflow-hidden"
            >
              <h1 className="text-[16px] font-semibold">Select Token</h1>
              <TokensSelector
                tokenBalances={userBalances ?? {}}
                amountDue={amount ?? "0.00"}
              />
            </motion.div>

            {/* Connect Button */}
            <CustomConnectButton isConnected={isConnected} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
