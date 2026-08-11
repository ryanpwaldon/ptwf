export interface StickerAsset {
  id: string;
  lightSrc: string;
  darkSrc: string;
  width: number;
  height: number;
  maskSrc: string;
}

export const stickerAssets = {
  "toilet-paper-cat": {
    id: "toilet-paper-cat",
    lightSrc: "/stickers/toilet-paper-cat.svg",
    darkSrc: "/stickers/toilet-paper-cat-dark.svg",
    width: 1284,
    height: 620,
    maskSrc: "/stickers/toilet-paper-cat-mask.svg",
  },
  ball: {
    id: "ball",
    lightSrc: "/stickers/ball.svg",
    darkSrc: "/stickers/ball-dark.svg",
    width: 207,
    height: 204,
    maskSrc: "/stickers/ball-mask.svg",
  },
  bowl: {
    id: "bowl",
    lightSrc: "/stickers/bowl.svg",
    darkSrc: "/stickers/bowl-dark.svg",
    width: 235,
    height: 171,
    maskSrc: "/stickers/bowl-mask.svg",
  },
  bone: {
    id: "bone",
    lightSrc: "/stickers/bone.svg",
    darkSrc: "/stickers/bone-dark.svg",
    width: 269,
    height: 173,
    maskSrc: "/stickers/bone-mask.svg",
  },
  fish: {
    id: "fish",
    lightSrc: "/stickers/fish.svg",
    darkSrc: "/stickers/fish-dark.svg",
    width: 259,
    height: 167,
    maskSrc: "/stickers/fish-mask.svg",
  },
} as const satisfies Record<string, StickerAsset>;

export function getStickerSource(asset: StickerAsset, theme?: string) {
  return theme === "dark" ? asset.darkSrc : asset.lightSrc;
}
