export const homepageEntranceDelays = {
  first: 0.05,
  title: 0.15,
  description: 0.65,
  final: 0.8,
} as const;

export const homepageStickerStagger = 0.06;

interface HomepageEntranceOffset {
  x?: number;
  y?: number;
}

export function getHomepageEntrance(
  delay: number,
  shouldReduceMotion: boolean | null,
  offset: HomepageEntranceOffset = {},
) {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12 },
    };
  }

  const { x = 0, y = 16 } = offset;

  return {
    initial: {
      opacity: 0,
      transform: `translate3d(${x}px, ${y}px, 0)`,
    },
    animate: { opacity: 1, transform: "translate3d(0px, 0px, 0)" },
    transition: {
      type: "spring" as const,
      visualDuration: 0.55,
      bounce: 0.05,
      delay,
    },
  };
}
