import { CustomButton } from "@/components/custom-ui/customButton";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ApproveCompletedProps {
  onOpenChange: (open: boolean) => void;
}

export const ApproveCompleted = ({ onOpenChange }: ApproveCompletedProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start items-center size-full min-h-screen sm:min-h-0 sm:max-w-[496px] gap-5 sm:gap-8 pt-3"
    >
      <div className="flex flex-col justify-center items-center gap-1">
        {/* Check Circle */}
        <div className="flex justify-center items-center rounded-full size-[70px] bg-success/30">
          <CheckCircle className="size-9 text-success" />
        </div>

        <h1 className="text-2xl font-bold">Tokens approved!</h1>
        <p className="text-[15px] text-center text-secondary">
          Your completed all the token approvals.
        </p>
      </div>

      {/* Close modal button */}
      <CustomButton
        text="Close"
        onClick={() => {
          onOpenChange(false);
        }}
        className="w-full max-w-[98.5%] mx-auto"
      />
    </motion.div>
  );
};
