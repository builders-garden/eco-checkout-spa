import { AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/components/providers/is-mobile-provider";

interface BlueInfoBoxProps {
  isFormComplete: boolean;
}

export const BlueInfoBox = ({ isFormComplete }: BlueInfoBoxProps) => {
  const { isMobile } = useIsMobile();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isFormComplete && (
        <motion.div
          key="blue-warning"
          initial={{ opacity: 0, height: isMobile ? "96px" : 0 }}
          animate={{ opacity: 1, height: "96px" }}
          exit={{ opacity: 0, height: isMobile ? "96px" : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-end w-full overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 rounded-md bg-blue-50 border border-blue-700 text-blue-700 h-[72px]">
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Please fill out all required fields to continue with the payment
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
