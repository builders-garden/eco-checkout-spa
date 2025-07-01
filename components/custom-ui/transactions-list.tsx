import { motion } from "framer-motion";
import {
  ActionItem,
  WagmiActionType,
  ActionStatus,
} from "@/hooks/use-consecutive-wagmi-actions";
import { CornerDownRight, PencilLine } from "lucide-react";
import { TokenAssetChainIcon } from "./token-asset-chain-icon";
import { PopTransactionLink } from "./pop-transaction-link";
import { TransactionStatusIcon } from "./transaction-status-icon";
import { useMemo } from "react";

interface TransactionsListProps {
  queuedActions: ActionItem[];
  showState?: boolean;
}

export const TransactionsList = ({
  queuedActions,
  showState = true,
}: TransactionsListProps) => {
  // Defines the height of the success line
  const successLineHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < queuedActions.length - 1; i++) {
      const action = queuedActions[i];
      if (action.status !== ActionStatus.SUCCESS) {
        return height;
      }
      height +=
        action.type === WagmiActionType.SIGN_TYPED_DATA
          ? 60 + (action.metadata.involvedTokens?.length ?? 0) * 44
          : 60;
    }
    return height;
  }, [queuedActions]);

  return (
    <div className="relative flex flex-col justify-center items-center bg-secondary-foreground/40 rounded-[8px] p-4 w-full gap-[22px]">
      {showState && (
        <motion.div
          animate={{
            height: successLineHeight,
          }}
          transition={{ duration: 0.55 }}
          className="absolute left-[32px] top-[35px] w-[6px] rounded-full bg-success/97"
        />
      )}

      {/* Transactions */}
      {queuedActions.map((action, index) =>
        action.type === WagmiActionType.SIGN_TYPED_DATA ? (
          <div
            key={index}
            className="flex flex-col justify-center items-center w-full gap-3"
          >
            <div className="flex justify-between items-center w-full min-h-[44px] sm:min-h-0">
              <div className="flex justify-start items-center w-full gap-3">
                {/* Status */}
                {showState && <TransactionStatusIcon status={action.status} />}

                <div className="flex justify-center items-center gap-3 sm:gap-5">
                  <div className="flex justify-center items-center w-[32px] h-[32px] rounded-full bg-secondary-foreground">
                    <PencilLine className="size-5 text-secondary" />
                  </div>

                  {/* Action description */}
                  <p className="text-[15px] sm:text-[16px] font-semibold shrink-0">
                    {action.metadata.description}
                  </p>
                </div>
              </div>

              {/* Tx hashes */}
              <PopTransactionLink txLink={action.txLink} />
            </div>

            {/* Involved tokens */}
            <div className="relative flex flex-col justify-center items-center w-full gap-2">
              {action.metadata.involvedTokens?.length > 0 &&
                action.metadata.involvedTokens.map(
                  (token: any, index: number) => (
                    <div
                      key={`${token.asset}-${token.chain}-${index}`}
                      className="flex justify-between items-center w-full min-h-[44px] sm:min-h-0 pl-[62px]"
                    >
                      <div className="flex justify-start items-center w-full gap-3">
                        <CornerDownRight color="#999999" />
                        <div className="flex justify-center items-center gap-3 sm:gap-5">
                          <TokenAssetChainIcon
                            asset={token.asset}
                            chain={token.chain}
                          />

                          {/* Action description */}
                          <p className="text-[15px] sm:text-[16px] font-semibold shrink-0">
                            {token.description}
                          </p>
                        </div>
                      </div>

                      {/* Tx hashes */}
                      <PopTransactionLink txLink={token.txLink} />
                    </div>
                  )
                )}
            </div>
          </div>
        ) : (
          <div
            key={index}
            className="flex justify-between items-center w-full min-h-[44px] sm:min-h-0"
          >
            <div className="flex justify-start items-center w-full gap-3">
              {/* Status */}
              {showState && <TransactionStatusIcon status={action.status} />}

              <div className="flex justify-center items-center gap-3 sm:gap-5">
                <TokenAssetChainIcon
                  asset={action.metadata.asset}
                  chain={action.metadata.chain}
                />

                {/* Action description */}
                <p className="text-[15px] sm:text-[16px] font-semibold shrink-0">
                  {action.metadata.description}
                </p>
              </div>
            </div>

            {/* Tx hashes */}
            <PopTransactionLink txLink={action.txLink} />
          </div>
        )
      )}
    </div>
  );
};
