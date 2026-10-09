// src/components/dashboard/TrendChart.tsx — new customers over time (single line, hover tooltip)
"use client";

import { formatDay } from "@/lib/dashboard/dashboard-data";
import { useMemo, useRef, useState } from "react";

export type TrendPoint = { key: string; label: string; value: number };

const W = 640;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 28, left: 34 };

export default function TrendChart({ points }: { points: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { max, ticks, x, y, path, area } = useMemo(() => {
    const raw = Math.max(1, ...points.map((p) => p.value));
    const step = Math.max(1, Math.ceil(raw / 4 / 5) * 5);
    const max = step * 4;
    const ticks = [0, step, step * 2, step * 3, max];
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
    const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
    const area = points.length
      ? `${path} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`
      : "";
    return { max, ticks, x, y, path, area };
  }, [points]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    points.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
    setHover(best);
  };

  // Show ~6 x-axis labels whatever the range
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={`New customers over time, highest ${Math.max(0, ...points.map((p) => p.value))} per period`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-gray-200" strokeDasharray={t ? "3 4" : undefined} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-gray-400 text-[11px]">{t}</text>
          </g>
        ))}

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.key} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} className="fill-gray-400 text-[11px]">
              {p.label}
            </text>
          ) : null,
        )}

        <path d={area} fill="url(#trendFill)" />
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {active && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="currentColor" className="text-gray-300" />
            <circle cx={x(hover)} cy={y(active.value)} r={5} fill="var(--color-primary)" stroke="white" strokeWidth={2} />
          </g>
        )}
      </svg>

      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{ left: `clamp(70px, ${(x(hover) / W) * 100}%, calc(100% - 70px))` }}
        >
          <p className="text-gray-500">{active.label}</p>
          <p className="mt-0.5 font-semibold text-gray-900">{active.value} new {active.value === 1 ? "customer" : "customers"}</p>
        </div>
      )}
      <span className="sr-only">Maximum on scale: {max}</span>
    </div>
  );
}

// Group daily counts into days (short ranges) or weeks (long ranges)
export function buildTrend(dates: string[], from: string, to: string, days: number): TrendPoint[] {
  const counts = new Map<string, number>();
  dates.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1));

  const weekly = days > 45;
  const points: TrendPoint[] = [];
  const step = weekly ? 7 : 1;
  for (let i = 0; i <= days; i += step) {
    const start = addDaysLocal(from, i);
    let value = 0;
    for (let j = 0; j < step && i + j <= days; j++) value += counts.get(addDaysLocal(from, i + j)) ?? 0;
    points.push({ key: start, label: weekly ? `Week of ${formatDay(start)}` : formatDay(start), value });
  }
  void to;
  return points;
}

function addDaysLocal(key: string, n: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}