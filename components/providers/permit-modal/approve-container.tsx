import {
  HookStatus,
  TransactionStatus,
  useConsecutiveWagmiActions,
  WagmiAction,
  WagmiActionType,
} from "@/hooks/use-consecutive-wagmi-actions";
import { UserAssetsByChain } from "@/lib/types";
import { config } from "@/lib/appkit";
import { erc20Abi, maxUint256 } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";
import { PERMIT3_VERIFIER_ADDRESS } from "@/lib/constants";
import { useEffect } from "react";
import { chainStringToChainId } from "@/lib/utils";
import { CustomButton } from "@/components/custom-ui/customButton";
import {
  ChainImages,
  PermitModalState,
  TokenImages,
  TokenSymbols,
} from "@/lib/enums";
import { motion } from "framer-motion";
import { cn } from "@/lib/shadcn/utils";
import {
  CheckCircle,
  Clock,
  Loader2,
  RotateCw,
  SquareArrowOutUpRight,
} from "lucide-react";

interface ApproveContainerProps {
  selectedTokensToApprove: UserAssetsByChain;
  setPermitModalState: (state: PermitModalState) => void;
}

export const ApproveContainer = ({
  selectedTokensToApprove,
  setPermitModalState,
}: ApproveContainerProps) => {
  const { address } = useAppKitAccount();

  // Get all balances to approve
  const allBalancesToApprove = Object.values(selectedTokensToApprove).flat();

  // Create the wagmi actions
  const initialWagmiActions: WagmiAction[] = allBalancesToApprove.map(
    (balance) => ({
      type: WagmiActionType.WRITE_CONTRACT,
      data: {
        abi: erc20Abi,
        functionName: "approve",
        address: balance.tokenContractAddress,
        args: [PERMIT3_VERIFIER_ADDRESS, maxUint256],
        chainId: chainStringToChainId(balance.chain),
      },
      metadata: {
        chain: balance.chain,
        asset: balance.asset,
        amount: balance.amount,
        description: `Approve ${
          TokenSymbols[balance.asset as keyof typeof TokenSymbols]
        }`,
      },
    })
  );

  // Initialize the hook
  const {
    start,
    retry,
    queuedTransactions,
    hookStatus,
    currentTransactionIndex,
  } = useConsecutiveWagmiActions({
    config,
    initialWagmiActions,
  });

  // If the hook has finished, set the state to end
  useEffect(() => {
    if (hookStatus === HookStatus.FINISHED) {
      setPermitModalState(PermitModalState.END);
    }
  }, [hookStatus]);

  // Start the hook at mount
  useEffect(() => {
    start();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative flex flex-col justify-center items-center bg-secondary-foreground/40 rounded-[8px] p-4 w-full gap-[22px]">
        <motion.div
          animate={{
            height:
              hookStatus === HookStatus.FINISHED
                ? (queuedTransactions.length - 1) * 60
                : currentTransactionIndex * 60,
          }}
          transition={{ duration: 0.55 }}
          className="absolute left-[32px] top-[35px] w-[6px] rounded-full bg-success/97"
        />

        {/* Transactions */}
        {queuedTransactions.map((transaction, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full min-h-[44px] sm:min-h-0"
          >
            <div className="flex justify-start items-center w-full gap-3">
              {/* Status */}
              <div className="z-10 bg-secondary-foreground rounded-full">
                <div
                  className={cn(
                    "flex justify-center items-center rounded-full size-9.5 transition-all duration-300",
                    transaction.status === TransactionStatus.TO_SEND &&
                      "bg-secondary/30",
                    transaction.status === TransactionStatus.PENDING &&
                      "bg-blue-400/30",
                    transaction.status === TransactionStatus.SUCCESS &&
                      "bg-success/30",
                    transaction.status === TransactionStatus.ERROR &&
                      "bg-destructive/30"
                  )}
                >
                  {transaction.status === TransactionStatus.TO_SEND && (
                    <Clock className="size-5 text-secondary" />
                  )}
                  {transaction.status === TransactionStatus.PENDING && (
                    <Loader2 className="size-5 text-blue-500 animate-spin" />
                  )}
                  {transaction.status === TransactionStatus.SUCCESS && (
                    <CheckCircle className="size-5 text-success" />
                  )}
                  {transaction.status === TransactionStatus.ERROR && (
                    <RotateCw className="size-5 text-destructive" />
                  )}
                </div>
              </div>

              <div className="flex justify-center items-center gap-3 sm:gap-5">
                {/* Token */}
                <div className="flex justify-start items-center -space-x-4">
                  <div
                    key={index}
                    className="relative flex justify-center items-center"
                  >
                    <img
                      src={
                        TokenImages[
                          transaction.metadata.asset as keyof typeof TokenImages
                        ]
                      }
                      alt={`${transaction.metadata.asset} logo`}
                      width={31}
                      height={31}
                      className="object-cover rounded-full"
                    />
                    <img
                      src={
                        ChainImages[
                          transaction.metadata.chain as keyof typeof ChainImages
                        ]
                      }
                      alt={`${transaction.metadata.chain} logo`}
                      className="absolute bottom-0 right-0 object-cover rounded-full"
                      width={12}
                      height={12}
                    />
                  </div>
                </div>

                {/* Action description */}
                <p className="text-[15px] sm:text-[16px] font-semibold">
                  {transaction.metadata.description}
                </p>
              </div>
            </div>

            {/* Tx hashes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                width: "fit-content",
                transition: {
                  duration: 0.5,
                  ease: "easeInOut",
                },
              }}
              exit={{ opacity: 0 }}
              layout
              className="flex sm:flex-row flex-col justify-center items-end sm:items-center sm:gap-1.5 text-xs underline shrink-0 cursor-pointer"
            >
              {transaction.txLink && (
                <motion.div
                  key={`link-${transaction.txLink}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.025, 1.075, 1.15, 1.075, 1.025, 1],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className="flex justify-center items-center gap-1 text-xs underline shrink-0 cursor-pointer"
                  onClick={() => window.open(transaction.txLink!, "_blank")}
                >
                  See Tx
                  <SquareArrowOutUpRight className="size-3" />
                </motion.div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      <CustomButton
        text={hookStatus === HookStatus.ERROR ? "Retry" : ""}
        onClick={() => {
          if (hookStatus === HookStatus.ERROR) {
            retry();
          }
        }}
        isLoading={hookStatus === HookStatus.RUNNING}
        isDisabled={hookStatus === HookStatus.RUNNING}
      />
    </div>
  );
};
