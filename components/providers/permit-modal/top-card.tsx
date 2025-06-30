import AnimatedName from "@/components/custom-ui/animated-name";
import { getHumanReadableAmount, truncateAddress } from "@/lib/utils";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useNames } from "../names-provider";
import { useMemo } from "react";
import { useDisconnect } from "@reown/appkit/react";
import { usePermitModal } from "./permit-modal-provider";

interface TopCardProps {
  onOpenChange: (open: boolean) => void;
  address: string;
}

export const TopCard = ({ onOpenChange, address }: TopCardProps) => {
  const { userNames } = useNames();
  const { disconnect } = useDisconnect();
  const { selectedTokensToApprove } = usePermitModal();

  // Calculate all the amount of the selected tokens
  const selectedTokensAmount = useMemo(() => {
    return selectedTokensToApprove.reduce((acc, token) => {
      return acc + token.amount;
    }, 0);
  }, [selectedTokensToApprove]);

  return (
    <div className="relative flex flex-col justify-between items-center bg-secondary-foreground h-full w-full p-4 gap-7 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center w-full z-10">
        <div className="flex items-center justify-center size-10 rounded-lg border border-border">
          <Wallet />
        </div>
        <motion.div
          key="change-wallet-div"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-semibold border border-border rounded-[8px] px-3 py-2.5 cursor-pointer hover:bg-border"
          onClick={() => {
            onOpenChange(false);
            setTimeout(() => {
              disconnect();
            }, 300);
          }}
        >
          Change Wallet
        </motion.div>
      </div>
      <div className="flex justify-end items-center w-full z-10 pr-1.5">
        <AnimatedName
          name={userNames.preferredName}
          address={truncateAddress(address)}
          className="cursor-pointer w-[40%]"
          textClassName="font-medium"
        />
      </div>
      <img
        src="/images/eco-card-background2.png"
        alt="Eco Card Background"
        className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] h-[100%] w-[80%] object-cover opacity-[11%]"
      />
    </div>
  );
};
