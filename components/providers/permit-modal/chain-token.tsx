import { TokenImages, TokenSymbols } from "@/lib/enums";
import { UserAsset } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";
import { usePermitModal } from "./permit-modal-provider";
import { capitalizeFirstLetter, deepCompareUserAssets } from "@/lib/utils";
import { TokenAssetChainIcon } from "@/components/custom-ui/token-asset-chain-icon";

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
        "flex justify-between items-center border border-border rounded-lg px-3 h-[55px] transition-all duration-200",
        !unselectable && "cursor-pointer",
        !isTokenSelected && !unselectable && "opacity-50"
      )}
      onClick={() => {
        if (!unselectable) {
          handleSelectToken(token);
        }
      }}
    >
      <div className="flex justify-start items-center shrink-0 gap-2">
        <TokenAssetChainIcon asset={token.asset} chain={token.chain} />
        <p className="text-sm font-medium">
          {TokenSymbols[token.asset as keyof typeof TokenSymbols]} on{" "}
          {capitalizeFirstLetter(token.chain)}
        </p>
      </div>
      {unselectable ? (
        <div className="flex justify-center items-center gap-2">
          {token.hasPermit && (
            <p className="text-xs text-secondary">Already approved</p>
          )}
          <div className="flex justify-center items-center rounded-full bg-success size-[17px] sm:size-[20px]">
            <Check className="size-3 text-white" />
          </div>
        </div>
      ) : (
        !unselectable && (
          <div className="flex justify-center items-center sm:mr-[3px] gap-2">
            <p className="text-sm text-secondary">
              ${token.humanReadableAmount.toFixed(2)}
            </p>
            <div
              className={cn(
                "flex justify-center items-center rounded-[5px] sm:rounded-[6px] border border-success size-[17px] sm:size-[20px] transition-all duration-200 cursor-pointer",
                isTokenSelected && "border-success"
              )}
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
          </div>
        )
      )}
    </div>
  );
};
