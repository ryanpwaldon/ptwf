export const homepageEntranceDelays = {
  first: 0.05,
  title: 0.15,
  description: 0.65,
  final: 0.8,
} as const;

export const homepageStickerStagger = 0.06;

export function getHomepageEntrance(
  delay: number,
  shouldReduceMotion: boolean | null,
) {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12 },
    };
  }

  return {
    initial: { opacity: 0, transform: "translateY(16px)" },
    animate: { opacity: 1, transform: "translateY(0px)" },
    transition: {
      type: "spring" as const,
      visualDuration: 0.55,
      bounce: 0.05,
      delay,
    },
  };
}
