import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const Loader = () => {
  return (
    <motion.div
      className="flex items-center justify-center h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader2 className="w-12 h-12 animate-spin opacity-70" />
    </motion.div>
  );
};
