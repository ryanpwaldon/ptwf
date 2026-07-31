"use client";

import { Loader } from "./loader";
import { PageShell } from "./page-shell";

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
      <main className="flex flex-1 flex-col items-center justify-center">
        {title && description && (
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        )}
        <Loader className="mt-4" />
      </main>
    </PageShell>
  );
}
