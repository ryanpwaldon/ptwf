"use client";

import type { SVGProps } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronDownIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Input } from "@acme/ui/input";

interface ArchedBadgeSettings {
  curve: number;
  fontSize: number;
  fontWeight: number;
  label: string;
  letterSpacing: number;
  pillHeight: number;
  shadowBlur: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  strokeLength: number;
  verticalTextOffset: number;
}

export interface ArchedBadgeProps
  extends Omit<
    SVGProps<SVGSVGElement>,
    "children" | "fontSize" | "fontWeight"
  > {
  controlsDefaultCollapsed?: boolean;
  curve?: number;
  fontSize?: number;
  fontWeight?: number;
  label: string;
  letterSpacing?: number;
  pillHeight?: number;
  shadowBlur?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  showControls?: boolean;
  strokeLength?: number;
  verticalTextOffset?: number;
}

interface RangeControlProps {
  format?: (value: number) => string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}

function RangeControl({
  format = String,
  label,
  max,
  min,
  onChange,
  step,
  value,
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

interface ArchedBadgeControlsProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onReset: () => void;
  onSettingsChange: <Key extends keyof ArchedBadgeSettings>(
    key: Key,
    value: ArchedBadgeSettings[Key],
  ) => void;
  settings: ArchedBadgeSettings;
}

function ArchedBadgeControls({
  collapsed,
  onCollapsedChange,
  onReset,
  onSettingsChange,
  settings,
}: ArchedBadgeControlsProps) {
  return (
    <aside className="fixed bottom-4 left-4 z-50 max-h-[calc(100dvh-2rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto">
      <Card
        size="sm"
        className="bg-card/90 gap-0 overflow-hidden shadow-xl backdrop-blur-xl"
      >
        <CardHeader className="grid-cols-[1fr_auto] items-center">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontalIcon className="size-4" />
            Arched badge controls
          </CardTitle>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={
              collapsed
                ? "Expand arched badge controls"
                : "Collapse arched badge controls"
            }
            aria-expanded={!collapsed}
            onClick={() => onCollapsedChange(!collapsed)}
            className="transition-transform duration-150 active:scale-[0.97]"
          >
            <ChevronDownIcon
              className={cn(
                "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </CardHeader>

        {!collapsed && (
          <CardContent className="border-border/70 mt-3 border-t pt-3">
            <label className="grid gap-1.5 text-xs font-medium">
              <span>Badge text</span>
              <Input
                value={settings.label}
                onChange={(event) =>
                  onSettingsChange("label", event.currentTarget.value)
                }
                className="h-7 text-xs"
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
              <RangeControl
                label="Font size"
                value={settings.fontSize}
                min={10}
                max={36}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("fontSize", value)}
              />
              <RangeControl
                label="Font weight"
                value={settings.fontWeight}
                min={300}
                max={800}
                step={100}
                onChange={(value) => onSettingsChange("fontWeight", value)}
              />
              <RangeControl
                label="Letter spacing"
                value={settings.letterSpacing}
                min={-2}
                max={6}
                step={0.1}
                format={(value) => `${value.toFixed(1)}px`}
                onChange={(value) => onSettingsChange("letterSpacing", value)}
              />
              <RangeControl
                label="Stroke width"
                value={settings.pillHeight}
                min={16}
                max={64}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("pillHeight", value)}
              />
              <RangeControl
                label="Stroke length"
                value={settings.strokeLength}
                min={0}
                max={120}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("strokeLength", value)}
              />
              <RangeControl
                label="Arc height"
                value={settings.curve}
                min={0}
                max={64}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("curve", value)}
              />
              <RangeControl
                label="Vertical text offset"
                value={settings.verticalTextOffset}
                min={-8}
                max={12}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) =>
                  onSettingsChange("verticalTextOffset", value)
                }
              />
              <RangeControl
                label="Shadow blur"
                value={settings.shadowBlur}
                min={0}
                max={16}
                step={0.5}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("shadowBlur", value)}
              />
              <RangeControl
                label="Shadow offset"
                value={settings.shadowOffsetY}
                min={-8}
                max={16}
                step={1}
                format={(value) => `${value}px`}
                onChange={(value) => onSettingsChange("shadowOffsetY", value)}
              />
              <RangeControl
                label="Shadow opacity"
                value={settings.shadowOpacity}
                min={0}
                max={0.5}
                step={0.01}
                format={(value) => `${Math.round(value * 100)}%`}
                onChange={(value) => onSettingsChange("shadowOpacity", value)}
              />
            </div>

            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={onReset}
              className="text-muted-foreground mt-4 w-full transition-transform duration-150 active:scale-[0.97]"
            >
              <RotateCcwIcon />
              Reset controls
            </Button>
          </CardContent>
        )}
      </Card>
    </aside>
  );
}

export function ArchedBadge({
  className,
  controlsDefaultCollapsed = false,
  curve = 18,
  fontSize = 16,
  fontWeight = 500,
  label,
  letterSpacing = -0.2,
  pillHeight = 29,
  shadowBlur = 4,
  shadowOffsetY = 2,
  shadowOpacity = 0.1,
  showControls = false,
  strokeLength = 16,
  verticalTextOffset = 6,
  ...props
}: ArchedBadgeProps) {
  const pathId = `arched-badge-path-${useId().replaceAll(":", "")}`;
  const shadowId = `arched-badge-shadow-${useId().replaceAll(":", "")}`;
  const measureRef = useRef<SVGTextElement>(null);
  const defaultSettings = useMemo<ArchedBadgeSettings>(
    () => ({
      curve,
      fontSize,
      fontWeight,
      label,
      letterSpacing,
      pillHeight,
      shadowBlur,
      shadowOffsetY,
      shadowOpacity,
      strokeLength,
      verticalTextOffset,
    }),
    [
      curve,
      fontSize,
      fontWeight,
      label,
      letterSpacing,
      pillHeight,
      shadowBlur,
      shadowOffsetY,
      shadowOpacity,
      strokeLength,
      verticalTextOffset,
    ],
  );
  const [settings, setSettings] = useState(defaultSettings);
  const [controlsCollapsed, setControlsCollapsed] = useState(
    controlsDefaultCollapsed,
  );
  const [textWidth, setTextWidth] = useState(() =>
    Math.max(
      fontSize,
      label.length * fontSize * 0.52 +
        Math.max(0, label.length - 1) * letterSpacing,
    ),
  );

  useEffect(() => {
    setSettings(defaultSettings);
  }, [defaultSettings]);

  const {
    curve: activeCurve,
    fontSize: activeFontSize,
    fontWeight: activeFontWeight,
    label: activeLabel,
    letterSpacing: activeLetterSpacing,
    pillHeight: activePillHeight,
    shadowBlur: activeShadowBlur,
    shadowOffsetY: activeShadowOffsetY,
    shadowOpacity: activeShadowOpacity,
    strokeLength: activeStrokeLength,
    verticalTextOffset: activeVerticalTextOffset,
  } = settings;

  useEffect(() => {
    const text = measureRef.current;
    if (!text) return;

    function updateWidth() {
      const element = measureRef.current;
      if (!element) return;
      const nextWidth = Math.ceil(element.getComputedTextLength());
      setTextWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth,
      );
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(text);
    void document.fonts.ready.then(updateWidth);

    return () => observer.disconnect();
  }, [activeFontSize, activeFontWeight, activeLabel, activeLetterSpacing]);

  function updateSetting<Key extends keyof ArchedBadgeSettings>(
    key: Key,
    value: ArchedBadgeSettings[Key],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  const radius = activePillHeight / 2;
  const width = Math.ceil(
    Math.max(textWidth + activeStrokeLength, activePillHeight + 1),
  );
  const chordWidth = width - activePillHeight;
  const rise = Math.min(Math.max(0, activeCurve), chordWidth / 2);
  const startX = radius;
  const endX = startX + chordWidth;
  const centerY = rise + radius;
  const height = Math.ceil(centerY + radius);
  const shadowSpread = Math.ceil(activeShadowBlur * 3);
  const shadowPaddingX = shadowSpread;
  const shadowPaddingTop = shadowSpread + Math.max(0, -activeShadowOffsetY);
  const shadowPaddingBottom = shadowSpread + Math.max(0, activeShadowOffsetY);
  const renderedWidth = width + shadowPaddingX * 2;
  const renderedHeight = height + shadowPaddingTop + shadowPaddingBottom;
  const arcRadius = rise > 0 ? chordWidth ** 2 / (8 * rise) + rise / 2 : 0;
  const centerline =
    rise > 0
      ? `M ${startX} ${centerY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${centerY}`
      : `M ${startX} ${centerY} L ${endX} ${centerY}`;

  return (
    <>
      <svg
        {...props}
        className={cn("block overflow-visible select-none", className)}
        viewBox={`${-shadowPaddingX} ${-shadowPaddingTop} ${renderedWidth} ${renderedHeight}`}
        width={renderedWidth}
        height={renderedHeight}
        aria-hidden="true"
      >
        <defs>
          <path id={pathId} d={centerline} />
          <filter
            id={shadowId}
            filterUnits="userSpaceOnUse"
            x={-shadowPaddingX}
            y={-shadowPaddingTop}
            width={renderedWidth}
            height={renderedHeight}
          >
            <feDropShadow
              className="text-black"
              dx="0"
              dy={activeShadowOffsetY}
              stdDeviation={activeShadowBlur}
              floodColor="currentColor"
              floodOpacity={activeShadowOpacity}
            />
          </filter>
        </defs>
        <path
          className="stroke-sticker-surface fill-none [stroke-linecap:round]"
          d={centerline}
          filter={`url(#${shadowId})`}
          strokeWidth={activePillHeight}
        />
        <text
          className="fill-sticker-foreground font-sans"
          dy={activeVerticalTextOffset}
          fontSize={activeFontSize}
          fontWeight={activeFontWeight}
          letterSpacing={activeLetterSpacing}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {activeLabel}
          </textPath>
        </text>
        <text
          ref={measureRef}
          className="invisible fill-transparent font-sans"
          fontSize={activeFontSize}
          fontWeight={activeFontWeight}
          letterSpacing={activeLetterSpacing}
        >
          {activeLabel}
        </text>
      </svg>

      {showControls && (
        <ArchedBadgeControls
          settings={settings}
          collapsed={controlsCollapsed}
          onCollapsedChange={setControlsCollapsed}
          onSettingsChange={updateSetting}
          onReset={() => setSettings(defaultSettings)}
        />
      )}
    </>
  );
}
