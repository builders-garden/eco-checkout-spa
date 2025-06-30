import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PaymentPageState } from "@/lib/enums";
import { motion } from "framer-motion";
import { TxContainerHeader } from "./tx-container-header";
import { HookStatus } from "@/hooks/use-consecutive-wagmi-actions";
import { CustomButton } from "../../customButton";
import { ResizablePanel } from "../../resizable-panel";
import { TransactionsList } from "../../transactions-list";
import { Loader2 } from "lucide-react";
import { useTransactions } from "@/components/providers/transactions-provider";
import { useEffect } from "react";

interface TransactionsContainerProps {
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
}

export default function TransactionsContainer({
  setPaymentPageState,
}: TransactionsContainerProps) {
  const {
    consecutiveWagmiActionsObject,
    isLoading,
    isError,
    getRequestIDAndSignatureData,
  } = useTransactions();
  const {
    queuedActions,
    currentActionIndex,
    currentAction,
    hookStatus,
    retry,
    start,
  } = consecutiveWagmiActionsObject;
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
        initialHeight={76}
        className="flex flex-col justify-center items-center w-full h-full"
        id={isLoading ? "loading" : "transactions-list"}
      >
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full pt-5 pb-4">
            <Loader2 className="size-10 animate-spin opacity-70" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center w-full h-full">
            <p className="text-destructive text-center">
              Error fetching intents from endpoint
            </p>
          </div>
        ) : (
          queuedActions.length > 0 && (
            <TransactionsList
              queuedActions={queuedActions}
              currentActionIndex={currentActionIndex}
              currentAction={currentAction}
              hookStatus={hookStatus}
            />
          )
        )}
      </ResizablePanel>

      <CustomButton
        text={
          isLoading
            ? "Loading..."
            : hookStatus === HookStatus.ERROR
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
        isDisabled={hookStatus === HookStatus.RUNNING || isLoading || isError}
      />
    </motion.div>
  );
}
