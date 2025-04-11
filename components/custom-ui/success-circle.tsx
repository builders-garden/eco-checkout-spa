import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";
interface SuccessCircleProps {
  currentAmount: number;
  goalAmount: number;
  className?: string;
}

export const SuccessCircle = ({
  currentAmount,
  goalAmount,
  className,
}: SuccessCircleProps) => {
  return (
    <AnimatePresence mode="wait">
      {currentAmount > goalAmount && (
        <motion.div
          key="tick"
          initial={{ scale: 0.95 }}
          animate={{ scale: [1, 1.35, 1] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("flex justify-center items-center", className)}
        >
          <CircleCheck className="w-4 h-4 text-green-500" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
