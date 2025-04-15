"use client";
import { useMemo } from "react";
import { CreditCard, SquarePen, WandSparkles } from "lucide-react";
import type { UserAsset } from "@/lib/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/shadcn/utils";
import { compareArrays, groupSelectedTokensByAssetName } from "@/lib/utils";
import { AdvancedPaymentModal } from "./advanced-payment-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../shadcn-ui/tooltip";
import { GroupedTokensIcons } from "./grouped-tokens-icons";
import { TokensInfoAccordion } from "./tokens-info-accordion";

interface PaymentMethodCardProps {
  userAssets: UserAsset[] | undefined;
  amountDue: number;
  selectedTokens: UserAsset[];
  setSelectedTokens: (
    tokens: UserAsset[] | ((prev: UserAsset[]) => UserAsset[])
  ) => void;
  optimizedSelection: UserAsset[];
  shouldAnimate?: boolean;
}

export const PaymentMethodCard = ({
  userAssets,
  amountDue,
  selectedTokens,
  setSelectedTokens,
  optimizedSelection,
  shouldAnimate = true,
}: PaymentMethodCardProps) => {
  const groupedTokens = useMemo(() => {
    return groupSelectedTokensByAssetName(selectedTokens);
  }, [selectedTokens]);

  // A deep comparison of the optimized selection and the selected tokens
  const isOptimized = compareArrays(optimizedSelection, selectedTokens);

  // Optimizes the selection
  const handleOptimize = () => {
    setSelectedTokens(optimizedSelection);
  };

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
      animate={
        shouldAnimate ? { opacity: 1, height: "fit-content" } : undefined
      }
      exit={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full gap-2"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center gap-1.5">
          <CreditCard className="size-4 text-secondary" />
          <p className="text-sm text-secondary">Payment method</p>
        </div>
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
      </div>

      {/* Payment card */}
      <div className="flex flex-col w-full gap-4 border border-success p-5 rounded-[8px]">
        {/* Selected Tokens and Edit Button */}
        <div className="flex justify-between items-start">
          <GroupedTokensIcons groupedTokens={groupedTokens} />
          {/* Advanced payment options */}
          <AdvancedPaymentModal
            amountDue={amountDue}
            userAssets={userAssets}
            selectedTokens={selectedTokens}
            setSelectedTokens={setSelectedTokens}
          >
            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              whileHover={{
                scale: 1.04,
              }}
              className="flex justify-center items-center cursor-pointer pr-1"
            >
              <SquarePen className="size-[25px] text-secondary" />
            </motion.button>
          </AdvancedPaymentModal>
        </div>

        {/* Show token info */}
        <TokensInfoAccordion
          selectedTokens={selectedTokens}
          amountDue={amountDue}
        />
      </div>
    </motion.div>
  );
};
