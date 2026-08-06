"use client";

import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

import { cn } from "@acme/ui";

import {
  HolographicMotionProvider,
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

const heroStickerId = "toilet-paper-cat";

const maxRotateX = 7;
const maxRotateY = 9;
const pointerDeadZone = 12;

const lockupSpring = {
  stiffness: 110,
  damping: 20,
  mass: 0.75,
};

export function StickerLockup({ className, ...props }: ComponentProps<"div">) {
  const lockupRef = useRef<HTMLDivElement>(null);
  const influenceRef = useRef({ x: 0, y: 0, radius: 1 });
  const lastDirectionRef = useRef({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();
  const targetRotateX = useMotionValue(0);
  const targetRotateY = useMotionValue(0);
  const targetInteraction = useMotionValue(0);
  const rotateX = useSpring(targetRotateX, lockupSpring);
  const rotateY = useSpring(targetRotateY, lockupSpring);
  const interaction = useSpring(targetInteraction, lockupSpring);
  const transform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const config = stickerLockupConfigs[heroStickerId];
  const heroSticker = stickerAssets[heroStickerId];
  const aspectRatio = heroSticker.width / heroSticker.height;
  const holographicMotion = useMemo(
    () => ({ interaction, maxRotateX, maxRotateY, rotateX, rotateY }),
    [interaction, rotateX, rotateY],
  );

  useEffect(() => {
    const lockup = lockupRef.current;
    if (!lockup) return;

    const measureInfluence = () => {
      const bounds = lockup.getBoundingClientRect();
      influenceRef.current = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
        radius: Math.max(320, Math.hypot(bounds.width, bounds.height) * 1.4),
      };
    };

    measureInfluence();

    const resizeObserver = new ResizeObserver(measureInfluence);
    resizeObserver.observe(lockup);
    window.addEventListener("resize", measureInfluence);
    window.addEventListener("scroll", measureInfluence, {
      capture: true,
      passive: true,
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureInfluence);
      window.removeEventListener("scroll", measureInfluence, true);
    };
  }, []);

  useEffect(() => {
    function resetMotion() {
      targetRotateX.set(0);
      targetRotateY.set(0);
      targetInteraction.set(shouldReduceMotion ? 0.4 : 0);
    }

    if (shouldReduceMotion) {
      resetMotion();
      return;
    }

    function handlePointerMove(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse") return;

      const influence = influenceRef.current;
      const deltaX = event.clientX - influence.x;
      const deltaY = event.clientY - influence.y;
      const distance = Math.hypot(deltaX, deltaY);
      const linearProximity = Math.max(0, 1 - distance / influence.radius);
      const proximity =
        linearProximity * linearProximity * (3 - 2 * linearProximity);

      if (distance > pointerDeadZone) {
        lastDirectionRef.current = {
          x: deltaX / distance,
          y: deltaY / distance,
        };
      }

      const direction = lastDirectionRef.current;
      targetRotateX.set(-direction.y * maxRotateX * proximity);
      targetRotateY.set(direction.x * maxRotateY * proximity);
      targetInteraction.set(proximity);
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") resetMotion();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("blur", resetMotion);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetMotion);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shouldReduceMotion, targetInteraction, targetRotateX, targetRotateY]);

  return (
    <div
      className={cn(
        "@container-[size] grid w-full place-items-center",
        className,
      )}
      {...props}
    >
      <HolographicMotionProvider value={holographicMotion}>
        <motion.div
          ref={lockupRef}
          className="relative will-change-transform [transform-style:preserve-3d]"
          style={{
            aspectRatio,
            transform: shouldReduceMotion ? "none" : transform,
            width: `${aspectRatio * config.height}cqh`,
          }}
          role="img"
          aria-label="Playful pet stickers"
        >
          <HolographicSticker
            asset={heroSticker}
            className="size-full drop-shadow-xl"
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
                <HolographicSticker asset={accessory} className="size-full" />
              </div>
            );
          })}
        </motion.div>
      </HolographicMotionProvider>
    </div>
  );
}
