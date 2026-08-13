import Link from "next/link";

import { Button } from "@acme/ui/button";

import { AppShell, PageContainer } from "./app-shell";

interface FullScreenErrorProps {
  title: string;
  description?: string;
}

export function FullScreenError({
  title,
  description = "Something went wrong.",
}: FullScreenErrorProps) {
  return (
    <AppShell>
      <PageContainer className="flex flex-1 flex-col">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-md p-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <Button size="xl" variant="default" asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </PageContainer>
    </AppShell>
  );
}
