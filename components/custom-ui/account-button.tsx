import { truncateAddress } from "@/lib/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export const AccountButton = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col w-full gap-2"
    >
      <div className="flex justify-start items-center gap-1.5">
        <Wallet className="size-4 text-secondary" />
        <p className="text-sm text-secondary">Connected wallet</p>
      </div>
      <button
        className="flex justify-between items-center w-full px-3 h-[60px] border border-secondary-foreground rounded-[8px] text-primary font-bold cursor-pointer"
        onClick={() => open({ view: "Account" })}
      >
        <div className="flex justify-center items-center gap-2">
          <div className="flex justify-center items-center gap-2 bg-secondary-foreground rounded-full p-2">
            <Wallet className="size-3.5 text-primary" />
          </div>
          <p className="text-sm font-medium">
            {truncateAddress(address ?? "")}
          </p>
        </div>
        <div className="text-sm font-medium text-primary border border-secondary-foreground rounded-[8px] px-2 py-1">
          Change
        </div>
      </button>
    </motion.div>
  );
};
