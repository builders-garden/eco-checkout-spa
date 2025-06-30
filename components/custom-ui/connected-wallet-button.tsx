"use client";

import { truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/shadcn/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useIsMobile } from "@/components/providers/is-mobile-provider";
import { useNames } from "../providers/names-provider";
import AnimatedName from "./animated-name";

interface ConnectedWalletButtonProps {
  disabled?: boolean;
}

export const ConnectedWalletButton = ({
  disabled,
}: ConnectedWalletButtonProps) => {
  const { userNames } = useNames();
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { isMobile } = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, height: isMobile ? "auto" : 0 }}
      animate={{ opacity: 1, height: isMobile ? "auto" : "fit-content" }}
      exit={{ opacity: 0, height: isMobile ? "auto" : 0 }}
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
        <div className="flex justify-start items-center w-full gap-2">
          <div className="flex justify-center items-center gap-2 bg-secondary-foreground rounded-full p-2">
            <Wallet className="size-3.5 text-primary" />
          </div>
          {address && (
            <AnimatedName
              name={userNames.preferredName}
              address={truncateAddress(address)}
              className={cn(
                "items-start h-[20px] cursor-pointer w-[40%]",
                disabled && "cursor-default"
              )}
              height={20}
              textClassName="text-sm font-medium"
            />
          )}
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
