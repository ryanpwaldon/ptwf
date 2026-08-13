import { describe, expect, it } from "vitest";

import type { Answer } from "./game-data";
import { createAnswerIndex } from "./game-data";

const gameId = "game" as Answer["gameId"];
const firstQuestionId = "question-1" as Answer["questionId"];
const secondQuestionId = "question-2" as Answer["questionId"];
const firstPlayerId = "player-1" as Answer["playerId"];
const secondPlayerId = "player-2" as Answer["playerId"];

function makeAnswer(
  id: string,
  values: Pick<
    Answer,
    "character" | "isCorrect" | "playerId" | "questionId" | "selectedLabel"
  >,
): Answer {
  return {
    _id: id as Answer["_id"],
    _creationTime: 1,
    answeredAt: 1,
    gameId,
    ...values,
  };
}

describe("createAnswerIndex", () => {
  it("projects answers by question, player, and selected label", () => {
    const firstAnswer = makeAnswer("answer-1", {
      character: "apricot",
      isCorrect: false,
      playerId: firstPlayerId,
      questionId: firstQuestionId,
      selectedLabel: "A",
    });
    const secondAnswer = makeAnswer("answer-2", {
      character: "aqua",
      isCorrect: true,
      playerId: secondPlayerId,
      questionId: firstQuestionId,
      selectedLabel: "B",
    });
    const thirdAnswer = makeAnswer("answer-3", {
      character: "apricot",
      isCorrect: true,
      playerId: firstPlayerId,
      questionId: secondQuestionId,
      selectedLabel: "B",
    });

    const index = createAnswerIndex([firstAnswer, secondAnswer, thirdAnswer]);

    const firstQuestion = index.byQuestionId.get(firstQuestionId);
    expect(firstQuestion?.answers).toEqual([firstAnswer, secondAnswer]);
    expect(firstQuestion?.byPlayerId.get(firstPlayerId)).toBe(firstAnswer);
    expect(firstQuestion?.bySelectedLabel.get("B")).toEqual([secondAnswer]);
    expect(index.byQuestionId.get(secondQuestionId)?.answers).toEqual([
      thirdAnswer,
    ]);
  });

  it("counts correct answers by player", () => {
    const index = createAnswerIndex([
      makeAnswer("answer-1", {
        character: "apricot",
        isCorrect: true,
        playerId: firstPlayerId,
        questionId: firstQuestionId,
        selectedLabel: "A",
      }),
      makeAnswer("answer-2", {
        character: "apricot",
        isCorrect: false,
        playerId: firstPlayerId,
        questionId: secondQuestionId,
        selectedLabel: "B",
      }),
      makeAnswer("answer-3", {
        character: "aqua",
        isCorrect: true,
        playerId: secondPlayerId,
        questionId: secondQuestionId,
        selectedLabel: "A",
      }),
    ]);

    expect(index.correctCountByPlayerId.get(firstPlayerId)).toBe(1);
    expect(index.correctCountByPlayerId.get(secondPlayerId)).toBe(1);
  });
});
