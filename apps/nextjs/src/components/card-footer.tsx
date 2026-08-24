"use client";

import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@acme/ui";
import { Card } from "@acme/ui/card";

import { PageContainer } from "./app-shell";

type CardFooterProps = Omit<HTMLMotionProps<"footer">, "children"> & {
  children?: ReactNode;
  contentClassName?: string;
};

export function CardFooter({
  children,
  className,
  contentClassName,
  ...props
}: CardFooterProps) {
  return (
    <motion.footer
      className={cn("sticky bottom-0 z-10 mt-4", className)}
      {...props}
    >
      <PageContainer>
        <div className={cn("flex items-center gap-4 p-2", contentClassName)}>
          <Card className="bg-card dark:bg-card w-full gap-0 p-4 shadow-[0_0_32px_16px_var(--background)]">
            {children}
          </Card>
        </div>
      </PageContainer>
    </motion.footer>
  );
}
