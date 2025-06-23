import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn-ui/dialog";
import { chainStringToChainId, groupUserBalancesByChain } from "@/lib/utils";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { Separator } from "../../shadcn-ui/separator";
import { useUserBalances } from "../user-balances-provider";
import { UserAssetsByChain } from "@/lib/types";
import { TopCard } from "./top-card";
import { CustomButton } from "@/components/custom-ui/customButton";
import { useEffect, useState, useMemo } from "react";
import { ResizablePanel } from "@/components/custom-ui/resizable-panel";
import { useSelectedTokens } from "../selected-tokens-provider";
import { RelayoorChain } from "@/lib/relayoor/types";
import { PermitModalState, TokenSymbols } from "@/lib/enums";
import { BottomAccordions } from "./bottom-accordions";
import { ApproveContainer } from "./approve-container";
import { ApproveCompleted } from "./approve-completed";
import {
  InitialWagmiAction,
  useConsecutiveWagmiActions,
  WagmiActionType,
} from "@/hooks/use-consecutive-wagmi-actions";
import { erc20Abi, maxUint256 } from "viem";
import { PERMIT3_VERIFIER_ADDRESS } from "@/lib/constants";
import { config } from "@/lib/appkit";
import { usePaymentParams } from "../payment-params-provider";

interface PermitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setAllApprovalsCompleted: (allApprovalsCompleted: boolean) => void;
}

export const PermitModal = ({
  open,
  onOpenChange,
  setAllApprovalsCompleted,
}: PermitModalProps) => {
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { userBalances } = useUserBalances();
  const { selectedTokens } = useSelectedTokens();
  const { desiredNetworkString } = usePaymentParams();
  const [selectedTokensToApprove, setSelectedTokensToApprove] =
    useState<UserAssetsByChain>({});
  const [totalTokensToApprove, setTotalTokensToApprove] = useState(0);
  const [permitModalState, setPermitModalState] = useState<PermitModalState>(
    PermitModalState.SELECT
  );

  // Get all the chains of the selected tokens
  const allSelectedChains = useMemo(
    () =>
      selectedTokens
        .map((token) => token.chain)
        .filter((chain) => chain !== desiredNetworkString),
    [selectedTokens, desiredNetworkString]
  );

  // Group the user balances by chain
  const allGroupedUserBalances = useMemo(
    () =>
      groupUserBalancesByChain(
        userBalances.filter((balance) => !balance.hasPermit) //HINT: Change this to approve every time
      ),
    [userBalances]
  );

  // Set the selected tokens to approve later in the flow
  useEffect(() => {
    let selectedTokensToApprove: UserAssetsByChain = {};
    let count = 0;

    Object.entries(allGroupedUserBalances).forEach(([chain, balances]) => {
      if (allSelectedChains.includes(chain as RelayoorChain)) {
        selectedTokensToApprove[chain] = balances;
        count += balances.length;
      } else {
        selectedTokensToApprove[chain] = [];
      }
    });

    setSelectedTokensToApprove(selectedTokensToApprove);
    setTotalTokensToApprove(count);
  }, [allGroupedUserBalances, allSelectedChains]);

  // Create the wagmi actions
  const initialWagmiActions: InitialWagmiAction[] = useMemo(
    () =>
      Object.values(selectedTokensToApprove)
        .flat()
        .map((balance) => {
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
        }),
    [selectedTokensToApprove]
  );

  // Initialize the hook
  const { start, retry, queuedActions, hookStatus, currentActionIndex } =
    useConsecutiveWagmiActions({
      config,
      initialWagmiActions,
    });

  // Handle Permit Modal Close
  const handlePermitModalClose = () => {
    setPermitModalState(PermitModalState.SELECT);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handlePermitModalClose}>
      <DialogTrigger />
      <DialogContent className="flex flex-col rounded-none sm:rounded-lg sm:gap-5 gap-6 sm:max-w-[550px] sm:h-fit max-w-full h-full">
        <DialogHeader className="flex flex-col gap-1 justify-start items-start">
          <DialogTitle className="text-xl">
            Let&apos;s set up your stables
          </DialogTitle>
          <DialogDescription className="text-left text-[13px] sm:text-sm">
            Allocate your balances for one-click spending
          </DialogDescription>
        </DialogHeader>
        <ResizablePanel
          initialHeight={
            permitModalState === "select"
              ? 418 + (totalTokensToApprove - 1) * 60
              : permitModalState === "end"
              ? 237
              : undefined
          }
          id={permitModalState}
        >
          {permitModalState === "select" && (
            <div className="flex flex-col gap-4 w-full">
              {/* Card */}
              <TopCard
                onOpenChange={onOpenChange}
                disconnect={disconnect}
                address={address ?? ""}
                selectedTokensToApprove={selectedTokensToApprove}
              />

              <Separator dashed />

              {/* Bottom Accordions */}
              <BottomAccordions
                allGroupedUserBalances={allGroupedUserBalances}
                allSelectedChains={allSelectedChains}
                selectedTokensToApprove={selectedTokensToApprove}
                setSelectedTokensToApprove={setSelectedTokensToApprove}
              />

              {/* Continue Button */}
              <CustomButton
                text="Continue"
                onClick={() => {
                  setPermitModalState(PermitModalState.APPROVE);
                }}
                className="w-full max-w-[98.5%] mx-auto"
              />
            </div>
          )}

          {permitModalState === "approve" && (
            <ApproveContainer
              setPermitModalState={setPermitModalState}
              setAllApprovalsCompleted={setAllApprovalsCompleted}
              hookStatus={hookStatus}
              queuedActions={queuedActions}
              currentActionIndex={currentActionIndex}
              start={start}
              retry={retry}
            />
          )}

          {permitModalState === "end" && (
            <ApproveCompleted
              onOpenChange={onOpenChange}
              queuedActions={queuedActions}
              currentActionIndex={currentActionIndex}
              hookStatus={hookStatus}
            />
          )}
        </ResizablePanel>
      </DialogContent>
    </Dialog>
  );
};
