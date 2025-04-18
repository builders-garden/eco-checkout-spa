import {
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { SelectContent } from "@/components/shadcn-ui/select";
import { Select } from "@/components/shadcn-ui/select";

interface ChainSelectionProps {
  userInputNetwork: string;
  setUserInputNetwork: (network: string) => void;
}

export const ChainSelection = ({
  userInputNetwork,
  setUserInputNetwork,
}: ChainSelectionProps) => {
  return (
    <Select value={userInputNetwork} onValueChange={setUserInputNetwork}>
      <SelectTrigger id="chain" className="w-full h-[48px]">
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1" className="flex items-center gap-2">
          <img
            src="/images/chains/ethereum-logo.svg"
            alt="Ethereum"
            className="size-[18px] rounded-full"
          />
          Ethereum
        </SelectItem>
        <SelectItem value="137" className="flex items-center gap-2">
          <img
            src="/images/chains/polygon-logo.webp"
            alt="Polygon"
            className="size-[18px] rounded-full"
          />
          Polygon
        </SelectItem>
        <SelectItem value="42161" className="flex items-center gap-2">
          <img
            src="/images/chains/arbitrum-logo.png"
            alt="Arbitrum"
            className="size-[18px] rounded-full"
          />
          Arbitrum
        </SelectItem>
        <SelectItem value="10" className="flex items-center gap-2">
          <img
            src="/images/chains/op-logo.png"
            alt="Optimism"
            className="size-[18px] rounded-full"
          />
          Optimism
        </SelectItem>
        <SelectItem value="8453" className="flex items-center gap-2">
          <img
            src="/images/chains/base-logo.png"
            alt="Base"
            className="size-[18px] rounded-full"
          />
          Base
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
