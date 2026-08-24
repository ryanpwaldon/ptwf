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
      className="hover:bg-primary after:bg-background/0 hover:after:bg-background/15 relative w-full overflow-hidden text-base after:pointer-events-none after:absolute after:inset-0 after:z-10 after:transition-colors after:content-['']"
      aria-pressed={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="relative z-20 tabular-nums">{label}</span>
      <motion.span
        aria-hidden="true"
        className="bg-primary-progress absolute inset-0 origin-left"
        style={{ scaleX: progress }}
      />
    </Button>
  );
}

function getProgress(roundEndsAt: number) {
  const durationMs = RESULTS_DURATION_SECONDS * 1000;
  const remainingMs = Math.max(0, roundEndsAt - Date.now());
  return Math.min(1, Math.max(0, 1 - remainingMs / durationMs));
}
