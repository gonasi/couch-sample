import type { Module } from "../data/products";

const U = 64; // px per module
const BACK = 12;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  const r = c((n >> 16) & 255);
  const g = c((n >> 8) & 255);
  const b = c(n & 255);
  return `rgb(${r},${g},${b})`;
}

export interface ExtraModule extends Module {
  label?: string;
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
}: {
  modules: Module[];
  extras?: ExtraModule[];
  color: string;
  showDims?: boolean;
  widthLabel?: string;
  depthLabel?: string;
  maxWidth?: number;
}) {
  const all = [...modules, ...extras];
  const cols = Math.max(...all.map((m) => m.x)) + 1;
  const rows = Math.max(...all.map((m) => m.y)) + 1;
  const pad = showDims ? 34 : 6;
  const W = cols * U + pad * 2;
  const H = rows * U + pad * 2;
  const dark = shade(color, color === "#22221F" ? 40 : -38);
  const mid = shade(color, color === "#22221F" ? 18 : -14);

  const drawModule = (m: Module, i: number, extra = false) => {
    const x = pad + m.x * U + 2;
    const y = pad + m.y * U + 2;
    const s = U - 4;
    const fill = m.kind === "ottoman" ? mid : color;
    return (
      <g key={`${extra ? "e" : "m"}${i}`} style={{ transition: "all .3s" }}>
        <rect
          x={x}
          y={y}
          width={s}
          height={s}
          rx={m.kind === "ottoman" ? 12 : 8}
          fill={fill}
          stroke={extra ? "var(--accent)" : dark}
          strokeWidth={extra ? 2 : 1.2}
          strokeDasharray={extra ? "5 4" : undefined}
          opacity={extra ? 0.85 : 1}
        />
        {m.back.includes("n") && (
          <rect
            x={x + 3}
            y={y + 3}
            width={s - 6}
            height={BACK}
            rx={5}
            fill={dark}
            opacity={0.55}
          />
        )}
        {m.back.includes("s") && (
          <rect
            x={x + 3}
            y={y + s - BACK - 3}
            width={s - 6}
            height={BACK}
            rx={5}
            fill={dark}
            opacity={0.55}
          />
        )}
        {m.back.includes("w") && (
          <rect
            x={x + 3}
            y={y + 3}
            width={BACK}
            height={s - 6}
            rx={5}
            fill={dark}
            opacity={0.55}
          />
        )}
        {m.back.includes("e") && (
          <rect
            x={x + s - BACK - 3}
            y={y + 3}
            width={BACK}
            height={s - 6}
            rx={5}
            fill={dark}
            opacity={0.55}
          />
        )}
        {extra && (
          <text
            x={x + s / 2}
            y={y + s / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fill="var(--accent)"
            fontFamily="var(--body)"
            style={{ letterSpacing: ".06em" }}
          >
            + ADD
          </text>
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: "100%",
        maxWidth,
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
          <line
            x1={pad}
            y1={pad - 16}
            x2={pad + cols * U}
            y2={pad - 16}
            stroke="var(--muted)"
            strokeWidth={0.8}
          />
          <line
            x1={pad}
            y1={pad - 20}
            x2={pad}
            y2={pad - 12}
            stroke="var(--muted)"
            strokeWidth={0.8}
          />
          <line
            x1={pad + cols * U}
            y1={pad - 20}
            x2={pad + cols * U}
            y2={pad - 12}
            stroke="var(--muted)"
            strokeWidth={0.8}
          />
          <text x={pad + (cols * U) / 2} y={pad - 21} textAnchor="middle">
            {widthLabel}
          </text>
          <line
            x1={pad - 16}
            y1={pad}
            x2={pad - 16}
            y2={pad + rows * U}
            stroke="var(--muted)"
            strokeWidth={0.8}
          />
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
  const cols = Math.max(...modules.map((m) => m.x)) + 1;
  const rows = Math.max(...modules.map((m) => m.y)) + 1;
  return { width: `${cols * 33}"`, depth: `${rows * 44}"` };
}
