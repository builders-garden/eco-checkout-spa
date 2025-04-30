import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { TokenImages, ChainImages, TokenSymbols } from "@/lib/enums";
import { cn } from "@/lib/shadcn/utils";
import { UserAsset } from "@/lib/types";
import {
  capitalizeFirstLetter,
  getAmountDeducted,
  twoDecimalsSlicingString,
} from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo } from "react";

interface SelectableTokenProps {
  token: UserAsset;
  index: number;
  isAmountReached: boolean;
  selectedTokens: UserAsset[];
  setSelectedTokens: (tokens: UserAsset[]) => void;
}

export const SelectableToken = ({
  token,
  index,
  isAmountReached,
  selectedTokens,
  setSelectedTokens,
}: SelectableTokenProps) => {
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  const isSelected = selectedTokens.some((t) => t === token);

  const handleSelectToken = () => {
    if (isSelected) {
      setSelectedTokens(selectedTokens.filter((t) => t !== token));
    } else if (!isAmountReached) {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  // Calculate the amount deducted from this specific token
  const amountDeducted = useMemo(() => {
    return getAmountDeducted(amountDue!, selectedTokens, token);
  }, [amountDue, token.spendableAmount, selectedTokens]);

  return (
    <motion.button
      key={`${token.asset}-${token.chain}`}
      onClick={handleSelectToken}
      className={cn(
        "flex justify-between w-full items-center rounded-[8px] h-[58px] border border-secondary-foreground p-3 cursor-pointer transition-all duration-200",
        isSelected && "border-success"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: isAmountReached && !isSelected ? 0.5 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, delay: index * 0.1 }}
    >
      <div className="flex justify-start items-center gap-2">
        <div
          className={cn(
            "flex justify-center items-center rounded-[5px] sm:rounded-[6px] border border-secondary-foreground size-[17px] sm:size-[20px] sm:mr-1 transition-all duration-200",
            isSelected && "border-success"
          )}
        >
          <AnimatePresence mode="wait">
            {isSelected && (
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
        <div className="relative flex justify-center items-center">
          <img
            src={TokenImages[token.asset as keyof typeof TokenImages]}
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
          <p className="text-[11px] sm:text-xs text-secondary">
            {capitalizeFirstLetter(token.chain)}{" "}
            <span className="text-[10px] sm:text-[11px]">
              {token.estimatedFee === 0
                ? "(free)"
                : token.estimatedFee < 0.01
                ? "(< $0.01 fee)"
                : `($${twoDecimalsSlicingString(token.estimatedFee)} fee)`}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-end">
        <p className="text-sm text-primary font-semibold">
          ${twoDecimalsSlicingString(token.amount)}
        </p>
        {isSelected && (
          <p className="text-xs text-secondary font-semibold">
            -${twoDecimalsSlicingString(amountDeducted)}
          </p>
        )}
      </div>
    </motion.button>
  );
};
