import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import "~/app/styles.css";

import { TooltipProvider } from "@acme/ui/tooltip";

import { ConvexProvider } from "~/components/convex-provider";
import { UncaughtErrorToastListener } from "~/components/uncaught-error-toast-listener";

export const metadata: Metadata = {
  title: "Pet Trivia With Friends",
  description:
    "Put your pet-care knowledge to the test with friends in a live trivia game.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "text-foreground bg-muted font-sans antialiased",
          inter.variable,
        )}
      >
        <ConvexProvider>
          <TooltipProvider>
            <ThemeProvider>
              <UncaughtErrorToastListener />
              {props.children}
              <Toaster />
            </ThemeProvider>
          </TooltipProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
