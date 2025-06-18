import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PaymentPageState, TokenSymbols } from "@/lib/enums";
import { motion } from "framer-motion";
import { TxContainerHeader } from "./tx-container-header";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import ky from "ky";
import { Permit3SignatureData } from "@/lib/relayoor/types";
import { config } from "@/lib/appkit";
import { PERMIT3_TYPES } from "@/lib/constants";
import { erc20Abi } from "viem";
import { toast } from "sonner";
import {
  HookStatus,
  useConsecutiveWagmiActions,
  InitialWagmiAction,
  WagmiActionType,
} from "@/hooks/use-consecutive-wagmi-actions";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { chainStringToChainId, getAmountDeducted } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { CustomButton } from "../../customButton";
import { ResizablePanel } from "../../resizable-panel";
import { TransactionsList } from "../../transactions-list";

interface TransactionsContainerProps {
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
}

export default function TransactionsContainer({
  setPaymentPageState,
}: TransactionsContainerProps) {
  const { address } = useAppKitAccount();
  const { paymentParams, desiredNetworkString, amountDueRaw } =
    usePaymentParams();
  const { recipient, desiredToken, amountDue, desiredNetworkId } =
    paymentParams;
  const { selectedTokens } = useSelectedTokens();
  const [isLoading, setIsLoading] = useState(false);
  const [initialWagmiActions, setInitialWagmiActions] = useState<
    InitialWagmiAction[]
  >([]);

  const { start, retry, queuedActions, hookStatus, currentActionIndex } =
    useConsecutiveWagmiActions({
      config,
      initialWagmiActions,
    });

  // Gets the requestID and signature data
  // Then fills the initialWagmiActions array which will be used to send the transactions
  useEffect(() => {
    const getRequestIDAndSignatureData = async () => {
      if (
        address &&
        desiredNetworkString &&
        desiredToken &&
        amountDueRaw &&
        recipient
      ) {
        try {
          setIsLoading(true);
          const response = await ky
            .post<{
              signatureData: Permit3SignatureData;
              requestID: string;
            }>(
              `/api/get-intents?sender=${address}&recipient=${recipient}&destinationNetwork=${desiredNetworkString}&destinationToken=${desiredToken}&transferAmount=${amountDueRaw}`,
              {
                timeout: false,
              }
            )
            .json();

          if (!response.signatureData || !response.requestID) {
            throw new Error("Failed to get intents");
          }

          const initialWagmiActions: InitialWagmiAction[] = [
            {
              type: WagmiActionType.SIGN_TYPED_DATA,
              data: {
                domain: response.signatureData.domain,
                types: PERMIT3_TYPES,
                primaryType: "SignedUnhingedPermit3",
                message: response.signatureData.message,
              },
              chainId: 1,
              onSuccess: async (args) => {
                if (!args.userSignedMessage) {
                  throw new Error("User signed message is required");
                }

                console.log(
                  "Executing intent with signature",
                  response.requestID,
                  args.userSignedMessage
                );

                const executeIntentResponse = await ky
                  .post(`/api/execute-intent`, {
                    json: {
                      requestID: response.requestID,
                      userSignedMessage: args.userSignedMessage,
                    },
                    timeout: false,
                  })
                  .json();
                console.log("Intent executed", executeIntentResponse);
              },
              metadata: {
                description: "Sign message to execute the intent",
              },
            },
            ...selectedTokens
              .map((token) => {
                const chainId = chainStringToChainId(token.chain);

                // If it's not the desired network, don't add it to the actions
                // because the intents will already execute that transfer
                if (chainId !== desiredNetworkId) {
                  return undefined;
                }

                const amountToSend = getAmountDeducted(
                  amountDueRaw,
                  selectedTokens,
                  token
                );
                return {
                  type: WagmiActionType.WRITE_CONTRACT,
                  data: {
                    abi: erc20Abi,
                    functionName: "transfer",
                    address: token.tokenContractAddress,
                    args: [recipient, BigInt(amountToSend)],
                    chainId,
                  },
                  chainId,
                  metadata: {
                    chain: token.chain,
                    asset: token.asset,
                    amount: token.amount,
                    description: `Transfer ${
                      TokenSymbols[token.asset as keyof typeof TokenSymbols]
                    }`,
                  },
                };
              })
              .filter((action) => action !== undefined),
          ];

          setInitialWagmiActions(initialWagmiActions);
        } catch (error) {
          toast.error("Failed to get intents");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    getRequestIDAndSignatureData();
  }, []);

  useEffect(() => {
    console.log("initialWagmiActions", initialWagmiActions);
  }, [initialWagmiActions]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background"
    >
      {/* Header */}
      <TxContainerHeader amountDue={amountDue!} />

      <ResizablePanel className="flex flex-col justify-center items-center w-full h-full">
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="size-5 text-blue-500 animate-spin" />
          </div>
        ) : (
          <TransactionsList
            queuedActions={queuedActions}
            currentActionIndex={currentActionIndex}
            hookStatus={hookStatus}
          />
        )}
      </ResizablePanel>

      <CustomButton
        text={hookStatus === HookStatus.ERROR ? "Retry" : ""}
        onClick={() => {
          if (hookStatus === HookStatus.ERROR) {
            retry();
          }
        }}
        isLoading={hookStatus === HookStatus.RUNNING || isLoading}
        isDisabled={hookStatus === HookStatus.RUNNING || isLoading}
      />
    </motion.div>
  );
}
