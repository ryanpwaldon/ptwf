import type { FunctionReturnType } from "convex/server";

import type { api } from "@acme/convex";

export type Game = NonNullable<FunctionReturnType<typeof api.games.byCode>>;
export type Me = NonNullable<FunctionReturnType<typeof api.players.me>>;
export type Player = FunctionReturnType<typeof api.players.allByGameId>[number];
export type Question = FunctionReturnType<
  typeof api.questions.allByGameId
>[number];
export type Answer = FunctionReturnType<typeof api.answers.allByGameId>[number];

export interface QuestionAnswerIndex {
  readonly answers: readonly Answer[];
  readonly byPlayerId: ReadonlyMap<Answer["playerId"], Answer>;
  readonly bySelectedLabel: ReadonlyMap<
    Answer["selectedLabel"],
    readonly Answer[]
  >;
}

export interface AnswerIndex {
  readonly byQuestionId: ReadonlyMap<Answer["questionId"], QuestionAnswerIndex>;
  readonly correctCountByPlayerId: ReadonlyMap<Answer["playerId"], number>;
}

export function createAnswerIndex(answers: readonly Answer[]): AnswerIndex {
  const byQuestionId = new Map<
    Answer["questionId"],
    {
      answers: Answer[];
      byPlayerId: Map<Answer["playerId"], Answer>;
      bySelectedLabel: Map<Answer["selectedLabel"], Answer[]>;
    }
  >();
  const correctCountByPlayerId = new Map<Answer["playerId"], number>();

  for (const answer of answers) {
    let questionIndex = byQuestionId.get(answer.questionId);
    if (!questionIndex) {
      questionIndex = {
        answers: [],
        byPlayerId: new Map(),
        bySelectedLabel: new Map(),
      };
      byQuestionId.set(answer.questionId, questionIndex);
    }

    questionIndex.answers.push(answer);
    if (!questionIndex.byPlayerId.has(answer.playerId)) {
      questionIndex.byPlayerId.set(answer.playerId, answer);
    }

    const selectedAnswers =
      questionIndex.bySelectedLabel.get(answer.selectedLabel) ?? [];
    selectedAnswers.push(answer);
    questionIndex.bySelectedLabel.set(answer.selectedLabel, selectedAnswers);

    if (answer.isCorrect) {
      correctCountByPlayerId.set(
        answer.playerId,
        (correctCountByPlayerId.get(answer.playerId) ?? 0) + 1,
      );
    }
  }

  return { byQuestionId, correctCountByPlayerId };
}
