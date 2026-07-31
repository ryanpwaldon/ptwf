"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { ArrowUpRightIcon } from "lucide-react";

import { api } from "@acme/convex";
import { Button } from "@acme/ui/button";

import { Header } from "~/components/header";
import { Loader } from "~/components/loader";
import { PageShell } from "~/components/page-shell";

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
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-24">
        <div className="2xs:w-1/2 aspect-2/3 w-3/4 bg-red-600 px-3 py-3">
          <h1 className="2xs:text-4xl text-3xl leading-none font-extrabold tracking-tight text-white">
            Movie
            <br />
            Trivia
            <br />
            With
            <br />
            Friends
          </h1>
        </div>
        <div className="2xs:w-1/2 flex w-3/4 flex-col gap-3 pt-12">
          <Button
            size="xl"
            variant="default"
            onClick={handleCreate}
            disabled={isCreating}
            className="disabled:opacity-100"
          >
            {isCreating ? <Loader className="size-6" /> : "Create a game"}
          </Button>
          <Button
            size="xl"
            variant="ghost"
            onClick={() => router.push("/join")}
          >
            Join a game
          </Button>
        </div>
      </main>
      <footer className="flex h-16 items-center justify-end gap-4 px-1.5 text-sm">
        <Button variant="link" asChild>
          <Link href="https://github.com/ryanpwaldon/mtwf" target="_blank">
            Github <ArrowUpRightIcon />
          </Link>
        </Button>
      </footer>
    </PageShell>
  );
}
