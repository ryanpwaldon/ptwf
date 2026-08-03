"use client";

import { useEffect, useId, useRef } from "react";

import { cn } from "@acme/ui";

interface Point {
  x: number;
  y: number;
}

interface Paw {
  element: SVGUseElement;
  progress: number;
}

interface Trail {
  id: number;
  path: SVGPathElement;
  pawGroup: SVGGElement;
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
  density?: number;
  spacing?: number;
  trailLength?: number;
  curvature?: number;
  walkInDuration?: number;
  holdDuration?: number;
  walkOutDuration?: number;
  overscan?: number;
  pawSpacing?: number;
  pawSize?: number;
  pawOffset?: number;
}

const svgNamespace = "http://www.w3.org/2000/svg";

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
  density = 0.8,
  spacing = 82,
  trailLength = 500,
  curvature = 0.55,
  walkInDuration = 1600,
  holdDuration = 2600,
  walkOutDuration = 1400,
  overscan = 220,
  pawSpacing = 62,
  pawSize = 0.68,
  pawOffset = 11,
}: PawTrailBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const geometryLayerRef = useRef<SVGGElement>(null);
  const footprintLayerRef = useRef<SVGGElement>(null);
  const footprintId = useId().replaceAll(":", "");

  useEffect(() => {
    const svg = svgRef.current;
    const geometryLayer = geometryLayerRef.current;
    const footprintLayer = footprintLayerRef.current;
    if (!svg || !geometryLayer || !footprintLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const activeTrails = new Map<number, Trail>();
    let geometry: Geometry;
    let spatialHash = new SpatialHash(spacing);
    let trailSequence = 0;
    let consecutiveMisses = 0;
    let resetTimeout: number | undefined;

    function updateGeometry() {
      geometry = {
        width: window.innerWidth + overscan * 2,
        height: window.innerHeight + overscan * 2,
        viewport: {
          left: overscan,
          top: overscan,
          right: overscan + window.innerWidth,
          bottom: overscan + window.innerHeight,
        },
      };

      svg?.setAttribute("viewBox", `0 0 ${geometry.width} ${geometry.height}`);
      svg?.setAttribute("width", String(geometry.width));
      svg?.setAttribute("height", String(geometry.height));
      if (svg) {
        svg.style.left = `${-overscan}px`;
        svg.style.top = `${-overscan}px`;
      }
    }

    function candidatePoints() {
      const start = {
        x: random(0, geometry.width),
        y: random(0, geometry.height),
        angle: random(0, Math.PI * 2),
      };
      const requestedLength = trailLength * random(0.68, 1.12);
      const direction = {
        x: Math.cos(start.angle),
        y: Math.sin(start.angle),
      };
      const normal = { x: -direction.y, y: direction.x };
      const segments = Math.floor(random(6, 10));
      const phase = random(0, Math.PI * 2);
      const frequency = random(0.55, 1.1);
      const bend = requestedLength * 0.22 * curvature;
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
      const step = clamp(spacing * 0.34, 14, 34);
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
      const edgeMargin = pawSpacing * 0.42;
      let index = 0;

      for (
        let distance = edgeMargin;
        distance < length - edgeMargin;
        distance += pawSpacing
      ) {
        const point = path.getPointAtLength(distance);
        const before = path.getPointAtLength(Math.max(0, distance - 1));
        const after = path.getPointAtLength(Math.min(length, distance + 1));
        const deltaX = after.x - before.x;
        const deltaY = after.y - before.y;
        const magnitude = Math.hypot(deltaX, deltaY) || 1;
        const side = index % 2 === 0 ? -1 : 1;
        const x = point.x + (-deltaY / magnitude) * pawOffset * side;
        const y = point.y + (deltaX / magnitude) * pawOffset * side;
        const angle =
          Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90 + side * 5;

        const placement = document.createElementNS(svgNamespace, "g");
        placement.setAttribute(
          "transform",
          `translate(${x} ${y}) rotate(${angle}) scale(${pawSize})`,
        );

        const footprint = document.createElementNS(svgNamespace, "use");
        footprint.setAttribute("href", `#${footprintId}`);
        footprint.style.opacity = reducedMotion.matches ? "1" : "0";
        footprint.style.transformBox = "fill-box";
        footprint.style.transformOrigin = "center";
        placement.appendChild(footprint);
        group.appendChild(placement);
        paws.push({ element: footprint, progress: distance / length });
        index += 1;
      }

      footprintLayer?.appendChild(group);
      return { group, paws };
    }

    function animatePawsIn(trail: Trail) {
      for (const paw of trail.paws) {
        const duration = 220;
        const delay = Math.max(
          0,
          walkInDuration * paw.progress - duration * 0.55,
        );
        const animation = paw.element.animate(
          [
            { opacity: 0, transform: "translateY(-10%) scale(0.82)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          {
            duration,
            delay,
            fill: "forwards",
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          },
        );
        trail.animations.push(animation);
      }
    }

    function animatePawsOut(trail: Trail) {
      for (const paw of trail.paws) {
        const animation = paw.element.animate(
          [
            { opacity: 1, transform: "translateY(0) scale(1)" },
            { opacity: 0, transform: "translateY(4%) scale(0.92)" },
          ],
          {
            duration: 180,
            delay: walkOutDuration * paw.progress,
            fill: "forwards",
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          },
        );
        trail.animations.push(animation);
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
      activeTrails.delete(id);
      consecutiveMisses = 0;
    }

    function startTrail(trail: Trail) {
      if (reducedMotion.matches) return;

      animatePawsIn(trail);
      trail.timeouts.push(
        window.setTimeout(
          () => animatePawsOut(trail),
          walkInDuration + holdDuration,
        ),
        window.setTimeout(
          () => removeTrail(trail.id),
          walkInDuration + holdDuration + walkOutDuration + 180,
        ),
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
        spatialHash.hasNearby(samples, spacing)
      ) {
        path.remove();
        consecutiveMisses += 1;
        return false;
      }

      const id = trailSequence;
      trailSequence += 1;
      const pawTrail = createPaws(path, length);
      const trail: Trail = {
        id,
        path,
        pawGroup: pawTrail.group,
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
      if (document.hidden) return;

      const safetyLimit = Math.round(18 + density * 18);
      if (
        activeTrails.size >= safetyLimit ||
        (activeTrails.size > 0 && consecutiveMisses >= 18)
      ) {
        return;
      }

      const attemptBudget = Math.max(1, Math.round(density * 5));
      for (let index = 0; index < attemptBudget; index += 1) {
        if (trySpawn()) break;
      }
    }

    function clearScene() {
      for (const trail of [...activeTrails.values()]) removeTrail(trail.id);
      spatialHash = new SpatialHash(spacing);
      consecutiveMisses = 0;
      updateGeometry();
    }

    function scheduleReset() {
      window.clearTimeout(resetTimeout);
      resetTimeout = window.setTimeout(clearScene, 180);
    }

    updateGeometry();
    const scheduler = window.setInterval(schedulerTick, 170);
    window.addEventListener("resize", scheduleReset);
    schedulerTick();

    return () => {
      window.clearInterval(scheduler);
      window.clearTimeout(resetTimeout);
      window.removeEventListener("resize", scheduleReset);
      for (const trail of [...activeTrails.values()]) removeTrail(trail.id);
    };
  }, [
    curvature,
    density,
    footprintId,
    holdDuration,
    overscan,
    pawOffset,
    pawSize,
    pawSpacing,
    spacing,
    trailLength,
    walkInDuration,
    walkOutDuration,
  ]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "text-foreground/10 pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
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
      </svg>
    </div>
  );
}
