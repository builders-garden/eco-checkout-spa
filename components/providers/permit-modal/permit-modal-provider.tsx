import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PermitModal } from "./permit-modal";
import { useUserBalances } from "../user-balances-provider";
import { UserAsset, UserAssetsByChain } from "@/lib/types";
import { useSelectedTokens } from "../selected-tokens-provider";
import { usePaymentParams } from "../payment-params-provider";
import { chainStringToChainId, deepCompareUserAssets } from "@/lib/utils";
import { InitialWagmiAction } from "@/hooks/use-consecutive-wagmi-actions";
import { WagmiActionType } from "@/hooks/use-consecutive-wagmi-actions";
import { erc20Abi, maxUint256 } from "viem";
import { PERMIT3_VERIFIER_ADDRESS } from "@/lib/constants";
import { TokenSymbols } from "@/lib/enums";

// Support function to group user balances by chain
const groupUserBalancesByChain = (
  userBalances: UserAsset[]
): UserAssetsByChain => {
  return userBalances.reduce((acc, balance) => {
    acc[balance.chain] = acc[balance.chain] || [];
    acc[balance.chain].push(balance);
    return acc;
  }, {} as UserAssetsByChain);
};

export const PermitModalContext = createContext<
  PermitModalContextType | undefined
>(undefined);

export type PermitModalContextType = {
  openPermitModal: () => void;
  closePermitModal: () => void;
  allApprovalsCompleted: boolean;
  setAllApprovalsCompleted: (allApprovalsCompleted: boolean) => void;
  addTokensToApproveList: (tokens: UserAsset[]) => void;
  removeTokensFromApproveList: (tokens: UserAsset[]) => void;
  groupedTokens: {
    mandatoryTokens: UserAssetsByChain;
    otherTokens: UserAssetsByChain;
  };
  approveWagmiActions: InitialWagmiAction[];
  selectedTokensToApprove: UserAsset[];
  mandatoryTokensAmount: number;
  otherTokensAmount: number;
};

export const usePermitModal = () => {
  const context = useContext(PermitModalContext);
  if (!context) {
    throw new Error("usePermitModal must be used within a PermitModalProvider");
  }
  return context;
};

export const PermitModalProvider = ({ children }: { children: ReactNode }) => {
  const { userBalances } = useUserBalances();
  const { selectedTokens } = useSelectedTokens();
  const { desiredNetworkString } = usePaymentParams();

  // States
  const [selectedTokensToApprove, setSelectedTokensToApprove] = useState<
    UserAsset[]
  >([]);
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [allApprovalsCompleted, setAllApprovalsCompleted] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [groupedMandatoryTokens, setGroupedMandatoryTokens] =
    useState<UserAssetsByChain>({});
  const [groupedOtherTokens, setGroupedOtherTokens] =
    useState<UserAssetsByChain>({});

  // Sets both the mandatory and other tokens when the user balances change
  useEffect(() => {
    // Take all the tokens that are not on the desired network and are among the selected tokens
    const mandatoryTokens = userBalances.filter(
      (balance) =>
        balance.chain !== desiredNetworkString &&
        selectedTokens.some((token) => deepCompareUserAssets(token, balance))
    );

    // Set a first set of selected tokens to approve
    setSelectedTokensToApprove(
      mandatoryTokens.filter((token) => !token.hasPermit)
    );

    // Take all the remaining tokens (except the ones that have already been approved)
    const otherTokens = userBalances.filter(
      (balance) => !balance.hasPermit && !mandatoryTokens.includes(balance)
    );

    // Set the grouped tokens
    setGroupedMandatoryTokens(groupUserBalancesByChain(mandatoryTokens));
    setGroupedOtherTokens(groupUserBalancesByChain(otherTokens));
  }, [userBalances, selectedTokens, desiredNetworkString]);

  // Support function to add multiple tokens to the selected tokens to approve
  const addTokensToApproveList = (tokens: UserAsset[]) => {
    setSelectedTokensToApprove([...selectedTokensToApprove, ...tokens]);
  };

  // Support function to remove multiple tokens from the selected tokens to approve
  const removeTokensFromApproveList = (tokens: UserAsset[]) => {
    setSelectedTokensToApprove(
      selectedTokensToApprove.filter(
        (t) => !tokens.some((token) => deepCompareUserAssets(t, token))
      )
    );
  };

  // Create the wagmi actions
  const approveWagmiActions: InitialWagmiAction[] = useMemo(
    () =>
      selectedTokensToApprove.map((balance) => {
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

  // Handle Permit Modal Open
  const handlePermitModalOpen = () => {
    setShouldRenderModal(true);
    setIsPermitModalOpen(true);
  };

  // Handle Permit Modal Close
  const handlePermitModalClose = () => {
    setIsPermitModalOpen(false);
    // Keep modal in DOM for animation, then unmount after delay
    setTimeout(() => {
      setShouldRenderModal(false);
    }, 200);
  };

  // Amount of mandatory tokens
  const mandatoryTokensAmount = useMemo(() => {
    return Object.keys(groupedMandatoryTokens).length;
  }, [groupedMandatoryTokens]);

  // Amount of other tokens
  const otherTokensAmount = useMemo(() => {
    return Object.keys(groupedOtherTokens).length;
  }, [groupedOtherTokens]);

  const value = useMemo(
    () => ({
      openPermitModal: handlePermitModalOpen,
      closePermitModal: handlePermitModalClose,
      allApprovalsCompleted,
      setAllApprovalsCompleted,
      addTokensToApproveList,
      removeTokensFromApproveList,
      groupedTokens: {
        mandatoryTokens: groupedMandatoryTokens,
        otherTokens: groupedOtherTokens,
      },
      approveWagmiActions,
      selectedTokensToApprove,
      mandatoryTokensAmount,
      otherTokensAmount,
    }),
    [
      handlePermitModalOpen,
      handlePermitModalClose,
      allApprovalsCompleted,
      setAllApprovalsCompleted,
      addTokensToApproveList,
      removeTokensFromApproveList,
      groupedMandatoryTokens,
      groupedOtherTokens,
      approveWagmiActions,
      selectedTokensToApprove,
      mandatoryTokensAmount,
      otherTokensAmount,
    ]
  );

  return (
    <PermitModalContext.Provider value={value}>
      {children}
      {shouldRenderModal && (
        <PermitModal
          open={isPermitModalOpen}
          onOpenChange={handlePermitModalClose}
          setAllApprovalsCompleted={setAllApprovalsCompleted}
        />
      )}
    </PermitModalContext.Provider>
  );
};
