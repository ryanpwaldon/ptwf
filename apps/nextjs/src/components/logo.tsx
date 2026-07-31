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
        d="M0 0h3.127L6.43 14.781h.14L9.873 0H13v22h-2.46V7.68h-.099L7.337 21.894H5.663L2.559 7.627h-.1V22H0V0Z"
      />
    </svg>
  );
}
