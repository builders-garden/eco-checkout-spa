import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CustomButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  text: string;
}

export const CustomButton = ({
  isLoading = false,
  isDisabled = false,
  onClick,
  text,
}: CustomButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{
        opacity: isLoading || isDisabled ? 0.7 : 1,
      }}
      whileHover={{
        scale: isLoading || isDisabled ? 1 : 1.015,
      }}
      whileTap={{
        scale: isLoading || isDisabled ? 1 : 0.985,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex justify-center items-center w-full bg-primary rounded-[8px] p-4 h-[60px] cursor-pointer"
      type="button"
      disabled={isLoading || isDisabled}
    >
      <p className="text-xl text-white font-bold">
        {isLoading ? <Loader2 className="size-6 animate-spin" /> : text}
      </p>
    </motion.button>
  );
};
