import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";
import { useState } from "react";

export const InfoFooter = () => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute sm:fixed bottom-0 sm:flex w-full text-sm text-secondary font-semibold tracking-tight sm:py-4 sm:px-8 p-2.5"
    >
      <div className="flex items-center justify-between w-full">
        <Link
          href="https://www.builders.garden/"
          target="_blank"
          className="hover:underline"
        >
          Builders Garden @ 2025
        </Link>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 cursor-pointer">
              <p>About</p>
              <InfoIcon className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="flex flex-col rounded-none sm:rounded-lg sm:gap-5 gap-6 sm:max-w-[550px] sm:h-fit max-w-full h-full">
            <DialogHeader>
              <DialogTitle className="text-start text-3xl font-bold mb-1">
                About
              </DialogTitle>
            </DialogHeader>

            <p className="text-lg leading-5.5">
              Eco Checkout is an open source single-page web application that
              enables merchants to seamlessly receive stablecoin payments.
            </p>

            <p className="text-lg leading-5.5">
              Merchants should redirect their users to the Eco Checkout web app
              via a specially crafted URL that includes the necessary payment
              parameters.
            </p>

            <div className="flex flex-col gap-4 bg-secondary-foreground/50 border rounded-lg p-4 sm:mb-10">
              <p className="text-lg font-medium leading-5.5">
                Eco is a stablecoin liquidity layer for onchain apps and
                protocols.
              </p>
              <p className="text-lg leading-5.5">
                The checkout experience is powered by Eco Routes.
              </p>
              <ul className="flex flex-col gap-2 list-inside list-disc ml-4">
                <li>
                  <Link
                    href="https://eco.com/blog/introducing-the-eco-routes-sdk"
                    target="_blank"
                    className="underline underline-offset-2"
                  >
                    Routes SDK
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://docs.eco.com"
                    target="_blank"
                    className="underline underline-offset-2"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
              <Link
                href="https://eco.com/"
                target="_blank"
                className="block text-lg text-blue-500 hover:underline"
              >
                About Eco
              </Link>
            </div>

            <DialogFooter className="absolute bottom-0 left-0 right-0 flex flex-row items-center justify-between sm:justify-between tracking-tight font-semibold text-sm text-secondary p-3 sm:p-4">
              <Link href="https://www.builders.garden/" target="_blank">
                Built by Builders Garden
              </Link>
              <div className="flex items-center gap-1">
                <img
                  src="/images/github-logo.svg"
                  alt="Github Logo"
                  className="w-4 h-4 opacity-50"
                />
                <Link
                  href="https://github.com/builders-garden/eco-checkout-spa"
                  target="_blank"
                  className="flex items-center"
                >
                  View on Github
                </Link>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};
