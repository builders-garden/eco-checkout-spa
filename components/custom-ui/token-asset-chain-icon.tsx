import { ChainImages, TokenImages } from "@/lib/enums";

interface TokenAssetChainIconProps {
  asset: string;
  chain: string;
}

export const TokenAssetChainIcon = ({
  asset,
  chain,
}: TokenAssetChainIconProps) => {
  return (
    <div className="flex justify-start items-center -space-x-4">
      <div className="relative flex justify-center items-center">
        <img
          src={TokenImages[asset as keyof typeof TokenImages]}
          alt={`${asset} logo`}
          width={31}
          height={31}
          className="object-cover rounded-full"
        />
        <img
          src={ChainImages[chain as keyof typeof ChainImages]}
          alt={`${chain} logo`}
          className="absolute bottom-0 right-0 object-cover rounded-full"
          width={12}
          height={12}
        />
      </div>
    </div>
  );
};
