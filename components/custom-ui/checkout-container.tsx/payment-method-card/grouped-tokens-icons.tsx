import { ChainImages, TokenImages } from "@/lib/enums";
import { GroupedTokens } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../shadcn-ui/tooltip";
import { capitalizeFirstLetter } from "@/lib/utils";

interface GroupedTokensIconsProps {
  groupedTokens: GroupedTokens;
}

export const GroupedTokensIcons = ({
  groupedTokens,
}: GroupedTokensIconsProps) => {
  return (
    <div className="flex -space-x-2">
      {Object.entries(groupedTokens).map(([asset, tokens], index) => (
        <Tooltip key={asset}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative flex justify-center items-center"
              style={{
                zIndex: 30 - index,
              }}
            >
              <img
                src={TokenImages[asset as keyof typeof TokenImages]}
                alt={`${tokens[0].chain} logo`}
                className="sm:size-[48px] size-[42px] object-cover rounded-full"
              />
              <div className="absolute bottom-0 -right-1 flex justify-center items-center sm:-space-x-2.5 -space-x-2">
                {tokens
                  .slice(0, tokens.length > 3 ? 2 : tokens.length)
                  .map((token) => (
                    <motion.img
                      key={`${token.chain}-${token.assetName}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="sm:size-[18px] size-[16px] rounded-full object-cover"
                      src={ChainImages[token.chain as keyof typeof ChainImages]}
                      alt={`${token.chain} logo`}
                      layout
                    />
                  ))}
                {tokens.length > 3 && (
                  <div className="size-[16px] sm:size-[18px] bg-secondary-foreground rounded-full flex justify-center items-center">
                    <p className="text-[8px] font-semibold text-primary">
                      +{tokens.length - 2}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex justify-center items-center gap-[7px] z-40">
              <p className="text-[10px] text-white font-semibold leading-0">
                {tokens[0].assetName.toUpperCase()}
              </p>
              <p className="text-[10px] text-white font-semibold">•</p>
              <div className="flex justify-center items-center gap-1">
                {tokens.map((token, index) => (
                  <div
                    key={token.chain}
                    className="flex justify-center items-center gap-[5px]"
                  >
                    <div className="flex justify-center items-center gap-1">
                      <p className="text-[10px] text-white font-semibold leading-0">
                        {capitalizeFirstLetter(token.chain)}
                      </p>
                      <img
                        src={
                          ChainImages[token.chain as keyof typeof ChainImages]
                        }
                        alt={`${token.chain} logo`}
                        className="size-[14px] object-cover rounded-full"
                      />
                    </div>
                    {index < tokens.length - 1 && (
                      <p className="text-[10px] text-white font-semibold">+</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
