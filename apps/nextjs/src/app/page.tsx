"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionMutation } from "convex-helpers/react/sessions";
import {
  GithubIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  PawPrintIcon,
} from "lucide-react";

import { api } from "@acme/convex";
import { Button } from "@acme/ui/button";

import { ArchedBadge } from "~/components/arched-badge";
import { PageShell } from "~/components/page-shell";
import { PawTrailBackground } from "~/components/paw-trail-background";
import { StickerLockup } from "~/components/sticker-lockup";
import { ThemeToggle } from "~/components/theme-toggle";

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
          <h1 className="sr-only">Pet Care Trivia</h1>
          <ArchedBadge label="Pet Care Trivia" />
          <StickerLockup className="h-40" />
          <h2 className="mt-8 text-4xl leading-[0.95] font-medium tracking-[-0.07em] sm:text-5xl">
            All about pets!
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed sm:text-xl">
            Challenge your friends and learn interesting pet-care facts together
            through trivia.
          </p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row">
            <Button
              size="xl"
              onClick={handleCreate}
              disabled={isCreating}
              className="disabled:opacity-100 sm:flex-1"
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
              className="sm:flex-1"
            >
              <KeyRoundIcon />
              Join with a code
            </Button>
          </div>
        </div>
      </main>
      <footer className="relative z-10 flex justify-center gap-1 px-4 pb-4">
        <Button asChild variant="ghost" size="sm">
          <a
            href="https://github.com/ryanpwaldon/ptwf"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon />
            GitHub
          </a>
        </Button>
        <ThemeToggle size="sm" />
      </footer>
    </PageShell>
  );
}
