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
  const [selectedTokens, setSelectedTokens] = useState<UserAsset[]>([]);
  const [optimizedSelection, setOptimizedSelection] = useState<UserAsset[]>([]);
  const { userBalances } = useUserBalances();
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  // Keep adding tokens until the amount due is reached
  useEffect(() => {
    if (!amountDue) return;
    let selectedArray: UserAsset[] = [];
    for (const asset of userBalances) {
      const selectedArraySum = selectedArray.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      if (selectedArraySum < amountDue) {
        selectedArray.push(asset);
      } else {
        break;
      }
    }
    setSelectedTokens(selectedArray);
    setOptimizedSelection(selectedArray);
  }, [userBalances, amountDue]);

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
    [selectedTokens, selectedTotal, setSelectedTokens, optimizedSelection]
  );

  return (
    <SelectedTokensContext.Provider value={value}>
      {children}
    </SelectedTokensContext.Provider>
  );
};
