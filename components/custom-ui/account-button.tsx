import { truncateAddress } from "@/lib/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export const AccountButton = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => open({ view: "Account" })}
      className="flex justify-between items-center w-full h-[60px] px-5 cursor-pointer text-xl font-bold text-primary border border-primary rounded-[10px]"
      type="button"
    >
      <div className="flex justify-center items-center gap-2">
        <Wallet className="size-5" />
        <p className="text-sm font-medium">{truncateAddress(address ?? "")}</p>
      </div>
      <p className="text-sm font-medium text-secondary">Change</p>
    </motion.button>
  );
};
