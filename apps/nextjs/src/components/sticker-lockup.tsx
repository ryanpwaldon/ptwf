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

const heroSticker = stickerAssets["toilet-paper-cat"];

const accessoryStickers = [
  { asset: stickerAssets.ball, x: -40, y: -30, size: 25, rotate: 0 },
  { asset: stickerAssets.bowl, x: 40, y: -45, size: 25, rotate: 20 },
  { asset: stickerAssets.bone, x: 50, y: 40, size: 25, rotate: 20 },
  { asset: stickerAssets.fish, x: -55, y: 50, size: 30, rotate: 0 },
] as const;

const stickerClassName = "size-full drop-shadow-[0_6px_14px_rgb(0_0_0/0.18)]";

export function StickerLockup({
  className,
  entranceDelay = 0,
  ...props
}: ComponentProps<"div"> & { entranceDelay?: number }) {
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
            aspectRatio: heroSticker.width / heroSticker.height,
            height: "90cqh",
          }}
          role="img"
          aria-label="Playful pet stickers"
        >
          <div className="absolute bottom-[calc(100%+1rem)] left-1/2 h-14 -translate-x-1/2">
            <motion.div
              className="h-full"
              {...getHomepageEntrance(
                entranceDelay +
                  (accessoryStickers.length + 1) * homepageStickerStagger,
                shouldReduceMotion,
                { y: 48 },
              )}
            >
              <ArchedBadge className="h-full drop-shadow-[0_4px_10px_rgb(0_0_0/0.12)]" />
            </motion.div>
          </div>
          <motion.div
            className="size-full"
            {...getHomepageEntrance(entranceDelay, shouldReduceMotion)}
          >
            <HolographicSticker
              asset={heroSticker}
              className={stickerClassName}
              mouseTiltIntensity={1}
              circularTiltIntensity={0.1}
              foilIntensity={1}
              circularTiltSpeed={20}
              priority
            />
          </motion.div>
          {accessoryStickers.map(({ asset, x, y, size, rotate }, index) => {
            const aspectRatio = asset.width / asset.height;

            return (
              <div
                key={asset.id}
                className="absolute"
                style={{
                  top: `${50 + y}%`,
                  left: `${50 + x}%`,
                  width: `${size}cqh`,
                  aspectRatio,
                  transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                }}
              >
                <motion.div
                  className="size-full"
                  {...getHomepageEntrance(
                    entranceDelay + (index + 1) * homepageStickerStagger,
                    shouldReduceMotion,
                    {
                      x: x < 0 ? 32 : -32,
                      y: 48,
                    },
                  )}
                >
                  <HolographicSticker
                    asset={asset}
                    className={stickerClassName}
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
