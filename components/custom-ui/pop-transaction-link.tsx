import { motion } from "framer-motion";
import { SquareArrowOutUpRight } from "lucide-react";

interface PopTransactionLinkProps {
  txLink: string | null;
}

export const PopTransactionLink = ({ txLink }: PopTransactionLinkProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        width: "fit-content",
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      }}
      exit={{ opacity: 0 }}
      className="flex sm:flex-row flex-col justify-center items-end sm:items-center sm:gap-1.5 text-xs underline shrink-0 cursor-pointer"
    >
      {txLink && (
        <motion.div
          key={`link-${txLink}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            scale: [1, 1.025, 1.075, 1.15, 1.075, 1.025, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          layout
          className="flex justify-center items-center gap-1 text-xs underline shrink-0 cursor-pointer"
          onClick={() => window.open(txLink, "_blank")}
        >
          See Tx
          <SquareArrowOutUpRight className="size-3" />
        </motion.div>
      )}
    </motion.div>
  );
};
