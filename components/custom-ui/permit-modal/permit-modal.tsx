import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn-ui/dialog";
import { useAppKitAccount } from "@reown/appkit/react";
import { Separator } from "../../shadcn-ui/separator";
import { TopCard } from "./top-card";
import { CustomButton } from "@/components/custom-ui/customButton";
import { useState } from "react";
import { ResizablePanel } from "@/components/custom-ui/resizable-panel";
import { PermitModalState } from "@/lib/enums";
import { TokensSection } from "./tokens-section";
import { ApproveContainer } from "./approve-container";
import { ApproveCompleted } from "./approve-completed";
import { useConsecutiveWagmiActions } from "@/hooks/use-consecutive-wagmi-actions";
import { config } from "@/lib/appkit";
import { usePermitModal } from "@/components/providers/permit-modal-provider";

interface PermitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setAllApprovalsCompleted: (allApprovalsCompleted: boolean) => void;
}

export const PermitModal = ({
  open,
  onOpenChange,
  setAllApprovalsCompleted,
}: PermitModalProps) => {
  const { address } = useAppKitAccount();
  const [permitModalState, setPermitModalState] = useState<PermitModalState>(
    PermitModalState.SELECT
  );
  const {
    selectedTokensToApprove,
    approveWagmiActions,
    mandatoryTokensAmount,
    otherTokensAmount,
  } = usePermitModal();

  // Handle Permit Modal Close
  const handlePermitModalClose = () => {
    setPermitModalState(PermitModalState.SELECT);
    onOpenChange(false);
  };

  // Initialize the hook
  const { start, retry, queuedActions, hookStatus } =
    useConsecutiveWagmiActions({
      config,
      initialWagmiActions: approveWagmiActions,
    });

  return (
    <Dialog open={open} onOpenChange={handlePermitModalClose}>
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
        <ResizablePanel
          initialHeight={
            235 +
            (mandatoryTokensAmount > 0 ? 20 + mandatoryTokensAmount * 63 : 0) +
            (otherTokensAmount > 0 ? 36 + otherTokensAmount * 63 : 0)
          }
          id={permitModalState}
        >
          {permitModalState === "select" && (
            <div className="flex flex-col gap-4 w-full">
              {/* Card */}
              <TopCard onOpenChange={onOpenChange} address={address ?? ""} />

              <Separator dashed />

              {/* Tokens Section */}
              <TokensSection />

              {/* Continue Button */}
              <CustomButton
                text="Continue"
                onClick={() => {
                  if (selectedTokensToApprove.length > 0) {
                    setPermitModalState(PermitModalState.APPROVE);
                  } else {
                    handlePermitModalClose();
                    setAllApprovalsCompleted(true);
                  }
                }}
                className="w-full max-w-[98.5%] mx-auto"
              />
            </div>
          )}

          {permitModalState === "approve" && (
            <ApproveContainer
              setPermitModalState={setPermitModalState}
              setAllApprovalsCompleted={setAllApprovalsCompleted}
              hookStatus={hookStatus}
              queuedActions={queuedActions}
              start={start}
              retry={retry}
            />
          )}

          {permitModalState === "end" && (
            <ApproveCompleted
              onOpenChange={onOpenChange}
              queuedActions={queuedActions}
            />
          )}
        </ResizablePanel>
      </DialogContent>
    </Dialog>
  );
};
