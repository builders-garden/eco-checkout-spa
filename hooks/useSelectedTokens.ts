import { useEffect } from "react";
import { UserAsset } from "@/lib/types";
import { useState } from "react";

export const useSelectedTokens = (
  userBalances: UserAsset[],
  amountDue: number
) => {
  const [selectedTokens, setSelectedTokens] = useState<UserAsset[]>([]);
  const [optimizedSelection, setOptimizedSelection] = useState<UserAsset[]>([]);

  // Keep adding tokens until the amount due is reached
  useEffect(() => {
    let selectedArray: UserAsset[] = [];
    for (const asset of userBalances) {
      const selectedArraySum = selectedArray.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      if (selectedArraySum < amountDue) {
        selectedArray.push(asset);
      }
    }
    setSelectedTokens(selectedArray);
    setOptimizedSelection(selectedArray);
  }, [userBalances]);

  const selectedTotal = selectedTokens?.reduce((acc, token) => {
    return acc + token.amount;
  }, 0);

  return {
    selectedTokens,
    setSelectedTokens,
    selectedTotal,
    optimizedSelection,
  };
};
