import Link from "next/link";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  if (!href) {
    return (
      <div className={cn(className, "size-8 border-red-700 bg-red-600 p-2")}>
        <LogoContent />
      </div>
    );
  }

  return (
    <Button
      asChild
      size="icon"
      variant="ghost"
      className={cn(
        className,
        "border-red-700 bg-red-600 bg-clip-border hover:bg-red-600/80 dark:hover:bg-red-600/80",
      )}
    >
      <Link href={href}>
        <LogoContent />
      </Link>
    </Button>
  );
}

function LogoContent() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 13 22"
    >
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M0 0h6.5C10.7 0 13 2.4 13 6.5S10.7 13 6.5 13H3v9H0V0Zm3 3v7h3.2c2.5 0 3.8-1.2 3.8-3.5S8.7 3 6.2 3H3Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
