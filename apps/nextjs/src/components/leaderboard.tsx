import type { Character } from "@acme/convex";
import { cn } from "@acme/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

interface LeaderboardEntry {
  character: Character;
  correctAnswers: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  totalQuestions: number;
  myCharacterValue: Character["value"];
  className?: string;
}

export function Leaderboard({
  entries,
  totalQuestions,
  myCharacterValue,
  className,
}: LeaderboardProps) {
  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow className="border-border transition-none hover:bg-transparent">
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Correct</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, i) => (
          <TableRow
            key={entry.character.value}
            className="border-border transition-none hover:bg-transparent"
          >
            <TableCell className="py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-3.5">{i + 1}.</span>
                <Avatar size="sm" tooltip={entry.character.label}>
                  <AvatarImage
                    src={entry.character.image}
                    alt={`${entry.character.label} avatar`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {entry.character.label.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span>{entry.character.label}</span>
                {myCharacterValue === entry.character.value && (
                  <Badge>You</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="py-2.5 text-right">
              {entry.correctAnswers}/{totalQuestions}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
