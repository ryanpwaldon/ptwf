import type { SVGProps } from "react";

import { cn } from "@acme/ui";

export type PetCareTriviaBadgeProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "height" | "width"
>;

export function PetCareTriviaBadge({
  className,
  ...props
}: PetCareTriviaBadgeProps) {
  return (
    <svg
      {...props}
      viewBox="7 7 135 57"
      aria-hidden="true"
      className={cn(
        "block aspect-[135/57] overflow-visible drop-shadow-[0_2px_4px_rgb(0_0_0/0.1)] select-none",
        className,
      )}
    >
      <path
        d="M 26.5 44.5 A 73 73 0 0 1 122.5 44.5"
        className="stroke-sticker-surface fill-none [stroke-linecap:round]"
        strokeWidth="49"
      />
      <path
        d="M 26.5 44.5 A 73 73 0 0 1 122.5 44.5"
        className="stroke-sticker-foreground fill-none [stroke-linecap:round]"
        strokeWidth="33"
      />
      <path
        id="arched-badge-curve"
        d="M 26.5 44.5 A 73 73 0 0 1 122.5 44.5"
        className="stroke-sticker-surface fill-none [stroke-linecap:round]"
        strokeWidth="29"
      />
      <text
        className="fill-sticker-foreground font-sans"
        dy="6"
        fontSize="16"
        fontWeight="500"
        letterSpacing="-0.2"
      >
        <textPath
          href="#arched-badge-curve"
          startOffset="50%"
          textAnchor="middle"
        >
          Pet Care Trivia
        </textPath>
      </text>
    </svg>
  );
}
