import type { ComponentProps, ReactNode } from "react";

import type { Character } from "@acme/convex";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";

interface CharacterAvatarProps
  extends Omit<ComponentProps<typeof Avatar>, "children" | "tooltip"> {
  character: Character;
  alt?: string;
  tooltip?: boolean;
  children?: ReactNode;
}

export function CharacterAvatar({
  character,
  alt = `${character.label} avatar`,
  tooltip = false,
  children,
  ...props
}: CharacterAvatarProps) {
  return (
    <Avatar tooltip={tooltip ? character.label : undefined} {...props}>
      <AvatarImage src={character.image} alt={alt} className="object-cover" />
      <AvatarFallback>{character.label.slice(0, 2)}</AvatarFallback>
      {children}
    </Avatar>
  );
}
