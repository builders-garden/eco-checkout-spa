import { UserAsset } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePaymentParams } from "./payment-params-provider";
import { useUserBalances } from "./user-balances-provider";
import { useAppKitAccount } from "@reown/appkit/react";
import ky from "ky";
import {
  AllowanceOrTransfer,
  Permit3SignatureData,
} from "@/lib/relayoor/types";

export const SelectedTokensContext = createContext<
  SelectedTokensContextType | undefined
>(undefined);

export type SelectedTokensContextType = {
  selectedTokens: UserAsset[];
  selectedTotal: number;
  setSelectedTokens: (tokens: UserAsset[]) => void;
  optimizedSelection: UserAsset[];
  hasFetchedSelectedTokens: boolean;
  isLoadingSelectedTokens: boolean;
  isErrorSelectedTokens: boolean;
  requestID: string;
  permit3SignatureData: Permit3SignatureData | undefined;
  allowanceOrTransfers: AllowanceOrTransfer[];
};

export const useSelectedTokens = () => {
  const context = useContext(SelectedTokensContext);
  if (!context) {
    throw new Error(
      "useSelectedTokens must be used within a SelectedTokensProvider"
    );
  }
  return context;
};

export const SelectedTokensProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { address } = useAppKitAccount();
  const [selectedTokens, setSelectedTokens] = useState<UserAsset[]>([]);
  const [optimizedSelection, setOptimizedSelection] = useState<UserAsset[]>([]);
  const [requestID, setRequestID] = useState<string>("");
  const [permit3SignatureData, setPermit3SignatureData] =
    useState<Permit3SignatureData>();
  const [allowanceOrTransfers, setAllowanceOrTransfers] = useState<
    AllowanceOrTransfer[]
  >([]);
  const [isLoadingSelectedTokens, setIsLoadingSelectedTokens] = useState(false);
  const [isErrorSelectedTokens, setIsErrorSelectedTokens] = useState(false);
  const [hasFetchedSelectedTokens, setHasFetchedSelectedTokens] =
    useState(false);
  const { userBalances, hasFetchedUserBalances, isLoadingUserBalances } =
    useUserBalances();
  const { paymentParams, amountDueRaw, desiredNetworkString } =
    usePaymentParams();
  const { desiredToken, recipient } = paymentParams;

  // Reset the selected tokens when the wallet is disconnected
  useEffect(() => {
    if (!address) {
      setSelectedTokens([]);
      setOptimizedSelection([]);

      // Reset the loading and other states
      setIsLoadingSelectedTokens(false);
      setIsErrorSelectedTokens(false);
      setHasFetchedSelectedTokens(false);
    }
  }, [address]);

  useEffect(() => {
    if (
      !address ||
      !recipient ||
      !desiredNetworkString ||
      !desiredToken ||
      !amountDueRaw ||
      !userBalances ||
      isLoadingUserBalances ||
      !hasFetchedUserBalances
    ) {
      return;
    }

    // If the user has no balances, set the selected tokens to an empty array
    if (hasFetchedUserBalances && userBalances.length === 0) {
      setHasFetchedSelectedTokens(true);
      setSelectedTokens([]);
      setOptimizedSelection([]);
      return;
    }

    setIsLoadingSelectedTokens(true);
    setIsErrorSelectedTokens(false);

    const fetchSelectedTokens = async () => {
      try {
        const getTransfersResponse = await ky
          .post<{
            optimizedSelection: UserAsset[];
            requestID: string;
            permit3SignatureData: Permit3SignatureData;
            allowanceOrTransfers: AllowanceOrTransfer[];
          }>(
            `/api/tokens-selection?sender=${address}&recipient=${recipient}&destinationNetwork=${desiredNetworkString}&destinationToken=${desiredToken}&transferAmount=${amountDueRaw}`,
            {
              json: {
                userBalances,
              },
            }
          )
          .json();

        setSelectedTokens(getTransfersResponse.optimizedSelection);
        setOptimizedSelection(getTransfersResponse.optimizedSelection);
        setRequestID(getTransfersResponse.requestID);
        setPermit3SignatureData(getTransfersResponse.permit3SignatureData);
        setAllowanceOrTransfers(getTransfersResponse.allowanceOrTransfers);
      } catch (error) {
        setIsErrorSelectedTokens(true);
      } finally {
        setHasFetchedSelectedTokens(true);
        setIsLoadingSelectedTokens(false);
      }
    };

    fetchSelectedTokens();
  }, [
    address,
    recipient,
    desiredNetworkString,
    desiredToken,
    amountDueRaw,
    userBalances,
    isLoadingUserBalances,
    hasFetchedUserBalances,
  ]);

  const selectedTotal = selectedTokens.reduce((acc, token) => {
    return acc + token.amount;
  }, 0);

  const value = useMemo(
    () => ({
      selectedTokens,
      selectedTotal,
      setSelectedTokens,
      optimizedSelection,
      isLoadingSelectedTokens,
      isErrorSelectedTokens,
      hasFetchedSelectedTokens,
      requestID,
      permit3SignatureData,
      allowanceOrTransfers,
    }),
    [
      selectedTokens,
      selectedTotal,
      optimizedSelection,
      setSelectedTokens,
      isLoadingSelectedTokens,
      isErrorSelectedTokens,
      hasFetchedSelectedTokens,
      requestID,
      permit3SignatureData,
      allowanceOrTransfers,
    ]
  );

  return (
    <SelectedTokensContext.Provider value={value}>
      {children}
    </SelectedTokensContext.Provider>
  );
};
