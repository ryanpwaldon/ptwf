import type { Character } from "@acme/convex";
import { cn } from "@acme/ui";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@acme/ui/field";
import { RadioGroupItem } from "@acme/ui/radio-group";

import { PlayerAvatarGroup } from "./player-avatar-group";

export function AnswerChoice({
  id,
  value,
  showResults,
  isCorrectAnswer,
  voters,
  description,
  disabled,
}: {
  id: string;
  value: string;
  showResults: boolean;
  isCorrectAnswer: boolean;
  voters: Character[];
  description: string;
  disabled: boolean;
}) {
  return (
    <FieldLabel
      htmlFor={id}
      data-show-results={showResults}
      data-correct-answer={isCorrectAnswer}
      className={cn(
        "group/choice bg-card relative transition-[background-color,border-color] duration-150",
        "data-[show-results=true]:data-[correct-answer=true]:border-correct data-[show-results=true]:data-[correct-answer=true]:bg-correct/30",
        "data-[show-results=true]:data-[correct-answer=false]:has-data-[state=checked]:border-incorrect data-[show-results=true]:data-[correct-answer=false]:has-data-[state=checked]:bg-incorrect/30",
      )}
    >
      <Field orientation="horizontal" className="relative">
        <FieldContent>
          <div className="flex items-center justify-between">
            <FieldTitle className="group-data-[show-results=true]/choice:group-data-[correct-answer=true]/choice:text-correct-foreground group-data-[show-results=true]/choice:group-has-data-[state=checked]/choice:group-data-[correct-answer=false]/choice:text-incorrect-foreground transition-colors duration-150">
              {value}
            </FieldTitle>
            {showResults ? (
              <PlayerAvatarGroup
                characters={voters}
                avatarSize="2xs"
                maxVisible={10}
                animateEntrance
              />
            ) : null}
          </div>
          <FieldDescription className="group-data-[show-results=true]/choice:group-data-[correct-answer=true]/choice:text-correct-foreground/80 group-data-[show-results=true]/choice:group-has-data-[state=checked]/choice:group-data-[correct-answer=false]/choice:text-incorrect-foreground/80 transition-colors duration-150">
            {description}
          </FieldDescription>
        </FieldContent>
        <RadioGroupItem
          id={id}
          value={value}
          disabled={disabled}
          className={cn(
            "transition-[color,border-color,box-shadow,opacity] duration-150 [&_svg]:transition-colors [&_svg]:duration-150",
            "group-data-[show-results=true]/choice:group-data-[correct-answer=true]/choice:text-correct group-data-[show-results=true]/choice:group-data-[correct-answer=true]/choice:border-correct [&_svg]:group-data-[show-results=true]/choice:group-data-[correct-answer=true]/choice:fill-correct",
            "group-data-[show-results=true]/choice:group-data-[correct-answer=false]/choice:data-[state=checked]:text-incorrect group-data-[show-results=true]/choice:group-data-[correct-answer=false]/choice:data-[state=checked]:border-incorrect group-data-[show-results=true]/choice:group-data-[correct-answer=false]/choice:data-[state=checked]:[&_svg]:fill-incorrect",
          )}
        />
      </Field>
    </FieldLabel>
  );
}
