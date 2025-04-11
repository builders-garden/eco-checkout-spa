import { UserAsset } from "@/lib/types";
import { chainIdToChain } from "@/lib/utils";
import { useAppKitAccount } from "@reown/appkit/react";
import ky from "ky";
import { useEffect, useState } from "react";

export const useUserBalances = (
  userAddress: string | undefined,
  destinationNetwork: string | null
) => {
  const { address, isConnected } = useAppKitAccount();
  const [userBalances, setUserBalances] = useState<UserAsset[]>([]);
  const [hasFetchedUserBalances, setHasFetchedUserBalances] = useState(false);
  const [isLoadingUserBalances, setIsLoadingUserBalances] = useState(false);
  const [isErrorUserBalances, setIsErrorUserBalances] = useState(false);

  const destinationNetworkString = chainIdToChain(
    Number(destinationNetwork ?? 1),
    true
  ) as string;

  useEffect(() => {
    if (!isConnected && !address) {
      setUserBalances([]);
      setHasFetchedUserBalances(false);
      setIsLoadingUserBalances(false);
      setIsErrorUserBalances(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    const fetchUserBalances = async () => {
      if (!userAddress) return;
      setIsLoadingUserBalances(true);
      setHasFetchedUserBalances(false);
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
        setHasFetchedUserBalances(true);
      }
    };
    fetchUserBalances();
  }, [userAddress]);

  return {
    userBalances,
    isLoadingUserBalances,
    isErrorUserBalances,
    hasFetchedUserBalances,
  };
};
