import { useEffect, useState } from "react";
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
  SignTypedDataParameters,
  signTypedData,
} from "@wagmi/core";
import { Hex } from "viem";

export enum WagmiActionType {
  SEND_TRANSACTION = "sendTransaction",
  WRITE_CONTRACT = "writeContract",
  CALL_CONTRACT = "callContract",
  SIGN_TYPED_DATA = "signTypedData",
}

export enum HookStatus {
  PAUSED = "paused",
  RUNNING = "running",
  ERROR = "error",
  FINISHED = "finished",
}

export enum ActionStatus {
  TO_SEND = "toSend",
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

export type InitialWagmiAction = {
  type: WagmiActionType;
  data:
    | WriteContractParameters
    | SendTransactionParameters
    | CallParameters
    | SignTypedDataParameters;
  onSuccess?: (args: Record<string, any>) => Promise<void>;
  chainId: number;
  metadata?: any;
};

export type ActionItem = {
  type: WagmiActionType;
  data:
    | WriteContractParameters
    | SendTransactionParameters
    | CallParameters
    | SignTypedDataParameters;
  onSuccess?: (args: Record<string, any>) => Promise<void>;
  chainId: number;
  status: ActionStatus;
  hash: string | null;
  txLink: string | null;
  metadata?: any;
};

interface ConsecutiveWagmiActionProps {
  config: Config;
  initialWagmiActions: InitialWagmiAction[];
  startDelay?: number;
}

export const useConsecutiveWagmiActions = ({
  config,
  initialWagmiActions,
  startDelay = 0,
}: ConsecutiveWagmiActionProps) => {
  // Initialize the hook statuses
  const [hookStatus, setHookStatus] = useState<HookStatus>(HookStatus.PAUSED);

  // Initialize the actions queue
  const [queuedActions, setQueuedActions] = useState<ActionItem[]>(
    initialWagmiActions.map((initialAction) => ({
      ...initialAction,
      status: ActionStatus.TO_SEND,
      hash: null,
      txLink: null,
      metadata: initialAction.metadata,
      chainId: initialAction.chainId,
    }))
  );

  // Initialize the current action and its index
  const [currentAction, setCurrentAction] = useState<ActionItem>(
    queuedActions[0]
  );
  const [currentActionIndex, setCurrentActionIndex] = useState<number>(0);

  // Handles the adding of a new action to the queue
  const addAction = (action: InitialWagmiAction) => {
    setQueuedActions((prev) => [
      ...prev,
      {
        ...action,
        status: ActionStatus.TO_SEND,
        hash: null,
        txLink: null,
        metadata: action.metadata,
      },
    ]);
  };

  // Handles the starting of the actions processing
  const start = async () => {
    setTimeout(async () => {
      setHookStatus(HookStatus.RUNNING);
    }, startDelay);
  };

  // Handles the retrying of the actions
  const retry = async () => {
    setTimeout(async () => {
      setHookStatus(HookStatus.RUNNING);
    }, startDelay);
  };

  // Handles the pausing of the actions processing
  const pause = () => {
    setHookStatus(HookStatus.PAUSED);
  };

  // Handles the updating of the action info
  const updateActionInfo = (actionIndex: number, info: Partial<ActionItem>) => {
    setQueuedActions((prev) =>
      prev.map((action, index) =>
        index === actionIndex ? { ...action, ...info } : action
      )
    );
  };

  // Handles the processing of the actions
  useEffect(() => {
    let currentActionIdx = currentActionIndex;

    const processActions = async () => {
      while (hookStatus === HookStatus.RUNNING) {
        // Get the current action to process
        const currentAction = queuedActions[currentActionIdx];

        // If there is no action to send or retry, set the job as finished and break the loop
        if (!currentAction) {
          setHookStatus(HookStatus.FINISHED);
          break;
        }

        // Set the states for external usage
        setCurrentAction(currentAction);
        setCurrentActionIndex(currentActionIdx);

        updateActionInfo(currentActionIdx, {
          status: ActionStatus.PENDING,
        });

        // Get the current chain id
        let currentChainId = getChainId(config);

        // Switch the chain to the action's chain if it's not the current chain
        const actionChainId = currentAction.chainId;

        if (actionChainId && actionChainId !== currentChainId) {
          await switchChain(config, {
            chainId: actionChainId,
          });
          currentChainId = actionChainId;
        }

        // Get the block explorer url
        const currentChain = getChains(config).find(
          (chain) => chain.id === currentChainId
        );
        const blockExplorerBaseUrl = currentChain?.blockExplorers?.default.url;

        // Perform the action
        let txHash: Hex | null = null;
        if (currentAction.type === WagmiActionType.SEND_TRANSACTION) {
          try {
            txHash = await sendTransaction(
              config,
              currentAction.data as SendTransactionParameters
            );

            if (currentAction.onSuccess) {
              await currentAction.onSuccess({
                txHash,
              });
            }
          } catch (error) {
            // User rejected or another error occurred
            console.log(error);
            setHookStatus(HookStatus.ERROR);
            updateActionInfo(currentActionIdx, {
              status: ActionStatus.ERROR,
            });
            break;
          }
        } else if (currentAction.type === WagmiActionType.WRITE_CONTRACT) {
          try {
            const { request } = await simulateContract(
              config,
              currentAction.data as WriteContractParameters
            );
            txHash = await writeContract(config, request);

            if (currentAction.onSuccess) {
              await currentAction.onSuccess({
                txHash,
              });
            }
          } catch (error) {
            // The simulation failed, the user rejected or another error occurred
            console.log(error);
            setHookStatus(HookStatus.ERROR);
            updateActionInfo(currentActionIdx, {
              status: ActionStatus.ERROR,
            });
            break;
          }
        } else if (currentAction.type === WagmiActionType.CALL_CONTRACT) {
          try {
            const { data } = await call(
              config,
              currentAction.data as CallParameters
            );
            if (data) {
              txHash = data;
            } else {
              throw new Error("Call failed");
            }

            if (currentAction.onSuccess) {
              await currentAction.onSuccess({
                txHash,
              });
            }
          } catch (error) {
            // The simulation failed, the user rejected or another error occurred
            console.log(error);
            setHookStatus(HookStatus.ERROR);
            updateActionInfo(currentActionIdx, {
              status: ActionStatus.ERROR,
            });
            break;
          }
        } else if (currentAction.type === WagmiActionType.SIGN_TYPED_DATA) {
          try {
            const userSignedMessage = await signTypedData(
              config,
              currentAction.data as SignTypedDataParameters
            );

            if (!userSignedMessage) {
              throw new Error("Failed to sign typed data");
            }

            if (currentAction.onSuccess) {
              await currentAction.onSuccess({
                userSignedMessage,
              });
            }
          } catch (error) {
            console.log(error);
          }
        }

        // If the action was sent successfully, and the action wasn't a signTypedData,
        //  update the action status and watch for the action's receipt, because it was a transaction
        if (txHash && currentAction.type !== WagmiActionType.SIGN_TYPED_DATA) {
          updateActionInfo(currentActionIdx, {
            status: ActionStatus.PENDING,
            hash: txHash,
            txLink: `${blockExplorerBaseUrl}/tx/${txHash}`,
          });

          // Wait for the transaction to be mined
          try {
            const transactionReceipt = await waitForTransactionReceipt(config, {
              hash: txHash,
              chainId: actionChainId,
            });

            // If the transaction was mined successfully, update the transaction status
            if (transactionReceipt) {
              updateActionInfo(currentActionIdx, {
                status: ActionStatus.SUCCESS,
              });

              // Increment the current transaction index
              currentActionIdx++;
            }
          } catch (error) {
            // The transaction reverted or another error occurred
            console.log("Transaction reverted", error);
            setHookStatus(HookStatus.ERROR);
            updateActionInfo(currentActionIdx, {
              status: ActionStatus.ERROR,
            });
            break;
          }
        }
        // If the action was a signTypedData, update the action status to success
        // and increment the current action index
        else if (currentAction.type === WagmiActionType.SIGN_TYPED_DATA) {
          updateActionInfo(currentActionIdx, {
            status: ActionStatus.SUCCESS,
          });

          currentActionIdx++;
        }
      }
    };

    processActions();
  }, [hookStatus]);

  return {
    queuedActions: queuedActions,
    currentAction: currentAction,
    currentActionIndex: currentActionIndex,
    hookStatus,
    addAction,
    start,
    retry,
    pause,
  };
};
