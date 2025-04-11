import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export const ConnectWalletInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, height: "fit-content" }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col justify-center w-full items-center text-center gap-3.5 -mt-1"
    >
      <div className="flex p-3.5 justify-center items-center bg-secondary-foreground rounded-full">
        <Wallet className="size-[27px]" />
      </div>
      <div className="flex flex-col justify-center items-center gap-1">
        <h1 className="text-[18px] font-semibold">Connect your wallet</h1>
        <p className="text-secondary text-[14px]">
          Connect your wallet to continue with the payment
        </p>
      </div>
    </motion.div>
  );
};
