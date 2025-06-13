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
import { UserAssetsByChain } from "@/lib/types";
import { TopCard } from "./top-card";
import { CustomButton } from "@/components/custom-ui/customButton";
import { useEffect, useState, useMemo } from "react";
import { ResizablePanel } from "@/components/custom-ui/resizable-panel";
import { useSelectedTokens } from "../selected-tokens-provider";
import { RelayoorChain } from "@/lib/relayoor/types";
import { PermitModalState } from "@/lib/enums";
import { BottomAccordions } from "./bottom-accordions";

interface PermitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PermitModal = ({ open, onOpenChange }: PermitModalProps) => {
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { userBalances } = useUserBalances();
  const { selectedTokens } = useSelectedTokens();
  const [selectedTokensToApprove, setSelectedTokensToApprove] =
    useState<UserAssetsByChain>({});
  const [permitModalState, setPermitModalState] = useState<PermitModalState>(
    PermitModalState.SELECT
  );

  // Get all the chains of the selected tokens
  const allSelectedChains = useMemo(
    () => selectedTokens.map((token) => token.chain),
    [selectedTokens]
  );

  // Group the user balances by chain
  const allGroupedUserBalances = useMemo(
    () => groupUserBalancesByChain(userBalances),
    [userBalances]
  );

  // Set the selected tokens to approve later in the flow
  useEffect(() => {
    let selectedTokensToApprove: UserAssetsByChain = {};

    Object.entries(allGroupedUserBalances).forEach(([chain, balances]) => {
      if (allSelectedChains.includes(chain as RelayoorChain)) {
        selectedTokensToApprove[chain] = balances;
      } else {
        selectedTokensToApprove[chain] = [];
      }
    });

    setSelectedTokensToApprove(selectedTokensToApprove);
  }, [allGroupedUserBalances, allSelectedChains]);

  // Log the selected tokens to approve TODO: remove this later
  useEffect(() => {
    console.log("selectedTokensToApprove", selectedTokensToApprove);
  }, [selectedTokensToApprove]);

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
                selectedTokensToApprove={selectedTokensToApprove}
              />

              <Separator dashed />

              <BottomAccordions
                allGroupedUserBalances={allGroupedUserBalances}
                allSelectedChains={allSelectedChains}
                selectedTokensToApprove={selectedTokensToApprove}
                setSelectedTokensToApprove={setSelectedTokensToApprove}
              />
            </div>
          )}

          {permitModalState === "approve" && (
            <div className="flex flex-col gap-4">
              {Object.entries(selectedTokensToApprove).map(
                ([chain, balances]) => {
                  if (balances.length > 0) {
                    return (
                      <div key={chain}>
                        {chain} {balances.length}
                      </div>
                    );
                  }
                  return null;
                }
              )}
            </div>
          )}
        </ResizablePanel>
        <DialogFooter>
          <CustomButton
            text="Continue"
            onClick={() => {
              setPermitModalState(
                permitModalState === PermitModalState.SELECT
                  ? PermitModalState.APPROVE
                  : PermitModalState.SELECT
              );
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
