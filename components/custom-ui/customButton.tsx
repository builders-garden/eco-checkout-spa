import { cn } from "@/lib/shadcn/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CustomButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  text: string;
  className?: string;
}

export const CustomButton = ({
  isLoading = false,
  isDisabled = false,
  onClick,
  text,
  className,
}: CustomButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{
        scale: isLoading || isDisabled ? 1 : 1.015,
      }}
      whileTap={{
        scale: isLoading || isDisabled ? 1 : 0.985,
      }}
      className={cn(
        "sticky sm:bottom-0 bottom-10 left-0 right-0 flex justify-center items-center w-full sm:pt-2 sm:relative sm:p-0 mt-auto sm:bg-transparent bg-background",
        className
      )}
    >
      <motion.button
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoading || isDisabled ? 0.7 : 1,
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className={`flex justify-center items-center w-full bg-primary rounded-[8px] p-4 h-[60px] transition-all duration-300 ${
          isDisabled || isLoading ? "cursor-default" : "cursor-pointer"
        }`}
        type="button"
        disabled={isLoading || isDisabled}
      >
        <p className="text-xl text-white font-bold">
          {isLoading ? <Loader2 className="size-6 animate-spin" /> : text}
        </p>
      </motion.button>
    </motion.div>
  );
};
