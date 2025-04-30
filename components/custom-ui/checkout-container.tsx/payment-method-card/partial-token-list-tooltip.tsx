import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import { Info } from "lucide-react";
import { useState } from "react";

export const PartialTokenListTooltip = () => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <div
          className="flex gap-1 justify-start items-center cursor-pointer mb-2.5"
          onClick={() => {
            window.open("https://eco.com/docs/routes/chain-support", "_blank");
            setOpen(!open);
          }}
        >
          <Info className="size-3.5 text-secondary" />
          <p className="text-xs underline text-secondary">
            Why I don&apos;t see all my tokens?
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="flex min-w-0 max-w-[80vw] sm:ml-0 ml-3 z-[1500] sm:w-full sm:max-w-full text-center">
        <p className="text-xs font-medium">
          We only show tokens supported by the Eco protocol <br />
          and whose balance is more than $0.01.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
