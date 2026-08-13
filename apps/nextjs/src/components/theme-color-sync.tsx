"use client";

import { useEffect } from "react";

import { useTheme } from "@acme/ui/theme";

import { themeColors } from "~/lib/theme";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;

    const color = themeColors[resolvedTheme];

    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((element) => {
        element.content = color;
      });
  }, [resolvedTheme]);

  return null;
}
