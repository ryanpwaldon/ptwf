"use client";

import type { ComponentProps } from "react";

import { cn } from "@acme/ui";

import {
  HolographicPointerProvider,
  HolographicSticker,
} from "./holographic-sticker";
import { stickerAssets } from "./sticker-assets";

const accessoryStickerIds = ["ball", "bowl", "bone", "fish"] as const;

type AccessoryStickerId = (typeof accessoryStickerIds)[number];

interface AccessoryPlacement {
  x: number;
  y: number;
  size: number;
  rotate: number;
}

interface StickerLockupConfig {
  height: number;
  accessories: Record<AccessoryStickerId, AccessoryPlacement>;
}

const stickerLockupConfigs = {
  "toilet-paper-cat": {
    height: 90,
    accessories: {
      ball: { x: -40, y: -30, size: 25, rotate: 0 },
      bowl: { x: 40, y: -45, size: 25, rotate: 20 },
      bone: { x: 50, y: 40, size: 25, rotate: 20 },
      fish: { x: -55, y: 50, size: 30, rotate: 0 },
    },
  },
  "cat-in-box": {
    height: 100,
    accessories: {
      ball: { x: -55, y: -30, size: 25, rotate: 0 },
      bowl: { x: 55, y: -20, size: 25, rotate: 0 },
      bone: { x: -60, y: 40, size: 30, rotate: 0 },
      fish: { x: 70, y: 40, size: 30, rotate: 20 },
    },
  },
  "paper-bag-cat": {
    height: 100,
    accessories: {
      ball: { x: -65, y: -30, size: 25, rotate: 0 },
      bowl: { x: 75, y: -20, size: 25, rotate: 0 },
      bone: { x: -70, y: 40, size: 30, rotate: 0 },
      fish: { x: 70, y: 40, size: 30, rotate: 20 },
    },
  },
  "post-bath-dog": {
    height: 100,
    accessories: {
      ball: { x: -55, y: -40, size: 25, rotate: 0 },
      bowl: { x: 55, y: -40, size: 25, rotate: 30 },
      bone: { x: -60, y: 40, size: 30, rotate: 45 },
      fish: { x: 55, y: 45, size: 30, rotate: -20 },
    },
  },
  "sock-thief-dog": {
    height: 100,
    accessories: {
      ball: { x: -40, y: -25, size: 25, rotate: 0 },
      bowl: { x: 55, y: -10, size: 30, rotate: 10 },
      bone: { x: -45, y: 40, size: 35, rotate: 20 },
      fish: { x: 50, y: 40, size: 30, rotate: -20 },
    },
  },
} satisfies Record<string, StickerLockupConfig>;

const heroStickerId = "toilet-paper-cat" as keyof typeof stickerLockupConfigs;

export function StickerLockup({ className, ...props }: ComponentProps<"div">) {
  const config = stickerLockupConfigs[heroStickerId];
  const heroSticker = stickerAssets[heroStickerId];
  const aspectRatio = heroSticker.width / heroSticker.height;

  return (
    <div
      className={cn(
        "@container-[size] grid w-full place-items-center",
        className,
      )}
      {...props}
    >
      <HolographicPointerProvider mouseInfluence={1}>
        <div
          className="relative"
          style={{
            aspectRatio,
            width: `${aspectRatio * config.height}cqh`,
          }}
          role="img"
          aria-label="Playful pet stickers"
        >
          <HolographicSticker
            asset={heroSticker}
            className="size-full drop-shadow-xl"
            tiltIntensity={2}
            foilIntensity={1}
            flutterSpeed={20}
            priority
          />
          {accessoryStickerIds.map((accessoryId) => {
            const accessory = stickerAssets[accessoryId];
            const placement = config.accessories[accessoryId];
            return (
              <div
                key={accessoryId}
                className="absolute drop-shadow-sm"
                style={{
                  top: `${50 + placement.y}%`,
                  left: `${50 + placement.x}%`,
                  width: `${placement.size}cqh`,
                  aspectRatio: accessory.width / accessory.height,
                  transform: `translate(-50%, -50%) rotate(${placement.rotate}deg)`,
                }}
              >
                <HolographicSticker
                  asset={accessory}
                  className="size-full"
                  tiltIntensity={4}
                  foilIntensity={0.5}
                  flutterSpeed={20}
                />
              </div>
            );
          })}
        </div>
      </HolographicPointerProvider>
    </div>
  );
}
