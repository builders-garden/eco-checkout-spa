import { useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { CardStates } from "@/lib/enums";

export const useCardTransitions = (
  isLoadingUserBalances: boolean,
  hasFetchedUserBalances: boolean
) => {
  const { address, isConnected } = useAppKitAccount();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Animation state to control sequence
  const [animationState, setAnimationState] = useState<CardStates | null>(
    CardStates.CONNECT_WALLET
  );

  const isConnectedAndFetched =
    isConnected &&
    !!address &&
    !isLoadingUserBalances &&
    hasFetchedUserBalances;

  // Handle transition between states
  const handleSetAnimationState = (state: CardStates) => {
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
      handleSetAnimationState(CardStates.SELECT_PAYMENT_METHOD);
    } else {
      handleSetAnimationState(CardStates.CONNECT_WALLET);
    }
  }, [isConnectedAndFetched]);

  return { animationState };
};
