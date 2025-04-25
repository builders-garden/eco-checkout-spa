import { isDeviceMobile } from "@/lib/utils";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const IsMobileContext = createContext<IsMobileContextType | undefined>(
  undefined
);

export type IsMobileContextType = {
  isMobile: boolean;
};

export const useIsMobile = () => {
  const context = useContext(IsMobileContext);
  if (!context) {
    throw new Error("useIsMobile must be used within a IsMobileProvider");
  }
  return context;
};

export const IsMobileProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isDeviceMobile());
  }, []);

  const value = useMemo(
    () => ({
      isMobile,
    }),
    [isMobile]
  );

  return (
    <IsMobileContext.Provider value={value}>
      {children}
    </IsMobileContext.Provider>
  );
};
