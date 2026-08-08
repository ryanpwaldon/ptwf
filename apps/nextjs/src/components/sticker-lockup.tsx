"use client";

import type { ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@acme/ui";

import { ArchedBadge } from "./arched-badge";
import {
  HolographicPointerProvider,
  HolographicSticker,
} from "./holographic-sticker";
import {
  getHomepageEntrance,
  homepageStickerStagger,
} from "./homepage-entrance";
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

const stickerShadowClassName = "drop-shadow-[0_6px_14px_rgb(0_0_0/0.18)]";
const archShadowClassName = "drop-shadow-[0_4px_10px_rgb(0_0_0/0.12)]";

export function StickerLockup({
  className,
  entranceDelay = 0,
  ...props
}: ComponentProps<"div"> & { entranceDelay?: number }) {
  const config = stickerLockupConfigs[heroStickerId];
  const heroSticker = stickerAssets[heroStickerId];
  const aspectRatio = heroSticker.width / heroSticker.height;
  const shouldReduceMotion = useReducedMotion();
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
          <div className="absolute bottom-[calc(100%+1rem)] left-1/2 h-14 -translate-x-1/2">
            <motion.div
              className="h-full"
              {...getHomepageEntrance(
                entranceDelay +
                  (accessoryStickerIds.length + 1) * homepageStickerStagger,
                shouldReduceMotion,
                { y: 48 },
              )}
            >
              <ArchedBadge className={cn("h-full", archShadowClassName)} />
            </motion.div>
          </div>
          <motion.div
            className="size-full"
            {...getHomepageEntrance(entranceDelay, shouldReduceMotion)}
          >
            <HolographicSticker
              asset={heroSticker}
              className={cn("size-full", stickerShadowClassName)}
              mouseTiltIntensity={1}
              circularTiltIntensity={0.1}
              foilIntensity={1}
              circularTiltSpeed={20}
              priority
            />
          </motion.div>
          {accessoryStickerIds.map((accessoryId, index) => {
            const accessory = stickerAssets[accessoryId];
            const placement = config.accessories[accessoryId];
            return (
              <div
                key={accessoryId}
                className="absolute"
                style={{
                  top: `${50 + placement.y}%`,
                  left: `${50 + placement.x}%`,
                  width: `${placement.size}cqh`,
                  aspectRatio: accessory.width / accessory.height,
                  transform: `translate(-50%, -50%) rotate(${placement.rotate}deg)`,
                }}
              >
                <motion.div
                  className="size-full"
                  {...getHomepageEntrance(
                    entranceDelay + (index + 1) * homepageStickerStagger,
                    shouldReduceMotion,
                    {
                      x: placement.x < 0 ? 32 : -32,
                      y: 48,
                    },
                  )}
                >
                  <HolographicSticker
                    asset={accessory}
                    className={cn("size-full", stickerShadowClassName)}
                    mouseTiltIntensity={3}
                    circularTiltIntensity={1}
                    foilIntensity={0.4}
                    circularTiltSpeed={200}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </HolographicPointerProvider>
    </div>
  );
}
