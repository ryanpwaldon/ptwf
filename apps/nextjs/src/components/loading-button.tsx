import type { ComponentProps } from "react";
import { LoaderCircleIcon } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  isLoading: boolean;
  preserveContentWidth?: boolean;
  contentClassName?: string;
}

export function LoadingButton({
  children,
  contentClassName,
  disabled,
  isLoading,
  preserveContentWidth = false,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      aria-busy={isLoading || undefined}
      disabled={isLoading ? true : disabled}
    >
      {preserveContentWidth ? (
        <span className="grid place-items-center">
          <span
            className={cn(
              "col-start-1 row-start-1",
              isLoading && "invisible",
              contentClassName,
            )}
          >
            {children}
          </span>
          {isLoading && (
            <LoaderCircleIcon className="col-start-1 row-start-1 animate-spin" />
          )}
        </span>
      ) : isLoading ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : (
        children
      )}
    </Button>
  );
}
