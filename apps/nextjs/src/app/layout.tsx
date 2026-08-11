import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import "~/app/styles.css";

import { TooltipProvider } from "@acme/ui/tooltip";

import { ConvexProvider } from "~/components/convex-provider";
import { UncaughtErrorToastListener } from "~/components/uncaught-error-toast-listener";

const title = "All about pets!";
const description =
  "Challenge your friends and learn interesting pet-care facts together through trivia.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ptwf.vercel.app"),
  title,
  description,
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    images: [
      {
        url: "/meta/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Pet Care Trivia with a playful cartoon cat and pet-themed stickers.",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
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
        className={cn("text-foreground font-sans antialiased", inter.variable)}
      >
        <ConvexProvider>
          <TooltipProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UncaughtErrorToastListener />
              <div className="relative z-30">{props.children}</div>
              <Toaster />
            </ThemeProvider>
          </TooltipProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
