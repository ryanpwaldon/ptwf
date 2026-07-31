"use client";

import { useEffect } from "react";

import { ErrorFallbackCard } from "~/components/error-fallback-card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="text-foreground bg-muted font-sans antialiased">
        <ErrorFallbackCard onRetry={reset} />
      </body>
    </html>
  );
}
