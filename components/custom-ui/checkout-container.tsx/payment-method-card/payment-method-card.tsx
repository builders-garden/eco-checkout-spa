"use client";
import { useMemo } from "react";
import {
  AlertCircle,
  CreditCard,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/shadcn/utils";
import { compareArrays, groupSelectedTokensByAssetName } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../shadcn-ui/tooltip";
import { TokensInfoAccordion } from "./tokens-info-accordion";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { useDisconnect } from "@reown/appkit/react";
import { usePaymentParams } from "@/components/providers/payment-params-provider";

export const PaymentMethodCard = () => {
  const { disconnect } = useDisconnect();

  const {
    selectedTokens,
    setSelectedTokens,
    optimizedSelection,
    selectedTotal,
  } = useSelectedTokens();

  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  // A deep comparison of the optimized selection and the selected tokens
  const isOptimized = compareArrays(optimizedSelection, selectedTokens);

  // Optimizes the selection
  const handleOptimize = () => {
    setSelectedTokens(optimizedSelection);
  };

  // Disconnects the wallet
  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "fit-content" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full gap-2"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center gap-1.5">
          <CreditCard className="size-4 text-secondary" />
          <p className="text-sm text-secondary">Payment method</p>
        </div>
        {selectedTokens.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{
                  scale: 0.98,
                }}
                onClick={handleOptimize}
                disabled={isOptimized}
                className={cn(
                  "text-sm text-success border border-success bg-success/10 rounded-full w-[110px] py-0.5 flex justify-center items-center gap-1",
                  !isOptimized && "bg-success text-white cursor-pointer"
                )}
              >
                <WandSparkles
                  className={cn(
                    "size-4 text-success",
                    !isOptimized && "text-white"
                  )}
                />
                {isOptimized ? "Optimized" : "Optimize"}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px]">
              <p>
                The optimization takes into account the destination chain and
                favors L2 blockchains over Mainnet.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Payment card */}
      <div className="flex flex-col w-full gap-4 border border-success p-5 rounded-[8px]">
        {selectedTokens.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-3.5">
            <div className="flex justify-center items-center bg-warning/10 rounded-full size-[56px]">
              <TriangleAlert className="text-warning" />
            </div>
            <div className="flex flex-col justify-center items-center gap-1">
              <h1 className="text-lg font-semibold">No tokens available</h1>
              <p className="text-sm text-secondary font-semibold text-center px-16">
                Your wallet doesn't have any tokens to complete this payment.
              </p>
            </div>
            <motion.button
              whileTap={{
                scale: 0.985,
              }}
              whileHover={{
                scale: 1.015,
              }}
              onClick={handleDisconnect}
              className="flex justify-center items-center w-full text-white bg-primary rounded-[8px] h-[48px] font-semibold cursor-pointer"
            >
              Connect another wallet
            </motion.button>
          </div>
        ) : (
          <>
            <TokensInfoAccordion />
            {amountDue && selectedTotal < amountDue && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="insufficient-balance-warning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-end w-full overflow-hidden"
                >
                  <div className="flex items-center w-full gap-3 px-4 rounded-md bg-warning/10 border border-warning text-warning h-[72px]">
                    <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col justify-center items-start gap-2">
                      <p className="font-semibold">
                        Insufficient balance - ${selectedTotal?.toFixed(2)} / $
                        {amountDue?.toFixed(2)}
                      </p>
                      <p className="text-xs">
                        Try another wallet or add funds.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};
