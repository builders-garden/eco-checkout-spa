import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion";
import { ChainAccordion } from "./chain-accordion";
import { UserAssetsByChain } from "@/lib/types";
import { RelayoorChain } from "@/lib/relayoor/types";

interface BottomAccordionsProps {
  allGroupedUserBalances: UserAssetsByChain;
  allSelectedChains: RelayoorChain[];
  selectedTokensToApprove: UserAssetsByChain;
  setSelectedTokensToApprove: (tokens: UserAssetsByChain) => void;
}

export const BottomAccordions = ({
  allGroupedUserBalances,
  allSelectedChains,
  selectedTokensToApprove,
  setSelectedTokensToApprove,
}: BottomAccordionsProps) => {
  return (
    <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        {/* Unselectable tokens to approve */}
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm px-1 cursor-pointer">
            Payment Approvals
          </AccordionTrigger>
          <AccordionContent className="flex flex-col px-1 pt-0.5 transition-all duration-300">
            <div className="flex flex-col gap-2">
              {Object.entries(allGroupedUserBalances).map(
                ([chain, balances]) => {
                  if (allSelectedChains.includes(chain as RelayoorChain)) {
                    return (
                      <ChainAccordion
                        key={chain}
                        chain={chain}
                        balances={balances}
                        selectedTokens={selectedTokensToApprove}
                        setSelectedTokens={setSelectedTokensToApprove}
                        unselectable={true}
                      />
                    );
                  }
                }
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Other tokens to select */}
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-sm px-1 cursor-pointer">
            Select more tokens
          </AccordionTrigger>
          <AccordionContent className="flex flex-col px-1 pb-1 pt-0.5 transition-all duration-300">
            <div className="flex flex-col gap-2">
              {Object.entries(allGroupedUserBalances).map(
                ([chain, balances]) => {
                  if (!allSelectedChains.includes(chain as RelayoorChain)) {
                    return (
                      <ChainAccordion
                        key={chain}
                        chain={chain}
                        balances={balances}
                        selectedTokens={selectedTokensToApprove}
                        setSelectedTokens={setSelectedTokensToApprove}
                        unselectable={false}
                      />
                    );
                  }
                }
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
