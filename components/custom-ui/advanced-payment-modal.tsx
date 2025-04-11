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
import { SuccessCircle } from "./success-circle";
import { UserAsset } from "@/lib/types";
import { cn } from "@/lib/shadcn/utils";

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

  // Check if the selected amount is enough to cover the required amount
  const isAmountReached = selectedTotal >= amountDue;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <ScrollArea className="h-[232px] w-full">
          <div className="flex flex-col gap-2 justify-start items-start w-[98%]">
            {userAssets && userAssets.length > 0 ? (
              userAssets.map((token) => (
                <SelectableToken
                  key={`${token.asset}-${token.chain}`}
                  token={token}
                  selectedTokens={selectedTokens}
                  setSelectedTokens={setSelectedTokens}
                  selectedTotal={selectedTotal}
                  amountDue={amountDue}
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
        <DialogFooter className="flex justify-between items-center w-full">
          <div className="flex justify-start items-center w-full gap-2">
            <p>Selected total:</p>
            <span className="font-bold text-primary">
              $
              {selectedTotal > amountDue
                ? amountDue.toFixed(2)
                : selectedTotal?.toString().slice(0, 4)}{" "}
              / ${amountDue.toFixed(2)}
            </span>
            <SuccessCircle
              currentAmount={selectedTotal}
              goalAmount={amountDue}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
