import { useEffect } from "react";

import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { CheckoutFlowStates } from "@/lib/enums";

export const useStateTransitions = (
  isLoadingUserBalances: boolean,
  hasFetchedUserBalances: boolean
) => {
  const { address, isConnected } = useAppKitAccount();

  // Animation state to control sequence
  const [animationState, setAnimationState] = useState<CheckoutFlowStates>(
    !isConnected || !address || isLoadingUserBalances || !hasFetchedUserBalances
      ? CheckoutFlowStates.CONNECT_WALLET
      : CheckoutFlowStates.SELECT_PAYMENT_METHOD
  );

  const isConnectedAndFetched =
    isConnected &&
    !!address &&
    !isLoadingUserBalances &&
    hasFetchedUserBalances;

  // Handle transition between states
  useEffect(() => {
    if (
      isConnectedAndFetched &&
      animationState === CheckoutFlowStates.CONNECT_WALLET
    ) {
      // Start transition
      setAnimationState(CheckoutFlowStates.SELECT_PAYMENT_METHOD);
    } else if (
      !isConnectedAndFetched &&
      animationState === CheckoutFlowStates.SELECT_PAYMENT_METHOD
    ) {
      // Start transition
      setAnimationState(CheckoutFlowStates.TRANSACTIONS);
    }
  }, [isConnectedAndFetched]); // Only depend on connection state

  // Handle completing the transition
  useEffect(() => {
    if (animationState === CheckoutFlowStates.TRANSACTIONS) {
      const timer = setTimeout(() => {
        setAnimationState(
          isConnectedAndFetched
            ? CheckoutFlowStates.SELECT_PAYMENT_METHOD
            : CheckoutFlowStates.CONNECT_WALLET
        );
      }, 300); // Match this with the exit animation duration
      return () => clearTimeout(timer);
    }
  }, [animationState, isConnectedAndFetched]);

  return { animationState, isConnectedAndFetched };
};
