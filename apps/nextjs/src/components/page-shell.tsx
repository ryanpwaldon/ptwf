import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col sm:px-4 sm:pt-4">
      <div className="bg-background relative flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
