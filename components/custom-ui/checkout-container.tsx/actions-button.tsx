import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useMemo, useState } from "react";
import { PageState } from "@/lib/enums";
import { usePaymentParams } from "../../providers/payment-params-provider";
import { useSelectedTokens } from "../../providers/selected-tokens-provider";
import { useUserBalances } from "../../providers/user-balances-provider";
import { useTransactionSteps } from "../../providers/transaction-steps-provider";
import { cn } from "@/lib/shadcn/utils";

interface ActionsButtonProps {
  setPageState: (pageState: PageState) => void;
}

export const ActionsButton = ({ setPageState }: ActionsButtonProps) => {
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;
  const { selectedTotal } = useSelectedTokens();
  const { isLoadingUserBalances } = useUserBalances();
  const [mounted, setMounted] = useState(false);
  const { isConnected, status, address } = useAppKitAccount();
  const { transactionStepsLoading, transactionStepsError } =
    useTransactionSteps();
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  // States
  const ready = status !== "connecting" && status !== "reconnecting";
  const connected = isConnected && !!address;
  const showLoader =
    !ready ||
    !mounted ||
    (connected && (isLoadingUserBalances || transactionStepsLoading));
  const isDisabled =
    (connected && selectedTotal < amountDue!) || !!transactionStepsError;

  // Button Props
  const { text, onClick, key } = useMemo(() => {
    if (!connected) {
      return {
        text: "Connect Wallet",
        onClick: () => open({ view: "Connect" }),
        key: "connect",
      };
    }
    return {
      text: "Confirm",
      onClick: () => {
        setPageState(PageState.PAYMENT_RECAP);
      },
      key: "confirm",
    };
  }, [connected, open, setPageState]);

  return (
    <div className="sticky sm:bottom-0 bottom-8 left-0 right-0 sm:pt-2 sm:relative sm:p-0 mt-auto sm:bg-transparent bg-background">
      <motion.button
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        whileHover={{
          scale: showLoader || isDisabled ? 1 : 1.015,
        }}
        whileTap={{
          scale: showLoader || isDisabled ? 1 : 0.985,
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={cn(
          "flex justify-center items-center w-full rounded-[8px] p-4 h-[60px] cursor-pointer transition-all duration-300",
          showLoader || isDisabled ? "bg-disabled cursor-default" : "bg-primary"
        )}
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
    </div>
  );
};
