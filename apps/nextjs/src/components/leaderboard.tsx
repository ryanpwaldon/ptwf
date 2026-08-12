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

export interface LeaderboardEntry {
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
  const minimumRows = 0;
  const emptyRowCount = Math.max(0, minimumRows - entries.length);

  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Correct</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, i) => (
          <TableRow key={entry.character.value}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-3.5">{i + 1}.</span>
                <Avatar size="2xs" tooltip={entry.character.label}>
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
                  <Badge variant="outline">You</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              {entry.correctAnswers}/{totalQuestions}
            </TableCell>
          </TableRow>
        ))}
        {Array.from({ length: emptyRowCount }, (_, index) => (
          <TableRow key={`empty-${index}`} className="select-none">
            <TableCell>&nbsp;</TableCell>
            <TableCell>&nbsp;</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
