import {
  HookStatus,
  useConsecutiveWagmiActions,
  InitialWagmiAction,
  WagmiActionType,
} from "@/hooks/use-consecutive-wagmi-actions";
import { UserAssetsByChain } from "@/lib/types";
import { config } from "@/lib/appkit";
import { erc20Abi, maxUint256 } from "viem";
import { PERMIT3_VERIFIER_ADDRESS } from "@/lib/constants";
import { useEffect } from "react";
import { chainStringToChainId } from "@/lib/utils";
import { CustomButton } from "@/components/custom-ui/customButton";
import { PermitModalState, TokenSymbols } from "@/lib/enums";
import { TransactionsList } from "@/components/custom-ui/transactions-list";

interface ApproveContainerProps {
  selectedTokensToApprove: UserAssetsByChain;
  setPermitModalState: (state: PermitModalState) => void;
  setAllApprovalsCompleted: (allApprovalsCompleted: boolean) => void;
}

export const ApproveContainer = ({
  selectedTokensToApprove,
  setPermitModalState,
  setAllApprovalsCompleted,
}: ApproveContainerProps) => {
  // Get all balances to approve
  const allBalancesToApprove = Object.values(selectedTokensToApprove).flat();

  // Create the wagmi actions
  const initialWagmiActions: InitialWagmiAction[] = allBalancesToApprove.map(
    (balance) => {
      const chainId = chainStringToChainId(balance.chain);
      return {
        type: WagmiActionType.WRITE_CONTRACT,
        data: {
          abi: erc20Abi,
          functionName: "approve",
          address: balance.tokenContractAddress,
          args: [PERMIT3_VERIFIER_ADDRESS, maxUint256],
          chainId,
        },
        chainId,
        metadata: {
          chain: balance.chain,
          asset: balance.asset,
          amount: balance.amount,
          description: `Approve ${
            TokenSymbols[balance.asset as keyof typeof TokenSymbols]
          }`,
        },
      };
    }
  );

  // Initialize the hook
  const { start, retry, queuedActions, hookStatus, currentActionIndex } =
    useConsecutiveWagmiActions({
      config,
      initialWagmiActions,
    });

  // If the hook has finished, set the state to end
  useEffect(() => {
    if (hookStatus === HookStatus.FINISHED) {
      setPermitModalState(PermitModalState.END);
      setAllApprovalsCompleted(true);
    }
  }, [hookStatus]);

  // Start the hook at mount
  useEffect(() => {
    start();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <TransactionsList
        queuedActions={queuedActions}
        currentActionIndex={currentActionIndex}
        hookStatus={hookStatus}
      />

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
