import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useMemo, useState } from "react";
import { PageState } from "@/lib/enums";
import { usePageState } from "../providers/page-state-provider";

interface ActionsButtonProps {
  isLoading: boolean;
  selectedTotal: number;
  amountDue: number;
}

export const ActionsButton = ({
  isLoading,
  selectedTotal,
  amountDue,
}: ActionsButtonProps) => {
  const { pageState, setPageState } = usePageState();
  const [mounted, setMounted] = useState(false);
  const { isConnected, status, address } = useAppKitAccount();
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  // States
  const ready = status !== "connecting" && status !== "reconnecting";
  const connected = isConnected && !!address;
  const showLoader = !mounted || isLoading || !ready;
  const isDisabled = connected && selectedTotal < amountDue;

  // Button Props
  const { text, onClick, key } = useMemo(() => {
    if (!connected) {
      return {
        text: "Connect Wallet",
        onClick: () => open({ view: "Connect" }),
        key: "connect",
      };
    }
    if (pageState === PageState.PAYMENT_RECAP) {
      return {
        text: "Confirm & Send",
        onClick: () => {
          setPageState(PageState.TRANSACTIONS);
        },
        key: "confirm-send",
      };
    }
    return {
      text: "Confirm",
      onClick: () => {
        setPageState(PageState.PAYMENT_RECAP);
      },
      key: "confirm",
    };
  }, [connected, open, pageState, setPageState]);

  return (
    <motion.button
      initial={{ opacity: 1 }}
      animate={{ opacity: showLoader || isDisabled ? 0.7 : 1 }}
      whileHover={{ scale: showLoader || isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: showLoader || isDisabled ? 1 : 0.98 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex justify-center items-center w-full bg-primary rounded-[8px] p-4 h-[60px] cursor-pointer"
      type="button"
      disabled={showLoader || isDisabled}
      style={{
        zIndex: 50,
      }}
    >
      <AnimatePresence mode="wait">
        <p key={key} className="text-xl text-white font-bold">
          {showLoader ? <Loader2 className="size-6 animate-spin" /> : text}
        </p>
      </AnimatePresence>
    </motion.button>
  );
};
