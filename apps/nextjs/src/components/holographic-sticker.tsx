"use client";

import type { MotionValue } from "motion/react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@acme/ui";
import { useTheme } from "@acme/ui/theme";

import type { StickerAsset } from "./sticker-assets";
import { getStickerSource } from "./sticker-assets";

export interface HolographicStickerProps {
  asset: StickerAsset;
  className?: string;
  foilIntensity?: number;
  priority?: boolean;
  tiltIntensity?: number;
}

export interface HolographicMotion {
  interaction: MotionValue<number>;
  maxRotateX: number;
  maxRotateY: number;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

interface HolographicMotionProviderProps {
  children: ReactNode;
  value: HolographicMotion;
}

const HolographicMotionContext = createContext<HolographicMotion | null>(null);

export function HolographicMotionProvider({
  children,
  value,
}: HolographicMotionProviderProps) {
  return (
    <HolographicMotionContext value={value}>
      {children}
    </HolographicMotionContext>
  );
}

type StickerStyle = Omit<CSSProperties, "transform"> & {
  "--background-x": MotionValue<string>;
  "--background-x-inverse": MotionValue<string>;
  "--background-y": MotionValue<string>;
  "--background-y-inverse": MotionValue<string>;
  "--glare-opacity": MotionValue<number>;
  "--holographic-mask": string;
  "--interaction": MotionValue<number>;
  "--pointer-x": MotionValue<string>;
  "--pointer-y": MotionValue<string>;
  transform: MotionValue<string> | "none";
};

const interactionSpring = {
  stiffness: 150,
  damping: 18,
  mass: 0.55,
};

export function HolographicSticker({
  asset,
  className,
  foilIntensity = 1,
  priority = false,
  tiltIntensity = 1,
}: HolographicStickerProps) {
  const { resolvedTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);
  const isTouching = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const sharedMotion = useContext(HolographicMotionContext);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const pointerDistance = useMotionValue(0);
  const interaction = useMotionValue(0);
  const smoothX = useSpring(pointerX, interactionSpring);
  const smoothY = useSpring(pointerY, interactionSpring);
  const smoothDistance = useSpring(pointerDistance, interactionSpring);
  const smoothInteraction = useSpring(interaction, interactionSpring);
  const rotateX = useTransform(smoothY, [0, 100], [-25, 25]);
  const rotateY = useTransform(smoothX, [0, 100], [14, -14]);
  const scale = useTransform(smoothInteraction, [0, 1], [1, 1.015]);
  const displayRotateX = useTransform(
    sharedMotion?.rotateX ?? rotateX,
    (value) => value * tiltIntensity,
  );
  const displayRotateY = useTransform(
    sharedMotion?.rotateY ?? rotateY,
    (value) => value * tiltIntensity,
  );
  const foilRange = 50 * Math.max(foilIntensity, 0);
  const effectX = useTransform(
    sharedMotion?.rotateY ?? smoothX,
    sharedMotion
      ? [-sharedMotion.maxRotateY, sharedMotion.maxRotateY]
      : [0, 100],
    [50 - foilRange, 50 + foilRange],
  );
  const effectY = useTransform(
    sharedMotion?.rotateX ?? smoothY,
    sharedMotion
      ? [-sharedMotion.maxRotateX, sharedMotion.maxRotateX]
      : [0, 100],
    sharedMotion
      ? [50 + foilRange, 50 - foilRange]
      : [50 - foilRange, 50 + foilRange],
  );
  const effectInteraction = sharedMotion?.interaction ?? smoothInteraction;
  const transformDistance = useTransform(() =>
    Math.min(Math.hypot(effectX.get() - 50, effectY.get() - 50) / 50, 1),
  );
  const effectDistance = sharedMotion ? transformDistance : smoothDistance;
  const backgroundX = useTransform(effectX, [0, 100], [37, 63]);
  const backgroundY = useTransform(effectY, [0, 100], [33, 67]);
  const inverseBackgroundX = useTransform(effectX, [0, 100], [63, 37]);
  const inverseBackgroundY = useTransform(effectY, [0, 100], [67, 33]);
  const glareOpacity = useTransform(
    () => effectInteraction.get() * (effectDistance.get() + 0.2),
  );
  const pointerXPercent = useMotionTemplate`${effectX}%`;
  const pointerYPercent = useMotionTemplate`${effectY}%`;
  const backgroundXPercent = useMotionTemplate`${backgroundX}%`;
  const backgroundYPercent = useMotionTemplate`${backgroundY}%`;
  const inverseBackgroundXPercent = useMotionTemplate`${inverseBackgroundX}%`;
  const inverseBackgroundYPercent = useMotionTemplate`${inverseBackgroundY}%`;
  const sharedTransform = useMotionTemplate`perspective(900px) rotateX(${displayRotateX}deg) rotateY(${displayRotateY}deg)`;
  const transform = useMotionTemplate`perspective(900px) rotateY(${displayRotateY}deg) rotateX(${displayRotateX}deg) scale(${scale})`;
  const source = getStickerSource(
    asset,
    hasMounted ? resolvedTheme : undefined,
  );
  const stickerStyle = {
    "--background-x": backgroundXPercent,
    "--background-x-inverse": inverseBackgroundXPercent,
    "--background-y": backgroundYPercent,
    "--background-y-inverse": inverseBackgroundYPercent,
    "--glare-opacity": glareOpacity,
    "--holographic-mask": `url("${asset.maskSrc}")`,
    "--interaction": effectInteraction,
    "--pointer-x": pointerXPercent,
    "--pointer-y": pointerYPercent,
    transform: shouldReduceMotion
      ? "none"
      : sharedMotion
        ? sharedTransform
        : transform,
  } satisfies StickerStyle;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (sharedMotion) return;

    interaction.set(shouldReduceMotion ? 0.4 : 0);
  }, [interaction, sharedMotion, shouldReduceMotion]);

  function updatePointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(
      Math.max(((event.clientX - bounds.left) / bounds.width) * 100, 0),
      100,
    );
    const y = Math.min(
      Math.max(((event.clientY - bounds.top) / bounds.height) * 100, 0),
      100,
    );

    pointerX.set(x);
    pointerY.set(y);
    pointerDistance.set(Math.min(Math.hypot(x - 50, y - 50) / 50, 1));
    interaction.set(1);
  }

  function resetPointer() {
    pointerX.set(50);
    pointerY.set(50);
    pointerDistance.set(0);
    interaction.set(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      sharedMotion ||
      shouldReduceMotion ||
      (event.pointerType === "touch" && !isTouching.current)
    ) {
      return;
    }

    updatePointer(event);
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (sharedMotion || shouldReduceMotion || event.pointerType === "touch") {
      return;
    }
    updatePointer(event);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (sharedMotion || shouldReduceMotion || event.pointerType !== "touch") {
      return;
    }
    isTouching.current = true;
    updatePointer(event);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (sharedMotion || shouldReduceMotion || event.pointerType !== "touch") {
      return;
    }

    isTouching.current = false;

    resetPointer();
  }

  function handlePointerLeave() {
    if (sharedMotion || shouldReduceMotion) return;

    resetPointer();
  }

  return (
    <>
      <motion.div
        className={cn(
          "@container relative isolate mx-auto filter-[drop-shadow(0_18px_24px_rgb(0_0_0/0.22))] will-change-transform transform-3d",
          className,
        )}
        style={stickerStyle}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        aria-hidden="true"
      >
        <Image
          className="relative z-1 block h-auto w-full select-none"
          src={source}
          width={asset.width}
          height={asset.height}
          sizes="(min-width: 640px) 18rem, 16rem"
          alt=""
          draggable={false}
          preload={priority}
        />

        <span className="holographic-sticker__shine pointer-events-none absolute inset-0 z-2 overflow-hidden">
          <span className="holographic-sticker__shine-pass holographic-sticker__shine-pass--primary absolute inset-0" />
          <span className="holographic-sticker__shine-pass holographic-sticker__shine-pass--secondary absolute inset-0" />
        </span>

        <span className="holographic-sticker__glare pointer-events-none absolute inset-0 z-4 overflow-hidden" />
      </motion.div>

      <style href="holographic-sticker" precedence="medium">{`
        .holographic-sticker__shine,
        .holographic-sticker__glare {
          -webkit-mask-image: var(--holographic-mask);
          mask-image: var(--holographic-mask);
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }

        .holographic-sticker__shine {
          opacity: var(--interaction);
          filter: brightness(0.45) contrast(1.5) saturate(1.2);
          mix-blend-mode: color-dodge;
        }

        .holographic-sticker__shine-pass {
          --holo-color-1: hsl(228 100% 74%);
          --holo-color-2: hsl(283 100% 73%);
          --holo-color-3: hsl(2 100% 73%);
          --holo-color-4: hsl(53 100% 69%);
          --holo-color-5: hsl(93 100% 69%);
          --holo-color-6: hsl(176 100% 76%);
          background-image:
            url("/holographic/grain.webp"),
            repeating-linear-gradient(
              0deg,
              var(--holo-color-1) 5%,
              var(--holo-color-2) 10%,
              var(--holo-color-3) 15%,
              var(--holo-color-4) 20%,
              var(--holo-color-5) 25%,
              var(--holo-color-6) 30%,
              var(--holo-color-1) 35%
            ),
            repeating-linear-gradient(
              133deg,
              #0e1221 0%,
              hsl(180 10% 60%) 2.8%,
              hsl(180 20.9% 82.2%) 3.5%,
              hsl(180 10% 60%) 4.2%,
              #0e1221 7%,
              #0e1221 12%
            ),
            radial-gradient(
              farthest-corner circle at var(--pointer-x) var(--pointer-y),
              hsl(0 0% 0% / 0.1) 12%,
              hsl(0 0% 0% / 0.15) 20%,
              hsl(0 0% 0% / 0.25) 120%
            );
          background-blend-mode: screen, hue, hard-light;
          background-repeat: repeat, no-repeat, no-repeat, no-repeat;
          background-position:
            center,
            0% var(--background-y),
            var(--background-x) var(--background-y),
            var(--background-x) var(--background-y);
          background-size:
            64cqi 64cqi,
            200% 700%,
            300% 100%,
            200% 100%;
          filter: brightness(1) contrast(1.5) saturate(2);
          mix-blend-mode: lighten;
        }

        .holographic-sticker__shine-pass--secondary {
          --holo-color-1: hsl(283 100% 73%);
          --holo-color-2: hsl(2 100% 73%);
          --holo-color-3: hsl(53 100% 69%);
          --holo-color-4: hsl(93 100% 69%);
          --holo-color-5: hsl(176 100% 76%);
          --holo-color-6: hsl(228 100% 74%);
          background-position:
            center,
            0% var(--background-y),
            var(--background-x-inverse) var(--background-y-inverse),
            var(--background-x) var(--background-y);
          background-size:
            64cqi 100%,
            200% 400%,
            195% 100%,
            200% 100%;
          filter: brightness(1.2) contrast(1) saturate(2);
          mix-blend-mode: difference;
        }

        .holographic-sticker__glare {
          background-image: radial-gradient(
            farthest-corner circle at var(--pointer-x) var(--pointer-y),
            hsl(0 0% 40%) 0%,
            hsl(210 3% 54% / 0.5) 63%,
            hsl(0 0% 30%) 150%
          );
          opacity: var(--glare-opacity);
          filter: brightness(1.5) contrast(2);
          mix-blend-mode: color-burn;
        }

        @media (hover: none), (pointer: coarse) {
          .holographic-sticker__shine,
          .holographic-sticker__glare {
            will-change: opacity, background-position;
          }
        }
      `}</style>
    </>
  );
}
