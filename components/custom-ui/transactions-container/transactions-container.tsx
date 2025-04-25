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
import { SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { chainStringToChainId, extractStepParams } from "@/lib/utils";
import { Hex } from "viem";
import { TxContainerHeader } from "./tx-container-header";
import { CustomButton } from "../customButton";

export default function TransactionsContainer() {
  const {
    transactionSteps,
    handleChangeStatus,
    currentStep,
    currentStepIndex,
  } = useTransactionSteps();
  const { paymentParams } = usePaymentParams();
  const { totalProtocolFee } = useTransactionSteps();
  const { amountDue, redirect } = paymentParams;
  const [isStarted, setIsStarted] = useState(false);
  const [txHashes, setTxHashes] = useState<{ hash: Hex; link: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

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

  const humanReadableProtocolFee = (totalProtocolFee ?? 0) / 10 ** 6;

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

    // If the process is not started, set it as started
    if (!isStarted) setIsStarted(true);

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
      console.log("SUCCESS");
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
      console.log("ERROR");
      handleChangeStatus(currentStepIndex, TransactionStatus.ERROR);
    }
  }, [isTxError, isWalletError]);

  // Automatically start the transaction if the current step is to send
  useEffect(() => {
    // If there is no current step, set the process as finished
    if (!currentStep) setIsFinished(true);

    // If there is a current step, switch to the chain
    if (chainId) switchChain({ chainId });

    // If the current step is to send and the process is started, trigger the next step
    if (currentStep?.status === TransactionStatus.TO_SEND && isStarted) {
      console.log("Triggered next step");
      setTimeout(() => {
        handleAction();
      }, 750);
    }
  }, [currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 gap-4 sm:p-5 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      {/* Header */}
      <TxContainerHeader
        amountDue={amountDue!}
        humanReadableProtocolFee={humanReadableProtocolFee}
      />

      {/* Transactions */}
      <div className="flex flex-col justify-center items-center bg-accent rounded-[8px] p-4 w-full gap-4">
        {transactionSteps.map((step, index) => (
          <div key={index} className="flex justify-between items-center w-full">
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
      <p className="text-sm text-secondary text-center">
        Please confirm all the transactions in your wallet.
      </p>

      {/* Actions Button */}
      <CustomButton
        text={
          isTxError || isWalletError
            ? "Retry"
            : currentStep?.status === TransactionStatus.AWAITING_CONFIRMATION
            ? "Confirm in wallet"
            : isFinished && redirect
            ? "Return to website"
            : isFinished
            ? "Payment successful"
            : "Pay"
        }
        onClick={handleAction}
        isDisabled={
          (!isFinished || (isFinished && !redirect)) &&
          currentStep?.status !== TransactionStatus.TO_SEND &&
          currentStep?.status !== TransactionStatus.ERROR
        }
      />
    </motion.div>
  );
}
