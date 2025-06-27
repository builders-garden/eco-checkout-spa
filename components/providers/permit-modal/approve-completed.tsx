import { CustomButton } from "@/components/custom-ui/customButton";
import { TransactionsList } from "@/components/custom-ui/transactions-list";
import { ActionItem, HookStatus } from "@/hooks/use-consecutive-wagmi-actions";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { usePermitModal } from "./permit-modal-provider";

interface ApproveCompletedProps {
  onOpenChange: (open: boolean) => void;
  queuedActions: ActionItem[];
  currentActionIndex: number;
  hookStatus: HookStatus;
}

export const ApproveCompleted = ({
  onOpenChange,
  queuedActions,
  currentActionIndex,
  hookStatus,
}: ApproveCompletedProps) => {
  const { setAllApprovalsCompleted } = usePermitModal();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start items-center size-full min-h-screen sm:min-h-0 sm:max-w-[496px] gap-5 sm:gap-8 pt-3"
    >
      <div className="flex flex-col justify-center items-center w-full gap-5">
        <div className="flex flex-col justify-center items-center w-full gap-1">
          {/* Check Circle */}
          <div className="flex justify-center items-center rounded-full size-[70px] bg-success/30">
            <CheckCircle className="size-9 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Tokens approved!</h1>
        </div>

        <TransactionsList
          queuedActions={queuedActions}
          currentActionIndex={currentActionIndex}
          hookStatus={hookStatus}
          showState={false}
        />
      </div>

      {/* Close modal button */}
      <CustomButton
        text="Close"
        onClick={() => {
          setAllApprovalsCompleted(true);
          onOpenChange(false);
        }}
        className="w-full max-w-[98.5%] mx-auto"
      />
    </motion.div>
  );
};
