import { motion } from "framer-motion";

import { AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from "@/components/shadcn-ui/accordion";
import { SquarePen } from "lucide-react";
import { Separator } from "@/components/shadcn-ui/separator";
import { ChainImages, TokenImages, TokenSymbols } from "@/lib/enums";
import {
  capitalizeFirstLetter,
  getAmountDeducted,
  groupSelectedTokensByAssetName,
} from "@/lib/utils";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { GroupedTokensIcons } from "./grouped-tokens-icons";
import { AdvancedPaymentModal } from "./advanced-payment-modal";
import { useMemo } from "react";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";

export const TokensInfoAccordion = () => {
  const { selectedTokens } = useSelectedTokens();
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  // Group the selected tokens by asset name
  const groupedTokens = useMemo(() => {
    return groupSelectedTokensByAssetName(selectedTokens, amountDue!);
  }, [selectedTokens, amountDue]);

  // Get the token with the highest amount deducted
  const highestDeductedToken = useMemo(() => {
    let highestToken = null;
    for (const token of selectedTokens) {
      const amountDeducted = getAmountDeducted(
        amountDue!,
        selectedTokens,
        token
      );
      if (amountDeducted > (highestToken?.amount ?? 0)) {
        highestToken = token;
      }
    }
    return highestToken;
  }, [selectedTokens, amountDue]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="flex justify-start text-primary items-center gap-2 py-1 cursor-pointer hover:no-underline">
          {/* Selected Tokens */}
          <div className="flex justify-start items-center sm:gap-6 gap-3 w-full">
            <GroupedTokensIcons groupedTokens={groupedTokens} />
            <div className="flex flex-col">
              <h1 className="text-[16px] text-primary font-semibold">
                {
                  TokenSymbols[
                    highestDeductedToken?.asset as keyof typeof TokenSymbols
                  ]
                }{" "}
                {highestDeductedToken?.chain
                  ? `on ${capitalizeFirstLetter(highestDeductedToken.chain)}`
                  : ""}
              </h1>
              {selectedTokens.length > 1 && (
                <p className="text-sm text-secondary">
                  +{selectedTokens.length - 1} more token
                  {selectedTokens.length - 1 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </AccordionTrigger>
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
                  className="flex justify-between items-center bg-secondary-foreground/40 rounded-[8px] py-2 px-4"
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
                          TokenImages[token.asset as keyof typeof TokenImages]
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
                        {TokenSymbols[token.asset as keyof typeof TokenSymbols]}
                      </p>
                      <p className="text-xs text-secondary">
                        {capitalizeFirstLetter(token.chain)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    <p className="text-sm text-primary font-semibold">
                      ${token.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-secondary font-semibold text-right">
                      -$
                      {getAmountDeducted(
                        amountDue!,
                        selectedTokens,
                        token
                      ).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            ))}

            {/* Advanced payment options */}
            <AdvancedPaymentModal>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center w-full gap-1.5 border border-secondary-foreground rounded-[8px] cursor-pointer py-2 mt-2"
              >
                <SquarePen className="size-[18px] text-primary" />
                <p className="text-xs text-primary font-semibold">
                  Advanced Payment Options
                </p>
              </motion.button>
            </AdvancedPaymentModal>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
