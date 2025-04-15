"use client";

import { PageState } from "@/lib/enums";
import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
} from "react";

const PageStateContext = createContext<{
  pageState: PageState;
  setPageState: (pageState: PageState) => void;
} | null>(null);

export const usePageState = () => {
  const context = useContext(PageStateContext);
  if (!context) {
    throw new Error("usePageState must be used within a PageStateProvider");
  }
  return context;
};

interface PageStateProviderProps {
  children: ReactNode;
}

export function PageStateProvider({ children }: PageStateProviderProps) {
  const [pageState, setPageState] = useState<PageState>(PageState.CHECKOUT);

  return (
    <PageStateContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageStateContext.Provider>
  );
}
