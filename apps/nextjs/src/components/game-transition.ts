import type { Variants } from "motion/react";

const gameTransitionEase: [number, number, number, number] = [0.33, 1, 0.68, 1];

const questionExitDuration = 0.24;

export const questionExit = {
  opacity: 0,
  y: -14,
  transition: {
    duration: questionExitDuration,
    ease: gameTransitionEase,
  },
};

export const gamePlayVariants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: {
      duration: questionExitDuration,
      ease: gameTransitionEase,
    },
  },
} satisfies Variants;

export const gameResultsEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: questionExitDuration,
    ease: gameTransitionEase,
  },
};
