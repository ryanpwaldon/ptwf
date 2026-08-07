import type { SVGProps } from "react";

import { cn } from "@acme/ui";

export type ArchedBadgeProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "height" | "width"
>;

export function ArchedBadge({ className, ...props }: ArchedBadgeProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 149 73"
      aria-hidden="true"
      className={cn(
        "block aspect-[149/73] overflow-visible select-none",
        className,
      )}
    >
      <defs>
        <filter
          id="arched-badge-shadow"
          x="0"
          y="0"
          width="149"
          height="73"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="4"
            floodColor="#000"
            floodOpacity="0.1"
          />
        </filter>
      </defs>
      <path
        id="arched-badge-curve"
        d="M 26.5 44.5 A 73 73 0 0 1 122.5 44.5"
        className="stroke-sticker-surface fill-none [stroke-linecap:round]"
        strokeWidth="29"
        filter="url(#arched-badge-shadow)"
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
