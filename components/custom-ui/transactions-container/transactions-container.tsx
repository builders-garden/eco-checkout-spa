import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useTransactionSteps } from "@/components/providers/transaction-steps-provider";
import {
  ChainExplorerUrls,
  ChainImages,
  TokenImages,
  TransactionStatus,
} from "@/lib/enums";
import { AnimatePresence, motion } from "framer-motion";
import StatusIndicator from "./status-indicator";
import { OperationLabel } from "./operation-label";
import {
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CheckCircle, SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { chainStringToChainId, extractStepParams } from "@/lib/utils";
import { Hex } from "viem";
import { TxContainerHeader } from "./tx-container-header";
import { CustomButton } from "../customButton";
import { cn } from "@/lib/shadcn/utils";

export default function TransactionsContainer() {
  const {
    transactionSteps,
    handleChangeStatus,
    currentStep,
    currentStepIndex,
  } = useTransactionSteps();
  const { paymentParams } = usePaymentParams();
  const { amountDue, redirect } = paymentParams;
  const [isMounted, setIsMounted] = useState(false);
  const [txHashes, setTxHashes] = useState<{ hash: Hex; link: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Set the process as started when the component mounts
  // To prevent the button from being enabled before the component is mounted
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 650);
  }, []);

  // wagmi hooks
  const {
    data: hash,
    isError: isWalletError,
    writeContract,
  } = useWriteContract();
  const { isError: isTxError, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });
  const { switchChain } = useSwitchChain();

  const chainId = useMemo(() => {
    if (!currentStep) return null;
    return chainStringToChainId(currentStep.assets[0].chain);
  }, [currentStep]);

  const handleAction = () => {
    // If the process is finished, go to the redirect url
    if (isFinished) {
      window.location.href = redirect!;
      return;
    }

    // If there is no current step or chainId, return
    if (!currentStep || !chainId) return;

    // Write the contract
    const writeContractParams = extractStepParams(currentStep, chainId);
    writeContract(writeContractParams);
    handleChangeStatus(
      currentStepIndex,
      TransactionStatus.AWAITING_CONFIRMATION
    );
  };

  // Update the status of the current step to success
  useEffect(() => {
    if (isTxSuccess) {
      setTxHashes((prev) => [
        ...prev,
        {
          hash: hash!,
          link: `${
            ChainExplorerUrls[
              currentStep?.assets[0].chain as keyof typeof ChainExplorerUrls
            ]
          }/tx/${hash}`,
        },
      ]);
      handleChangeStatus(currentStepIndex, TransactionStatus.SUCCESS);
    }
  }, [isTxSuccess]);

  // Update the status of the current step to error
  useEffect(() => {
    if (isTxError || isWalletError) {
      handleChangeStatus(currentStepIndex, TransactionStatus.ERROR);
    }
  }, [isTxError, isWalletError]);

  // Automatically start the transaction if the current step is to send
  useEffect(() => {
    // If there is no current step, set the process as finished
    if (!currentStep) {
      setIsFinished(true);
      return;
    }

    // If the current step is to send, trigger the next step
    if (currentStep.status === TransactionStatus.TO_SEND) {
      // If there is a current step, switch to the chain
      if (chainId) switchChain({ chainId });

      // Wait for the chain to be switched and then trigger the action
      setTimeout(() => {
        handleAction();
      }, 600);
    }
  }, [currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] px-4 py-4 pb-[92px] sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden"
    >
      {/* Header */}
      <TxContainerHeader amountDue={amountDue!} />

      {/* Transactions */}
      <div className="relative flex flex-col justify-center items-center bg-secondary-foreground/40 rounded-[8px] p-4 w-full gap-[22px]">
        <motion.div
          animate={{
            height: isFinished
              ? (transactionSteps.length - 1) * 60
              : currentStepIndex * 60,
          }}
          transition={{ duration: 0.55 }}
          className={cn(
            "absolute left-[32px] top-[35px] w-[6px] rounded-full bg-success/97"
          )}
        />
        {transactionSteps.map((step, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full z"
          >
            <div className="flex justify-start items-center w-full gap-3">
              {/* Status */}
              <StatusIndicator status={step.status} />

              <div className="flex justify-center items-center gap-5">
                {/* Tokens */}
                <div className="flex justify-start items-center -space-x-4">
                  {step.assets.map((token, index) => (
                    <div
                      key={index}
                      className="relative flex justify-center items-center"
                    >
                      <img
                        src={
                          TokenImages[token.asset as keyof typeof TokenImages]
                        }
                        alt={`${token.chain} logo`}
                        width={31}
                        height={31}
                        className="object-cover rounded-full"
                      />
                      {index === step.assets.length - 1 && (
                        <img
                          src={ChainImages[token.chain]}
                          alt={`${token.chain} logo`}
                          className="absolute bottom-0 right-0 object-cover rounded-full"
                          width={12}
                          height={12}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Action description */}
                <OperationLabel step={step} />
              </div>
            </div>

            {/* Tx hash */}
            <AnimatePresence>
              {txHashes[index] && (
                <motion.div
                  key={txHashes[index].hash}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.025, 1.075, 1.15, 1.075, 1.025, 1],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center items-center gap-1 text-xs underline shrink-0 cursor-pointer"
                  onClick={() => window.open(txHashes[index].link, "_blank")}
                >
                  View tx
                  <SquareArrowOutUpRight className="size-3" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Message */}
      <p className="text-sm text-secondary text-center px-10">
        Please confirm all the transactions in your wallet.
      </p>

      {/* Actions Button & Payment Completed */}
      <AnimatePresence mode="wait">
        {isFinished && !redirect ? (
          <motion.div
            key="payment-completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center gap-2 fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 sm:relative sm:p-0 sm:bg-transparent bg-background h-[60px]"
          >
            <CheckCircle className="size-6 text-success" />
            <p className="text-success">Payment Completed</p>
          </motion.div>
        ) : (
          <CustomButton
            key="custom-action-button"
            isLoading={!isMounted}
            text={
              isTxError || isWalletError
                ? "Retry"
                : currentStep?.status ===
                  TransactionStatus.AWAITING_CONFIRMATION
                ? "Confirm in wallet"
                : isFinished && redirect
                ? "Return to website"
                : ""
            }
            onClick={handleAction}
            isDisabled={
              (!isFinished || (isFinished && !redirect)) &&
              currentStep?.status !== TransactionStatus.TO_SEND &&
              currentStep?.status !== TransactionStatus.ERROR
            }
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
