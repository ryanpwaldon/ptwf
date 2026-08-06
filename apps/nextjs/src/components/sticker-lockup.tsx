import type { ComponentProps } from "react";
import Image from "next/image";

import { cn } from "@acme/ui";

import { stickerAssets } from "./sticker-assets";

const heroSticker = stickerAssets["toilet-paper-cat"];
// const heroSticker = stickerAssets["blanket-burrito-dog"];
// const heroSticker = stickerAssets["cat-in-box"];
// const heroSticker = stickerAssets["giant-stick-dog"];
// const heroSticker = stickerAssets["guilty-dog"];
// const heroSticker = stickerAssets["laptop-cat"];
// const heroSticker = stickerAssets["paper-bag-cat"];
// const heroSticker = stickerAssets["post-bath-dog"];
// const heroSticker = stickerAssets["sock-thief-dog"];
// const heroSticker = stickerAssets["upside-down-cat"];

export function StickerLockup({ className, ...props }: ComponentProps<"div">) {
  const aspectRatio = heroSticker.width / heroSticker.height;

  return (
    <div
      className={cn(
        "[container-type:size] grid w-full place-items-center",
        className,
      )}
      {...props}
    >
      <div
        className="relative"
        style={{
          aspectRatio,
          width: `min(100cqw, ${aspectRatio * 80}cqh)`,
        }}
      >
        <Image
          src={heroSticker.lightSrc}
          alt="Playful Pet Sticker"
          width={heroSticker.width}
          height={heroSticker.height}
          className="size-full drop-shadow-2xl"
        />
        <Image
          src={stickerAssets.ball.lightSrc}
          alt="Pet Accessory Sticker"
          width={50}
          height={50}
          className="absolute top-0 left-0 size-[25cqh] -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
        />
        <Image
          src={stickerAssets.bowl.lightSrc}
          alt="Pet Accessory Sticker"
          width={50}
          height={50}
          className="absolute top-0 left-full size-[25cqh] -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
        />
        <Image
          src={stickerAssets.bone.lightSrc}
          alt="Pet Accessory Sticker"
          width={50}
          height={50}
          className="absolute top-full left-0 size-[30cqh] -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
        />
        <Image
          src={stickerAssets.fish.lightSrc}
          alt="Pet Accessory Sticker"
          width={50}
          height={50}
          className="absolute top-full left-full size-[25cqh] -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
        />
      </div>
    </div>
  );
}
