import type { Character } from "@acme/convex";
import { cn } from "@acme/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { PlayerGroup } from "./player-group";

export interface QuestionResultChoice {
  text: string;
  voters: Character[];
}

interface QuestionResultProps {
  question: string;
  questionIndex: number;
  choices: QuestionResultChoice[];
  correctIndex: number;
  myChoiceIndex: number;
  className?: string;
}

export function QuestionResult({
  question,
  questionIndex,
  choices,
  correctIndex,
  myChoiceIndex,
  className,
}: QuestionResultProps) {
  return (
    <Card className={cn("gap-0 p-0", className)}>
      <CardHeader className="border-b p-2!">
        <CardTitle className="text-sm font-medium">
          Question {questionIndex + 1}
        </CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {choices.map((choice, i) => {
          const letter = String.fromCharCode(65 + i);
          const isCorrect = i === correctIndex;
          const isUserWrongPick = i === myChoiceIndex && myChoiceIndex !== correctIndex; // prettier-ignore
          return (
            <div
              key={i}
              className={cn(
                "relative flex w-full items-center justify-between gap-2 bg-clip-padding p-2",
                isCorrect && "bg-correct/20",
                isUserWrongPick && "bg-incorrect/20",
              )}
            >
              <span
                className={cn(
                  "text-muted-foreground relative",
                  isCorrect && "text-correct-foreground",
                  isUserWrongPick && "text-incorrect-foreground",
                )}
              >
                {letter}. {choice.text}
              </span>
              <div className="relative flex items-center gap-2">
                {choice.voters.length > 0 && (
                  <PlayerGroup
                    characters={choice.voters}
                    avatarSize="2xs"
                    maxVisible={10}
                  />
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
