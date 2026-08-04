"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { KeyRoundIcon, LoaderCircleIcon, PawPrintIcon } from "lucide-react";

import { api } from "@acme/convex";
import { Button } from "@acme/ui/button";

import { PageShell } from "~/components/page-shell";
import { PawTrailBackground } from "~/components/paw-trail-background";

export default function HomePage() {
  const router = useRouter();
  const createGame = useSessionMutation(api.games.create);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const code = await createGame();
      router.push(`/game/${code}`);
    } catch {
      setIsCreating(false);
    }
  }

  return (
    <PageShell>
      <PawTrailBackground spacing={320} />
      <main className="relative z-10 flex flex-1 items-center px-4 py-16">
        <div className="flex w-full flex-col items-center text-center">
          <h1 className="text-5xl leading-[0.95] font-medium tracking-[-0.07em]">
            Who knows pets?
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md text-lg leading-relaxed sm:text-xl">
            Put your pet-care know-how to the test with your friends. See who
            really knows pets best!
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Button
              size="xl"
              variant="default"
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-none disabled:opacity-100 sm:flex-1"
            >
              {isCreating ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <>
                  <PawPrintIcon />
                  Start a game
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="xl"
              onClick={() => router.push("/join")}
              className="flex-none sm:flex-1"
            >
              <KeyRoundIcon />
              Join with a code
            </Button>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
