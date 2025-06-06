import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

interface ContinueButtonProps {
  isFormValid: boolean;
  handleContinue: () => void;
}

export const ContinueButton = ({
  isFormValid,
  handleContinue,
}: ContinueButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: !isFormValid ? 1 : 1.02 }}
      whileTap={{ scale: !isFormValid ? 1 : 0.98 }}
      onClick={handleContinue}
      className={`flex justify-center items-center w-full bg-primary text-white font-semibold rounded-[8px] p-4 h-[60px] transition-all duration-300 ${
        !isFormValid ? "opacity-70 cursor-default" : "cursor-pointer"
      }`}
      type="button"
      disabled={!isFormValid}
      style={{
        zIndex: 50,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isFormValid ? (
          <motion.span
            key="continue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Continue
          </motion.span>
        ) : (
          <motion.span
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Complete required fields
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
