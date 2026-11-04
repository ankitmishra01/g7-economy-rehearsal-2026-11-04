"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Observation } from "@/lib/observations";

const COUNTRIES: Record<string, string> = {
  CAN: "Canada",
  FRA: "France",
  DEU: "Germany",
  ITA: "Italy",
  JPN: "Japan",
  GBR: "United Kingdom",
  USA: "United States",
};

const SERIES = [
  { key: "inflation", label: "Inflation", color: "var(--series-1)" },
  { key: "unemployment", label: "Unemployment", color: "var(--series-2)" },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];
type Point = { year: number; value: number };

const fmt = (v: number) => `${v.toFixed(1)}%`;

export default function Dashboard({
  observations,
}: {
  observations: Observation[];
}) {
  const [country, setCountry] = useState("CAN");

  const series = useMemo(() => {
    const out: Record<SeriesKey, Point[]> = { inflation: [], unemployment: [] };
    for (const o of observations) {
      if (o.country === country)
        out[o.indicator].push({ year: o.year, value: o.value });
    }
    for (const k of Object.keys(out) as SeriesKey[])
      out[k].sort((a, b) => a.year - b.year);
    return out;
  }, [observations, country]);

  const latest = useMemo(() => {
    const out: Record<string, Partial<Record<SeriesKey, Point>>> = {};
    for (const o of observations) {
      const row = (out[o.country] ??= {});
      const cur = row[o.indicator];
      if (!cur || o.year > cur.year)
        row[o.indicator] = { year: o.year, value: o.value };
    }
    return out;
  }, [observations]);

  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <label
          htmlFor="country"
          className="text-sm text-[var(--text-secondary)]"
        >
          Country
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-sm"
        >
          {Object.entries(COUNTRIES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-6">
        <h2 className="text-base font-medium">{COUNTRIES[country]}</h2>
        <ul className="mt-2 flex gap-5 text-sm text-[var(--text-secondary)]">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-4 rounded"
                style={{ background: s.color }}
              />
              {s.label}
            </li>
          ))}
        </ul>
        <LineChart series={series} />
      </section>

      <section className="mt-8">
        <h2 className="text-base font-medium">Latest values</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
                <th className="py-2 pr-4 font-medium">Country</th>
                <th className="py-2 pr-4 text-right font-medium">Inflation</th>
                <th className="py-2 text-right font-medium">Unemployment</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(COUNTRIES).map(([code, name]) => (
                <tr
                  key={code}
                  onClick={() => setCountry(code)}
                  className={`cursor-pointer border-b border-[var(--border)] ${
                    code === country
                      ? "bg-[var(--highlight)] font-medium"
                      : "hover:bg-[var(--highlight)]"
                  }`}
                >
                  <td className="py-2 pr-4">{name}</td>
                  {SERIES.map((s) => {
                    const p = latest[code]?.[s.key];
                    return (
                      <td
                        key={s.key}
                        className="py-2 pr-4 text-right last:pr-0"
                      >
                        {p ? fmt(p.value) : "—"}
                        {p && (
                          <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {p.year}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Source:{" "}
          <a
            href="https://data.worldbank.org/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            World Bank
          </a>
        </p>
      </section>
    </>
  );
}

function LineChart({ series }: { series: Record<SeriesKey, Point[]> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 300;
  const compact = width < 520;
  const m = { top: 12, right: compact ? 48 : 136, bottom: 28, left: 36 };
  const innerW = Math.max(width - m.left - m.right, 100);
  const innerH = height - m.top - m.bottom;

  const all = [...series.inflation, ...series.unemployment];
  const years = all.map((p) => p.year);
  const x0 = Math.min(...years);
  const x1 = Math.max(...years);
  const values = all.map((p) => p.value);
  const step = niceStep(Math.max(...values, 0) - Math.min(...values, 0));
  const y0 = Math.floor(Math.min(...values, 0) / step) * step;
  const y1 = Math.ceil(Math.max(...values, 0) / step) * step;

  const x = (yr: number) => m.left + ((yr - x0) / (x1 - x0 || 1)) * innerW;
  const y = (v: number) => m.top + (1 - (v - y0) / (y1 - y0 || 1)) * innerH;

  const yTicks: number[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += step)
    yTicks.push(Math.round(v * 10) / 10);
  const xTicks = years.length
    ? Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).filter(
        (yr) => (yr - x0) % (innerW < 420 ? 5 : 2) === 0,
      )
    : [];

  // End-of-line labels, nudged apart if they collide.
  const ends = SERIES.map((s) => {
    const pts = series[s.key];
    const last = pts[pts.length - 1];
    return last ? { ...s, last, ly: y(last.value) } : null;
  }).filter((e) => e !== null);
  if (ends.length === 2 && Math.abs(ends[0].ly - ends[1].ly) < 16) {
    const mid = (ends[0].ly + ends[1].ly) / 2;
    const [hi, lo] =
      ends[0].ly < ends[1].ly ? [ends[0], ends[1]] : [ends[1], ends[0]];
    hi.ly = mid - 8;
    lo.ly = mid + 8;
  }

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const yr = Math.round(
      x0 + ((e.clientX - rect.left) / rect.width) * (x1 - x0),
    );
    setHoverYear(Math.min(x1, Math.max(x0, yr)));
  }

  const hover =
    hoverYear === null
      ? null
      : SERIES.map((s) => ({
          ...s,
          p: series[s.key].find((p) => p.year === hoverYear),
        }));

  if (!all.length) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-muted)]">
        No data.
      </p>
    );
  }

  return (
    <div
      ref={ref}
      className="relative mt-4 overflow-hidden"
      style={{ minHeight: height }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Line chart of inflation and unemployment by year"
        >
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={m.left}
                x2={m.left + innerW}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 0 ? "var(--axis)" : "var(--grid)"}
                strokeWidth={1}
              />
              <text
                x={m.left - 8}
                y={y(v)}
                dy="0.32em"
                textAnchor="end"
                className="fill-[var(--text-muted)] text-[11px]"
              >
                {v}%
              </text>
            </g>
          ))}
          {xTicks.map((yr) => (
            <text
              key={yr}
              x={x(yr)}
              y={height - 8}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[11px]"
            >
              {yr}
            </text>
          ))}

          {hoverYear !== null && (
            <line
              x1={x(hoverYear)}
              x2={x(hoverYear)}
              y1={m.top}
              y2={m.top + innerH}
              stroke="var(--axis)"
              strokeWidth={1}
            />
          )}

          {SERIES.map((s) => (
            <path
              key={s.key}
              d={series[s.key]
                .map((p, i) => `${i ? "L" : "M"}${x(p.year)},${y(p.value)}`)
                .join("")}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {ends.map((e) => (
            <text
              key={e.key}
              x={x(e.last.year) + 8}
              y={e.ly}
              dy="0.32em"
              className="fill-[var(--text-secondary)] text-[12px]"
            >
              {compact ? fmt(e.last.value) : `${e.label} ${fmt(e.last.value)}`}
            </text>
          ))}

          {hover?.map(
            (h) =>
              h.p && (
                <circle
                  key={h.key}
                  cx={x(h.p.year)}
                  cy={y(h.p.value)}
                  r={4.5}
                  fill={h.color}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                />
              ),
          )}

          <rect
            x={m.left}
            y={m.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHoverYear(null)}
          />
        </svg>
      )}

      {hover && hoverYear !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-xs shadow-sm"
          style={{
            left: x(hoverYear) > width / 2 ? undefined : x(hoverYear) + 12,
            right:
              x(hoverYear) > width / 2 ? width - x(hoverYear) + 12 : undefined,
          }}
        >
          <div className="font-medium">{hoverYear}</div>
          {hover.map((h) => (
            <div
              key={h.key}
              className="mt-1 flex items-center gap-2 text-[var(--text-secondary)]"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: h.color }}
              />
              {h.label}
              <span className="ml-auto pl-3 tabular-nums text-[var(--text-primary)]">
                {h.p ? fmt(h.p.value) : "n/a"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function niceStep(range: number) {
  const raw = range / 5 || 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}
