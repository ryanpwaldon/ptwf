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
    <>
      <motion.div
        className={cn("holographic-sticker relative mx-auto", className)}
        data-effect={effect}
        style={{ ...stickerStyle, transform }}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        aria-hidden="true"
      >
        <Image
          className="holographic-sticker__image"
          src={source}
          width={asset.width}
          height={asset.height}
          sizes="(min-width: 640px) 18rem, 16rem"
          alt=""
          draggable={false}
          priority={priority}
        />
        <motion.span
          className="holographic-sticker__foil"
          style={{ opacity: foilOpacity }}
        >
          <motion.span
            className="holographic-sticker__spectrum"
            style={{ backgroundPosition: foilPosition }}
          />
          <motion.span
            className="holographic-sticker__relief"
            style={{ backgroundPosition: texturePosition }}
          />
        </motion.span>
        <motion.span
          className="holographic-sticker__glaze"
          style={{ backgroundImage: glaze, opacity: glazeOpacity }}
        />
      </motion.div>

      <style href="holographic-sticker" precedence="medium">{`
        .holographic-sticker {
          --sticker-image: none;
          --holographic-mask: none;
          filter: drop-shadow(0 18px 24px rgb(0 0 0 / 0.22));
          transform-style: preserve-3d;
          will-change: transform;
        }

        .holographic-sticker__image {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
        }

        .holographic-sticker__foil,
        .holographic-sticker__glaze {
          position: absolute;
          inset: 0;
          pointer-events: none;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }

        .holographic-sticker__foil {
          z-index: 2;
          -webkit-mask-image: var(--holographic-mask);
          mask-image: var(--holographic-mask);
        }

        .holographic-sticker__spectrum,
        .holographic-sticker__relief {
          position: absolute;
          inset: 0;
        }

        .holographic-sticker__spectrum {
          background-image: repeating-linear-gradient(
            112deg,
            rgb(255 119 115) 0%,
            rgb(255 237 95) 14%,
            rgb(168 255 95) 28%,
            rgb(131 255 247) 42%,
            rgb(120 148 255) 56%,
            rgb(216 117 255) 70%,
            rgb(255 119 115) 84%
          );
          background-size: 180% 220%;
          mix-blend-mode: normal;
          -webkit-mask-repeat: repeat;
          mask-repeat: repeat;
        }

        .holographic-sticker__relief {
          mix-blend-mode: screen;
        }

        .holographic-sticker__glaze {
          z-index: 3;
          -webkit-mask-image: var(--sticker-image);
          mask-image: var(--sticker-image);
          mix-blend-mode: screen;
        }

        .holographic-sticker[data-effect="diffraction"]
          .holographic-sticker__spectrum {
          -webkit-mask-image: repeating-linear-gradient(
            -24deg,
            rgb(0 0 0 / 0.9) 0,
            rgb(0 0 0 / 0.38) 1px,
            transparent 2px,
            transparent 5px
          );
          mask-image: repeating-linear-gradient(
            -24deg,
            rgb(0 0 0 / 0.9) 0,
            rgb(0 0 0 / 0.38) 1px,
            transparent 2px,
            transparent 5px
          );
          filter: contrast(1.15) saturate(1.2);
        }

        .holographic-sticker[data-effect="diffraction"]
          .holographic-sticker__relief {
          background-image:
            repeating-linear-gradient(
              -24deg,
              rgb(255 255 255 / 0.7) 0,
              rgb(255 255 255 / 0.04) 1px,
              rgb(0 0 0 / 0.16) 2px,
              transparent 5px
            ),
            radial-gradient(circle, rgb(255 255 255 / 0.48), transparent 56%);
          background-size:
            100% 100%,
            80% 120%;
          filter: contrast(1.1);
        }

        .holographic-sticker[data-effect="mica"]
          .holographic-sticker__spectrum {
          background-image: conic-gradient(
            from 210deg,
            rgb(64 255 231),
            rgb(92 104 255),
            rgb(255 72 202),
            rgb(255 230 100),
            rgb(64 255 231)
          );
          background-size: 170% 210%;
          -webkit-mask-image: url("/holographic/mica-texture.svg");
          mask-image: url("/holographic/mica-texture.svg");
          -webkit-mask-size: 46% 95%;
          mask-size: 46% 95%;
          filter: contrast(1.2) saturate(1.3);
        }

        .holographic-sticker[data-effect="mica"] .holographic-sticker__relief {
          background-image:
            url("/holographic/mica-texture.svg"),
            radial-gradient(circle, rgb(255 255 255 / 0.72), transparent 48%);
          background-size:
            46% 95%,
            70% 110%;
          background-blend-mode: screen;
          filter: contrast(1.15);
        }

        .holographic-sticker[data-effect="embossed"]
          .holographic-sticker__spectrum {
          background-image: conic-gradient(
            from 35deg,
            rgb(119 238 255),
            rgb(174 125 255),
            rgb(255 147 221),
            rgb(255 226 138),
            rgb(119 238 255)
          );
          background-size: 210% 210%;
          -webkit-mask-image: url("/holographic/embossed-texture.svg");
          mask-image: url("/holographic/embossed-texture.svg");
          -webkit-mask-size: 38% 76%;
          mask-size: 38% 76%;
          filter: contrast(1.2) saturate(1.1);
        }

        .holographic-sticker[data-effect="embossed"]
          .holographic-sticker__relief {
          background-image:
            url("/holographic/embossed-texture.svg"),
            linear-gradient(
              105deg,
              transparent 22%,
              rgb(255 255 255 / 0.7) 42%,
              transparent 58%
            );
          background-size:
            38% 76%,
            190% 100%;
          background-blend-mode: screen;
          filter: contrast(1.12);
        }

        @media (hover: none),
          (pointer: coarse),
          (prefers-reduced-motion: reduce) {
          .holographic-sticker {
            transform: none !important;
            will-change: auto;
          }
        }
      `}</style>
    </>
  );
}
