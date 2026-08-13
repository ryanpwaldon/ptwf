"use client";

import { AppShell, PageContainer } from "./app-shell";
import { PawLoader } from "./paw-loader";
import { PawTrailBackground } from "./paw-trail-background";

interface FullScreenLoaderProps {
  title?: string;
  description?: string;
  showPawTrail?: boolean;
}

export function FullScreenLoader({
  title,
  description,
  showPawTrail = false,
}: FullScreenLoaderProps) {
  return (
    <AppShell>
      {showPawTrail && <PawTrailBackground />}
      <PageContainer className="relative z-10 flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center">
          <PawLoader />
          {title && description && (
            <div className="mt-4 flex flex-col items-center gap-1 text-center">
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          )}
        </main>
      </PageContainer>
    </AppShell>
  );
}
