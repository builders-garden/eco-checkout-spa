import {
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { SelectContent } from "@/components/shadcn-ui/select";
import { Select } from "@/components/shadcn-ui/select";
import { ChainImages } from "@/lib/enums";

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
            src={ChainImages.Ethereum}
            alt="Ethereum"
            className="size-[18px] rounded-full"
          />
          Ethereum
        </SelectItem>
        <SelectItem value="10" className="flex items-center gap-2">
          <img
            src={ChainImages.Optimism}
            alt="Optimism"
            className="size-[18px] rounded-full"
          />
          Optimism
        </SelectItem>
        <SelectItem value="130" className="flex items-center gap-2">
          <img
            src={ChainImages.Unichain}
            alt="Unichain"
            className="size-[18px] rounded-full"
          />
          Unichain
        </SelectItem>
        <SelectItem value="137" className="flex items-center gap-2">
          <img
            src={ChainImages.Polygon}
            alt="Polygon"
            className="size-[18px] rounded-full"
          />
          Polygon
        </SelectItem>
        <SelectItem value="8453" className="flex items-center gap-2">
          <img
            src={ChainImages.Base}
            alt="Base"
            className="size-[18px] rounded-full"
          />
          Base
        </SelectItem>
        <SelectItem value="42161" className="flex items-center gap-2">
          <img
            src={ChainImages.Arbitrum}
            alt="Arbitrum"
            className="size-[18px] rounded-full"
          />
          Arbitrum
        </SelectItem>
        <SelectItem value="42220" className="flex items-center gap-2">
          <img
            src={ChainImages.Celo}
            alt="Celo"
            className="size-[18px] rounded-full"
          />
          Celo
        </SelectItem>
        <SelectItem value="57073" className="flex items-center gap-2">
          <img
            src={ChainImages.Ink}
            alt="Ink"
            className="size-[18px] rounded-full"
          />
          Ink
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
