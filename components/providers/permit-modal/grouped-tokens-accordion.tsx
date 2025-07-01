import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../shadcn-ui/accordion";
import { TokenImages, TokenSymbols } from "@/lib/enums";
import { cn } from "@/lib/shadcn/utils";
import { UserAsset } from "@/lib/types";
import { deepCompareUserAssets } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ChainToken } from "./chain-token";
import { usePermitModal } from "./permit-modal-provider";

interface GroupedTokensAccordionProps {
  token: string;
  tokenBalances: UserAsset[];
  unselectable: boolean;
  onAccordionChange?: (isOpen: boolean) => void;
}

export const GroupedTokensAccordion = ({
  token,
  tokenBalances,
  unselectable,
  onAccordionChange,
}: GroupedTokensAccordionProps) => {
  const {
    selectedTokensToApprove,
    addTokensToApproveList,
    removeTokensFromApproveList,
  } = usePermitModal();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Whether the whole token group is selected
  const isWholeTokenGroupSelected = useMemo(
    () =>
      tokenBalances.every((balance) =>
        selectedTokensToApprove.some((token) =>
          deepCompareUserAssets(token, balance)
        )
      ),
    [tokenBalances, selectedTokensToApprove]
  );

  // Whether the whole token group is already approved
  const isWholeTokenGroupApproved = useMemo(
    () => tokenBalances.every((balance) => balance.hasPermit),
    [tokenBalances]
  );

  // Handle selecting a whole token group
  const handleSelectWholeTokenGroup = () => {
    if (unselectable) return;

    if (!isWholeTokenGroupSelected) {
      addTokensToApproveList(tokenBalances);
    } else {
      removeTokensFromApproveList(tokenBalances);
    }
  };

  const handleAccordionChange = (value: string) => {
    const isOpen = value === "item-1";
    setIsAccordionOpen(isOpen);
    onAccordionChange?.(isOpen);
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={handleAccordionChange}
    >
      <AccordionItem
        value="item-1"
        className="bg-secondary-foreground rounded-lg"
      >
        <AccordionTrigger
          className="text-sm p-3 cursor-pointer group"
          showChevron={false}
        >
          <div className="flex justify-start items-center gap-2">
            <img
              src={TokenImages[token as keyof typeof TokenImages]}
              alt={`${token} logo`}
              width={31}
              height={31}
              className="object-cover rounded-full"
            />
            <p className="text-sm font-medium">
              {TokenSymbols[token as keyof typeof TokenSymbols]}
            </p>
          </div>
          <div className="flex justify-end items-center h-full gap-1">
            {unselectable && isWholeTokenGroupApproved ? (
              <div className="flex justify-center items-center gap-2">
                <p className="text-xs text-secondary">All set!</p>
                <div className="flex justify-center items-center rounded-full bg-success size-[17px] sm:size-[20px] sm:mr-1">
                  <Check className="size-3 text-white" />
                </div>
              </div>
            ) : (
              !unselectable && (
                <div
                  className={cn(
                    "flex justify-center items-center rounded-[5px] sm:rounded-[6px] border border-success size-[17px] sm:size-[20px] sm:mr-1 transition-all duration-200",
                    isWholeTokenGroupSelected && "border-success"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectWholeTokenGroup();
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isWholeTokenGroupSelected && (
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
              )
            )}
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
            {tokenBalances.map((balance) => (
              <ChainToken
                key={`${token}-${balance.asset}-${balance.chain}`}
                token={balance}
                unselectable={unselectable}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
