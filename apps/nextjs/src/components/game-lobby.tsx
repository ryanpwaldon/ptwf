"use client";

import type { FunctionReturnType } from "convex/server";
import { useState } from "react";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { CheckIcon } from "lucide-react";

import { api, getCharacterByValue } from "@acme/convex";
import { AvatarBadge } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { Header } from "~/components/header";
import { InviteCodeField } from "~/components/invite-code-field";
import { AnimalInput } from "./animal-input";
import { AvatarInput } from "./avatar-input";
import { PageShell } from "./page-shell";
import { PlayerGroup } from "./player-group";
import { ThemeInput } from "./theme-input";

type Game = NonNullable<FunctionReturnType<typeof api.games.byCode>>;
type Player = FunctionReturnType<typeof api.players.allByGameId>[number];
type Me = NonNullable<FunctionReturnType<typeof api.players.me>>;

interface GameLobbyProps {
  game: Game;
  players: Player[];
  me: Me;
}

export function GameLobby({ game, players, me }: GameLobbyProps) {
  const updateQuizAnimal = useSessionMutation(api.games.updateQuizAnimal);
  const updateQuizTheme = useSessionMutation(api.games.updateQuizTheme);
  const updateCharacter = useSessionMutation(api.players.updateCharacter);
  const updateIsReady = useSessionMutation(api.players.updateIsReady);
  const [isUpdatingReady, setIsUpdatingReady] = useState(false);
  const characters = players.map((p) => getCharacterByValue(p.character));
  const takenCharacterValues = players.filter((p) => p.character !== me.character).map((p) => p.character); // prettier-ignore
  const readyByCharacter = new Map(players.map((p) => [p.character, p.isReady])); // prettier-ignore

  async function handleReadyToggle() {
    setIsUpdatingReady(true);
    try {
      await updateIsReady({ gameId: game._id, isReady: !me.isReady });
    } finally {
      setIsUpdatingReady(false);
    }
  }

  return (
    <PageShell>
      <Header />
      <main className="flex-1 px-4 pb-16">
        <div className="mt-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Get ready to play
          </h1>
          <p className="text-muted-foreground">
            Choose a pet and topic, then invite your friends.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="w-full sm:col-span-2">
            <CardHeader className="border-b">
              <CardTitle>Invite your friends</CardTitle>
              <CardDescription>
                Share this code so they can join.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <InviteCodeField code={game.code} />
            </CardContent>
          </Card>
          <Card className="sm:col-span-1">
            <CardHeader className="border-b">
              <CardTitle>Your player</CardTitle>
              <CardDescription>Choose your colour.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full items-center justify-center">
              <AvatarInput
                value={me.character}
                takenValues={takenCharacterValues}
                onChange={(character) => {
                  void updateCharacter({ gameId: game._id, character });
                }}
              />
            </CardContent>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader className="border-b">
            <CardTitle>Choose a pet</CardTitle>
            <CardDescription>
              Which pet should the questions be about?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full items-center">
            <AnimalInput
              value={game.quizAnimal}
              onChange={(quizAnimal) => {
                void updateQuizAnimal({
                  gameId: game._id,
                  quizAnimal,
                });
              }}
            />
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader className="border-b">
            <CardTitle>Choose a topic</CardTitle>
            <CardDescription>What should the questions cover?</CardDescription>
          </CardHeader>
          <CardContent className="flex h-full items-center">
            <ThemeInput
              value={game.quizTheme}
              onChange={(quizTheme) => {
                void updateQuizTheme({ gameId: game._id, quizTheme });
              }}
            />
          </CardContent>
        </Card>
      </main>
      <div className="bg-background/95 sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-4 border-t p-4 backdrop-blur">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <p className="font-medium">Players</p>
            <Badge variant="secondary">{players.length}</Badge>
          </div>
          <PlayerGroup
            maxVisible={8}
            avatarSize="default"
            characters={characters}
            renderBadge={(character) =>
              readyByCharacter.get(character.value) ? (
                <AvatarBadge position="top-left" className="bg-lime-400">
                  <CheckIcon className="stroke-lime-900 stroke-5" />
                </AvatarBadge>
              ) : null
            }
          />
        </div>
        <Button
          size="xl"
          disabled={isUpdatingReady}
          className="transition-none"
          onClick={() => void handleReadyToggle()}
          variant={me.isReady ? "outline" : "default"}
        >
          {me.isReady ? "Ready ✓" : "I’m ready"}
        </Button>
      </div>
    </PageShell>
  );
}
