"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  PlayIcon,
  RotateCcwIcon,
  ShuffleIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import styles from "./sticker-fountain.module.css";

const stickers = [
  { src: "/stickers/blanket-burrito-dog.svg", width: 872, height: 528 },
  { src: "/stickers/cat-in-box.svg", width: 749, height: 735 },
  { src: "/stickers/giant-stick-dog.svg", width: 1295, height: 646 },
  { src: "/stickers/guilty-dog.svg", width: 972, height: 811 },
  { src: "/stickers/laptop-cat.svg", width: 896, height: 552 },
  { src: "/stickers/paper-bag-cat.svg", width: 710, height: 802 },
  { src: "/stickers/post-bath-dog.svg", width: 788, height: 647 },
  { src: "/stickers/sock-thief-dog.svg", width: 1016, height: 708 },
  { src: "/stickers/toilet-paper-cat.svg", width: 1284, height: 620 },
  { src: "/stickers/upside-down-cat.svg", width: 915, height: 925 },
] as const;

export interface StickerFountainSettings {
  scale: number;
  spacing: number;
  rotation: number;
  jitter: number;
  spread: number;
  originWidth: number;
  taper: number;
  topOverflow: number;
  opacity: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowOpacity: number;
  entranceDuration: number;
  stagger: number;
  riseDistance: number;
  showGuides: boolean;
}

export type StickerFountainProps = Partial<StickerFountainSettings> & {
  className?: string;
  seed?: number;
  showControls?: boolean;
  onSettingsChange?: (settings: StickerFountainSettings) => void;
};

interface LayoutSize {
  width: number;
  height: number;
}

interface StickerPlacement {
  id: string;
  asset: (typeof stickers)[number];
  x: number;
  y: number;
  rotation: number;
  delay: number;
  layer: number;
}

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}

export const stickerFountainDefaults: StickerFountainSettings = {
  scale: 14,
  spacing: 110,
  rotation: 18,
  jitter: 12,
  spread: 150,
  originWidth: 133,
  taper: 100,
  topOverflow: 100,
  opacity: 100,
  shadowX: 0,
  shadowY: 10,
  shadowBlur: 4,
  shadowOpacity: 6,
  entranceDuration: 520,
  stagger: 64,
  riseDistance: 24,
  showGuides: false,
};

export const stickerFountainDefaultSeed = 1297;

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

function cellSeed(seed: number, row: number, column: number) {
  let value = seed ^ Math.imul(row + 1, 0x9e3779b1);
  value ^= Math.imul(column + 0x7fff, 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  return (value ^ (value >>> 15)) >>> 0;
}

function halfWidthAt(
  progress: number,
  layoutWidth: number,
  settings: StickerFountainSettings,
) {
  const exponent = 0.55 + (settings.taper / 100) * 1.4;
  const originHalfWidth = settings.originWidth / 2;
  const topHalfWidth = (layoutWidth * settings.spread) / 200;
  return (
    originHalfWidth +
    (topHalfWidth - originHalfWidth) * Math.pow(progress, exponent)
  );
}

function buildPlacements(
  layout: LayoutSize,
  settings: StickerFountainSettings,
  seed: number,
) {
  const rowSpacing = settings.spacing * (Math.sqrt(3) / 2);
  const flowHeight = layout.height + settings.topOverflow;
  const rowCount = Math.ceil(flowHeight / rowSpacing);
  const placements: StickerPlacement[] = [];

  for (let row = 0; row <= rowCount; row += 1) {
    const baseY = layout.height - row * rowSpacing;
    if (baseY < -settings.topOverflow) continue;

    const progress = Math.min(
      1,
      Math.max(0, (layout.height - baseY) / flowHeight),
    );
    const halfWidth = halfWidthAt(progress, layout.width, settings);
    const phase = row % 2 === 0 ? 0 : settings.spacing / 2;
    const firstColumn = Math.ceil((-halfWidth - phase) / settings.spacing);
    const lastColumn = Math.floor((halfWidth - phase) / settings.spacing);

    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const random = createRandom(cellSeed(seed, row, column));
      const jitterRange = (settings.spacing * settings.jitter) / 500;
      const x = Math.min(
        halfWidth,
        Math.max(
          -halfWidth,
          column * settings.spacing + phase + (random() * 2 - 1) * jitterRange,
        ),
      );
      const y = baseY + (random() * 2 - 1) * jitterRange;
      const assetRandom = random();
      const neighborRadius = settings.spacing * 1.15;
      const neighboringSources = new Set(
        placements
          .filter((placement) => {
            const deltaX = layout.width / 2 + x - placement.x;
            const deltaY = y - placement.y;
            return deltaX ** 2 + deltaY ** 2 < neighborRadius ** 2;
          })
          .map((placement) => placement.asset.src),
      );
      const availableStickers = stickers.filter(
        (sticker) => !neighboringSources.has(sticker.src),
      );
      const asset =
        availableStickers[Math.floor(assetRandom * availableStickers.length)] ??
        stickers[Math.floor(assetRandom * stickers.length)] ??
        stickers[0];

      placements.push({
        id: `${seed}-${row}-${column}`,
        asset,
        x: layout.width / 2 + x,
        y,
        rotation: (random() * 2 - 1) * settings.rotation,
        delay: row * settings.stagger + random() * settings.stagger * 0.2,
        layer: rowCount - row + 1,
      });
    }
  }

  return placements;
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  format = String,
  onChange,
}: RangeControlProps) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-medium">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <output className="text-muted-foreground font-mono text-[0.6875rem] tabular-nums">
          {format(value)}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="accent-foreground h-4 w-full cursor-pointer"
      />
    </label>
  );
}

interface StickerFountainControlsProps {
  settings: StickerFountainSettings;
  seed: number;
  collapsed: boolean;
  copied: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onSeedChange: (seed: number) => void;
  onSettingsChange: <Key extends keyof StickerFountainSettings>(
    key: Key,
    value: StickerFountainSettings[Key],
  ) => void;
  onReplay: () => void;
  onReset: () => void;
  onCopy: () => void;
}

function StickerFountainControls({
  settings,
  seed,
  collapsed,
  copied,
  onCollapsedChange,
  onSeedChange,
  onSettingsChange,
  onReplay,
  onReset,
  onCopy,
}: StickerFountainControlsProps) {
  return (
    <aside className="fixed right-4 bottom-4 z-50 max-h-[calc(100dvh-2rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto">
      <Card
        size="sm"
        className="bg-card/92 gap-0 overflow-hidden shadow-xl backdrop-blur-xl"
      >
        <CardHeader className="grid-cols-[1fr_auto] items-center">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontalIcon className="size-4" />
            Sticker fountain
          </CardTitle>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={collapsed ? "Expand controls" : "Collapse controls"}
            aria-expanded={!collapsed}
            onClick={() => onCollapsedChange(!collapsed)}
            className="transition-transform duration-150 active:scale-[0.97]"
          >
            <ChevronDownIcon
              className={cn(
                "transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </CardHeader>

        {!collapsed && (
          <CardContent className="border-border/70 mt-3 grid gap-4 border-t pt-3">
            <section className="grid grid-cols-2 gap-x-3 gap-y-4">
              <RangeControl
                label="Global scale"
                value={settings.scale}
                min={6}
                max={30}
                format={(value) => `${value}%`}
                onChange={(value) => onSettingsChange("scale", value)}
              />
              <RangeControl
                label="Spacing"
                value={settings.spacing}
                min={100}
                max={300}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("spacing", value)}
              />
              <RangeControl
                label="Rotation"
                value={settings.rotation}
                min={0}
                max={45}
                format={(value) => `${value}°`}
                onChange={(value) => onSettingsChange("rotation", value)}
              />
              <RangeControl
                label="Position jitter"
                value={settings.jitter}
                min={0}
                max={40}
                format={(value) => `${value}%`}
                onChange={(value) => onSettingsChange("jitter", value)}
              />
              <RangeControl
                label="Top spread"
                value={settings.spread}
                min={50}
                max={150}
                format={(value) => `${value}%`}
                onChange={(value) => onSettingsChange("spread", value)}
              />
              <RangeControl
                label="Origin width"
                value={settings.originWidth}
                min={0}
                max={360}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("originWidth", value)}
              />
              <RangeControl
                label="Taper curve"
                value={settings.taper}
                min={0}
                max={100}
                format={(value) => `${value}%`}
                onChange={(value) => onSettingsChange("taper", value)}
              />
              <RangeControl
                label="Top overflow"
                value={settings.topOverflow}
                min={0}
                max={400}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("topOverflow", value)}
              />
            </section>

            <section className="border-border/70 grid grid-cols-2 gap-x-3 gap-y-4 border-t pt-4">
              <RangeControl
                label="Opacity"
                value={settings.opacity}
                min={20}
                max={100}
                format={(value) => `${value}%`}
                onChange={(value) => onSettingsChange("opacity", value)}
              />
              <RangeControl
                label="Shadow opacity"
                value={settings.shadowOpacity}
                min={0}
                max={60}
                format={(value) => `${value}%`}
                onChange={(value) => onSettingsChange("shadowOpacity", value)}
              />
              <RangeControl
                label="Shadow X"
                value={settings.shadowX}
                min={-24}
                max={24}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("shadowX", value)}
              />
              <RangeControl
                label="Shadow Y"
                value={settings.shadowY}
                min={-24}
                max={36}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("shadowY", value)}
              />
              <RangeControl
                label="Shadow blur"
                value={settings.shadowBlur}
                min={0}
                max={48}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("shadowBlur", value)}
              />
            </section>

            <section className="border-border/70 grid grid-cols-2 gap-x-3 gap-y-4 border-t pt-4">
              <RangeControl
                label="Entrance"
                value={settings.entranceDuration}
                min={180}
                max={1200}
                step={20}
                format={(value) => `${value}ms`}
                onChange={(value) =>
                  onSettingsChange("entranceDuration", value)
                }
              />
              <RangeControl
                label="Row stagger"
                value={settings.stagger}
                min={0}
                max={120}
                step={2}
                format={(value) => `${value}ms`}
                onChange={(value) => onSettingsChange("stagger", value)}
              />
              <RangeControl
                label="Rise distance"
                value={settings.riseDistance}
                min={0}
                max={220}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("riseDistance", value)}
              />
              <label className="grid min-w-0 gap-1.5 text-xs font-medium">
                <span>Seed</span>
                <input
                  type="number"
                  value={seed}
                  onChange={(event) =>
                    onSeedChange(Number(event.currentTarget.value) || 0)
                  }
                  className="border-input bg-background h-7 w-full rounded-md border px-2 font-mono text-xs tabular-nums"
                />
              </label>
            </section>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={settings.showGuides}
                onChange={(event) =>
                  onSettingsChange("showGuides", event.currentTarget.checked)
                }
                className="accent-foreground size-3.5"
              />
              Show distribution guides
            </label>

            <div className="border-border/70 grid grid-cols-2 gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReplay}
                className="col-span-2"
              >
                <PlayIcon />
                Replay animation
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSeedChange((seed + 1) >>> 0)}
              >
                <ShuffleIcon />
                Next seed
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <RotateCcwIcon />
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCopy}
                className="col-span-2"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied production values" : "Copy production values"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </aside>
  );
}

export function StickerFountain({
  scale = stickerFountainDefaults.scale,
  spacing = stickerFountainDefaults.spacing,
  rotation = stickerFountainDefaults.rotation,
  jitter = stickerFountainDefaults.jitter,
  spread = stickerFountainDefaults.spread,
  originWidth = stickerFountainDefaults.originWidth,
  taper = stickerFountainDefaults.taper,
  topOverflow = stickerFountainDefaults.topOverflow,
  opacity = stickerFountainDefaults.opacity,
  shadowX = stickerFountainDefaults.shadowX,
  shadowY = stickerFountainDefaults.shadowY,
  shadowBlur = stickerFountainDefaults.shadowBlur,
  shadowOpacity = stickerFountainDefaults.shadowOpacity,
  entranceDuration = stickerFountainDefaults.entranceDuration,
  stagger = stickerFountainDefaults.stagger,
  riseDistance = stickerFountainDefaults.riseDistance,
  showGuides = stickerFountainDefaults.showGuides,
  className,
  seed = stickerFountainDefaultSeed,
  showControls = false,
  onSettingsChange,
}: StickerFountainProps) {
  const defaultSettings = useMemo<StickerFountainSettings>(
    () => ({
      scale,
      spacing,
      rotation,
      jitter,
      spread,
      originWidth,
      taper,
      topOverflow,
      opacity,
      shadowX,
      shadowY,
      shadowBlur,
      shadowOpacity,
      entranceDuration,
      stagger,
      riseDistance,
      showGuides,
    }),
    [
      entranceDuration,
      jitter,
      opacity,
      originWidth,
      riseDistance,
      rotation,
      shadowBlur,
      shadowOpacity,
      shadowX,
      shadowY,
      showGuides,
      scale,
      spacing,
      spread,
      stagger,
      taper,
      topOverflow,
    ],
  );
  const [settings, setSettings] = useState(defaultSettings);
  const [activeSeed, setActiveSeed] = useState(seed);
  const [layout, setLayout] = useState<LayoutSize | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replay, setReplay] = useState(0);
  const fountainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(defaultSettings);
  }, [defaultSettings]);

  useEffect(() => {
    setActiveSeed(seed);
  }, [seed]);

  useEffect(() => {
    const fountain = fountainRef.current;
    if (!fountain) return;

    const updateLayout = () => {
      const bounds = fountain.getBoundingClientRect();
      setLayout({ width: bounds.width, height: bounds.height });
    };
    const observer = new ResizeObserver(updateLayout);
    observer.observe(fountain);
    updateLayout();

    return () => observer.disconnect();
  }, []);

  const placements = useMemo(
    () => (layout ? buildPlacements(layout, settings, activeSeed) : []),
    [activeSeed, layout, settings],
  );
  const shadow = `drop-shadow(${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px rgb(0 0 0 / ${settings.shadowOpacity / 100}))`;

  function updateSetting<Key extends keyof StickerFountainSettings>(
    key: Key,
    value: StickerFountainSettings[Key],
  ) {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      onSettingsChange?.(next);
      return next;
    });
  }

  async function copyProductionValues() {
    await navigator.clipboard.writeText(
      JSON.stringify({ seed: activeSeed, ...settings }, null, 2),
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const guidePoints = layout
    ? Array.from({ length: 13 }, (_, index) => {
        const progress = index / 12;
        const y =
          layout.height - progress * (layout.height + settings.topOverflow);
        const halfWidth = halfWidthAt(progress, layout.width, settings);
        return {
          y,
          left: layout.width / 2 - halfWidth,
          right: layout.width / 2 + halfWidth,
        };
      })
    : [];

  return (
    <>
      <div
        ref={fountainRef}
        className={cn(
          "pointer-events-none relative z-0 h-full w-full overflow-visible",
          className,
        )}
        aria-hidden="true"
      >
        {settings.showGuides && layout ? (
          <svg
            className="absolute inset-0 z-[2000] size-full overflow-visible"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
          >
            <path
              d={guidePoints
                .map(
                  (point, index) =>
                    `${index === 0 ? "M" : "L"}${point.left} ${point.y}`,
                )
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeDasharray="6 6"
              strokeOpacity="0.35"
            />
            <path
              d={guidePoints
                .map(
                  (point, index) =>
                    `${index === 0 ? "M" : "L"}${point.right} ${point.y}`,
                )
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeDasharray="6 6"
              strokeOpacity="0.35"
            />
            <circle
              cx={layout.width / 2}
              cy={layout.height}
              r="5"
              fill="currentColor"
              fillOpacity="0.45"
            />
          </svg>
        ) : null}

        {placements.map((placement, index) => {
          const renderedWidth = placement.asset.width * (settings.scale / 100);
          const stickerStyle = {
            left: placement.x,
            top: placement.y,
            zIndex: placement.layer,
            width: renderedWidth,
            height: "auto",
            filter: shadow,
            "--sticker-opacity": settings.opacity / 100,
            "--sticker-rise": `${settings.riseDistance}px`,
            "--sticker-rotation": `${placement.rotation}deg`,
            "--sticker-duration": `${settings.entranceDuration}ms`,
            "--sticker-delay": `${placement.delay}ms`,
          } as CSSProperties;

          return (
            <Image
              key={`${placement.id}-${replay}`}
              className={cn(styles.sticker, "absolute max-w-none select-none")}
              src={placement.asset.src}
              width={placement.asset.width}
              height={placement.asset.height}
              sizes={`${Math.ceil(renderedWidth)}px`}
              alt=""
              draggable={false}
              priority={index < 8}
              style={stickerStyle}
            />
          );
        })}
      </div>

      {showControls ? (
        <StickerFountainControls
          settings={settings}
          seed={activeSeed}
          collapsed={controlsCollapsed}
          copied={copied}
          onCollapsedChange={setControlsCollapsed}
          onSeedChange={setActiveSeed}
          onSettingsChange={updateSetting}
          onReplay={() => setReplay((current) => current + 1)}
          onReset={() => {
            setSettings(defaultSettings);
            setActiveSeed(seed);
            onSettingsChange?.(defaultSettings);
          }}
          onCopy={() => void copyProductionValues()}
        />
      ) : null}
    </>
  );
}
