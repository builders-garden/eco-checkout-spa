import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn-ui/dialog";
import { groupUserBalancesByChain } from "@/lib/utils";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { Separator } from "../../shadcn-ui/separator";
import { useUserBalances } from "../user-balances-provider";
import { ChainAccordion } from "./chain-accordion";
import { UserAsset } from "@/lib/types";
import { TopCard } from "./top-card";
import { CustomButton } from "@/components/custom-ui/customButton";
import { useEffect, useState } from "react";
import { useMemo } from "react";
import { ResizablePanel } from "@/components/custom-ui/resizable-panel";
import { useSelectedTokens } from "../selected-tokens-provider";

interface PermitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PermitModal = ({ open, onOpenChange }: PermitModalProps) => {
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { userBalances } = useUserBalances();
  const { selectedTokens } = useSelectedTokens();
  const [selectedTokensToApprove, setSelectedTokensToApprove] = useState<
    Record<string, UserAsset[]>
  >({});
  const [allGroupedUserBalances, setAllGroupedUserBalances] = useState<
    Record<string, UserAsset[]>
  >({});
  const [permitModalState, setPermitModalState] = useState<
    "select" | "approve" | "end"
  >("select");

  // Group the user tokens by chain and set the selected tokens to approve
  useEffect(() => {
    const allGroupedUserBalances = groupUserBalancesByChain(userBalances);
    setAllGroupedUserBalances(allGroupedUserBalances);

    let selectedTokensToApprove = groupUserBalancesByChain(selectedTokens);

    // For each chain, if the chain is not among the selected tokens, set the value to []
    Object.keys(allGroupedUserBalances).forEach((chain) => {
      if (!selectedTokensToApprove[chain]) {
        selectedTokensToApprove[chain] = [];
      }
    });

    setSelectedTokensToApprove(selectedTokensToApprove);
  }, [userBalances, selectedTokens]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent className="flex flex-col rounded-none sm:rounded-lg sm:gap-5 gap-6 sm:max-w-[550px] sm:h-fit max-w-full h-full">
        <DialogHeader className="flex flex-col gap-1 justify-start items-start">
          <DialogTitle className="text-xl">
            Let&apos;s set up your stables
          </DialogTitle>
          <DialogDescription className="text-left text-[13px] sm:text-sm">
            Allocate your balances for one-click spending
          </DialogDescription>
        </DialogHeader>
        <ResizablePanel initialHeight={423} id={permitModalState}>
          {permitModalState === "select" && (
            <div className="flex flex-col gap-4">
              {/* Card */}
              <TopCard
                onOpenChange={onOpenChange}
                disconnect={disconnect}
                address={address ?? ""}
              />

              <Separator dashed />

              {/* Tokens */}
              <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent">
                {Object.entries(allGroupedUserBalances).map(
                  ([chain, balances]) => (
                    <ChainAccordion
                      key={chain}
                      chain={chain}
                      balances={balances}
                      selectedTokens={selectedTokensToApprove}
                      setSelectedTokens={setSelectedTokensToApprove}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {permitModalState === "approve" && (
            <div className="flex flex-col gap-4">
              <div>Approve</div>
            </div>
          )}
        </ResizablePanel>
        <DialogFooter>
          <CustomButton
            text="Continue"
            onClick={() => {
              setPermitModalState(
                permitModalState === "select" ? "approve" : "select"
              );
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
