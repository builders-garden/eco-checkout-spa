import { ChainImages, TokenImages } from "@/lib/enums";

interface ChainTokenAssetIconProps {
  chain: string;
  assets: string[];
}

export const ChainTokenAssetIcon = ({
  assets,
  chain,
}: ChainTokenAssetIconProps) => {
  return (
    <div className="relative flex justify-center items-center">
      <img
        src={ChainImages[chain as keyof typeof ChainImages]}
        alt={`${chain} logo`}
        width={31}
        height={31}
        className="object-cover rounded-full"
      />
      <div className="absolute bottom-0 -right-1 w-full flex justify-end items-center -space-x-3">
        {assets.map((asset, index) => (
          <img
            key={`${asset}-${index}`}
            src={TokenImages[asset as keyof typeof TokenImages]}
            alt={`${asset} logo`}
            className="object-cover rounded-full"
            width={16}
            height={16}
          />
        ))}
      </div>
    </div>
  );
};
