"use client";

import { useEffect } from "react";

import { ErrorFallbackCard } from "~/components/error-fallback-card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorFallbackCard onRetry={reset} />;
}
