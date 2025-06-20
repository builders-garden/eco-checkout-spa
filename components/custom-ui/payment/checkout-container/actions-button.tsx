import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useMemo, useState } from "react";
import { PaymentPageState } from "@/lib/enums";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { useUserBalances } from "@/components/providers/user-balances-provider";
import { cn } from "@/lib/shadcn/utils";
import { usePermitModal } from "@/components/providers/permit-modal/permit-modal-provider";
import { useDebounce } from "@/hooks/use-debounce";

interface ActionsButtonProps {
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
}

export const ActionsButton = ({ setPaymentPageState }: ActionsButtonProps) => {
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;
  const { selectedTotal, isLoadingSelectedTokens } = useSelectedTokens();
  const { isLoadingUserBalances } = useUserBalances();
  const [mounted, setMounted] = useState(false);
  const { isConnected, status } = useAppKitAccount();
  const { open } = useAppKit();
  const { openPermitModal, allApprovalsCompleted } = usePermitModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  // States
  const ready = status !== "connecting" && status !== "reconnecting";
  const debouncedIsConnected = useDebounce(isConnected, 100);
  const showLoader =
    !ready ||
    !mounted ||
    (isConnected &&
      (isLoadingUserBalances ||
        //transactionStepsLoading ||
        isLoadingSelectedTokens));
  const debouncedShowLoader = useDebounce(showLoader, 100);
  const isDisabled = isConnected && selectedTotal < amountDue!;

  // Button Props
  const { text, onClick, key } = useMemo(() => {
    if (!debouncedIsConnected) {
      return {
        text: "Connect Wallet",
        onClick: () => open({ view: "Connect" }),
        key: "connect",
      };
    }
    if (allApprovalsCompleted) {
      return {
        text: "Confirm & Pay",
        onClick: () => {
          setPaymentPageState(PaymentPageState.TRANSACTIONS);
        },
        key: "confirm",
      };
    } else {
      return {
        text: "Continue",
        onClick: () => {
          openPermitModal();
        },
        key: "continue",
      };
    }
  }, [debouncedIsConnected, open, setPaymentPageState, allApprovalsCompleted]);

  return (
    <div className="sticky sm:bottom-0 bottom-10 left-0 right-0 sm:pt-2 sm:relative sm:p-0 mt-auto sm:bg-transparent bg-background">
      <AnimatePresence mode="wait" initial={false}>
        <motion.button
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          whileHover={{
            scale: debouncedShowLoader || isDisabled ? 1 : 1.015,
          }}
          whileTap={{
            scale: debouncedShowLoader || isDisabled ? 1 : 0.985,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className={cn(
            "flex justify-center items-center w-full rounded-[8px] p-4 h-[60px] cursor-pointer transition-all duration-300",
            debouncedShowLoader || isDisabled
              ? "bg-disabled cursor-default"
              : "bg-primary"
          )}
          type="button"
          disabled={debouncedShowLoader || isDisabled}
          style={{
            zIndex: 50,
          }}
        >
          <AnimatePresence mode="wait">
            <p key={key} className="text-xl text-white font-bold">
              {debouncedShowLoader ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                text
              )}
            </p>
          </AnimatePresence>
        </motion.button>
      </AnimatePresence>
    </div>
  );
};
