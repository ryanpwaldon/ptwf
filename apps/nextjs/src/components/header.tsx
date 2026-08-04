"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { ThemeToggle } from "~/components/theme-toggle";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 backdrop-blur">
      <div className="flex items-center">
        <Button
          asChild
          variant="ghost"
          className="text-muted-foreground hover:text-foreground -ml-2.5 pr-0"
        >
          <Link href="/">
            <ArrowLeftIcon />
            Home
          </Link>
        </Button>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
