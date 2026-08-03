"use client";

import type { ComponentType, SVGProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDownIcon,
  MoonIcon,
  PanelRightCloseIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SparklesIcon,
  SunIcon,
} from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { useTheme } from "@acme/ui/theme";

import styles from "./sticker-background.module.css";

const stickerSources = [
  "/stickers/blanket-burrito-dog.png",
  "/stickers/cat-in-box.png",
  "/stickers/giant-stick-dog.png",
  "/stickers/guilty-dog.png",
  "/stickers/laptop-cat.png",
  "/stickers/paper-bag-cat.png",
  "/stickers/post-bath-dog.png",
  "/stickers/sock-thief-dog.png",
  "/stickers/toilet-paper-cat.png",
  "/stickers/upside-down-cat.png",
] as const;

export interface StickerBackgroundSettings {
  spacing: number;
  size: number;
  sizeVariance: number;
  rotation: number;
  jitter: number;
  edgeBleed: number;
  centerClearance: number;
  blur: number;
  opacity: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowOpacity: number;
  showGuides: boolean;
}

export type StickerBackgroundProps = Partial<StickerBackgroundSettings> & {
  className?: string;
  seed?: number;
  showControls?: boolean;
  onSettingsChange?: (settings: StickerBackgroundSettings) => void;
};

interface LayoutSize {
  width: number;
  height: number;
}

interface StickerPlacement {
  id: string;
  source: (typeof stickerSources)[number];
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  onChange: (value: number) => void;
}

export const stickerBackgroundDefaults: StickerBackgroundSettings = {
  spacing: 175,
  size: 148,
  sizeVariance: 28,
  rotation: 18,
  jitter: 58,
  edgeBleed: 56,
  centerClearance: 45,
  blur: 0,
  opacity: 100,
  shadowX: 0,
  shadowY: 10,
  shadowBlur: 0,
  shadowOpacity: 0,
  showGuides: false,
};

function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeed() {
  if (typeof crypto !== "undefined") {
    return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  }

  return Math.floor(Math.random() * 4294967296);
}

function buildPlacements(
  layoutSize: LayoutSize,
  settings: StickerBackgroundSettings,
  seed: number,
) {
  const random = createRandom(seed);
  const count = Math.max(
    5,
    Math.min(
      80,
      Math.round(
        (layoutSize.width * layoutSize.height) / settings.spacing ** 2,
      ),
    ),
  );
  const bleed = (settings.size * settings.edgeBleed) / 100;
  const perimeter = layoutSize.width * 2 + layoutSize.height * 2;
  const offset = random();
  const jitter = settings.jitter / 100;
  const depthLimit = Math.max(
    settings.size * 0.2,
    Math.min(layoutSize.width, layoutSize.height) *
      (0.5 - settings.centerClearance / 200) -
      settings.size * 0.5,
  );

  return Array.from({ length: count }, (_, index): StickerPlacement => {
    const progress = (index / count + offset) % 1;
    const distance = progress * perimeter;
    let x = 0;
    let y = 0;
    let inwardX = 0;
    let inwardY = 0;

    if (distance < layoutSize.width) {
      x = distance;
      y = -bleed;
      inwardY = 1;
    } else if (distance < layoutSize.width + layoutSize.height) {
      x = layoutSize.width + bleed;
      y = distance - layoutSize.width;
      inwardX = -1;
    } else if (distance < layoutSize.width * 2 + layoutSize.height) {
      x = layoutSize.width - (distance - layoutSize.width - layoutSize.height);
      y = layoutSize.height + bleed;
      inwardY = -1;
    } else {
      x = -bleed;
      y =
        layoutSize.height -
        (distance - layoutSize.width * 2 - layoutSize.height);
      inwardX = 1;
    }

    const depth =
      settings.size * 0.2 +
      random() *
        Math.min(depthLimit, settings.spacing * (0.45 + jitter * 0.45));
    x +=
      inwardX * depth + (random() * 2 - 1) * settings.spacing * jitter * 0.18;
    y +=
      inwardY * depth + (random() * 2 - 1) * settings.spacing * jitter * 0.18;

    const variance = settings.sizeVariance / 100;
    return {
      id: `${seed}-${index}`,
      source:
        stickerSources[Math.floor(random() * stickerSources.length)] ??
        stickerSources[0],
      x,
      y,
      size: settings.size * (1 - variance + random() * variance * 2),
      rotation: (random() * 2 - 1) * settings.rotation,
      delay: Math.min(index * 12, 180),
    };
  });
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  icon: Icon,
  onChange,
}: RangeControlProps) {
  return (
    <label className="grid gap-1.5 text-xs">
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5">
          {Icon ? (
            <Icon className="text-muted-foreground size-3.5" aria-hidden />
          ) : null}
          {label}
        </span>
        <output className="text-muted-foreground tabular-nums">
          {value}
          {suffix}
        </output>
      </span>
      <input
        className={styles.range}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

export function StickerBackground({
  spacing = stickerBackgroundDefaults.spacing,
  size = stickerBackgroundDefaults.size,
  sizeVariance = stickerBackgroundDefaults.sizeVariance,
  rotation = stickerBackgroundDefaults.rotation,
  jitter = stickerBackgroundDefaults.jitter,
  edgeBleed = stickerBackgroundDefaults.edgeBleed,
  centerClearance = stickerBackgroundDefaults.centerClearance,
  blur = stickerBackgroundDefaults.blur,
  opacity = stickerBackgroundDefaults.opacity,
  shadowX = stickerBackgroundDefaults.shadowX,
  shadowY = stickerBackgroundDefaults.shadowY,
  shadowBlur = stickerBackgroundDefaults.shadowBlur,
  shadowOpacity = stickerBackgroundDefaults.shadowOpacity,
  showGuides = stickerBackgroundDefaults.showGuides,
  className,
  seed,
  showControls = false,
  onSettingsChange,
}: StickerBackgroundProps) {
  const initialSettings = useMemo(
    () => ({
      spacing,
      size,
      sizeVariance,
      rotation,
      jitter,
      edgeBleed,
      centerClearance,
      blur,
      opacity,
      shadowX,
      shadowY,
      shadowBlur,
      shadowOpacity,
      showGuides,
    }),
    [
      spacing,
      size,
      sizeVariance,
      rotation,
      jitter,
      edgeBleed,
      centerClearance,
      blur,
      opacity,
      shadowX,
      shadowY,
      shadowBlur,
      shadowOpacity,
      showGuides,
    ],
  );
  const [settings, setSettings] = useState(initialSettings);
  const settingsRef = useRef(initialSettings);
  const generatedSeedRef = useRef<number | null>(null);
  const [activeSeed, setActiveSeed] = useState<number | null>(seed ?? null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [layoutSize, setLayoutSize] = useState<LayoutSize | null>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    if (seed !== undefined) {
      setActiveSeed(seed);
      return;
    }

    generatedSeedRef.current ??= createSeed();
    setActiveSeed(generatedSeedRef.current);
  }, [seed]);

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;

    const updateSize = () => {
      const bounds = background.getBoundingClientRect();
      setLayoutSize({ width: bounds.width, height: bounds.height });
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(background);
    updateSize();

    return () => observer.disconnect();
  }, []);

  const placements = useMemo(
    () =>
      layoutSize && activeSeed !== null
        ? buildPlacements(layoutSize, settings, activeSeed)
        : [],
    [activeSeed, layoutSize, settings],
  );
  const filter =
    settings.blur === 0 && settings.shadowOpacity === 0
      ? "none"
      : `blur(${settings.blur}px) drop-shadow(${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px rgb(0 0 0 / ${settings.shadowOpacity / 100}))`;

  const updateSetting = useCallback(
    <Key extends keyof StickerBackgroundSettings>(
      key: Key,
      value: StickerBackgroundSettings[Key],
    ) => {
      const next = { ...settingsRef.current, [key]: value };
      settingsRef.current = next;
      setSettings(next);
      onSettingsChange?.(next);
    },
    [onSettingsChange],
  );

  const resetSettings = () => {
    settingsRef.current = initialSettings;
    setSettings(initialSettings);
    onSettingsChange?.(initialSettings);
  };

  return (
    <>
      <div
        ref={backgroundRef}
        className={cn(
          "pointer-events-none fixed inset-0 z-20 overflow-hidden",
          className,
        )}
        aria-hidden="true"
      >
        {settings.showGuides && layoutSize ? (
          <div className="border-foreground/25 absolute inset-4 z-20 border border-dashed">
            <span className="bg-background text-muted-foreground absolute top-2 left-2 rounded-md px-1.5 py-1 text-[11px] tabular-nums">
              {Math.round(layoutSize.width)} × {Math.round(layoutSize.height)}
            </span>
            <span className="bg-foreground/20 absolute top-1/2 right-0 left-0 h-px" />
            <span className="bg-foreground/20 absolute top-0 bottom-0 left-1/2 w-px" />
          </div>
        ) : null}

        {placements.map((placement, index) => (
          <Image
            key={placement.id}
            className={cn(
              styles.sticker,
              "absolute h-auto max-w-none select-none",
            )}
            src={placement.source}
            width={placement.size}
            height={placement.size}
            sizes={`${Math.ceil(placement.size)}px`}
            alt=""
            draggable={false}
            priority={index < 10}
            style={{
              left: placement.x,
              top: placement.y,
              width: placement.size,
              opacity: settings.opacity / 100,
              filter,
              transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
              animationDelay: `${placement.delay}ms`,
            }}
          />
        ))}
      </div>

      {showControls ? (
        panelOpen ? (
          <aside
            className="border-border bg-card/92 text-card-foreground fixed top-4 right-4 z-[100] flex max-h-[calc(100dvh-2rem)] w-[min(316px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl shadow-black/15 backdrop-blur-xl"
            aria-label="Sticker background controls"
          >
            <div className="border-border flex items-start justify-between gap-3 border-b py-3 pr-3 pl-4">
              <div>
                <p className="text-sm font-semibold">Sticker background</p>
                <span className="text-muted-foreground mt-0.5 block text-[11px] leading-4">
                  Perimeter flow · protected content
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close controls"
                onClick={() => setPanelOpen(false)}
              >
                <PanelRightCloseIcon />
              </Button>
            </div>

            <div className="overflow-y-auto overscroll-contain">
              <section className="border-border grid gap-3 border-b px-4 py-4">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Arrangement
                </p>
                <RangeControl
                  label="Spacing"
                  value={settings.spacing}
                  min={120}
                  max={340}
                  suffix="px"
                  onChange={(value) => updateSetting("spacing", value)}
                />
                <RangeControl
                  label="Sticker size"
                  value={settings.size}
                  min={64}
                  max={220}
                  suffix="px"
                  onChange={(value) => updateSetting("size", value)}
                />
                <RangeControl
                  label="Size variance"
                  value={settings.sizeVariance}
                  min={0}
                  max={60}
                  suffix="%"
                  onChange={(value) => updateSetting("sizeVariance", value)}
                />
                <RangeControl
                  label="Randomness"
                  value={settings.jitter}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(value) => updateSetting("jitter", value)}
                />
                <RangeControl
                  label="Rotation"
                  value={settings.rotation}
                  min={0}
                  max={45}
                  suffix="°"
                  onChange={(value) => updateSetting("rotation", value)}
                />
                <RangeControl
                  label="Edge bleed"
                  value={settings.edgeBleed}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(value) => updateSetting("edgeBleed", value)}
                />
                <RangeControl
                  label="Center clearance"
                  value={settings.centerClearance}
                  min={0}
                  max={70}
                  suffix="%"
                  onChange={(value) => updateSetting("centerClearance", value)}
                />
              </section>

              <section className="border-border grid gap-3 border-b px-4 py-4">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Appearance
                </p>
                <RangeControl
                  label="Opacity"
                  value={settings.opacity}
                  min={20}
                  max={100}
                  suffix="%"
                  onChange={(value) => updateSetting("opacity", value)}
                />
                <RangeControl
                  label="Blur"
                  value={settings.blur}
                  min={0}
                  max={8}
                  step={0.5}
                  suffix="px"
                  onChange={(value) => updateSetting("blur", value)}
                />
                <RangeControl
                  label="Shadow X"
                  value={settings.shadowX}
                  min={-24}
                  max={24}
                  suffix="px"
                  onChange={(value) => updateSetting("shadowX", value)}
                />
                <RangeControl
                  label="Shadow Y"
                  value={settings.shadowY}
                  min={-24}
                  max={32}
                  suffix="px"
                  onChange={(value) => updateSetting("shadowY", value)}
                />
                <RangeControl
                  label="Shadow blur"
                  value={settings.shadowBlur}
                  min={0}
                  max={48}
                  suffix="px"
                  onChange={(value) => updateSetting("shadowBlur", value)}
                />
                <RangeControl
                  label="Shadow opacity"
                  value={settings.shadowOpacity}
                  min={0}
                  max={60}
                  suffix="%"
                  onChange={(value) => updateSetting("shadowOpacity", value)}
                />
              </section>

              <section className="grid grid-cols-2 gap-2 px-4 py-4">
                <Button
                  variant="outline"
                  className="justify-start text-[11px]"
                  onClick={() => setActiveSeed(createSeed())}
                >
                  <RefreshCwIcon />
                  Shuffle layout
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-[11px]"
                  onClick={resetSettings}
                >
                  <RotateCcwIcon />
                  Reset controls
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-[11px]"
                  aria-pressed={settings.showGuides}
                  onClick={() =>
                    updateSetting("showGuides", !settings.showGuides)
                  }
                >
                  <SparklesIcon />
                  {settings.showGuides ? "Hide guides" : "Show guides"}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-[11px]"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  <SunIcon className="hidden dark:block" />
                  <MoonIcon className="dark:hidden" />
                  <span className="hidden dark:inline">Light mode</span>
                  <span className="dark:hidden">Dark mode</span>
                </Button>
              </section>
            </div>
          </aside>
        ) : (
          <Button
            className="fixed top-4 right-4 z-[100] shadow-lg"
            variant="outline"
            onClick={() => setPanelOpen(true)}
          >
            Controls
            <ChevronDownIcon className="rotate-90" />
          </Button>
        )
      ) : null}
    </>
  );
}
