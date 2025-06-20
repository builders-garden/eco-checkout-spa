import { CheckCircle } from "lucide-react";
import { CustomButton } from "@/components/custom-ui/customButton";
import { motion } from "framer-motion";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useTransactions } from "@/components/providers/transactions-provider";
import { TransactionsList } from "../../transactions-list";

export default function PaymentCompletedContainer() {
  const { paymentParams } = usePaymentParams();
  const { amountDue, redirect } = paymentParams;
  const { consecutiveWagmiActionsObject } = useTransactions();
  const { queuedActions, currentActionIndex, hookStatus } =
    consecutiveWagmiActionsObject;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start items-center size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-8 gap-6 sm:gap-9 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background"
    >
      {/* Check Circle */}
      <div className="flex justify-center items-center rounded-full size-[70px] bg-success/30">
        <CheckCircle className="size-9 text-success" />
      </div>

      {/* Title */}
      <div className="flex flex-col justify-center items-center gap-1">
        <h1 className="text-2xl font-bold">Payment complete!</h1>
        <p className="text-[15px] text-center text-secondary">
          Your payment of{" "}
          <span className="font-bold">${amountDue?.toFixed(2)}</span> has been
          sent successfully
        </p>
      </div>

      {/* Transactions */}
      <TransactionsList
        queuedActions={queuedActions}
        currentActionIndex={currentActionIndex}
        hookStatus={hookStatus}
        showState={false}
      />

      {/* Redirect Button */}
      {redirect && (
        <CustomButton
          text="Return to application"
          onClick={() => {
            window.location.href = redirect;
          }}
        />
      )}
    </motion.div>
  );
}
