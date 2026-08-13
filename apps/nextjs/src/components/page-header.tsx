"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { ThemeToggle } from "~/components/theme-toggle";
import { PageContainer } from "./app-shell";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="bg-background/75 sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150">
      <PageContainer>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <Button
              asChild
              variant="ghost"
              className="text-muted-foreground hover:text-foreground -ml-2 px-2"
            >
              <Link href="/">
                <ArrowLeftIcon />
                Home
              </Link>
            </Button>
            <Separator
              orientation="vertical"
              className="mr-3 ml-1 data-[orientation=vertical]:h-4"
            />
            <p className="text-sm font-medium">{title}</p>
          </div>
          <ThemeToggle size="default" />
        </div>
      </PageContainer>
    </header>
  );
}
