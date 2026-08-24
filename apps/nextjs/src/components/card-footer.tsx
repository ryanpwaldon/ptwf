import type { ComponentProps } from "react";

import { cn } from "@acme/ui";
import { Card } from "@acme/ui/card";

import { PageContainer } from "./app-shell";

interface CardFooterProps extends ComponentProps<"footer"> {
  contentClassName?: string;
}

export function CardFooter({
  children,
  className,
  contentClassName,
  ...props
}: CardFooterProps) {
  return (
    <footer className={cn("sticky bottom-0 z-10 mt-4", className)} {...props}>
      <PageContainer>
        <div
          className={cn("flex items-center gap-4 px-2 py-4", contentClassName)}
        >
          <Card className="bg-card/75 dark:bg-card/75 w-full p-4 shadow-[0_0_32px_16px_var(--background)] backdrop-blur-xl backdrop-saturate-150">
            {children}
          </Card>
        </div>
      </PageContainer>
    </footer>
  );
}
