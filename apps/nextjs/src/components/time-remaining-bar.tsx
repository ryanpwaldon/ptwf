import { useEffect } from "react";
import { animate, motion, useMotionValue } from "motion/react";

interface TimeRemainingBarProps {
  phase: "answering" | "results" | "explanation";
  durationSeconds: number;
}

export function TimeRemainingBar({
  phase,
  durationSeconds,
}: TimeRemainingBarProps) {
  const width = useMotionValue("100%");

  useEffect(() => {
    if (phase === "answering") {
      void animate(width, "0%", { duration: durationSeconds, ease: "linear" });
    } else {
      // Interrupt the in-progress animation and sweep to 0 quickly.
      void animate(width, "0%", { duration: 0.4, ease: "easeOut" });
    }
  }, [phase, width, durationSeconds]);

  return (
    <div className="bg-secondary flex h-2 w-full justify-end rounded-full">
      <motion.div
        className="bg-primary h-full rounded-full"
        style={{ width }}
      />
    </div>
  );
}
