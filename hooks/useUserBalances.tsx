import { UserAsset } from "@/lib/types";
import { chainIdToChain } from "@/lib/utils";
import ky from "ky";
import { useEffect, useState } from "react";

export const useUserBalances = (
  userAddress: string | undefined,
  destinationNetwork: string | null
) => {
  const [userBalances, setUserBalances] = useState<UserAsset[]>([]);
  const [isLoadingUserBalances, setIsLoadingUserBalances] = useState(false);
  const [isErrorUserBalances, setIsErrorUserBalances] = useState(false);
  const [isFirstFetch, setIsFirstFetch] = useState(true);

  const destinationNetworkString = chainIdToChain(
    Number(destinationNetwork ?? 1),
    true
  ) as string;

  useEffect(() => {
    const fetchUserBalances = async () => {
      if (!userAddress) return;
      setIsLoadingUserBalances(true);
      if (isFirstFetch) {
        setIsFirstFetch(false);
      }
      try {
        const response = await ky
          .get<UserAsset[]>(`/api/user-balances?userAddress=${userAddress}`)
          .json();

        // Order the user balances following the rules:
        // 1. Tokens with chain equal to the destination network are preferred
        // 2. Layer 2 > Layer 1 (optimism, base, arbitrum, mantle, polygon > ethereum)
        // 3. Chain balance (sort and pick the first ones)

        // Get all destination network balances (they may be ethereum)
        const destinationNetworkBalances = response
          .filter((balance) => balance.chain === destinationNetworkString)
          .sort((a, b) => b.amount - a.amount);

        // Get all ethereum balances if the destination network is not ethereum
        let ethereumBalances: UserAsset[] = [];
        if (destinationNetworkString !== "ethereum") {
          ethereumBalances = response
            .filter((balance) => balance.chain === "ethereum")
            .sort((a, b) => b.amount - a.amount);
        }

        // Get all other balances (not destination network or ethereum)
        const otherBalances = response
          .filter(
            (balance) =>
              balance.chain !== destinationNetworkString &&
              balance.chain !== "ethereum"
          )
          .sort((a, b) => b.amount - a.amount);

        // Combine all balances following the rules
        if (destinationNetworkString === "ethereum") {
          setUserBalances([...destinationNetworkBalances, ...otherBalances]);
        } else {
          setUserBalances([
            ...destinationNetworkBalances,
            ...otherBalances,
            ...ethereumBalances,
          ]);
        }
      } catch (error) {
        console.error("Error fetching user balances:", error);
        setIsErrorUserBalances(true);
      } finally {
        setIsLoadingUserBalances(false);
      }
    };
    fetchUserBalances();
  }, [userAddress]);

  return {
    userBalances,
    isLoadingUserBalances,
    isErrorUserBalances,
    isFirstFetch,
  };
};
