import { useState } from "react";
import { Button } from "../shadcn-ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "../shadcn-ui/dialog";
import { Dialog } from "../shadcn-ui/dialog";
import { ScrollArea } from "../shadcn-ui/scroll-area";
import { SelectableToken } from "./selectable-token";
import { UserAsset } from "@/lib/types";
import { cn } from "@/lib/shadcn/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";

interface AdvancedPaymentModalProps {
  children: React.ReactNode;
  amountDue: number;
  userAssets: UserAsset[] | undefined;
  selectedTokens: UserAsset[];
  setSelectedTokens: (tokens: UserAsset[]) => void;
  selectedTotal: number;
}

export const AdvancedPaymentModal = ({
  children,
  amountDue,
  userAssets,
  selectedTokens,
  setSelectedTokens,
  selectedTotal,
}: AdvancedPaymentModalProps) => {
  const [open, setOpen] = useState(false);
  const [modalSelectedTokens, setModalSelectedTokens] =
    useState<UserAsset[]>(selectedTokens);

  // Calculate the selected total inside the modal
  const modalSelectedTotal = modalSelectedTokens?.reduce((acc, token) => {
    return acc + token.amount;
  }, 0);

  // Check if the selected amount is enough to cover the required amount
  const isAmountReached = modalSelectedTotal >= amountDue;

  // Handle the open state of the modal
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    setModalSelectedTokens(selectedTokens);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="flex flex-col gap-4 justify-start items-start sm:max-w-[487px]"
        style={{
          zIndex: 1000,
        }}
      >
        <DialogHeader className="flex flex-col gap-1 justify-start items-start">
          <DialogTitle>Advanced Payment Options</DialogTitle>
          <DialogDescription>
            Select tokens to use for payment. Total selected must cover the
            required amount.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center w-full">
          <p className="font-semibold">
            Required amount: ${amountDue.toFixed(2)}
          </p>
          <p
            className={cn(
              "transition-all duration-300 font-semibold",
              isAmountReached ? "text-success" : "text-warning"
            )}
          >
            Selected: ${selectedTotal.toString().slice(0, 4)}
          </p>
        </div>

        <div className="flex flex-col justify-start items-start w-full">
          <ScrollArea className="h-[255px] w-full">
            <div className="flex flex-col gap-2 justify-start items-start w-[98%]">
              {userAssets && userAssets.length > 0 ? (
                userAssets.map((token, index) => (
                  <SelectableToken
                    key={`${token.asset}-${token.chain}`}
                    token={token}
                    selectedTokens={modalSelectedTokens}
                    setSelectedTokens={setModalSelectedTokens}
                    selectedTotal={modalSelectedTotal}
                    amountDue={amountDue}
                    index={index}
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
                    {amountDue.toFixed(2)})
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
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
