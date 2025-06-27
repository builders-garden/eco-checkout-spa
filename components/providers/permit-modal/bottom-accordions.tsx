import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion";
import { ChainAccordion } from "./chain-accordion";
import { usePermitModal } from "./permit-modal-provider";

export const BottomAccordions = () => {
  const { groupedTokens, mandatoryTokensAmount, otherTokensAmount } =
    usePermitModal();

  return (
    <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={mandatoryTokensAmount > 0 ? "item-1" : "item-2"}
      >
        {/* Mandatory tokens to approve */}
        {mandatoryTokensAmount > 0 && (
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm px-1 cursor-pointer">
              Required for this payment
            </AccordionTrigger>
            <AccordionContent className="flex flex-col px-1 pt-0.5 transition-all duration-300">
              <div className="flex flex-col gap-2">
                {Object.entries(groupedTokens.mandatoryTokens).map(
                  ([chain, chainBalances]) => {
                    return (
                      <ChainAccordion
                        key={chain}
                        chain={chain}
                        chainBalances={chainBalances}
                        unselectable={true}
                      />
                    );
                  }
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Other tokens to select and approve for future payments */}
        {otherTokensAmount > 0 && (
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm px-1 cursor-pointer">
              Approve more tokens for future payments
            </AccordionTrigger>
            <AccordionContent className="flex flex-col px-1 pb-1 pt-0.5 transition-all duration-300">
              <div className="flex flex-col gap-2">
                {Object.entries(groupedTokens.otherTokens).map(
                  ([chain, chainBalances]) => {
                    return (
                      <ChainAccordion
                        key={chain}
                        chain={chain}
                        chainBalances={chainBalances}
                        unselectable={false}
                      />
                    );
                  }
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
