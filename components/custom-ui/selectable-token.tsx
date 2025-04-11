import { TokenImages, ChainImages, TokenSymbols } from "@/lib/enums";
import { cn } from "@/lib/shadcn/utils";
import { UserAsset } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface SelectableTokenProps {
  token: UserAsset;
  selectedTokens: UserAsset[];
  setSelectedTokens: (tokens: UserAsset[]) => void;
  selectedTotal: number;
  amountDue: number;
  index: number;
}

export const SelectableToken = ({
  token,
  selectedTokens,
  setSelectedTokens,
  selectedTotal,
  amountDue,
  index,
}: SelectableTokenProps) => {
  const isSelected = selectedTokens.some((t) => t === token);

  const handleSelectToken = () => {
    if (isSelected) {
      setSelectedTokens(selectedTokens.filter((t) => t !== token));
    } else if (selectedTotal < amountDue) {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  return (
    <motion.button
      key={`${token.asset}-${token.chain}`}
      onClick={handleSelectToken}
      className={cn(
        "flex justify-between w-full items-center rounded-[8px] border border-secondary-foreground p-3 cursor-pointer transition-all duration-200",
        isSelected && "border-success"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
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
      <p className="text-sm text-primary font-semibold">
        ${token.amount.toString().slice(0, 4)}
      </p>
    </motion.button>
  );
};
