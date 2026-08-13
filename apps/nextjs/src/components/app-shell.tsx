import type { ComponentProps } from "react";

import { cn } from "@acme/ui";

export function AppShell({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex min-h-dvh flex-col", className)}
      {...props}
    />
  );
}

export function PageContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-136 sm:max-w-xl sm:px-4", className)}
      {...props}
    />
  );
}
