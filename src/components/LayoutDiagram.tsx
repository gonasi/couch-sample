import type { Module } from "../data/products";
import { shade } from "../lib/color";
import { footprint } from "../lib/layout";

const U = 64; // px per module

export interface ExtraModule extends Module {
  label?: string;
}

export type ModuleTone = "extra" | "selected" | "invalid" | "ghost";

/**
 * One module seen from above: base cushion plus back cushions on the sides in
 * `m.back`. Sizes scale with the cell, so it works in px (diagrams) or inches (room views).
 */
export function ModuleShape({
  m,
  x,
  y,
  w,
  h,
  color,
  tone,
}: {
  m: Pick<Module, "kind" | "back">;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  tone?: ModuleTone;
}) {
  const k = Math.min(w, h) / 60; // 1 at the diagram's 60px module
  const darkColor = color === "#22221F";
  const dark = shade(color, darkColor ? 40 : -38);
  const mid = shade(color, darkColor ? 18 : -14);
  const back = 12 * k;
  const inset = 3 * k;
  const fill = m.kind === "ottoman" ? mid : color;
  const extra = tone === "extra";
  const stroke =
    tone === "extra" || tone === "selected"
      ? "var(--accent)"
      : tone === "invalid"
        ? "#C2412D"
        : dark;
  return (
    <g
      style={{ transition: "opacity .2s" }}
      opacity={tone === "ghost" ? 0.55 : tone === "invalid" ? 0.8 : 1}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={(m.kind === "ottoman" ? 12 : 8) * k}
        fill={fill}
        stroke={stroke}
        strokeWidth={(tone && tone !== "ghost" ? 2 : 1.2) * k}
        strokeDasharray={
          extra || tone === "invalid" ? `${5 * k} ${4 * k}` : undefined
        }
        opacity={extra ? 0.85 : 1}
      />
      {m.back.includes("n") && (
        <rect x={x + inset} y={y + inset} width={w - inset * 2} height={back} rx={5 * k} fill={dark} opacity={0.55} />
      )}
      {m.back.includes("s") && (
        <rect x={x + inset} y={y + h - back - inset} width={w - inset * 2} height={back} rx={5 * k} fill={dark} opacity={0.55} />
      )}
      {m.back.includes("w") && (
        <rect x={x + inset} y={y + inset} width={back} height={h - inset * 2} rx={5 * k} fill={dark} opacity={0.55} />
      )}
      {m.back.includes("e") && (
        <rect x={x + w - back - inset} y={y + inset} width={back} height={h - inset * 2} rx={5 * k} fill={dark} opacity={0.55} />
      )}
      {extra && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 4 * k}
          textAnchor="middle"
          fontSize={10 * k}
          fill="var(--accent)"
          fontFamily="var(--body)"
          style={{ letterSpacing: ".06em" }}
        >
          + ADD
        </text>
      )}
    </g>
  );
}

/** Top-down diagram of a modular layout. Extra (add-on) modules render dashed. */
export default function LayoutDiagram({
  modules,
  extras = [],
  color,
  showDims = true,
  widthLabel,
  depthLabel,
  maxWidth = 420,
  maxHeight,
}: {
  modules: Module[];
  extras?: ExtraModule[];
  color: string;
  showDims?: boolean;
  widthLabel?: string;
  depthLabel?: string;
  maxWidth?: number;
  maxHeight?: number;
}) {
  const all = [...modules, ...extras];
  const cols = Math.max(...all.map((m) => m.x)) + 1;
  const rows = Math.max(...all.map((m) => m.y)) + 1;
  const pad = showDims ? 34 : 6;
  const W = cols * U + pad * 2;
  const H = rows * U + pad * 2;

  const drawModule = (m: Module, i: number, extra = false) => (
    <ModuleShape
      key={`${extra ? "e" : "m"}${i}`}
      m={m}
      x={pad + m.x * U + 2}
      y={pad + m.y * U + 2}
      w={U - 4}
      h={U - 4}
      color={color}
      tone={extra ? "extra" : undefined}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: "100%",
        maxWidth,
        maxHeight,
        height: "auto",
        display: "block",
        margin: "0 auto",
      }}
      role="img"
      aria-label="Top-down layout diagram"
    >
      {showDims && (
        <g
          fontFamily="var(--mono)"
          fontSize="10"
          fill="var(--muted)"
          style={{ letterSpacing: ".08em" }}
        >
          <line x1={pad} y1={pad - 16} x2={pad + cols * U} y2={pad - 16} stroke="var(--muted)" strokeWidth={0.8} />
          <line x1={pad} y1={pad - 20} x2={pad} y2={pad - 12} stroke="var(--muted)" strokeWidth={0.8} />
          <line x1={pad + cols * U} y1={pad - 20} x2={pad + cols * U} y2={pad - 12} stroke="var(--muted)" strokeWidth={0.8} />
          <text x={pad + (cols * U) / 2} y={pad - 21} textAnchor="middle">
            {widthLabel}
          </text>
          <line x1={pad - 16} y1={pad} x2={pad - 16} y2={pad + rows * U} stroke="var(--muted)" strokeWidth={0.8} />
          <text
            x={pad - 21}
            y={pad + (rows * U) / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${pad - 21} ${pad + (rows * U) / 2})`}
          >
            {depthLabel}
          </text>
        </g>
      )}
      {modules.map((m, i) => drawModule(m, i))}
      {extras.map((m, i) => drawModule(m, i, true))}
    </svg>
  );
}

export function dimsFromLayout(modules: Module[]) {
  const fp = footprint(modules);
  return { width: `${fp.widthIn}"`, depth: `${fp.depthIn}"` };
}
