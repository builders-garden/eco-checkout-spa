"use client";

import { truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/shadcn/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";

interface ConnectedWalletButtonProps {
  disabled?: boolean;
  shouldAnimate?: boolean;
}

export const ConnectedWalletButton = ({
  disabled,
  shouldAnimate = true,
}: ConnectedWalletButtonProps) => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
      animate={
        shouldAnimate ? { opacity: 1, height: "fit-content" } : undefined
      }
      exit={shouldAnimate ? { opacity: 0, height: 0 } : undefined}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full gap-2"
    >
      <div className="flex justify-start items-center gap-1.5">
        <Wallet className="size-4 text-secondary" />
        <p className="text-sm text-secondary">Connected wallet</p>
      </div>
      <button
        className={cn(
          "flex justify-between items-center w-full px-3 h-[60px] border border-secondary-foreground rounded-[8px] text-primary font-bold cursor-pointer transition-all duration-300",
          disabled && "bg-secondary-foreground/40 cursor-default"
        )}
        onClick={() => !disabled && open({ view: "Account" })}
      >
        <div className="flex justify-center items-center gap-2">
          <div className="flex justify-center items-center gap-2 bg-secondary-foreground rounded-full p-2">
            <Wallet className="size-3.5 text-primary" />
          </div>
          <p className="text-sm font-medium">
            {truncateAddress(address ?? "")}
          </p>
        </div>
        <AnimatePresence mode="wait">
          {!disabled && (
            <motion.div
              key="change-wallet-div"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-primary border border-secondary-foreground rounded-[8px] px-2 py-1"
              onClick={() => open({ view: "Account" })}
            >
              Change
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};
