import { useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { CardState } from "@/lib/enums";

export const useCardTransitions = (
  isLoadingUserBalances: boolean,
  hasFetchedUserBalances: boolean
) => {
  const { address, isConnected } = useAppKitAccount();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Animation state to control sequence
  const [animationState, setAnimationState] = useState<CardState | null>(
    CardState.CONNECT_WALLET
  );

  const isConnectedAndFetched =
    isConnected &&
    !!address &&
    !isLoadingUserBalances &&
    hasFetchedUserBalances;

  // Handle transition between states
  const handleSetAnimationState = (state: CardState) => {
    setAnimationState(null);
    setTimeout(() => {
      setAnimationState(state);
    }, 300);
  };

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    if (isConnectedAndFetched) {
      handleSetAnimationState(CardState.SELECT_PAYMENT_METHOD);
    } else {
      handleSetAnimationState(CardState.CONNECT_WALLET);
    }
  }, [isConnectedAndFetched]);

  return { animationState };
};
