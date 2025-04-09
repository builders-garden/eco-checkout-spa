import { UserAsset } from "@/lib/types";
import ky from "ky";
import { useEffect, useState } from "react";

export const useUserBalances = (userAddress: string | undefined) => {
  const [userBalances, setUserBalances] = useState<UserAsset[]>([]);
  const [isLoadingUserBalances, setIsLoadingUserBalances] = useState(false);
  const [isErrorUserBalances, setIsErrorUserBalances] = useState(false);
  const [isFirstFetch, setIsFirstFetch] = useState(true);

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
        setUserBalances(response);
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
