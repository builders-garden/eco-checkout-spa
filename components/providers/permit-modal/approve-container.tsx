import { HookStatus, ActionItem } from "@/hooks/use-consecutive-wagmi-actions";
import { useEffect } from "react";
import { CustomButton } from "@/components/custom-ui/customButton";
import { PermitModalState } from "@/lib/enums";
import { TransactionsList } from "@/components/custom-ui/transactions-list";

interface ApproveContainerProps {
  setPermitModalState: (state: PermitModalState) => void;
  setAllApprovalsCompleted: (allApprovalsCompleted: boolean) => void;
  hookStatus: HookStatus;
  queuedActions: ActionItem[];
  start: () => void;
  retry: () => void;
}

export const ApproveContainer = ({
  setPermitModalState,
  setAllApprovalsCompleted,
  hookStatus,
  queuedActions,
  start,
  retry,
}: ApproveContainerProps) => {
  // If the hook has finished, set the state to end
  useEffect(() => {
    if (hookStatus === HookStatus.FINISHED) {
      setPermitModalState(PermitModalState.END);
      setAllApprovalsCompleted(true);
    }
  }, [hookStatus]);

  // Start the hook at mount
  useEffect(() => {
    setTimeout(() => {
      start();
    }, 300);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <TransactionsList queuedActions={queuedActions} />

      <CustomButton
        text={hookStatus === HookStatus.ERROR ? "Retry" : ""}
        onClick={() => {
          if (hookStatus === HookStatus.ERROR) {
            retry();
          }
        }}
        isLoading={hookStatus === HookStatus.RUNNING}
        isDisabled={hookStatus === HookStatus.RUNNING}
      />
    </div>
  );
};
