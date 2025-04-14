import { TokenImages, ChainImages, TokenSymbols } from "@/lib/enums";
import { cn } from "@/lib/shadcn/utils";
import { UserAsset } from "@/lib/types";
import { capitalizeFirstLetter, getAmountDeducted } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo } from "react";

interface SelectableTokenProps {
  token: UserAsset;
  selectedTokens: UserAsset[];
  setSelectedTokens: (tokens: UserAsset[]) => void;
  index: number;
  isAmountReached: boolean;
  amountDue: number;
}

export const SelectableToken = ({
  token,
  selectedTokens,
  setSelectedTokens,
  index,
  isAmountReached,
  amountDue,
}: SelectableTokenProps) => {
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
    return getAmountDeducted(amountDue, selectedTokens, token);
  }, [amountDue, token.amount, selectedTokens]);

  return (
    <motion.button
      key={`${token.asset}-${token.chain}`}
      onClick={handleSelectToken}
      className={cn(
        "flex justify-between w-full items-center rounded-[8px] border border-secondary-foreground p-3 cursor-pointer transition-all duration-200",
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
            "flex justify-center items-center rounded-[6px] border border-secondary-foreground size-[20px] mr-1 transition-all duration-200",
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
                className="flex justify-center items-center bg-success rounded-[6px] size-[20px]"
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
          <p className="text-xs text-secondary">
            {capitalizeFirstLetter(token.chain)}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center gap-3">
        {isSelected && (
          <p className="text-sm text-secondary font-semibold">
            -${amountDeducted.toFixed(2)}
          </p>
        )}
        <p className="text-sm text-primary font-semibold">
          ${token.amount.toFixed(2)}
        </p>
      </div>
    </motion.button>
  );
};
