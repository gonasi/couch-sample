import { useId } from "react";
import type { Module, ModuleKind } from "../data/products";
import { isDark, shade } from "../lib/color";
import { CELL_D, CELL_W, footprint, type Dir } from "../lib/layout";

/* ---------- scene model ---------- */

export interface IsoModule {
  key: string;
  /** cell units, relative to the layout center */
  x: number;
  y: number;
  kind: ModuleKind;
  /** back cushion height per side, 0–1 (tweenable) */
  back: Record<Dir, number>;
  /** lift in inches */
  dz: number;
  opacity: number;
  /** 0 = upholstered module, 1 = shipping box */
  boxed: number;
}

export interface IsoScene {
  modules: IsoModule[];
  color: string;
  /** scales module positions about the center (1 = touching) */
  spread?: number;
  /** explode one module into its cushion layers */
  explode?: { key: string; amount: number };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function isoModules(layout: Module[], prefix = "m"): IsoModule[] {
  const fp = footprint(layout);
  const cx = fp.minX + fp.cols / 2;
  const cy = fp.minY + fp.rows / 2;
  return layout.map((m, i) => ({
    key: `${prefix}${i}`,
    x: m.x - cx,
    y: m.y - cy,
    kind: m.kind,
    back: {
      n: m.back.includes("n") ? 1 : 0,
      e: m.back.includes("e") ? 1 : 0,
      s: m.back.includes("s") ? 1 : 0,
      w: m.back.includes("w") ? 1 : 0,
    },
    dz: 0,
    opacity: 1,
    boxed: 0,
  }));
}

/** Tween between two layouts: matched pieces slide, extras drop in or lift out. */
export function morphModules(
  a: IsoModule[],
  b: IsoModule[],
  u: number,
): IsoModule[] {
  const used = new Set<number>();
  const out: IsoModule[] = [];
  b.forEach((mb) => {
    let best = -1;
    let bestD = Infinity;
    a.forEach((ma, i) => {
      if (used.has(i) || ma.kind !== mb.kind) return;
      const d = Math.hypot(ma.x - mb.x, ma.y - mb.y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) {
      used.add(best);
      const ma = a[best];
      out.push({
        ...mb,
        key: ma.key,
        x: lerp(ma.x, mb.x, u),
        y: lerp(ma.y, mb.y, u),
        back: {
          n: lerp(ma.back.n, mb.back.n, u),
          e: lerp(ma.back.e, mb.back.e, u),
          s: lerp(ma.back.s, mb.back.s, u),
          w: lerp(ma.back.w, mb.back.w, u),
        },
      });
    } else
      out.push({ ...mb, key: `in-${mb.key}`, dz: (1 - u) * 70, opacity: u });
  });
  a.forEach((ma, i) => {
    if (!used.has(i))
      out.push({ ...ma, key: `out-${ma.key}`, dz: u * 70, opacity: 1 - u });
  });
  return out;
}

/* ---------- projection + boxes ---------- */

const C30 = Math.cos(Math.PI / 6);
export const project = (x: number, y: number, z: number): [number, number] => [
  (x - y) * C30,
  (x + y) * 0.5 - z,
];

interface Box {
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
}

const pts = (list: [number, number, number][]) =>
  list
    .map(([x, y, z]) => project(x, y, z))
    .map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`)
    .join(" ");

interface Shades {
  top: string;
  south: string;
  east: string;
}

function BoxShape({ b, c, stroke }: { b: Box; c: Shades; stroke: string }) {
  const { x0, y0, z0, x1, y1, z1 } = b;
  if (x1 - x0 < 0.2 || y1 - y0 < 0.2 || z1 - z0 < 0.2) return null;
  return (
    <g stroke={stroke} strokeWidth={0.6} strokeLinejoin="round">
      <polygon
        points={pts([
          [x1, y0, z1],
          [x1, y1, z1],
          [x1, y1, z0],
          [x1, y0, z0],
        ])}
        fill={c.east}
      />
      <polygon
        points={pts([
          [x0, y1, z1],
          [x1, y1, z1],
          [x1, y1, z0],
          [x0, y1, z0],
        ])}
        fill={c.south}
      />
      <polygon
        points={pts([
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ])}
        fill={c.top}
      />
    </g>
  );
}

const shadesFor = (hex: string, dark: boolean, tone = 0): Shades =>
  dark
    ? {
        top: shade(hex, 34 + tone),
        south: shade(hex, 16 + tone),
        east: shade(hex, 6 + tone),
      }
    : {
        top: shade(hex, 6 + tone),
        south: shade(hex, -24 + tone),
        east: shade(hex, -42 + tone),
      };

const CARDBOARD = "#C49A66";
const LAYERS = [
  { name: "Kiln-dried hardwood frame", z0: 0, z1: 5, color: "#96714A" },
  { name: "High-resilience foam core", z0: 5, z1: 13, color: "#EADBB0" },
  { name: "Fiber comfort wrap", z0: 13, z1: 16, color: "#F7F3EA" },
  { name: "Feather-blend topper", z0: 16, z1: 20, color: "" },
];

/* ---------- renderer ---------- */

export default function IsoCouch({
  scene,
  labelColor = "currentColor",
  viewBox = "-185 -135 370 240",
  style,
  title = "Couch illustration",
}: {
  scene: IsoScene;
  labelColor?: string;
  viewBox?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const spread = scene.spread ?? 1;
  const fabric = scene.color;
  const G = 0.8;
  const T = 9;

  const placed = scene.modules
    .map((m) => ({
      m,
      ox: m.x * CELL_W * spread,
      oy: m.y * CELL_D * spread,
    }))
    .sort((a, b) => a.ox + a.oy - (b.ox + b.oy));

  const renderModule = ({ m, ox, oy }: (typeof placed)[number]) => {
    const dz = m.dz;
    const hex = fabric;
    const dark = isDark(hex);
    const stroke = dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.10)";
    const fab = shadesFor(hex, dark);
    const base = shadesFor(hex, dark, dark ? -10 : -12);
    const box = (
      x0: number,
      y0: number,
      z0: number,
      x1: number,
      y1: number,
      z1: number,
    ): Box => ({
      x0: ox + x0,
      y0: oy + y0,
      z0: z0 + dz,
      x1: ox + x1,
      y1: oy + y1,
      z1: z1 + dz,
    });
    const W = CELL_W;
    const D = CELL_D;
    const bn = m.back.n;
    const bs = m.back.s;
    const bw = m.back.w;
    const be = m.back.e;
    const backZ = (h: number) => 6 + 26 * h;
    const exploding = scene.explode?.key === m.key ? scene.explode.amount : 0;

    const fabricBody =
      exploding > 0 ? (
        <g>
          {LAYERS.map((l, i) => {
            const lift = exploding * i * 15;
            const color = l.color || hex;
            const ld = isDark(color);
            return (
              <g key={l.name}>
                <BoxShape
                  b={box(G, G, l.z0 + lift, W - G, D - G, l.z1 + lift)}
                  c={shadesFor(color, ld)}
                  stroke={ld ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.12)"}
                />
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          <BoxShape
            b={box(G, G, 0, W - G, D - G, 6)}
            c={base}
            stroke={stroke}
          />
          {bn > 0.02 && (
            <BoxShape
              b={box(G, G, 6, W - G, G + T, backZ(bn))}
              c={fab}
              stroke={stroke}
            />
          )}
          {bw > 0.02 && (
            <BoxShape
              b={box(G, G + T * bn, 6, G + T, D - G - T * bs, backZ(bw))}
              c={fab}
              stroke={stroke}
            />
          )}
          <BoxShape
            b={box(
              G + T * bw + 0.6,
              G + T * bn + 0.6,
              6,
              W - G - T * be - 0.6,
              D - G - T * bs - 0.6,
              m.kind === "ottoman" ? 17 : 16,
            )}
            c={shadesFor(hex, dark, dark ? 4 : 2)}
            stroke={stroke}
          />
          {be > 0.02 && (
            <BoxShape
              b={box(
                W - G - T,
                G + T * bn,
                6,
                W - G,
                D - G - T * bs,
                backZ(be),
              )}
              c={fab}
              stroke={stroke}
            />
          )}
          {bs > 0.02 && (
            <BoxShape
              b={box(G, D - G - T, 6, W - G, D - G, backZ(bs))}
              c={fab}
              stroke={stroke}
            />
          )}
        </g>
      );

    const boxed = m.boxed;
    return (
      <g key={m.key} opacity={m.opacity}>
        {boxed < 0.999 && <g opacity={1 - boxed}>{fabricBody}</g>}
        {boxed > 0.001 && (
          <g opacity={boxed}>
            <BoxShape
              b={box(2, 3, 0, W - 2, D - 3, 28)}
              c={shadesFor(CARDBOARD, false)}
              stroke="rgba(0,0,0,.14)"
            />
            {/* packing tape */}
            <BoxShape
              b={box(W / 2 - 2.5, 3, 28, W / 2 + 2.5, D - 3, 28.3)}
              c={shadesFor("#E8D7B5", false)}
              stroke="none"
            />
            <BoxShape
              b={box(W / 2 - 2.5, D - 3, 18, W / 2 + 2.5, D - 2.99, 28)}
              c={shadesFor("#E8D7B5", false)}
              stroke="none"
            />
          </g>
        )}
      </g>
    );
  };

  // floor glow sized to the layout
  const ext = placed.reduce(
    (a, p) => ({
      x0: Math.min(a.x0, p.ox),
      y0: Math.min(a.y0, p.oy),
      x1: Math.max(a.x1, p.ox + CELL_W),
      y1: Math.max(a.y1, p.oy + CELL_D),
    }),
    { x0: 0, y0: 0, x1: 0, y1: 0 },
  );
  const [fx, fy] = project((ext.x0 + ext.x1) / 2, (ext.y0 + ext.y1) / 2, 0);
  const rx = ((ext.x1 - ext.x0 + ext.y1 - ext.y0) * C30) / 2 + 30;

  const exploded = scene.explode
    ? placed.find((p) => p.m.key === scene.explode!.key)
    : undefined;

  return (
    <svg
      viewBox={viewBox}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        overflow: "visible",
        ...style,
      }}
      role="img"
      aria-label={title}
    >
      <defs>
        <radialGradient id={`floor${uid}`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={fx}
        cy={fy + 8}
        rx={rx}
        ry={rx * 0.42}
        fill={`url(#floor${uid})`}
      />
      {placed.map(renderModule)}
      {exploded && scene.explode!.amount > 0.05 && (
        <g
          fontFamily="var(--body)"
          fontSize={7.5}
          fill={labelColor}
          opacity={clamp01((scene.explode!.amount - 0.4) / 0.4)}
        >
          {LAYERS.map((l, i) => {
            const lift = scene.explode!.amount * i * 15;
            const [ax, ay] = project(
              exploded.ox + CELL_W,
              exploded.oy + CELL_D / 2,
              (l.z0 + l.z1) / 2 + lift,
            );
            const tx = ax + 26;
            return (
              <g key={l.name}>
                <line
                  x1={ax + 2}
                  y1={ay}
                  x2={tx - 4}
                  y2={ay}
                  stroke={labelColor}
                  strokeWidth={0.5}
                  opacity={0.5}
                />
                <circle cx={ax + 2} cy={ay} r={1.6} fill={labelColor} />
                <text x={tx} y={ay + 3}>
                  <tspan fontFamily="var(--mono)" opacity={0.6}>
                    0{LAYERS.length - i}{" "}
                  </tspan>
                  {l.name}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
