import type { Variants } from "motion/react";

const gameTransitionEase: [number, number, number, number] = [0.33, 1, 0.68, 1];

const gameTransitionDuration = 0.24;

export const gamePlayVariants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: {
      duration: gameTransitionDuration,
      ease: gameTransitionEase,
    },
  },
} satisfies Variants;

export const gameResultsEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: gameTransitionDuration,
    ease: gameTransitionEase,
  },
};
