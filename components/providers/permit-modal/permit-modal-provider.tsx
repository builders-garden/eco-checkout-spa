import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn-ui/dialog";
import { groupUserBalancesByChain } from "@/lib/utils";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { Separator } from "../../shadcn-ui/separator";
import { useUserBalances } from "../user-balances-provider";
import { ChainAccordion } from "./chain-accordion";
import { UserAsset } from "@/lib/types";
import { TopCard } from "./top-card";

export const PermitModalContext = createContext<
  PermitModalContextType | undefined
>(undefined);

export type PermitModalContextType = {
  isPermitModalOpen: boolean;
  setIsPermitModalOpen: (isPermitModalOpen: boolean) => void;
  openPermitModal: () => void;
  closePermitModal: () => void;
};

export const usePermitModal = () => {
  const context = useContext(PermitModalContext);
  if (!context) {
    throw new Error("usePermitModal must be used within a PermitModalProvider");
  }
  return context;
};

interface PermitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PermitModal = ({ open, onOpenChange }: PermitModalProps) => {
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { userBalances } = useUserBalances();
  const [selectedTokensToApprove, setSelectedTokensToApprove] = useState<
    Record<string, UserAsset[]>
  >({});

  // Group the user tokens by chain
  const groupedUserBalances = useMemo(() => {
    const groupedUserBalances = groupUserBalancesByChain(userBalances);
    setSelectedTokensToApprove(groupedUserBalances);
    return groupedUserBalances;
  }, [userBalances]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent className="flex flex-col rounded-none sm:rounded-lg sm:gap-5 gap-6 sm:max-w-[550px] sm:h-fit max-w-full h-full">
        <DialogHeader className="flex flex-col gap-1 justify-start items-start">
          <DialogTitle className="text-xl">
            Let&apos;s set up your stables
          </DialogTitle>
          <DialogDescription className="text-left text-[13px] sm:text-sm">
            Allocate your balances for one-click spending
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Card */}
          <TopCard
            onOpenChange={onOpenChange}
            disconnect={disconnect}
            address={address ?? ""}
          />

          <Separator dashed />

          {/* Tokens */}
          {Object.entries(groupedUserBalances).map(([chain, balances]) => (
            <ChainAccordion
              key={chain}
              chain={chain}
              balances={balances}
              selectedTokens={selectedTokensToApprove}
              setSelectedTokens={setSelectedTokensToApprove}
            />
          ))}
        </div>
        <DialogFooter className="absolute bottom-0 left-0 right-0 flex flex-row items-center justify-between sm:justify-between tracking-tight font-semibold text-sm text-secondary py-3 px-6 sm:px-6 sm:py-4"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const PermitModalProvider = ({ children }: { children: ReactNode }) => {
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);

  // Handle Permit Modal Open
  const handlePermitModalOpen = () => {
    setIsPermitModalOpen(true);
  };

  // Handle Permit Modal Close
  const handlePermitModalClose = () => {
    setIsPermitModalOpen(false);
  };

  const value = useMemo(
    () => ({
      isPermitModalOpen,
      setIsPermitModalOpen,
      openPermitModal: handlePermitModalOpen,
      closePermitModal: handlePermitModalClose,
    }),
    [
      isPermitModalOpen,
      setIsPermitModalOpen,
      handlePermitModalOpen,
      handlePermitModalClose,
    ]
  );

  return (
    <PermitModalContext.Provider value={value}>
      {children}
      <PermitModal
        open={isPermitModalOpen}
        onOpenChange={setIsPermitModalOpen}
      />
    </PermitModalContext.Provider>
  );
};
