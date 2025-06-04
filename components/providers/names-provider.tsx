import { useAppKitAccount } from "@reown/appkit/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBaseName } from "@/lib/names/base-names";
import { Address } from "viem";
import { getEnsName } from "@/lib/names/ens";
import { usePaymentParams } from "./payment-params-provider";

export const NamesContext = createContext<NamesContextType | undefined>(
  undefined
);

export type NamesContextType = {
  userNames: {
    ens: string;
    baseName: string;
    preferredName: string | undefined;
    isFetching: boolean;
  };
  recipientNames: {
    ens: string;
    baseName: string;
    preferredName: string | undefined;
    isFetching: boolean;
  };
};

export const useNames = () => {
  const context = useContext(NamesContext);
  if (!context) {
    throw new Error("useNames must be used within a NamesProvider");
  }
  return context;
};

export const NamesProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useAppKitAccount();
  const { paymentParams } = usePaymentParams();
  const [connectedUserEns, setConnectedUserEns] = useState<string>("");
  const [connectedUserBaseName, setConnectedUserBaseName] =
    useState<string>("");
  const [recipientEns, setRecipientEns] = useState<string>("");
  const [recipientBaseName, setRecipientBaseName] = useState<string>("");
  const [isFetchingUserNames, setIsFetchingUserNames] = useState(false);
  const [isFetchingRecipientNames, setIsFetchingRecipientNames] =
    useState(false);

  const { recipient } = paymentParams;

  // Gets the Connected User ENS and Base Name from the address
  useEffect(() => {
    const fetchNames = async () => {
      if (!address) return;
      setIsFetchingUserNames(true);

      // Get the ENS domain from the address
      const ens = await getEnsName(address as Address);
      setConnectedUserEns(ens);

      // Get the Base Name from the address
      const baseName = await getBaseName(address as Address);
      setConnectedUserBaseName(baseName);

      setIsFetchingUserNames(false);
    };

    fetchNames();
  }, [address]);

  const connectedUserPreferredName = useMemo(() => {
    return connectedUserEns
      ? connectedUserEns
      : connectedUserBaseName
      ? connectedUserBaseName
      : undefined;
  }, [connectedUserEns, connectedUserBaseName]);

  // Get the recipient ENS domain and Base Name from the recipient address
  useEffect(() => {
    const fetchNames = async () => {
      if (!recipient) return;
      setIsFetchingRecipientNames(true);

      // Get the ENS domain from the recipient address
      const ens = await getEnsName(recipient as Address);
      setRecipientEns(ens);

      // Get the Base Name from the recipient address
      const baseName = await getBaseName(recipient as Address);
      setRecipientBaseName(baseName);

      setIsFetchingRecipientNames(false);
    };
    fetchNames();
  }, [recipient]);

  const recipientPreferredName = useMemo(() => {
    const preferredName = recipientEns
      ? recipientEns
      : recipientBaseName
      ? recipientBaseName
      : undefined;
    return preferredName;
  }, [recipientEns, recipientBaseName]);

  const value = useMemo(
    () => ({
      userNames: {
        ens: connectedUserEns,
        baseName: connectedUserBaseName,
        preferredName: connectedUserPreferredName,
        isFetching: isFetchingUserNames,
      },
      recipientNames: {
        ens: recipientEns,
        baseName: recipientBaseName,
        preferredName: recipientPreferredName,
        isFetching: isFetchingRecipientNames,
      },
    }),
    [
      connectedUserEns,
      connectedUserBaseName,
      recipientEns,
      recipientBaseName,
      recipientPreferredName,
    ]
  );

  return (
    <NamesContext.Provider value={value}>{children}</NamesContext.Provider>
  );
};
