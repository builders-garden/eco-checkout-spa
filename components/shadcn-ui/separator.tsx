"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/shadcn/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  dashed = false,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  dashed?: boolean;
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        dashed && "border-dashed bg-transparent border-border border-1",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
