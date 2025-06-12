import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../shadcn-ui/accordion";
import { ChainImages } from "@/lib/enums";
import { cn } from "@/lib/shadcn/utils";
import { UserAsset } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ChainToken } from "./chain-token";

interface ChainAccordionProps {
  chain: string;
  balances: UserAsset[];
  selectedTokens: Record<string, UserAsset[]>;
  setSelectedTokens: (tokens: Record<string, UserAsset[]>) => void;
}

export const ChainAccordion = ({
  chain,
  balances,
  selectedTokens,
  setSelectedTokens,
}: ChainAccordionProps) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Calculate the total amount of tokens on the chain
  const totalChainAmount = balances.reduce(
    (acc, balance) => acc + balance.humanReadableAmount,
    0
  );

  // Whether the whole chain tokens are selected
  const isWholeChainSelected = selectedTokens[chain].length === balances.length;

  // Handle selecting a whole chain
  const handleSelectWholeChain = () => {
    if (!isWholeChainSelected) {
      setSelectedTokens({
        ...selectedTokens,
        [chain]: balances,
      });
    } else {
      setSelectedTokens({
        ...selectedTokens,
        [chain]: [],
      });
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={(value) => setIsAccordionOpen(value === "item-1")}
    >
      <AccordionItem
        value="item-1"
        className="bg-secondary-foreground rounded-lg"
      >
        <AccordionTrigger
          className="text-sm px-3.5 cursor-pointer"
          showChevron={false}
        >
          <div className="flex justify-start items-center">
            <img
              src={ChainImages[chain as keyof typeof ChainImages]}
              alt={chain}
              className="size-4.5 mr-2"
            />
            <p>
              <span className="font-semibold">
                ${totalChainAmount.toFixed(2)}
              </span>{" "}
              on {capitalizeFirstLetter(chain)}
            </p>
          </div>
          <div className="flex justify-end items-center gap-1">
            <div
              className={cn(
                "flex justify-center items-center rounded-[5px] sm:rounded-[6px] border border-success size-[17px] sm:size-[20px] sm:mr-1 transition-all duration-200",
                isWholeChainSelected && "border-success"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectWholeChain();
              }}
            >
              <AnimatePresence mode="wait">
                {isWholeChainSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-center items-center bg-success rounded-[5px] sm:rounded-[6px] size-[17px] sm:size-[20px]"
                  >
                    <Check className="size-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200",
                isAccordionOpen && "rotate-180"
              )}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col px-1 pb-1 pt-0.5 transition-all duration-300">
          <div className="flex flex-col bg-background rounded-lg p-4 gap-2">
            {balances.map((balance) => (
              <ChainToken
                key={chain + balance.asset}
                chain={chain}
                token={balance}
                selectedTokens={selectedTokens}
                setSelectedTokens={setSelectedTokens}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
