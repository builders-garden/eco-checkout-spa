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
import { MIN_MAINNET_PROTOCOL_FEE } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import ky from "ky";
import { Transfer } from "@/lib/relayoor/types";

export const SelectedTokensContext = createContext<
  SelectedTokensContextType | undefined
>(undefined);

export type SelectedTokensContextType = {
  selectedTokens: UserAsset[];
  selectedTotal: number;
  setSelectedTokens: (tokens: UserAsset[]) => void;
  optimizedSelection: UserAsset[];
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
  const { userBalances } = useUserBalances();
  const { paymentParams } = usePaymentParams();
  const { amountDue, desiredNetworkId, desiredToken, recipient } =
    paymentParams;

  // Keep adding tokens until the amount due is reached
  // useEffect(() => {
  //   if (!amountDue) return;
  //   let selectedArray: UserAsset[] = [];
  //   let selectedArraySum = 0;
  //   for (let i = 0; i < userBalances.length; i++) {
  //     if (selectedArraySum < amountDue) {
  //       selectedArray.push(userBalances[i]);

  //       // If the next token is a risky one, we need to be sure that the remaining amount is enough to cover the fees
  //       const remainingAmount =
  //         amountDue - (selectedArraySum + userBalances[i].amount);
  //       if (
  //         remainingAmount > 0 &&
  //         i + 1 < userBalances.length &&
  //         userBalances[i + 1].isTokenAtRisk &&
  //         remainingAmount < MIN_MAINNET_PROTOCOL_FEE
  //       ) {
  //         selectedArraySum +=
  //           userBalances[i].amount -
  //           Math.ceil((MIN_MAINNET_PROTOCOL_FEE - remainingAmount) * 100) / 100;
  //       } else {
  //         selectedArraySum += userBalances[i].amount;
  //       }
  //     } else {
  //       break;
  //     }
  //   }

  //   setSelectedTokens(selectedArray);
  //   setOptimizedSelection(selectedArray);
  // }, [userBalances, amountDue]);

  const { isLoading: isLoadingSelectedTokens, isError: isErrorSelectedTokens } =
    useQuery({
      queryKey: ["selected-tokens"],
      queryFn: async () => {
        const getTransfersResponse = await ky
          .post<UserAsset[]>(
            `/api/optimized-selection?sender=${address}&recipient=${recipient}&destinationNetwork=${desiredNetworkId}&destinationToken=${desiredToken}&transferAmount=${amountDue}`,
            {
              json: {
                userBalances,
              },
            }
          )
          .json();

        setSelectedTokens(getTransfersResponse);
        setOptimizedSelection(getTransfersResponse);
        return true;
      },
      enabled:
        !!address &&
        !!recipient &&
        !!desiredNetworkId &&
        !!desiredToken &&
        !!amountDue &&
        !!selectedTokens &&
        !!userBalances &&
        userBalances.length > 0,
    });

  const selectedTotal = selectedTokens.reduce((acc, token) => {
    return acc + token.amount;
  }, 0);

  const value = useMemo(
    () => ({
      selectedTokens,
      selectedTotal,
      setSelectedTokens,
      optimizedSelection,
    }),
    [selectedTokens, selectedTotal, optimizedSelection, setSelectedTokens]
  );

  return (
    <SelectedTokensContext.Provider value={value}>
      {children}
    </SelectedTokensContext.Provider>
  );
};
