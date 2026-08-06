export interface StickerAsset {
  id: string;
  lightSrc: string;
  darkSrc: string;
  width: number;
  height: number;
  maskSrc: string;
}

export const stickerAssets = {
  "blanket-burrito-dog": {
    id: "blanket-burrito-dog",
    lightSrc: "/stickers/blanket-burrito-dog.svg",
    darkSrc: "/stickers/blanket-burrito-dog-dark.svg",
    width: 872,
    height: 528,
    maskSrc: "/stickers/blanket-burrito-dog-mask.svg",
  },
  "cat-in-box": {
    id: "cat-in-box",
    lightSrc: "/stickers/cat-in-box.svg",
    darkSrc: "/stickers/cat-in-box-dark.svg",
    width: 749,
    height: 735,
    maskSrc: "/stickers/cat-in-box-mask.svg",
  },
  "giant-stick-dog": {
    id: "giant-stick-dog",
    lightSrc: "/stickers/giant-stick-dog.svg",
    darkSrc: "/stickers/giant-stick-dog-dark.svg",
    width: 1295,
    height: 646,
    maskSrc: "/stickers/giant-stick-dog-mask.svg",
  },
  "guilty-dog": {
    id: "guilty-dog",
    lightSrc: "/stickers/guilty-dog.svg",
    darkSrc: "/stickers/guilty-dog-dark.svg",
    width: 972,
    height: 811,
    maskSrc: "/stickers/guilty-dog-mask.svg",
  },
  "laptop-cat": {
    id: "laptop-cat",
    lightSrc: "/stickers/laptop-cat.svg",
    darkSrc: "/stickers/laptop-cat-dark.svg",
    width: 896,
    height: 552,
    maskSrc: "/stickers/laptop-cat-mask.svg",
  },
  "paper-bag-cat": {
    id: "paper-bag-cat",
    lightSrc: "/stickers/paper-bag-cat.svg",
    darkSrc: "/stickers/paper-bag-cat-dark.svg",
    width: 710,
    height: 802,
    maskSrc: "/stickers/paper-bag-cat-mask.svg",
  },
  "post-bath-dog": {
    id: "post-bath-dog",
    lightSrc: "/stickers/post-bath-dog.svg",
    darkSrc: "/stickers/post-bath-dog-dark.svg",
    width: 788,
    height: 647,
    maskSrc: "/stickers/post-bath-dog-mask.svg",
  },
  "sock-thief-dog": {
    id: "sock-thief-dog",
    lightSrc: "/stickers/sock-thief-dog.svg",
    darkSrc: "/stickers/sock-thief-dog-dark.svg",
    width: 1016,
    height: 708,
    maskSrc: "/stickers/sock-thief-dog-mask.svg",
  },
  "toilet-paper-cat": {
    id: "toilet-paper-cat",
    lightSrc: "/stickers/toilet-paper-cat.svg",
    darkSrc: "/stickers/toilet-paper-cat-dark.svg",
    width: 1284,
    height: 620,
    maskSrc: "/stickers/toilet-paper-cat-mask.svg",
  },
  "upside-down-cat": {
    id: "upside-down-cat",
    lightSrc: "/stickers/upside-down-cat.svg",
    darkSrc: "/stickers/upside-down-cat-dark.svg",
    width: 915,
    height: 925,
    maskSrc: "/stickers/upside-down-cat-mask.svg",
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
