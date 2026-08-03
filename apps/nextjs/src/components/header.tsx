"use client";

import type { PropsWithChildren } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EllipsisIcon,
  LogOutIcon,
  SunMoonIcon,
} from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { useTheme } from "@acme/ui/theme";

export function Header({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <header
      className={cn("flex h-16 items-center justify-between px-4", className)}
    >
      {children}
    </header>
  );
}

export function HeaderTitle({ children }: PropsWithChildren) {
  return <p className="text-sm font-medium">{children}</p>;
}

export function HeaderHomeLink() {
  return (
    <Button asChild variant="link" className="-ml-2.5">
      <Link href="/">
        <ArrowLeftIcon />
        Home
      </Link>
    </Button>
  );
}

export function HeaderMenu({ children }: PropsWithChildren) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open menu">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderThemeItem() {
  const { themeMode, toggleMode } = useTheme();
  const themeLabel =
    themeMode === "auto" ? "System" : themeMode === "dark" ? "Dark" : "Light";

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        toggleMode();
      }}
    >
      <SunMoonIcon />
      Theme
      <span className="text-muted-foreground ml-auto text-xs">
        {themeLabel}
      </span>
    </DropdownMenuItem>
  );
}

export function HeaderMenuSeparator() {
  return <DropdownMenuSeparator />;
}

export function HeaderExitGameItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="/">
        <LogOutIcon />
        Exit game
      </Link>
    </DropdownMenuItem>
  );
}
