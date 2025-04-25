import { useState } from "react";
import { Button } from "../../../shadcn-ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "../../../shadcn-ui/dialog";
import { Dialog } from "../../../shadcn-ui/dialog";
import { ScrollArea } from "../../../shadcn-ui/scroll-area";
import { UserAsset } from "@/lib/types";
import { cn } from "@/lib/shadcn/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { SelectableToken } from "./selectable-token";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useUserBalances } from "@/components/providers/user-balances-provider";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";

interface AdvancedPaymentModalProps {
  children: React.ReactNode;
}

export const AdvancedPaymentModal = ({
  children,
}: AdvancedPaymentModalProps) => {
  const { selectedTokens, setSelectedTokens } = useSelectedTokens();
  const { userBalances } = useUserBalances();
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  const [open, setOpen] = useState(false);
  const [modalSelectedTokens, setModalSelectedTokens] =
    useState<UserAsset[]>(selectedTokens);

  // Calculate the total fees of the selected tokens inside the modal
  const totalModalSelectedTokensFees = modalSelectedTokens?.reduce(
    (acc, token) => {
      return acc + token.estimatedFee;
    },
    0
  );

  // Calculate the selected total inside the modal
  const modalSelectedTotal = modalSelectedTokens?.reduce((acc, token) => {
    return acc + token.amount;
  }, 0);

  // Check if the selected amount is enough to cover the required amount
  const isAmountReached =
    modalSelectedTotal >= amountDue! + totalModalSelectedTokensFees!;

  // Handle the open state of the modal
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    setModalSelectedTokens(selectedTokens);
  };

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
            Required: ${(amountDue! + totalModalSelectedTokensFees!).toFixed(2)}
          </p>
          <p
            className={cn(
              "transition-all duration-300 font-semibold text-right",
              isAmountReached ? "text-success" : "text-warning"
            )}
          >
            Selected: ${modalSelectedTotal.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-col justify-start items-start w-full">
          <ScrollArea className="h-[256px] w-full">
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
                animate={{ opacity: 1, height: "44px" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-end w-full overflow-hidden"
              >
                <div className="flex justify-start items-center w-full border border-warning bg-warning/10 rounded-[8px] h-[32px] px-2 gap-2">
                  <Info className="size-3.5 text-warning" />
                  <p className="text-xs text-warning">
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
