"use client";

import type { MotionValue } from "motion/react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
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
  flutterSpeed?: number;
  priority?: boolean;
  tiltIntensity?: number;
}

interface PointerPosition {
  x: number;
  y: number;
}

interface HolographicPointer {
  active: MotionValue<number>;
  mouseInfluence: number;
  position: MotionValue<PointerPosition>;
}

interface HolographicPointerProviderProps {
  children: ReactNode;
  mouseInfluence?: number;
}

const HolographicPointerContext = createContext<HolographicPointer | null>(
  null,
);

export function HolographicPointerProvider({
  children,
  mouseInfluence = 1,
}: HolographicPointerProviderProps) {
  const shouldReduceMotion = useReducedMotion();
  const active = useMotionValue(0);
  const position = useMotionValue<PointerPosition>({ x: 0, y: 0 });
  const value = useMemo(
    () => ({ active, mouseInfluence, position }),
    [active, mouseInfluence, position],
  );

  useEffect(() => {
    function resetPointer() {
      active.set(0);
    }

    if (shouldReduceMotion) {
      resetPointer();
      return;
    }

    function handlePointerMove(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse") return;

      active.set(1);
      position.set({ x: event.clientX, y: event.clientY });
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") resetPointer();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("blur", resetPointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetPointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, position, shouldReduceMotion]);

  return (
    <HolographicPointerContext value={value}>
      {children}
    </HolographicPointerContext>
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

const sharedMotionSpring = {
  stiffness: 110,
  damping: 20,
  mass: 0.75,
};

const maxRotateX = 7;
const maxRotateY = 9;
const mouseFalloffRadius = 420;
const mouseTiltDistance = 180;

function getFlutterProfile(id: string) {
  let hash = 2166136261;

  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  const seed = (hash >>> 0) / 4294967295;

  return {
    amplitudeX: 0.26 + seed * 0.1,
    amplitudeY: 0.24 + ((seed * 7.13) % 1) * 0.12,
    phaseX: seed * Math.PI * 2,
    phaseY: ((seed * 5.71) % 1) * Math.PI * 2,
    speedX: 0.88 + ((seed * 3.17) % 1) * 0.24,
    speedY: 0.86 + ((seed * 9.43) % 1) * 0.28,
  };
}

export function HolographicSticker({
  asset,
  className,
  foilIntensity = 1,
  flutterSpeed = 1,
  priority = false,
  tiltIntensity = 1,
}: HolographicStickerProps) {
  const { resolvedTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const isTouching = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const sharedPointer = useContext(HolographicPointerContext);
  const flutterTime = useRef(0);
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
  const targetSharedRotateX = useMotionValue(0);
  const targetSharedRotateY = useMotionValue(0);
  const targetMouseInfluence = useMotionValue(0);
  const sharedRotateX = useSpring(targetSharedRotateX, sharedMotionSpring);
  const sharedRotateY = useSpring(targetSharedRotateY, sharedMotionSpring);
  const smoothMouseInfluence = useSpring(
    targetMouseInfluence,
    sharedMotionSpring,
  );
  const sharedInteraction = useTransform(
    smoothMouseInfluence,
    [0, 1],
    [0.4, 1],
  );
  const flutterRotateX = useMotionValue(0);
  const flutterRotateY = useMotionValue(0);
  const flutterProfile = getFlutterProfile(asset.id);
  const blendedRotateX = useTransform(() => {
    if (!sharedPointer) return rotateX.get();

    const mouseInfluence = smoothMouseInfluence.get();
    return (
      flutterRotateX.get() * (1 - mouseInfluence) +
      sharedRotateX.get() * mouseInfluence
    );
  });
  const blendedRotateY = useTransform(() => {
    if (!sharedPointer) return rotateY.get();

    const mouseInfluence = smoothMouseInfluence.get();
    return (
      flutterRotateY.get() * (1 - mouseInfluence) +
      sharedRotateY.get() * mouseInfluence
    );
  });
  const scale = useTransform(smoothInteraction, [0, 1], [1, 1.015]);
  const displayRotateX = useTransform(
    blendedRotateX,
    (value) => value * tiltIntensity,
  );
  const displayRotateY = useTransform(
    blendedRotateY,
    (value) => value * tiltIntensity,
  );
  const foilRange = 50 * Math.max(foilIntensity, 0);
  const effectX = useTransform(
    sharedPointer ? blendedRotateY : smoothX,
    sharedPointer ? [-maxRotateY, maxRotateY] : [0, 100],
    [50 - foilRange, 50 + foilRange],
  );
  const effectY = useTransform(
    sharedPointer ? blendedRotateX : smoothY,
    sharedPointer ? [-maxRotateX, maxRotateX] : [0, 100],
    sharedPointer
      ? [50 + foilRange, 50 - foilRange]
      : [50 - foilRange, 50 + foilRange],
  );
  const effectInteraction = sharedPointer
    ? sharedInteraction
    : smoothInteraction;
  const transformDistance = useTransform(() =>
    Math.min(Math.hypot(effectX.get() - 50, effectY.get() - 50) / 50, 1),
  );
  const effectDistance = sharedPointer ? transformDistance : smoothDistance;
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
      : sharedPointer
        ? sharedTransform
        : transform,
  } satisfies StickerStyle;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!sharedPointer || !stickerRef.current) return;

    const pointer: HolographicPointer = sharedPointer;
    const sticker: HTMLDivElement = stickerRef.current;

    function resetMouseMotion() {
      targetSharedRotateX.set(0);
      targetSharedRotateY.set(0);
      targetMouseInfluence.set(0);
    }

    function updateMouseMotion(position: PointerPosition) {
      if (shouldReduceMotion || pointer.active.get() === 0) {
        resetMouseMotion();
        return;
      }

      const center = centerRef.current;
      const deltaX = position.x - center.x;
      const deltaY = position.y - center.y;
      const distance = Math.hypot(deltaX, deltaY);
      const normalizedDistance = distance / mouseFalloffRadius;
      const proximity = 1 / (1 + normalizedDistance ** 3);
      const influence = Math.min(
        proximity * Math.max(pointer.mouseInfluence, 0),
        1,
      );
      const normalizedX = Math.max(-1, Math.min(deltaX / mouseTiltDistance, 1));
      const normalizedY = Math.max(-1, Math.min(deltaY / mouseTiltDistance, 1));

      targetSharedRotateX.set(-normalizedY * maxRotateX);
      targetSharedRotateY.set(normalizedX * maxRotateY);
      targetMouseInfluence.set(influence);
    }

    function measureCenter() {
      const bounds = sticker.getBoundingClientRect();
      centerRef.current = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      };
      updateMouseMotion(pointer.position.get());
    }

    measureCenter();

    const resizeObserver = new ResizeObserver(measureCenter);
    const unsubscribePosition = pointer.position.on(
      "change",
      updateMouseMotion,
    );
    const unsubscribeActive = pointer.active.on("change", (active) => {
      if (active === 0) resetMouseMotion();
    });

    resizeObserver.observe(sticker);
    window.addEventListener("resize", measureCenter);
    window.addEventListener("scroll", measureCenter, {
      capture: true,
      passive: true,
    });

    return () => {
      resizeObserver.disconnect();
      unsubscribePosition();
      unsubscribeActive();
      window.removeEventListener("resize", measureCenter);
      window.removeEventListener("scroll", measureCenter, true);
    };
  }, [
    sharedPointer,
    shouldReduceMotion,
    targetMouseInfluence,
    targetSharedRotateX,
    targetSharedRotateY,
  ]);

  useAnimationFrame((_time, delta) => {
    if (!sharedPointer || shouldReduceMotion) return;

    flutterTime.current += (delta / 1000) * Math.max(flutterSpeed, 0);
    const elapsed = flutterTime.current;
    const xWave =
      Math.sin(elapsed * 0.42 * flutterProfile.speedX + flutterProfile.phaseX) +
      Math.sin(elapsed * 0.17 + flutterProfile.phaseY) * 0.45;
    const yWave =
      Math.sin(elapsed * 0.37 * flutterProfile.speedY + flutterProfile.phaseY) +
      Math.sin(elapsed * 0.13 + flutterProfile.phaseX) * 0.5;

    flutterRotateX.set((maxRotateX * flutterProfile.amplitudeX * xWave) / 1.45);
    flutterRotateY.set((maxRotateY * flutterProfile.amplitudeY * yWave) / 1.5);
  });

  useEffect(() => {
    if (sharedPointer) return;

    interaction.set(shouldReduceMotion ? 0.4 : 0);
  }, [interaction, sharedPointer, shouldReduceMotion]);

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
      sharedPointer ||
      shouldReduceMotion ||
      (event.pointerType === "touch" && !isTouching.current)
    ) {
      return;
    }

    updatePointer(event);
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (sharedPointer || shouldReduceMotion || event.pointerType === "touch") {
      return;
    }
    updatePointer(event);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (sharedPointer || shouldReduceMotion || event.pointerType !== "touch") {
      return;
    }
    isTouching.current = true;
    updatePointer(event);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (sharedPointer || shouldReduceMotion || event.pointerType !== "touch") {
      return;
    }

    isTouching.current = false;

    resetPointer();
  }

  function handlePointerLeave() {
    if (sharedPointer || shouldReduceMotion) return;

    resetPointer();
  }

  return (
    <>
      <motion.div
        ref={stickerRef}
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
