import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import "~/app/styles.css";

import { TooltipProvider } from "@acme/ui/tooltip";

import { ConvexProvider } from "~/components/convex-provider";
import { ThemeColorSync } from "~/components/theme-color-sync";
import { UncaughtErrorToastListener } from "~/components/uncaught-error-toast-listener";
import { themeColors } from "~/lib/theme";

const title = "All about pets!";
const description =
  "Test your pet-care knowledge with a game of trivia. Play solo or challenge your friends.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ptwf.vercel.app"),
  title: {
    default: title,
    template: "%s | All about pets!",
  },
  description,
  alternates: {
    canonical: "/",
  },
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
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/meta/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColors.light },
    { media: "(prefers-color-scheme: dark)", color: themeColors.dark },
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
              <ThemeColorSync />
              <UncaughtErrorToastListener />
              <div className="relative z-30">{props.children}</div>
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </TooltipProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
