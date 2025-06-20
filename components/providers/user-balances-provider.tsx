import { UserAsset } from "@/lib/types";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePaymentParams } from "./payment-params-provider";
import ky from "ky";
import { toast } from "sonner";

export const UserBalancesContext = createContext<
  UserBalancesContextType | undefined
>(undefined);

export type UserBalancesContextType = {
  userBalances: UserAsset[];
  isLoadingUserBalances: boolean;
  hasFetchedUserBalances: boolean;
  isErrorUserBalances: boolean;
};

export const useUserBalances = () => {
  const context = useContext(UserBalancesContext);
  if (!context) {
    throw new Error(
      "useUserBalances must be used within a UserBalancesProvider"
    );
  }
  return context;
};

export const UserBalancesProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAppKitAccount();

  const [userBalances, setUserBalances] = useState<UserAsset[]>([]);
  const [hasFetchedUserBalances, setHasFetchedUserBalances] = useState(false);
  const [isLoadingUserBalances, setIsLoadingUserBalances] = useState(false);
  const [isErrorUserBalances, setIsErrorUserBalances] = useState(false);

  const {
    paymentParams,
    areAllPaymentParamsValid,
    desiredNetworkString,
    amountDueRaw,
  } = usePaymentParams();
  const { desiredToken } = paymentParams;

  // Reset the user balances when the wallet is disconnected
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
      if (!address || !areAllPaymentParamsValid) return;
      setIsLoadingUserBalances(true);
      setHasFetchedUserBalances(false);
      try {
        const response = await ky
          .get<UserAsset[]>(
            `/api/user-balances?userAddress=${address}&amountDue=${amountDueRaw}&desiredNetwork=${desiredNetworkString}&desiredToken=${desiredToken}`,
            { timeout: false }
          )
          .json();

        // Order the user balances following the rules:
        // 1. Tokens with chain equal to the destination network are preferred
        // 2. Layer 2 > Layer 1 (optimism, base, arbitrum, polygon > ethereum)
        // 3. Chain balance (sort and pick the first ones)

        // Get all destination network balances (they may be ethereum)
        const destinationNetworkBalances = response
          .filter((balance) => balance.chain === desiredNetworkString)
          .sort((a, b) => b.amount - a.amount);

        // Get all other balances (not destination network or ethereum)
        const otherBalances = response
          .filter(
            (balance) =>
              balance.chain !== desiredNetworkString &&
              balance.chain !== "ethereum"
          )
          .sort((a, b) => b.amount - a.amount);

        // Combine all balances following the rules
        if (desiredNetworkString === "ethereum") {
          setUserBalances([...destinationNetworkBalances, ...otherBalances]);
        } else {
          // Get all ethereum balances if the destination network is not ethereum
          let ethereumBalances: UserAsset[] = [];
          if (desiredNetworkString !== "ethereum") {
            ethereumBalances = response
              .filter((balance) => balance.chain === "ethereum")
              .sort((a, b) => b.amount - a.amount);
          }

          setUserBalances([
            ...destinationNetworkBalances,
            ...otherBalances,
            ...ethereumBalances,
          ]);
        }
      } catch (error) {
        console.log("error", error);
        setIsErrorUserBalances(true);
      } finally {
        setIsLoadingUserBalances(false);
        setHasFetchedUserBalances(true);
      }
    };
    fetchUserBalances();
  }, [address, desiredNetworkString, areAllPaymentParamsValid]);

  const value = useMemo(
    () => ({
      userBalances,
      isLoadingUserBalances,
      hasFetchedUserBalances,
      isErrorUserBalances,
    }),
    [
      userBalances,
      isLoadingUserBalances,
      hasFetchedUserBalances,
      isErrorUserBalances,
    ]
  );

  return (
    <UserBalancesContext.Provider value={value}>
      {children}
    </UserBalancesContext.Provider>
  );
};
