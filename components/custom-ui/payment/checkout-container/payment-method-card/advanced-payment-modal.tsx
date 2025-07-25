import { useMemo, useState } from "react";
import { Button } from "@/components/shadcn-ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "@/components/shadcn-ui/dialog";
import { Dialog } from "@/components/shadcn-ui/dialog";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { UserAsset } from "@/lib/types";
import { cn } from "@/lib/shadcn/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { SelectableToken } from "./selectable-token";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useUserBalances } from "@/components/providers/user-balances-provider";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { PartialTokenListTooltip } from "./partial-token-list-tooltip";
import { useIsMobile } from "@/components/providers/is-mobile-provider";

interface AdvancedPaymentModalProps {
  children: React.ReactNode;
}

export const AdvancedPaymentModal = ({
  children,
}: AdvancedPaymentModalProps) => {
  const { isMobile } = useIsMobile();
  const { selectedTokens, setSelectedTokens } = useSelectedTokens();
  const { userBalances } = useUserBalances();
  const { paymentParams, amountDueRaw } = usePaymentParams();
  const { amountDue } = paymentParams;

  const [open, setOpen] = useState(false);
  const [modalSelectedTokens, setModalSelectedTokens] =
    useState<UserAsset[]>(selectedTokens);

  // Calculate the selected total inside the modal
  const { modalSelectedTotal, humanReadableTotal } =
    modalSelectedTokens?.reduce(
      (acc, token) => {
        return {
          modalSelectedTotal: acc.modalSelectedTotal + token.amount,
          humanReadableTotal:
            acc.humanReadableTotal + token.humanReadableAmount,
        };
      },
      { modalSelectedTotal: 0, humanReadableTotal: "0" }
    );

  // Check if the selected amount is enough to cover the required amount
  const isAmountReached = modalSelectedTotal >= amountDueRaw;

  // Handle the open state of the modal
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    setModalSelectedTokens(selectedTokens);
  };

  // Calculate the height of the scroll area based on the number of tokens
  const scrollAreaHeight = useMemo(() => {
    const tokenCount = userBalances?.length;
    if (isMobile) {
      return tokenCount >= 3 ? 190 : tokenCount * 58 + (tokenCount - 1) * 8;
    }
    return tokenCount >= 4 ? 256 : tokenCount * 58 + (tokenCount - 1) * 8;
  }, [isMobile, userBalances]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="flex flex-col gap-4 justify-start items-start sm:max-w-[487px] max-w-[95%]"
        style={{
          zIndex: 1000,
        }}
      >
        <DialogHeader className="flex flex-col gap-1 justify-start items-start">
          <DialogTitle>Advanced Payment Options</DialogTitle>
          <DialogDescription className="text-left text-[13px] sm:text-sm">
            Select tokens to use for payment. <br />
            Total selected must cover the required amount.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center w-[98%]">
          <p className="font-semibold">
            Required: {isMobile && <br />}${amountDue!.toFixed(2)}
          </p>
          <p
            className={cn(
              "transition-all duration-300 font-semibold text-right",
              isAmountReached ? "text-success" : "text-warning"
            )}
          >
            Selected: {isMobile && <br />}${humanReadableTotal}
          </p>
        </div>

        <div className="flex flex-col justify-start items-start w-full">
          <PartialTokenListTooltip />
          <ScrollArea className="w-full" style={{ height: scrollAreaHeight }}>
            <div className="flex flex-col gap-2 justify-start items-start w-[98%]">
              {userBalances && userBalances.length > 0 ? (
                userBalances.map((token, index) => (
                  <SelectableToken
                    key={`${token.asset}-${token.chain}`}
                    token={token}
                    index={index}
                    isAmountReached={isAmountReached}
                    selectedTokens={modalSelectedTokens}
                    setSelectedTokens={setModalSelectedTokens}
                  />
                ))
              ) : (
                <p className="text-lg font-medium w-full my-7 text-center text-secondary">
                  No tokens found
                  <br />
                  Try connecting to a different wallet
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Show warning if the selected tokens don't cover the required amount */}
          <AnimatePresence mode="wait">
            {!isAmountReached && (
              <motion.div
                key={`warning-${amountDue}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: isMobile ? "40px" : "44px" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-end overflow-hidden w-[98%]"
              >
                <div className="flex justify-start items-center w-full border border-warning bg-warning/10 rounded-[8px] h-[32px] px-2 gap-2">
                  <Info className="size-4 sm:size-3.5 text-warning" />
                  <p className="text-[11px] leading-3 sm:leading-4 sm:text-xs text-warning">
                    Selected tokens don&apos;t cover the required amount ($
                    {amountDue!.toFixed(2)})
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between items-center w-[98%]">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
            }}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSelectedTokens(modalSelectedTokens);
              setOpen(false);
            }}
            className="cursor-pointer"
            disabled={!isAmountReached}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
