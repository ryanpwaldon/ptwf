"use client";

import { useState } from "react";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { CheckIcon } from "lucide-react";

import { api, getCharacterByValue } from "@acme/convex";
import { AvatarBadge } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import type { Game, Me, Player } from "~/lib/game-data";
import { GameInviteField } from "~/components/game-invite-field";
import { LoadingButton } from "~/components/loading-button";
import { PageHeader } from "~/components/page-header";
import { AppShell, PageContainer } from "./app-shell";
import { CareTopicPicker } from "./care-topic-picker";
import { CharacterPicker } from "./character-picker";
import { ModelPicker } from "./model-picker";
import { PageFooter } from "./page-footer";
import { PetPicker } from "./pet-picker";
import { PlayerAvatarGroup } from "./player-avatar-group";
import { QuestionCountPicker } from "./question-count-picker";
import { TimeLimitPicker } from "./time-limit-picker";

interface GameLobbyProps {
  game: Game;
  players: Player[];
  me: Me;
}

export function GameLobby({ game, players, me }: GameLobbyProps) {
  const updateQuizAnimal = useSessionMutation(api.games.updateQuizAnimal);
  const updateQuizModel = useSessionMutation(api.games.updateQuizModel);
  const updateQuizTheme = useSessionMutation(api.games.updateQuizTheme);
  const updateCharacter = useSessionMutation(api.players.updateCharacter);
  const updateIsReady = useSessionMutation(api.players.updateIsReady);

  const updateQuestionCount = useSessionMutation(
    api.games.updateQuestionCount,
  ).withOptimisticUpdate((localStore, args) => {
    const currentGame = localStore.getQuery(api.games.byCode, {
      code: game.code,
    });
    if (!currentGame) return;
    localStore.setQuery(
      api.games.byCode,
      { code: game.code },
      { ...currentGame, questionCount: args.questionCount },
    );
  });

  const updateTimeLimitSeconds = useSessionMutation(
    api.games.updateTimeLimitSeconds,
  ).withOptimisticUpdate((localStore, args) => {
    const currentGame = localStore.getQuery(api.games.byCode, {
      code: game.code,
    });
    if (!currentGame) return;
    localStore.setQuery(
      api.games.byCode,
      { code: game.code },
      { ...currentGame, timeLimitSeconds: args.timeLimitSeconds },
    );
  });

  const [isUpdatingReady, setIsUpdatingReady] = useState(false);
  const characters = players.map((p) => getCharacterByValue(p.character));
  const takenCharacterValues = players.filter((p) => p.character !== me.character).map((p) => p.character); // prettier-ignore
  const readyByCharacter = new Map(players.map((p) => [p.character, p.isReady])); // prettier-ignore
  const readyPlayerCount = players.filter((player) => player.isReady).length;
  const readyButtonLabel =
    players.length === 1 ? "Play" : me.isReady ? "Cancel" : "Ready";

  async function handleReadyToggle() {
    setIsUpdatingReady(true);
    try {
      await updateIsReady({ gameId: game._id, isReady: !me.isReady });
    } finally {
      setIsUpdatingReady(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Game lobby" />
      <PageContainer className="flex flex-1 flex-col">
        <main className="flex-1 px-4 pb-16">
          <div className="mt-8 space-y-1">
            <h1 className="text-[1.75rem] leading-8 font-bold tracking-tight">
              Get ready to play
            </h1>
            <p className="text-muted-foreground">
              Choose your character, set up the quiz, and invite your friends.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle>Your player</CardTitle>
                <CardDescription>Choose your character.</CardDescription>
              </CardHeader>
              <CardContent className="flex h-full items-center">
                <CharacterPicker
                  value={me.character}
                  takenValues={takenCharacterValues}
                  onChange={(character) => {
                    void updateCharacter({ gameId: game._id, character });
                  }}
                />
              </CardContent>
            </Card>
            <Card className="w-full sm:col-span-3">
              <CardHeader>
                <CardTitle>Invite your friends</CardTitle>
                <CardDescription>
                  Share the code or copy the invite link.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <GameInviteField code={game.code} />
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Choose a pet</CardTitle>
              <CardDescription>
                Which pet should the questions be about?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full items-center">
              <PetPicker
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
            <CardHeader>
              <CardTitle>Choose a care topic</CardTitle>
              <CardDescription>
                What should the questions cover?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full items-center">
              <CareTopicPicker
                value={game.quizTheme}
                onChange={(quizTheme) => {
                  void updateQuizTheme({ gameId: game._id, quizTheme });
                }}
              />
            </CardContent>
          </Card>
          <Card className="mt-4 gap-0 pb-0">
            <CardHeader>
              <CardTitle>Game format</CardTitle>
              <CardDescription>Fine-tune the length and pace.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <QuestionCountPicker
                value={game.questionCount}
                onChange={(questionCount) => {
                  void updateQuestionCount({
                    gameId: game._id,
                    questionCount,
                  });
                }}
              />
              <TimeLimitPicker
                value={game.timeLimitSeconds}
                onChange={(timeLimitSeconds) => {
                  void updateTimeLimitSeconds({
                    gameId: game._id,
                    timeLimitSeconds,
                  });
                }}
              />
              <ModelPicker
                value={game.quizModel}
                onChange={(quizModel) => {
                  void updateQuizModel({ gameId: game._id, quizModel });
                }}
              />
            </CardContent>
          </Card>
        </main>
      </PageContainer>
      <PageFooter contentClassName="justify-between">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <p className="font-medium">Players</p>
            <Badge
              variant="secondary"
              className={
                players.length === 1
                  ? "size-6 rounded-full p-0 leading-none tabular-nums"
                  : "h-6 px-2 leading-none tabular-nums"
              }
            >
              {players.length === 1
                ? players.length
                : `${readyPlayerCount}/${players.length} ready`}
            </Badge>
          </div>
          <PlayerAvatarGroup
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
        <LoadingButton
          size="xl"
          aria-pressed={players.length > 1 ? me.isReady : undefined}
          isLoading={isUpdatingReady}
          preserveContentWidth
          className="transition-none disabled:opacity-100"
          onClick={() => void handleReadyToggle()}
          variant={players.length > 1 && me.isReady ? "outline" : "default"}
        >
          {readyButtonLabel}
        </LoadingButton>
      </PageFooter>
    </AppShell>
  );
}
