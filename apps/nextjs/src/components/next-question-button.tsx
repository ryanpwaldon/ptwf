"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue } from "motion/react";

import { RESULTS_DURATION_SECONDS } from "@acme/convex";
import { Button } from "@acme/ui/button";

interface NextQuestionButtonProps {
  disabled: boolean;
  label: string;
  roundEndsAt: number;
  onClick: () => void;
}

export function NextQuestionButton({
  disabled,
  label,
  roundEndsAt,
  onClick,
}: NextQuestionButtonProps) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const remainingSeconds = Math.max(0, roundEndsAt - Date.now()) / 1000;
    progress.set(getProgress(roundEndsAt));
    const controls = animate(progress, 1, {
      duration: remainingSeconds,
      ease: "linear",
    });
    return () => controls.stop();
  }, [progress, roundEndsAt]);

  return (
    <Button
      size="xl"
      className="relative w-full overflow-hidden text-base disabled:opacity-100"
      aria-pressed={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="relative z-10 tabular-nums">{label}</span>
      <span
        aria-hidden="true"
        className="bg-primary-foreground/25 absolute inset-x-0 bottom-0 h-1.5"
      >
        <motion.span
          className="bg-primary-foreground block h-full origin-left"
          style={{ scaleX: progress }}
        />
      </span>
    </Button>
  );
}

function getProgress(roundEndsAt: number) {
  const durationMs = RESULTS_DURATION_SECONDS * 1000;
  const remainingMs = Math.max(0, roundEndsAt - Date.now());
  return Math.min(1, Math.max(0, 1 - remainingMs / durationMs));
}
