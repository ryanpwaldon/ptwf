"use client";

import type { ComponentProps } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { useTheme } from "@acme/ui/theme";

interface ThemeToggleProps {
  size: ComponentProps<typeof Button>["size"];
}

export function ThemeToggle({ size }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
      <span className="dark:hidden">Light</span>
      <span className="hidden dark:inline">Dark</span>
    </Button>
  );
}
