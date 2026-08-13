import type { ComponentProps } from "react";

import { cn } from "@acme/ui";

import { PageContainer } from "./app-shell";

interface FooterProps extends ComponentProps<"footer"> {
  contentClassName?: string;
}

export function Footer({
  children,
  className,
  contentClassName,
  ...props
}: FooterProps) {
  return (
    <footer
      className={cn(
        "bg-background/75 sticky bottom-0 z-10 mt-4 backdrop-blur-xl backdrop-saturate-150",
        className,
      )}
      {...props}
    >
      <PageContainer>
        <div
          className={cn(
            "flex items-center gap-4 border-t p-4",
            contentClassName,
          )}
        >
          {children}
        </div>
      </PageContainer>
    </footer>
  );
}
