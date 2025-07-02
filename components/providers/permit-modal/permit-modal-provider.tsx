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
import { UserAsset, UserAssetsByAsset } from "@/lib/types";
import { useSelectedTokens } from "../selected-tokens-provider";
import { usePaymentParams } from "../payment-params-provider";
import {
  chainIdToChain,
  chainStringToChainId,
  deepCompareUserAssets,
  getViemPublicClient,
} from "@/lib/utils";
import { InitialWagmiAction } from "@/hooks/use-consecutive-wagmi-actions";
import { WagmiActionType } from "@/hooks/use-consecutive-wagmi-actions";
import { Address, Chain, erc20Abi, maxUint256 } from "viem";
import { PERMIT3_VERIFIER_ADDRESS } from "@/lib/constants";
import { TokenSymbols } from "@/lib/enums";
import {
  RoutesService,
  RoutesSupportedStable,
} from "@eco-foundation/routes-sdk";
import { useAppKitAccount } from "@reown/appkit/react";

// Support function to group user balances by asset
const groupUserBalancesByAsset = (
  userBalances: UserAsset[]
): UserAssetsByAsset => {
  return userBalances.reduce((acc, balance) => {
    acc[balance.asset] = acc[balance.asset] || [];
    acc[balance.asset].push(balance);
    return acc;
  }, {} as UserAssetsByAsset);
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
  mandatoryTokensList: UserAsset[];
  otherGroupedTokens: UserAssetsByAsset;
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
  const { address: userAddress } = useAppKitAccount();
  const { userBalances } = useUserBalances();
  const { selectedTokens } = useSelectedTokens();
  const { desiredNetworkString, paymentParams, amountDueRaw } =
    usePaymentParams();

  // Get the destination token and the destination chain id from the payment params
  const destinationToken = paymentParams?.desiredToken;
  const destinationChainId = paymentParams?.desiredNetworkId;

  // States
  const [selectedTokensToApprove, setSelectedTokensToApprove] = useState<
    UserAsset[]
  >([]);
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [allApprovalsCompleted, setAllApprovalsCompleted] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [mandatoryTokensList, setMandatoryTokensList] = useState<UserAsset[]>(
    []
  );
  const [otherGroupedTokens, setOtherGroupedTokens] =
    useState<UserAssetsByAsset>({});

  const getExtraTokenToApprove = async (
    destinationToken: string | null,
    destinationChainId: number | null,
    desiredNetworkString: string | null
  ): Promise<UserAsset | null> => {
    if (!destinationChainId || !desiredNetworkString || !destinationToken)
      return null;

    // Get the viem public client for the destination chain
    const publicClient = getViemPublicClient(
      chainIdToChain(destinationChainId) as Chain
    );

    // Get the token contract address
    const tokenContractAddress = RoutesService.getStableAddress(
      chainStringToChainId(desiredNetworkString),
      destinationToken as RoutesSupportedStable
    );

    // Get the allowance for the extra token to approve
    let allowance: bigint = BigInt(0);
    try {
      allowance = await publicClient.readContract({
        address: tokenContractAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [userAddress as Address, PERMIT3_VERIFIER_ADDRESS],
      });
    } catch (error) {
      allowance = BigInt(0);
    }

    // Create the extra token to approve
    return {
      asset: destinationToken?.toLocaleLowerCase() as string,
      chain: desiredNetworkString,
      amount: -1,
      humanReadableAmount: -1,
      tokenContractAddress,
      decimals: 6,
      hasPermit: allowance >= BigInt(amountDueRaw),
      permit3Allowance: Number(allowance).toString(),
      isTokenAtRisk: false,
    };
  };

  // Sets both the mandatory and other tokens when the user balances change
  useEffect(() => {
    const setupApprovedTokens = async () => {
      // Take all the tokens that are not on the desired network and are among the selected tokens
      const mandatoryTokens = userBalances.filter(
        (balance) =>
          balance.chain !== desiredNetworkString &&
          selectedTokens.some((token) => deepCompareUserAssets(token, balance))
      );

      // Get the extra token to approve
      const extraTokenToApprove = await getExtraTokenToApprove(
        destinationToken,
        destinationChainId,
        desiredNetworkString
      );

      // Create the extended mandatory tokens list
      // If the destination token has some missing data, we don't add it to the selected tokens to approve
      const extendedMandatoryTokens = extraTokenToApprove
        ? [...mandatoryTokens, extraTokenToApprove]
        : mandatoryTokens;

      // Set a first set of selected tokens to approve
      setSelectedTokensToApprove(
        extendedMandatoryTokens.filter((token) => !token.hasPermit)
      );

      // Take all the remaining tokens (except the ones that have already been approved)
      const otherTokens = userBalances.filter(
        (balance) =>
          !balance.hasPermit &&
          !mandatoryTokens.includes(balance) &&
          (extraTokenToApprove
            ? !deepCompareUserAssets(balance, extraTokenToApprove)
            : false)
      );

      // Set the tokens
      setMandatoryTokensList(extendedMandatoryTokens);
      setOtherGroupedTokens(groupUserBalancesByAsset(otherTokens));
    };

    setupApprovedTokens();
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
            args: [
              PERMIT3_VERIFIER_ADDRESS,
              balance.amount === -1 ? BigInt(amountDueRaw) : maxUint256,
            ],
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
    [selectedTokensToApprove, amountDueRaw]
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
    return mandatoryTokensList.length;
  }, [mandatoryTokensList]);

  // Amount of other tokens
  const otherTokensAmount = useMemo(() => {
    return Object.keys(otherGroupedTokens).length;
  }, [otherGroupedTokens]);

  const value = useMemo(
    () => ({
      openPermitModal: handlePermitModalOpen,
      closePermitModal: handlePermitModalClose,
      allApprovalsCompleted,
      setAllApprovalsCompleted,
      addTokensToApproveList,
      removeTokensFromApproveList,
      mandatoryTokensList,
      otherGroupedTokens,
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
      mandatoryTokensList,
      otherGroupedTokens,
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
