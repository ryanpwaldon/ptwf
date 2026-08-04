export const stickerAssets = [
  {
    id: "blanket-burrito-dog",
    lightSrc: "/stickers/blanket-burrito-dog.svg",
    width: 872,
    height: 528,
  },
  {
    id: "cat-in-box",
    lightSrc: "/stickers/cat-in-box.svg",
    width: 749,
    height: 735,
  },
  {
    id: "giant-stick-dog",
    lightSrc: "/stickers/giant-stick-dog.svg",
    width: 1295,
    height: 646,
  },
  {
    id: "guilty-dog",
    lightSrc: "/stickers/guilty-dog.svg",
    width: 972,
    height: 811,
  },
  {
    id: "laptop-cat",
    lightSrc: "/stickers/laptop-cat.svg",
    width: 896,
    height: 552,
  },
  {
    id: "paper-bag-cat",
    lightSrc: "/stickers/paper-bag-cat.svg",
    width: 710,
    height: 802,
  },
  {
    id: "post-bath-dog",
    lightSrc: "/stickers/post-bath-dog.svg",
    width: 788,
    height: 647,
  },
  {
    id: "sock-thief-dog",
    lightSrc: "/stickers/sock-thief-dog.svg",
    width: 1016,
    height: 708,
  },
  {
    id: "toilet-paper-cat",
    lightSrc: "/stickers/toilet-paper-cat.svg",
    width: 1284,
    height: 620,
  },
  {
    id: "upside-down-cat",
    lightSrc: "/stickers/upside-down-cat.svg",
    width: 915,
    height: 925,
  },
] as const;

export type StickerAsset = (typeof stickerAssets)[number];

export function getStickerSource(asset: StickerAsset, theme?: string) {
  return theme === "dark" ? `/stickers/${asset.id}-dark.svg` : asset.lightSrc;
}
