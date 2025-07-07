import { usePermitModal } from "@/components/providers/permit-modal-provider";
import { ChainToken } from "./chain-token";
import { GroupedTokensAccordion } from "./grouped-tokens-accordion";
import { useEffect, useRef, useState } from "react";

export const TokensSection = () => {
  const {
    mandatoryTokensList,
    otherGroupedTokens,
    mandatoryTokensAmount,
    otherTokensAmount,
  } = usePermitModal();

  // Scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [accordionStates, setAccordionStates] = useState<
    Record<string, boolean>
  >({});

  // Scroll timeout ref
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    // Only scroll when at least one accordion is open
    const hasOpenAccordion = Object.values(accordionStates).some(
      (isOpen) => isOpen
    );

    if (hasOpenAccordion && scrollContainerRef.current) {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout for 400ms debounce
      scrollTimeoutRef.current = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 400);
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [accordionStates]);

  // A function to handle accordion changes
  const handleAccordionChange = (token: string, isOpen: boolean) => {
    setAccordionStates((prev) => ({ ...prev, [token]: isOpen }));
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent"
    >
      {/* Mandatory tokens to approve */}
      {mandatoryTokensAmount > 0 && (
        <div className="flex flex-col bg-background rounded-lg gap-2">
          <p className="text-sm font-medium pl-0.5">
            Required for this payment
          </p>
          {mandatoryTokensList.map((balance) => (
            <ChainToken
              key={`mandatory-${balance.asset}-${balance.chain}`}
              token={balance}
              unselectable={true}
            />
          ))}
        </div>
      )}

      {/* Other tokens to select and approve for future payments */}
      {otherTokensAmount > 0 && (
        <div className="flex flex-col bg-background rounded-lg gap-2">
          <p className="text-sm font-medium pl-0.5">
            Approve more tokens for future payments
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(otherGroupedTokens).map(([token, balances]) => {
              return (
                <GroupedTokensAccordion
                  key={token}
                  token={token}
                  tokenBalances={balances}
                  unselectable={false}
                  onAccordionChange={(isOpen) =>
                    handleAccordionChange(token, isOpen)
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
