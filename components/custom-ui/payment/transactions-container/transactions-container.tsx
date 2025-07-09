import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PaymentPageState } from "@/lib/enums";
import { motion } from "framer-motion";
import { TxContainerHeader } from "./tx-container-header";
import {
  HookStatus,
  WagmiActionType,
} from "@/hooks/use-consecutive-wagmi-actions";
import { CustomButton } from "../../customButton";
import { ResizablePanel } from "../../resizable-panel";
import { TransactionsList } from "../../transactions-list";
import { useTransactions } from "@/components/providers/transactions-provider";
import { useEffect, useMemo } from "react";

interface TransactionsContainerProps {
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
}

export default function TransactionsContainer({
  setPaymentPageState,
}: TransactionsContainerProps) {
  const {
    consecutiveWagmiActionsObject,
    isError,
    getRequestIDAndSignatureData,
  } = useTransactions();
  const { queuedActions, hookStatus, retry, start } =
    consecutiveWagmiActionsObject;
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  // Loads the transactions and launches them after 250ms
  useEffect(() => {
    const loadAndLaunchTransactions = async () => {
      await getRequestIDAndSignatureData();
      start();
    };
    setTimeout(loadAndLaunchTransactions, 250);
  }, []);

  // When the transactions are finished, set the payment page state to payment completed
  useEffect(() => {
    if (hookStatus === HookStatus.FINISHED && !isError) {
      setPaymentPageState(PaymentPageState.PAYMENT_COMPLETED);
    }
  }, [hookStatus]);

  // Setting the initial height of the transactions list
  const initialHeight = useMemo(
    () =>
      isError
        ? 24
        : 32 +
          Math.max(queuedActions.length - 1, 0) * 12 +
          queuedActions.reduce((acc, action) => {
            const involvedTokensLength =
              Object.keys(action.metadata.involvedTokens ?? {}).length ?? 0;
            return (
              acc +
              (action.type === WagmiActionType.SIGN_TYPED_DATA
                ? 50 +
                  involvedTokensLength * 31 +
                  Math.max(involvedTokensLength - 1, 0) * 8
                : 38)
            );
          }, 0),
    [queuedActions, isError]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background z-[1]"
    >
      {/* Header */}
      <TxContainerHeader amountDue={amountDue!} />

      <ResizablePanel
        initialHeight={initialHeight}
        className="flex flex-col justify-center items-center w-full h-full"
        id="transactions-list"
      >
        {isError ? (
          <div className="flex justify-center items-center w-full h-full">
            <p className="text-destructive text-center">
              Error fetching intents from endpoint
            </p>
          </div>
        ) : (
          queuedActions.length > 0 && (
            <TransactionsList queuedActions={queuedActions} />
          )
        )}
      </ResizablePanel>

      <CustomButton
        text={
          hookStatus === HookStatus.ERROR
            ? "Retry"
            : isError
            ? "Endpoint Error"
            : ""
        }
        onClick={() => {
          if (hookStatus === HookStatus.ERROR) {
            retry();
          }
        }}
        isLoading={hookStatus === HookStatus.RUNNING}
        isDisabled={hookStatus === HookStatus.RUNNING || isError}
      />
    </motion.div>
  );
}
