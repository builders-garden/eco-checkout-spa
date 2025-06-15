import { useEffect, useMemo, useState } from "react";
import { Config } from "wagmi";
import {
  type WriteContractParameters,
  type SendTransactionParameters,
  type CallParameters,
  sendTransaction,
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
  getChains,
  simulateContract,
  call,
} from "@wagmi/core";
import { Hex } from "viem";

export enum WagmiActionType {
  SEND_TRANSACTION = "sendTransaction",
  WRITE_CONTRACT = "writeContract",
  CALL_CONTRACT = "callContract",
}

export enum HookStatus {
  PAUSED = "paused",
  RUNNING = "running",
  ERROR = "error",
  FINISHED = "finished",
}

export enum TransactionStatus {
  TO_SEND = "toSend",
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

export type WagmiAction = {
  type: WagmiActionType;
  data: WriteContractParameters | SendTransactionParameters | CallParameters;
  metadata?: any;
};

export type TransactionItem = {
  type: WagmiActionType;
  data: WriteContractParameters | SendTransactionParameters | CallParameters;
  status: TransactionStatus;
  hash: string | null;
  txLink: string | null;
  metadata?: any;
};

interface ConsecutiveWagmiActionProps {
  config: Config;
  initialWagmiActions: WagmiAction[];
  startDelay?: number;
}

export const useConsecutiveWagmiActions = ({
  config,
  initialWagmiActions,
  startDelay = 0,
}: ConsecutiveWagmiActionProps) => {
  // Initialize the hook statuses
  const [hookStatus, setHookStatus] = useState<HookStatus>(HookStatus.PAUSED);

  // Initialize the transactions queue
  const [queuedTransactions, setQueuedTransactions] = useState<
    TransactionItem[]
  >(
    initialWagmiActions.map((initialAction) => ({
      ...initialAction,
      status: TransactionStatus.TO_SEND,
      hash: null,
      txLink: null,
      metadata: initialAction.metadata,
    }))
  );

  // Initialize the current transaction and its index
  const [currentTransaction, setCurrentTransaction] = useState<
    TransactionItem | undefined
  >(queuedTransactions[0]);
  const [currentTransactionIndex, setCurrentTransactionIndex] =
    useState<number>(0);

  // Handles the adding of a new transaction to the queue
  const addAction = (action: WagmiAction) => {
    setQueuedTransactions((prev) => [
      ...prev,
      {
        ...action,
        status: TransactionStatus.TO_SEND,
        hash: null,
        txLink: null,
        metadata: action.metadata,
      },
    ]);
  };

  // Handles the starting of the transactions processing
  const start = async () => {
    setTimeout(async () => {
      setHookStatus(HookStatus.RUNNING);
    }, startDelay);
  };

  // Handles the retrying of the transactions
  const retry = async () => {
    setTimeout(async () => {
      setHookStatus(HookStatus.RUNNING);
    }, startDelay);
  };

  // Handles the pausing of the transactions processing
  const pause = () => {
    setHookStatus(HookStatus.PAUSED);
  };

  // Handles the updating of the transaction info
  const updateTransactionInfo = (
    transactionIndex: number,
    info: Partial<TransactionItem>
  ) => {
    setQueuedTransactions((prev) =>
      prev.map((transaction, index) =>
        index === transactionIndex ? { ...transaction, ...info } : transaction
      )
    );
  };

  // Handles the processing of the transactions
  useEffect(() => {
    const processTransactions = async () => {
      while (hookStatus === HookStatus.RUNNING) {
        // Get the next transaction to process and its index
        const currentTx = queuedTransactions.find(
          (transaction) => transaction.status !== TransactionStatus.SUCCESS
        );
        const currentTxIdx = currentTx
          ? queuedTransactions.indexOf(currentTx)
          : -1;

        console.log("currentTx", currentTx);
        console.log("currentTxIdx", currentTxIdx);

        // If there is no transaction to send or retry, set the job as finished and break the loop
        if (!currentTx) {
          setHookStatus(HookStatus.FINISHED);
          break;
        }

        // Set the states for external usage
        setCurrentTransaction(currentTx);
        setCurrentTransactionIndex(currentTxIdx);

        updateTransactionInfo(currentTransactionIndex, {
          status: TransactionStatus.PENDING,
        });

        // Get the current chain id
        let currentChainId = getChainId(config);

        // Switch the chain to the transaction's chain if it's not the current chain
        const transactionChainId = currentTx.data.chainId;
        if (transactionChainId && transactionChainId !== currentChainId) {
          await switchChain(config, {
            chainId: transactionChainId,
          });
          currentChainId = transactionChainId;
        }

        // Get the block explorer url
        const currentChain = getChains(config).find(
          (chain) => chain.id === currentChainId
        );
        const blockExplorerBaseUrl = currentChain?.blockExplorers?.default.url;

        // Send the transaction
        let txHash: Hex | null = null;
        if (currentTx.type === WagmiActionType.SEND_TRANSACTION) {
          try {
            txHash = await sendTransaction(
              config,
              currentTx.data as SendTransactionParameters
            );
          } catch (error) {
            // User rejected or another error occurred
            console.log(error);
            setHookStatus(HookStatus.ERROR);
            updateTransactionInfo(currentTransactionIndex, {
              status: TransactionStatus.ERROR,
            });
            break;
          }
        } else if (currentTx.type === WagmiActionType.WRITE_CONTRACT) {
          try {
            const { request } = await simulateContract(
              config,
              currentTx.data as WriteContractParameters
            );
            txHash = await writeContract(config, request);
          } catch (error) {
            // The simulation failed, the user rejected or another error occurred
            console.log(error);
            setHookStatus(HookStatus.ERROR);
            updateTransactionInfo(currentTransactionIndex, {
              status: TransactionStatus.ERROR,
            });
            break;
          }
        } else {
          try {
            const { data } = await call(
              config,
              currentTx.data as CallParameters
            );
            if (data) {
              txHash = data;
            } else {
              throw new Error("Call failed");
            }
          } catch (error) {
            // The simulation failed, the user rejected or another error occurred
            console.log(error);
            setHookStatus(HookStatus.ERROR);
            updateTransactionInfo(currentTransactionIndex, {
              status: TransactionStatus.ERROR,
            });
            break;
          }
        }

        // If the transaction was sent successfully, update the transaction status
        // And watch for the transaction's receipt
        if (txHash) {
          updateTransactionInfo(currentTransactionIndex, {
            status: TransactionStatus.PENDING,
            hash: txHash,
            txLink: `${blockExplorerBaseUrl}/tx/${txHash}`,
          });

          // Wait for the transaction to be mined
          try {
            const transactionReceipt = await waitForTransactionReceipt(config, {
              hash: txHash,
              chainId: transactionChainId,
            });

            console.log("transactionReceipt", transactionReceipt);

            // If the transaction was mined successfully, update the transaction status
            if (transactionReceipt) {
              console.log("Updating transaction status to success");
              updateTransactionInfo(currentTransactionIndex, {
                status: TransactionStatus.SUCCESS,
              });
            }
          } catch (error) {
            // The transaction reverted or another error occurred
            console.log("Transaction reverted", error);
            setHookStatus(HookStatus.ERROR);
            updateTransactionInfo(currentTransactionIndex, {
              status: TransactionStatus.ERROR,
            });
            break;
          }
        }
      }
    };

    processTransactions();
  }, [hookStatus]);

  return {
    queuedTransactions,
    currentTransaction,
    currentTransactionIndex,
    hookStatus,
    addAction,
    start,
    retry,
    pause,
  };
};
