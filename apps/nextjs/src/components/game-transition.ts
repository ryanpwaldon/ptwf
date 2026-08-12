import type { Variants } from "motion/react";

export const gameTransitionEase: [number, number, number, number] = [
  0.33, 1, 0.68, 1,
];

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
  visible: {},
  exit: {
    transition: {
      staggerChildren: questionExitDuration - 0.04,
      staggerDirection: -1,
    },
  },
} satisfies Variants;

export const questionContentVariants = {
  visible: { opacity: 1, y: 0 },
  exit: questionExit,
} satisfies Variants;

export const gameHeaderVariants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: gameTransitionEase },
  },
} satisfies Variants;

export const gameResultsEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.22,
    ease: gameTransitionEase,
  },
};
