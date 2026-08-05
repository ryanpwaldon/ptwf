"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useState } from "react";
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
import styles from "./holographic-sticker.module.css";
import { getStickerSource } from "./sticker-assets";

export type HolographicEffect = "diffraction" | "mica" | "embossed";

export interface HolographicStickerProps {
  asset: StickerAsset;
  effect: HolographicEffect;
  className?: string;
  priority?: boolean;
}

type StickerStyle = CSSProperties & {
  "--sticker-image": string;
  "--holographic-mask": string;
};

const spring = {
  stiffness: 150,
  damping: 18,
  mass: 0.55,
};

export function HolographicSticker({
  asset,
  effect,
  className,
  priority = false,
}: HolographicStickerProps) {
  const { resolvedTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const interaction = useMotionValue(0);
  const smoothX = useSpring(pointerX, spring);
  const smoothY = useSpring(pointerY, spring);
  const smoothInteraction = useSpring(interaction, spring);
  const rotateX = useTransform(smoothY, [0, 100], [8, -8]);
  const rotateY = useTransform(smoothX, [0, 100], [-8, 8]);
  const scale = useTransform(smoothInteraction, [0, 1], [1, 1.025]);
  const foilX = useTransform(smoothX, [0, 100], [12, 88]);
  const foilY = useTransform(smoothY, [0, 100], [18, 82]);
  const textureX = useTransform(smoothX, [0, 100], [24, -24]);
  const textureY = useTransform(smoothY, [0, 100], [18, -18]);
  const foilOpacity = useTransform(smoothInteraction, [0, 1], [0, 0.78]);
  const glazeOpacity = useTransform(smoothInteraction, [0, 1], [0, 0.22]);
  const transform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  const foilPosition = useMotionTemplate`${foilX}% ${foilY}%`;
  const texturePosition = useMotionTemplate`${textureX}px ${textureY}px, ${foilX}% ${foilY}%`;
  const glaze = useMotionTemplate`radial-gradient(circle at ${smoothX}% ${smoothY}%, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.16) 22%, transparent 52%)`;
  const source = getStickerSource(
    asset,
    hasMounted ? resolvedTheme : undefined,
  );
  const stickerStyle = {
    "--sticker-image": `url("${source}")`,
    "--holographic-mask": `url("${asset.maskSrc}")`,
  } satisfies StickerStyle;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || shouldReduceMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 100);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 100);
    interaction.set(1);
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || shouldReduceMotion) return;
    interaction.set(1);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || shouldReduceMotion) return;
    pointerX.set(50);
    pointerY.set(50);
    interaction.set(0);
  }

  return (
    <motion.div
      className={cn(styles.sticker, "relative mx-auto", className)}
      data-effect={effect}
      style={{ ...stickerStyle, transform }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <Image
        className={styles.image}
        src={source}
        width={asset.width}
        height={asset.height}
        sizes="(min-width: 640px) 18rem, 16rem"
        alt=""
        draggable={false}
        priority={priority}
      />
      <motion.span className={styles.foil} style={{ opacity: foilOpacity }}>
        <motion.span
          className={styles.spectrum}
          style={{ backgroundPosition: foilPosition }}
        />
        <motion.span
          className={styles.relief}
          style={{ backgroundPosition: texturePosition }}
        />
      </motion.span>
      <motion.span
        className={styles.glaze}
        style={{ backgroundImage: glaze, opacity: glazeOpacity }}
      />
    </motion.div>
  );
}
