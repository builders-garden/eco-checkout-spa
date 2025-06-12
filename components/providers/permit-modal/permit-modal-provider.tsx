import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { PermitModal } from "./permit-modal";

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
