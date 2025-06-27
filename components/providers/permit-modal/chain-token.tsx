import { TokenImages, TokenSymbols } from "@/lib/enums";
import { UserAsset } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";
import { usePermitModal } from "./permit-modal-provider";
import { deepCompareUserAssets } from "@/lib/utils";

interface ChainTokenProps {
  token: UserAsset;
  unselectable: boolean;
}

export const ChainToken = ({ token, unselectable }: ChainTokenProps) => {
  const {
    selectedTokensToApprove,
    addTokensToApproveList,
    removeTokensFromApproveList,
  } = usePermitModal();

  const isTokenSelected = selectedTokensToApprove.some((t) =>
    deepCompareUserAssets(t, token)
  );

  // Handle selecting a single token
  const handleSelectToken = (token: UserAsset) => {
    if (unselectable) return;

    // Deselect the token if it is already selected
    if (isTokenSelected) {
      removeTokensFromApproveList([token]);
    } else {
      addTokensToApproveList([token]);
    }
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center border border-border rounded-lg",
        !isTokenSelected && !unselectable && "opacity-50"
      )}
    >
      <div className="flex justify-start items-center shrink-0 gap-2 border-r border-border p-3">
        <img
          src={TokenImages[token.asset as keyof typeof TokenImages]}
          alt={token.asset}
          className="size-4"
        />
        <p className="text-sm font-medium">
          {TokenSymbols[token.asset as keyof typeof TokenSymbols]}
        </p>
      </div>
      <div className="flex justify-between items-center w-full gap-2 p-3">
        <p className="text-sm font-medium">
          ${token.humanReadableAmount.toFixed(2)}
        </p>
        {unselectable && token.hasPermit ? (
          <div className="flex justify-center items-center gap-2">
            <p className="text-xs text-secondary">Already approved</p>
            <div className="flex justify-center items-center rounded-full bg-success size-[17px] sm:size-[20px] sm:mr-1">
              <Check className="size-3 text-white" />
            </div>
          </div>
        ) : (
          !unselectable && (
            <div
              className={cn(
                "flex justify-center items-center rounded-[5px] sm:rounded-[6px] border border-success size-[17px] sm:size-[20px] sm:mr-1 transition-all duration-200 cursor-pointer",
                isTokenSelected && "border-success"
              )}
              onClick={() => handleSelectToken(token)}
            >
              <AnimatePresence mode="wait">
                {isTokenSelected && (
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
      </div>
    </div>
  );
};
