"use client";

import { useEffect, useState } from "react";
import { Clock3Icon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@acme/ui/badge";

import { FullScreenLoader } from "./full-screen-loader";

export function GameGenerating() {
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsTakingLonger(true);
    }, TAKING_LONGER_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <FullScreenLoader
      title="Paws for a moment..."
      description="We’re generating your quiz. This may take a moment."
      status={
        <div className="mt-3 h-5" role="status" aria-live="polite">
          {isTakingLonger ? (
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      transform: "translate3d(0, 8px, 0)",
                    }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      transform: "translate3d(0, 0, 0)",
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.12 }
                  : {
                      type: "spring",
                      visualDuration: 0.3,
                      bounce: 0.05,
                    }
              }
            >
              <Badge variant="warning">
                <Clock3Icon data-icon="inline-start" />
                Taking longer than usual
              </Badge>
            </motion.div>
          ) : null}
        </div>
      }
      showPawTrail
    />
  );
}

const TAKING_LONGER_DELAY_MS = 20_000;
