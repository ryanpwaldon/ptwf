"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { GithubIcon, KeyRoundIcon, PawPrintIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { api } from "@acme/convex";
import { Button } from "@acme/ui/button";

import { AppShell, PageContainer } from "~/components/app-shell";
import {
  getHomepageEntrance,
  homepageEntranceDelays,
} from "~/components/homepage-entrance";
import { HomepageStickerLockup } from "~/components/homepage-sticker-lockup";
import { LoadingButton } from "~/components/loading-button";
import { PawTrailBackground } from "~/components/paw-trail-background";
import { ThemeToggle } from "~/components/theme-toggle";

export default function HomePage() {
  const router = useRouter();
  const createGame = useSessionMutation(api.games.create);
  const [isCreating, setIsCreating] = useState(false);
  const shouldReduceMotion = useReducedMotion();

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
    <AppShell>
      <PawTrailBackground />
      <PageContainer className="relative z-10 flex flex-1 flex-col">
        <main className="flex flex-1 items-center px-4 py-16">
          <div className="flex w-full flex-col items-center text-center">
            <h1 className="sr-only">Pet Care Trivia</h1>
            <HomepageStickerLockup
              className="mt-[4.5rem] h-40"
              entranceDelay={homepageEntranceDelays.first}
            />
            <motion.h2
              className="mt-8 text-[2.5rem] leading-[0.95] font-medium tracking-[-0.07em] sm:text-5xl"
              {...getHomepageEntrance(
                homepageEntranceDelays.title,
                shouldReduceMotion,
              )}
            >
              All about pets!
            </motion.h2>
            <motion.p
              className="text-muted-foreground mt-6 max-w-[25rem] text-lg leading-relaxed text-pretty sm:max-w-md sm:text-xl"
              {...getHomepageEntrance(
                homepageEntranceDelays.description,
                shouldReduceMotion,
              )}
            >
              Challenge your friends and learn interesting pet-care facts over a
              game of trivia.
            </motion.p>
            <motion.div
              className="mt-6 flex w-full max-w-68 flex-col gap-3 sm:max-w-md sm:flex-row"
              {...getHomepageEntrance(
                homepageEntranceDelays.final,
                shouldReduceMotion,
              )}
            >
              <div className="w-full sm:flex-1">
                <LoadingButton
                  size="xl"
                  onClick={handleCreate}
                  isLoading={isCreating}
                  className="w-full rounded-full disabled:opacity-100"
                >
                  <PawPrintIcon />
                  Start a game
                </LoadingButton>
              </div>
              <div className="w-full sm:flex-1">
                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => router.push("/join")}
                  className="w-full rounded-full"
                >
                  <KeyRoundIcon />
                  Join with a code
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <motion.footer
          className="flex justify-center gap-1 px-4 pb-4"
          {...getHomepageEntrance(
            homepageEntranceDelays.final,
            shouldReduceMotion,
            { y: 0 },
          )}
        >
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
        </motion.footer>
      </PageContainer>
    </AppShell>
  );
}
