"use client";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Info, SquarePen, WandSparkles } from "lucide-react";
import { ChainImages, TokenImages, TokenSymbols } from "@/lib/enums";
import type { UserAsset } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "../shadcn-ui/progress";
import { cn } from "@/lib/shadcn/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../shadcn-ui/accordion";
import { Accordion } from "../shadcn-ui/accordion";
import { Separator } from "../shadcn-ui/separator";
import { capitalizeFirstLetter } from "@/lib/utils";
import { AdvancedPaymentModal } from "./advanced-payment-modal";

interface PaymentMethodCardProps {
  userAssets: UserAsset[] | undefined;
  amountDue: number;
  selectedTokens: UserAsset[];
  setSelectedTokens: (
    tokens: UserAsset[] | ((prev: UserAsset[]) => UserAsset[])
  ) => void;
  selectedTotal: number;
  optimizedSelection: UserAsset[];
}

export const PaymentMethodCard = ({
  userAssets,
  amountDue,
  selectedTokens,
  setSelectedTokens,
  selectedTotal,
  optimizedSelection,
}: PaymentMethodCardProps) => {
  const [progressPercentage, setProgressPercentage] = useState(0);

  const groupSelectedTokensByAssetName: {
    [key: string]: UserAsset[];
  } = useMemo(() => {
    return selectedTokens.reduce((acc, token) => {
      acc[token.asset] = acc[token.asset] || [];
      acc[token.asset].push(token);
      return acc;
    }, {} as Record<string, UserAsset[]>);
  }, [selectedTokens]);

  useEffect(() => {
    const progress = (selectedTotal * 100) / amountDue;
    setProgressPercentage(progress > 100 ? 100 : progress);
  }, [selectedTotal, amountDue]);

  // A deep comparison of the optimized selection and the selected tokens
  const isOptimized = optimizedSelection.every((token) =>
    selectedTokens.some(
      (t) => t.asset === token.asset && t.chain === token.chain
    )
  );

  // Check if the selected amount is enough to cover the required amount
  const isAmountReached = selectedTotal >= amountDue;

  // Optimizes the selection
  const handleOptimize = () => {
    setSelectedTokens(optimizedSelection);
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center gap-1.5">
          <CreditCard className="size-4 text-secondary" />
          <p className="text-sm text-secondary">Payment method</p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isOptimized}
          className={cn(
            "text-sm text-success border border-success bg-success/10 rounded-full px-2 py-0.5 flex justify-center items-center gap-1",
            !isOptimized && "bg-success text-white cursor-pointer"
          )}
        >
          <WandSparkles
            className={cn("size-4 text-success", !isOptimized && "text-white")}
          />
          {isOptimized ? "Optimized" : "Optimize"}
        </button>
      </div>

      {/* Payment card */}
      <div className="flex flex-col w-full gap-4 border border-success p-5 rounded-[8px]">
        {/* Selected Tokens */}
        <div className="flex w-full -space-x-2">
          {Object.entries(groupSelectedTokensByAssetName).map(
            ([asset, tokens], index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={asset}
                className="relative flex justify-center items-center"
                style={{
                  zIndex: 100 - index,
                }}
              >
                <img
                  src={TokenImages[asset as keyof typeof TokenImages]}
                  alt={`${tokens[0].chain} logo`}
                  className="size-[48px] object-cover rounded-full"
                />
                <div className="absolute bottom-0 right-0 flex justify-center items-center -space-x-1.5">
                  {tokens.map((token) => (
                    <motion.img
                      key={`${token.chain}-${token.asset}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="rounded-full object-cover"
                      src={ChainImages[token.chain]}
                      alt={`${token.chain} logo`}
                      width={14}
                      height={14}
                      layout
                    />
                  ))}
                </div>
              </motion.div>
            )
          )}
        </div>

        {/* Payment coverage */}
        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between items-center w-full">
            <p className="text-sm text-secondary">Payment coverage</p>
            <div
              className={cn(
                "flex justify-center items-center gap-1 text-sm font-semibold",
                isAmountReached ? "text-success" : "text-warning"
              )}
            >
              <p>${selectedTotal.toFixed(2)}</p>
              <p> / </p>
              <p>${amountDue.toFixed(2)}</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          {!isAmountReached ? (
            <div className="flex justify-start items-center w-full border border-warning bg-warning/10 rounded-[8px] h-[32px] px-2 gap-2">
              <Info className="size-3.5 text-warning" />
              <p className="text-xs text-warning">
                Not enough funds. Try another wallet or add more balance
              </p>
            </div>
          ) : (
            <p className="text-xs text-secondary h-[16px] mb-[4px]">
              Only the required balance will be deducted from your wallet
            </p>
          )}
        </div>

        {/* Show token info */}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex justify-start items-center gap-2 py-0 cursor-pointer">
              <Info className="size-3.5 text-primary" />
              <p className="text-xs leading-0 text-primary font-semibold">
                Show token info
              </p>
            </AccordionTrigger>
            {selectedTokens.length > 0 && (
              <AccordionContent className="pb-2">
                <Separator className="my-2" />
                <div className="flex flex-col gap-2">
                  {selectedTokens.map((token, index) => (
                    <AnimatePresence
                      key={`${token.asset}-${token.chain}`}
                      mode="wait"
                    >
                      <motion.div
                        key={`${token.asset}-${token.chain}`}
                        className="flex justify-between items-center bg-secondary-foreground rounded-[8px] p-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        layout
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-start items-center gap-2">
                          <div className="relative flex justify-center items-center">
                            <img
                              src={
                                TokenImages[
                                  token.asset as keyof typeof TokenImages
                                ]
                              }
                              alt={`${token.chain} logo`}
                              width={31}
                              height={31}
                              className="object-cover rounded-full"
                            />
                            <img
                              src={ChainImages[token.chain]}
                              alt={`${token.chain} logo`}
                              className="absolute bottom-0 right-0 object-cover rounded-full"
                              width={12}
                              height={12}
                            />
                          </div>
                          <div className="flex flex-col justify-center items-start">
                            <p className="text-sm text-primary font-semibold leading-4">
                              {
                                TokenSymbols[
                                  token.asset as keyof typeof TokenSymbols
                                ]
                              }
                            </p>
                            <p className="text-xs text-secondary">
                              {capitalizeFirstLetter(token.chain)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-primary font-semibold">
                          ${token.amount.toString().slice(0, 4)}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>

        {/* Advanced payment options */}
        <AdvancedPaymentModal
          amountDue={amountDue}
          userAssets={userAssets}
          selectedTokens={selectedTokens}
          setSelectedTokens={setSelectedTokens}
          selectedTotal={selectedTotal}
        >
          <motion.button
            whileTap={{
              scale: 0.98,
            }}
            className="flex justify-center items-center w-full gap-2 border border-secondary-foreground rounded-[8px] p-2 cursor-pointer"
          >
            <SquarePen className="size-4 text-primary" />
            <p className="text-sm text-primary font-semibold">
              Advanced Payment Options
            </p>
          </motion.button>
        </AdvancedPaymentModal>
      </div>
    </div>
  );
};
