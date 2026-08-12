"use client";

import { Loader } from "./loader";
import { PageShell } from "./page-shell";
import { PawTrailBackground } from "./paw-trail-background";

interface FullScreenLoaderProps {
  title?: string;
  description?: string;
}

export function FullScreenLoader({
  title,
  description,
}: FullScreenLoaderProps) {
  return (
    <PageShell>
      <PawTrailBackground />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <Loader />
        {title && description && (
          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        )}
      </main>
    </PageShell>
  );
}
