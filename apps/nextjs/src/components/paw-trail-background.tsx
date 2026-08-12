"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CircleHelpIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

interface Point {
  x: number;
  y: number;
}

interface Paw {
  element: SVGUseElement;
  fadeOutElement: SVGGElement;
  progress: number;
}

interface Trail {
  id: number;
  path: SVGPathElement;
  pawGroup: SVGGElement;
  debugGroup: SVGGElement;
  paws: Paw[];
  animations: Animation[];
  timeouts: number[];
}

interface Geometry {
  width: number;
  height: number;
  viewport: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

export interface PawTrailBackgroundProps {
  className?: string;
  showControls?: boolean;
  controlsDefaultCollapsed?: boolean;
  density?: number;
  spacing?: number;
  trailLength?: number;
  curvature?: number;
  walkInDuration?: number;
  footprintDuration?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  fadeInEasing?: string;
  fadeOutEasing?: string;
  overscan?: number;
  pawSpacing?: number;
  pawSize?: number;
  pawOffset?: number;
  color?: string;
  stepColor?: string;
  colorTransitionDuration?: number;
  showPaws?: boolean;
  showSpacingDebug?: boolean;
}

interface PawTrailSettings {
  density: number;
  spacing: number;
  trailLength: number;
  curvature: number;
  walkInDuration: number;
  footprintDuration: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  fadeInEasing: string;
  fadeOutEasing: string;
  overscan: number;
  pawSpacing: number;
  pawSize: number;
  pawOffset: number;
  color: string;
  showPaws: boolean;
  showSpacingDebug: boolean;
}

interface RangeControlProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}

const easingOptions = [
  {
    label: "Strong ease out",
    value: "cubic-bezier(0.23, 1, 0.32, 1)",
  },
  {
    label: "Gentle ease out",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  {
    label: "Ease in out",
    value: "cubic-bezier(0.77, 0, 0.175, 1)",
  },
  { label: "Ease in", value: "cubic-bezier(0.42, 0, 1, 1)" },
  { label: "Linear", value: "linear" },
] as const;

const controlDescriptions = {
  density:
    "How aggressively new trails spawn. Higher values fill available space faster and allow more trails at once.",
  spacing:
    "The minimum clearance between separate trails. Larger values leave more empty space.",
  trailLength:
    "The approximate distance covered by each trail before its random variation is applied.",
  curvature:
    "How strongly trails bend. Zero is almost straight; one produces the most pronounced curves.",
  walkInDuration:
    "How long the footprints take to progress from the tail to the head of a trail.",
  footprintDuration:
    "The complete lifetime of one footprint, from the start of its fade-in through the end of its fade-out.",
  fadeInDuration:
    "How long each individual footprint takes to become fully visible.",
  fadeOutDuration:
    "How long each individual footprint takes to disappear at the end of its lifetime.",
  fadeInEasing:
    "How opacity and scale accelerate during entry. Strong ease out appears quickly, then settles gently.",
  fadeOutEasing:
    "How opacity and scale accelerate during exit. Strong ease out disappears promptly, then settles gently.",
  overscan:
    "The hidden drawing area beyond the viewport, allowing trails to enter and leave naturally at the edges.",
  pawSpacing:
    "The distance between consecutive footprints along the same trail.",
  pawSize: "The visual scale of every footprint.",
  pawOffset:
    "How far alternating left and right footprints sit from the trail's centre line.",
  color: "The colour used to draw every footprint.",
  showPaws: "Shows or hides the rendered footprints.",
  showSpacingDebug:
    "Shows the collision-clearance samples used to keep separate trails apart.",
  collapse: "Shows or hides the paw trail controls.",
  pause:
    "Stops new trails from spawning. Footprints already on screen continue their lifecycle.",
  reseed: "Removes every current trail and starts a new random layout.",
  reset: "Restores every paw trail control to its default value.",
} as const;

interface EasingControlProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

interface ControlHelpProps {
  label: string;
  description: string;
}

function ControlHelp({ label, description }: ControlHelpProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -m-1 shrink-0 cursor-help rounded-sm p-1 transition-colors outline-none focus-visible:ring-2"
        >
          <CircleHelpIcon className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={6} className="max-w-64">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

function EasingControl({
  label,
  description,
  value,
  onChange,
}: EasingControlProps) {
  const id = useId();

  return (
    <div className="grid min-w-0 gap-1.5 text-xs font-medium">
      <span className="flex items-center gap-1.5">
        <label htmlFor={id}>{label}</label>
        <ControlHelp label={label} description={description} />
      </span>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="border-input bg-background h-7 min-w-0 rounded-md border px-2 text-xs"
      >
        {easingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RangeControl({
  label,
  description,
  value,
  min,
  max,
  step,
  format = String,
  onChange,
}: RangeControlProps) {
  const id = useId();

  return (
    <div className="grid min-w-0 gap-1.5 text-xs font-medium">
      <span className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <label htmlFor={id}>{label}</label>
          <ControlHelp label={label} description={description} />
        </span>
        <output className="text-muted-foreground font-mono text-[0.6875rem] tabular-nums">
          {format(value)}
        </output>
      </span>
      <input
        id={id}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="accent-foreground h-4 w-full cursor-pointer"
      />
    </div>
  );
}

interface PawTrailControlsProps {
  settings: PawTrailSettings;
  collapsed: boolean;
  paused: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onPausedChange: (paused: boolean) => void;
  onSettingsChange: <Key extends keyof PawTrailSettings>(
    key: Key,
    value: PawTrailSettings[Key],
  ) => void;
  onReset: () => void;
  onReseed: () => void;
}

function PawTrailControls({
  settings,
  collapsed,
  paused,
  onCollapsedChange,
  onPausedChange,
  onSettingsChange,
  onReset,
  onReseed,
}: PawTrailControlsProps) {
  const colorControlId = useId();

  return (
    <aside className="fixed bottom-4 left-4 z-50 max-h-[calc(100dvh-2rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto">
      <Card
        size="sm"
        className="bg-card/90 gap-0 overflow-hidden shadow-xl backdrop-blur-xl"
      >
        <CardHeader className="grid-cols-[1fr_auto] items-center">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontalIcon className="size-4" />
            Paw trail controls
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={
                  collapsed
                    ? "Expand paw trail controls"
                    : "Collapse paw trail controls"
                }
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
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={6}>
              {controlDescriptions.collapse}
            </TooltipContent>
          </Tooltip>
        </CardHeader>

        {!collapsed && (
          <CardContent className="border-border/70 mt-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <RangeControl
                label="Density"
                description={controlDescriptions.density}
                value={settings.density}
                min={0.4}
                max={2}
                step={0.1}
                format={(value) => `${value.toFixed(1)}×`}
                onChange={(value) => onSettingsChange("density", value)}
              />
              <RangeControl
                label="Trail spacing"
                description={controlDescriptions.spacing}
                value={settings.spacing}
                min={28}
                max={320}
                step={2}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("spacing", value)}
              />
              <RangeControl
                label="Trail length"
                description={controlDescriptions.trailLength}
                value={settings.trailLength}
                min={260}
                max={900}
                step={20}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("trailLength", value)}
              />
              <RangeControl
                label="Curvature"
                description={controlDescriptions.curvature}
                value={settings.curvature}
                min={0}
                max={1}
                step={0.05}
                format={(value) => value.toFixed(2).replace(/0$/, "")}
                onChange={(value) => onSettingsChange("curvature", value)}
              />
              <RangeControl
                label="Walk in"
                description={controlDescriptions.walkInDuration}
                value={settings.walkInDuration}
                min={500}
                max={5000}
                step={100}
                format={(value) => `${(value / 1000).toFixed(1)}s`}
                onChange={(value) => onSettingsChange("walkInDuration", value)}
              />
              <RangeControl
                label="Footprint duration"
                description={controlDescriptions.footprintDuration}
                value={settings.footprintDuration}
                min={1000}
                max={6000}
                step={100}
                format={(value) => `${(value / 1000).toFixed(1)}s`}
                onChange={(value) =>
                  onSettingsChange("footprintDuration", value)
                }
              />
              <RangeControl
                label="Fade in"
                description={controlDescriptions.fadeInDuration}
                value={settings.fadeInDuration}
                min={100}
                max={500}
                step={10}
                format={(value) => `${value}ms`}
                onChange={(value) => onSettingsChange("fadeInDuration", value)}
              />
              <RangeControl
                label="Fade out"
                description={controlDescriptions.fadeOutDuration}
                value={settings.fadeOutDuration}
                min={100}
                max={500}
                step={10}
                format={(value) => `${value}ms`}
                onChange={(value) => onSettingsChange("fadeOutDuration", value)}
              />
              <EasingControl
                label="Fade in easing"
                description={controlDescriptions.fadeInEasing}
                value={settings.fadeInEasing}
                onChange={(value) => onSettingsChange("fadeInEasing", value)}
              />
              <EasingControl
                label="Fade out easing"
                description={controlDescriptions.fadeOutEasing}
                value={settings.fadeOutEasing}
                onChange={(value) => onSettingsChange("fadeOutEasing", value)}
              />
              <RangeControl
                label="Overscan"
                description={controlDescriptions.overscan}
                value={settings.overscan}
                min={80}
                max={420}
                step={20}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("overscan", value)}
              />
              <RangeControl
                label="Paw spacing"
                description={controlDescriptions.pawSpacing}
                value={settings.pawSpacing}
                min={32}
                max={140}
                step={2}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("pawSpacing", value)}
              />
              <RangeControl
                label="Paw size"
                description={controlDescriptions.pawSize}
                value={settings.pawSize}
                min={0.4}
                max={1.5}
                step={0.01}
                format={(value) => `${value.toFixed(2).replace(/0$/, "")}×`}
                onChange={(value) => onSettingsChange("pawSize", value)}
              />
              <RangeControl
                label="Paw offset"
                description={controlDescriptions.pawOffset}
                value={settings.pawOffset}
                min={0}
                max={32}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("pawOffset", value)}
              />
              <div className="grid gap-1.5 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <label htmlFor={colorControlId}>Paw color</label>
                  <ControlHelp
                    label="Paw color"
                    description={controlDescriptions.color}
                  />
                </span>
                <input
                  id={colorControlId}
                  type="color"
                  value={
                    /^#[\da-f]{6}$/i.test(settings.color)
                      ? settings.color
                      : "#737373"
                  }
                  onChange={(event) =>
                    onSettingsChange("color", event.currentTarget.value)
                  }
                  className="border-input bg-background h-7 w-full cursor-pointer rounded-md border p-0.5"
                />
              </div>
            </div>

            <div className="border-border/70 mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t pt-3">
              <span className="flex items-center gap-1.5">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={settings.showPaws}
                    onChange={(event) =>
                      onSettingsChange("showPaws", event.currentTarget.checked)
                    }
                    className="accent-foreground size-3.5"
                  />
                  Show footprints
                </label>
                <ControlHelp
                  label="Show footprints"
                  description={controlDescriptions.showPaws}
                />
              </span>
              <span className="flex items-center gap-1.5">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={settings.showSpacingDebug}
                    onChange={(event) =>
                      onSettingsChange(
                        "showSpacingDebug",
                        event.currentTarget.checked,
                      )
                    }
                    className="accent-foreground size-3.5"
                  />
                  Show spacing
                </label>
                <ControlHelp
                  label="Show spacing"
                  description={controlDescriptions.showSpacingDebug}
                />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => onPausedChange(!paused)}
                    className="transition-transform duration-150 active:scale-[0.97]"
                  >
                    {paused ? "Resume spawning" : "Pause spawning"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {controlDescriptions.pause}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onReseed}
                    className="transition-transform duration-150 active:scale-[0.97]"
                  >
                    <RotateCcwIcon />
                    Clear &amp; reseed
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {controlDescriptions.reseed}
                </TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={onReset}
                  className="text-muted-foreground mt-2 w-full transition-transform duration-150 active:scale-[0.97]"
                >
                  Reset controls
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {controlDescriptions.reset}
              </TooltipContent>
            </Tooltip>
          </CardContent>
        )}
      </Card>
    </aside>
  );
}

const svgNamespace = "http://www.w3.org/2000/svg";
const minimumTrailSpawnDelay = 300;
const maximumTrailSpawnDelay = 900;

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothPath(points: Point[]) {
  const first = points[0];
  if (!first) return "";

  let path = `M ${first.x} ${first.y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)] ?? first;
    const current = points[index] ?? first;
    const next = points[index + 1] ?? current;
    const following = points[Math.min(points.length - 1, index + 2)] ?? next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    };

    path += ` C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${next.x} ${next.y}`;
  }

  return path;
}

class SpatialHash {
  private readonly cellSize: number;
  private readonly cells = new Map<string, (Point & { id: number })[]>();
  private readonly pointsByTrail = new Map<number, Point[]>();

  constructor(cellSize: number) {
    this.cellSize = Math.max(16, cellSize);
  }

  private key(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  insert(id: number, points: Point[]) {
    this.pointsByTrail.set(id, points);
    for (const point of points) {
      const key = this.key(point.x, point.y);
      const bucket = this.cells.get(key) ?? [];
      bucket.push({ ...point, id });
      this.cells.set(key, bucket);
    }
  }

  remove(id: number) {
    const points = this.pointsByTrail.get(id) ?? [];
    for (const point of points) {
      const key = this.key(point.x, point.y);
      const bucket = this.cells.get(key);
      if (!bucket) continue;

      const nextBucket = bucket.filter((entry) => entry.id !== id);
      if (nextBucket.length > 0) this.cells.set(key, nextBucket);
      else this.cells.delete(key);
    }
    this.pointsByTrail.delete(id);
  }

  hasNearby(points: Point[], distance: number) {
    const radius = Math.ceil(distance / this.cellSize);
    const distanceSquared = distance * distance;

    for (const point of points) {
      const cellX = Math.floor(point.x / this.cellSize);
      const cellY = Math.floor(point.y / this.cellSize);
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
          const bucket =
            this.cells.get(`${cellX + offsetX},${cellY + offsetY}`) ?? [];
          for (const occupied of bucket) {
            const deltaX = point.x - occupied.x;
            const deltaY = point.y - occupied.y;
            if (deltaX * deltaX + deltaY * deltaY < distanceSquared) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}

export function PawTrailBackground({
  className,
  showControls = false,
  controlsDefaultCollapsed = false,
  density = 2,
  spacing = 250,
  trailLength = 500,
  curvature = 0.55,
  walkInDuration = 1600,
  footprintDuration = 3000,
  fadeInDuration = 220,
  fadeOutDuration = 180,
  fadeInEasing = "cubic-bezier(0.16, 1, 0.3, 1)",
  fadeOutEasing = "cubic-bezier(0.42, 0, 1, 1)",
  overscan = 100,
  pawSpacing = 62,
  pawSize = 0.68,
  pawOffset = 11,
  color = "color-mix(in oklch, var(--muted-foreground) 14%, var(--background))",
  stepColor = "color-mix(in oklch, var(--muted-foreground) 28%, var(--background))",
  colorTransitionDuration = 800,
  showPaws = true,
  showSpacingDebug = false,
}: PawTrailBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const geometryLayerRef = useRef<SVGGElement>(null);
  const footprintLayerRef = useRef<SVGGElement>(null);
  const debugLayerRef = useRef<SVGGElement>(null);
  const footprintId = useId().replaceAll(":", "");
  const defaultSettings = useMemo<PawTrailSettings>(
    () => ({
      density,
      spacing,
      trailLength,
      curvature,
      walkInDuration,
      footprintDuration,
      fadeInDuration,
      fadeOutDuration,
      fadeInEasing,
      fadeOutEasing,
      overscan,
      pawSpacing,
      pawSize,
      pawOffset,
      color,
      showPaws,
      showSpacingDebug,
    }),
    [
      color,
      curvature,
      density,
      fadeInDuration,
      fadeInEasing,
      fadeOutDuration,
      fadeOutEasing,
      footprintDuration,
      overscan,
      pawOffset,
      pawSize,
      pawSpacing,
      showPaws,
      showSpacingDebug,
      spacing,
      trailLength,
      walkInDuration,
    ],
  );
  const [settings, setSettings] = useState(defaultSettings);
  const [controlsCollapsed, setControlsCollapsed] = useState(
    controlsDefaultCollapsed,
  );
  const [paused, setPaused] = useState(false);
  const [seed, setSeed] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = showControls && paused;
  }, [paused, showControls]);

  useEffect(() => {
    setSettings(defaultSettings);
  }, [defaultSettings]);

  function updateSetting<Key extends keyof PawTrailSettings>(
    key: Key,
    value: PawTrailSettings[Key],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  const {
    density: activeDensity,
    spacing: activeSpacing,
    trailLength: activeTrailLength,
    curvature: activeCurvature,
    walkInDuration: activeWalkInDuration,
    footprintDuration: activeFootprintDuration,
    fadeInDuration: activeFadeInDuration,
    fadeOutDuration: activeFadeOutDuration,
    fadeInEasing: activeFadeInEasing,
    fadeOutEasing: activeFadeOutEasing,
    overscan: activeOverscan,
    pawSpacing: activePawSpacing,
    pawSize: activePawSize,
    pawOffset: activePawOffset,
    showPaws: activeShowPaws,
    showSpacingDebug: activeShowSpacingDebug,
  } = settings;

  useEffect(() => {
    const svg = svgRef.current;
    const geometryLayer = geometryLayerRef.current;
    const footprintLayer = footprintLayerRef.current;
    const debugLayer = debugLayerRef.current;
    if (!svg || !geometryLayer || !footprintLayer || !debugLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const activeTrails = new Map<number, Trail>();
    let geometry: Geometry;
    let spatialHash = new SpatialHash(activeSpacing);
    let trailSequence = 0;
    let consecutiveMisses = 0;
    let resetTimeout: number | undefined;
    let schedulerTimeout: number | undefined;

    function updateGeometry() {
      geometry = {
        width: window.innerWidth + activeOverscan * 2,
        height: window.innerHeight + activeOverscan * 2,
        viewport: {
          left: activeOverscan,
          top: activeOverscan,
          right: activeOverscan + window.innerWidth,
          bottom: activeOverscan + window.innerHeight,
        },
      };

      svg?.setAttribute("viewBox", `0 0 ${geometry.width} ${geometry.height}`);
      svg?.setAttribute("width", String(geometry.width));
      svg?.setAttribute("height", String(geometry.height));
      if (svg) {
        svg.style.left = `${-activeOverscan}px`;
        svg.style.top = `${-activeOverscan}px`;
      }
    }

    function candidatePoints() {
      const start = {
        x: random(0, geometry.width),
        y: random(0, geometry.height),
        angle: random(0, Math.PI * 2),
      };
      const requestedLength = activeTrailLength * random(0.68, 1.12);
      const direction = {
        x: Math.cos(start.angle),
        y: Math.sin(start.angle),
      };
      const normal = { x: -direction.y, y: direction.x };
      const segments = Math.floor(random(6, 10));
      const phase = random(0, Math.PI * 2);
      const frequency = random(0.55, 1.1);
      const bend = requestedLength * 0.22 * activeCurvature;
      const points: Point[] = [];

      for (let index = 0; index <= segments; index += 1) {
        const progress = index / segments;
        const envelope = Math.sin(progress * Math.PI);
        const wave = Math.sin(progress * Math.PI * frequency + phase);
        const offset = bend * envelope * wave;
        points.push({
          x:
            start.x +
            direction.x * requestedLength * progress +
            normal.x * offset,
          y:
            start.y +
            direction.y * requestedLength * progress +
            normal.y * offset,
        });
      }

      return points;
    }

    function samplePath(path: SVGPathElement, length: number) {
      const step = clamp(activeSpacing * 0.34, 14, 34);
      const count = Math.max(8, Math.ceil(length / step));
      const points: Point[] = [];
      for (let index = 0; index <= count; index += 1) {
        const point = path.getPointAtLength((index / count) * length);
        points.push({ x: point.x, y: point.y });
      }
      return points;
    }

    function isUsefulCandidate(samples: Point[]) {
      const visibleSamples = samples.filter(
        (point) =>
          point.x >= geometry.viewport.left - 40 &&
          point.x <= geometry.viewport.right + 40 &&
          point.y >= geometry.viewport.top - 40 &&
          point.y <= geometry.viewport.bottom + 40,
      ).length;

      return visibleSamples >= Math.max(2, samples.length * 0.28);
    }

    function createPaws(path: SVGPathElement, length: number) {
      const group = document.createElementNS(svgNamespace, "g");
      group.setAttribute("fill", "currentColor");
      const paws: Paw[] = [];
      const edgeMargin = activePawSpacing * 0.42;
      let index = 0;

      if (activeShowPaws) {
        for (
          let distance = edgeMargin;
          distance < length - edgeMargin;
          distance += activePawSpacing
        ) {
          const point = path.getPointAtLength(distance);
          const before = path.getPointAtLength(Math.max(0, distance - 1));
          const after = path.getPointAtLength(Math.min(length, distance + 1));
          const deltaX = after.x - before.x;
          const deltaY = after.y - before.y;
          const magnitude = Math.hypot(deltaX, deltaY) || 1;
          const side = index % 2 === 0 ? -1 : 1;
          const x = point.x + (-deltaY / magnitude) * activePawOffset * side;
          const y = point.y + (deltaX / magnitude) * activePawOffset * side;
          const angle =
            Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90 + side * 5;

          const placement = document.createElementNS(svgNamespace, "g");
          placement.setAttribute(
            "transform",
            `translate(${x} ${y}) rotate(${angle}) scale(${activePawSize})`,
          );

          const footprint = document.createElementNS(svgNamespace, "use");
          footprint.setAttribute("href", `#${footprintId}`);
          footprint.style.opacity = reducedMotion.matches ? "1" : "0";
          footprint.style.fill = reducedMotion.matches
            ? "currentColor"
            : stepColor;
          footprint.style.transformBox = "fill-box";
          footprint.style.transformOrigin = "center";
          const fadeOutGroup = document.createElementNS(svgNamespace, "g");
          fadeOutGroup.style.transformBox = "fill-box";
          fadeOutGroup.style.transformOrigin = "center";
          fadeOutGroup.appendChild(footprint);
          placement.appendChild(fadeOutGroup);
          group.appendChild(placement);
          paws.push({
            element: footprint,
            fadeOutElement: fadeOutGroup,
            progress: distance / length,
          });
          index += 1;
        }
      }

      footprintLayer?.appendChild(group);
      return { group, paws };
    }

    function createDebugGroup(samples: Point[]) {
      const group = document.createElementNS(svgNamespace, "g");
      if (activeShowSpacingDebug) {
        for (let index = 0; index < samples.length; index += 2) {
          const sample = samples[index];
          if (!sample) continue;

          const circle = document.createElementNS(svgNamespace, "circle");
          circle.setAttribute("cx", String(sample.x));
          circle.setAttribute("cy", String(sample.y));
          circle.setAttribute("r", String(activeSpacing / 2));
          circle.setAttribute("fill", "currentColor");
          circle.setAttribute("fill-opacity", "0.15");
          circle.setAttribute("stroke", "currentColor");
          circle.setAttribute("stroke-opacity", "0.45");
          circle.setAttribute("stroke-width", "1");
          circle.setAttribute("vector-effect", "non-scaling-stroke");
          group.appendChild(circle);
        }
      }

      debugLayer?.appendChild(group);
      return group;
    }

    function getPawDelay(paw: Paw) {
      return Math.max(
        0,
        activeWalkInDuration * paw.progress - activeFadeInDuration * 0.55,
      );
    }

    function animatePaws(trail: Trail) {
      const duration = Math.max(
        activeFootprintDuration,
        activeFadeInDuration + activeFadeOutDuration,
      );

      for (const paw of trail.paws) {
        const delay = getPawDelay(paw);
        const fadeInAnimation = paw.element.animate(
          [
            {
              opacity: 0,
              transform: "translateY(-10%) scale(0.82)",
            },
            {
              opacity: 1,
              transform: "translateY(0) scale(1)",
            },
          ],
          {
            duration: activeFadeInDuration,
            delay,
            fill: "forwards",
            easing: activeFadeInEasing,
          },
        );
        const fadeOutAnimation = paw.fadeOutElement.animate(
          [
            { opacity: 1, transform: "translateY(0) scale(1)" },
            { opacity: 0, transform: "translateY(4%) scale(0.92)" },
          ],
          {
            duration: activeFadeOutDuration,
            delay: delay + duration - activeFadeOutDuration,
            fill: "forwards",
            easing: activeFadeOutEasing,
          },
        );
        const colorAnimation = paw.element.animate(
          [{ fill: stepColor }, { fill: "currentColor" }],
          {
            duration: colorTransitionDuration,
            delay: delay + activeFadeInDuration,
            fill: "forwards",
            easing: "cubic-bezier(0.77, 0, 0.175, 1)",
          },
        );
        trail.animations.push(
          fadeInAnimation,
          colorAnimation,
          fadeOutAnimation,
        );
      }
    }

    function removeTrail(id: number) {
      const trail = activeTrails.get(id);
      if (!trail) return;

      spatialHash.remove(id);
      for (const animation of trail.animations) animation.cancel();
      for (const timeout of trail.timeouts) window.clearTimeout(timeout);
      trail.path.remove();
      trail.pawGroup.remove();
      trail.debugGroup.remove();
      activeTrails.delete(id);
      consecutiveMisses = 0;
    }

    function startTrail(trail: Trail) {
      if (reducedMotion.matches) return;

      animatePaws(trail);
      const duration = Math.max(
        activeFootprintDuration,
        activeFadeInDuration + activeFadeOutDuration,
      );
      const lastPawDelay = trail.paws.reduce(
        (latest, paw) => Math.max(latest, getPawDelay(paw)),
        0,
      );
      trail.timeouts.push(
        window.setTimeout(() => removeTrail(trail.id), lastPawDelay + duration),
      );
    }

    function trySpawn() {
      const path = document.createElementNS(svgNamespace, "path");
      path.setAttribute("d", smoothPath(candidatePoints()));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "none");
      geometryLayer?.appendChild(path);

      const length = path.getTotalLength();
      const samples = samplePath(path, length);
      if (
        !isUsefulCandidate(samples) ||
        spatialHash.hasNearby(samples, activeSpacing)
      ) {
        path.remove();
        consecutiveMisses += 1;
        return false;
      }

      const id = trailSequence;
      trailSequence += 1;
      const pawTrail = createPaws(path, length);
      const debugGroup = createDebugGroup(samples);
      const trail: Trail = {
        id,
        path,
        pawGroup: pawTrail.group,
        debugGroup,
        paws: pawTrail.paws,
        animations: [],
        timeouts: [],
      };

      spatialHash.insert(id, samples);
      activeTrails.set(id, trail);
      consecutiveMisses = 0;
      startTrail(trail);
      return true;
    }

    function schedulerTick() {
      if (document.hidden || pausedRef.current) return;

      const safetyLimit = Math.round(18 + activeDensity * 18);
      if (
        activeTrails.size >= safetyLimit ||
        (activeTrails.size > 0 && consecutiveMisses >= 18)
      ) {
        return;
      }

      const attemptBudget = Math.max(1, Math.round(activeDensity * 5));
      for (let index = 0; index < attemptBudget; index += 1) {
        if (trySpawn()) break;
      }
    }

    function scheduleNextTrail() {
      schedulerTimeout = window.setTimeout(
        () => {
          schedulerTick();
          scheduleNextTrail();
        },
        random(minimumTrailSpawnDelay, maximumTrailSpawnDelay),
      );
    }

    function clearScene() {
      for (const trail of [...activeTrails.values()]) removeTrail(trail.id);
      spatialHash = new SpatialHash(activeSpacing);
      consecutiveMisses = 0;
      updateGeometry();
    }

    function scheduleReset() {
      window.clearTimeout(resetTimeout);
      resetTimeout = window.setTimeout(clearScene, 180);
    }

    updateGeometry();
    window.addEventListener("resize", scheduleReset);
    schedulerTick();
    scheduleNextTrail();

    return () => {
      window.clearTimeout(schedulerTimeout);
      window.clearTimeout(resetTimeout);
      window.removeEventListener("resize", scheduleReset);
      for (const trail of [...activeTrails.values()]) removeTrail(trail.id);
    };
  }, [
    activeCurvature,
    activeDensity,
    activeFadeInDuration,
    activeFadeInEasing,
    activeFadeOutDuration,
    activeFadeOutEasing,
    activeFootprintDuration,
    activeOverscan,
    activePawOffset,
    activePawSize,
    activePawSpacing,
    activeShowPaws,
    activeShowSpacingDebug,
    activeSpacing,
    activeTrailLength,
    activeWalkInDuration,
    colorTransitionDuration,
    footprintId,
    seed,
    stepColor,
  ]);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "text-foreground pointer-events-none fixed inset-0 z-0 overflow-hidden",
          className,
        )}
        style={{
          color: settings.color === "currentColor" ? undefined : settings.color,
        }}
      >
        <svg
          ref={svgRef}
          className="absolute block overflow-visible"
          xmlns={svgNamespace}
        >
          <defs>
            <g id={footprintId}>
              <path
                transform="translate(-50.5 -12.5)"
                d="M43 3.75C43 1.876 44.277 0 46.25 0s3.25 1.876 3.25 3.75-1.277 3.75-3.25 3.75S43 5.624 43 3.75M50.5 10a9 9 0 0 0-8.975 9.675c.142 1.914 1.265 3.276 2.703 4.122C45.643 24.63 47.405 25 49.055 25h2.89c1.65 0 3.412-.37 4.827-1.203 1.438-.846 2.56-2.208 2.703-4.122q.025-.334.025-.675a9 9 0 0 0-9-9m1-6.25C51.5 1.876 52.777 0 54.75 0S58 1.876 58 3.75 56.723 7.5 54.75 7.5 51.5 5.624 51.5 3.75m7 4.5c0-1.874 1.277-3.75 3.25-3.75S65 6.376 65 8.25 63.723 12 61.75 12s-3.25-1.876-3.25-3.75m-22.5 0c0-1.874 1.277-3.75 3.25-3.75s3.25 1.876 3.25 3.75S41.223 12 39.25 12 36 10.124 36 8.25"
              />
            </g>
          </defs>
          <g ref={geometryLayerRef} />
          <g ref={footprintLayerRef} />
          <g ref={debugLayerRef} />
        </svg>
      </div>

      {showControls && (
        <TooltipProvider delayDuration={500} skipDelayDuration={100}>
          <PawTrailControls
            settings={settings}
            collapsed={controlsCollapsed}
            paused={paused}
            onCollapsedChange={setControlsCollapsed}
            onPausedChange={setPaused}
            onSettingsChange={updateSetting}
            onReset={() => {
              setSettings(defaultSettings);
              setPaused(false);
            }}
            onReseed={() => setSeed((current) => current + 1)}
          />
        </TooltipProvider>
      )}
    </>
  );
}
