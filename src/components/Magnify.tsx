import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Droplets, PawPrint, RotateCcw, Sparkles, Wine } from "lucide-react";
import { COLORS, colorHex } from "../data/products";
import { isDark, shade } from "../lib/color";
import {
  useFinePointer,
  usePrefersReducedMotion,
} from "../hooks/useMediaQuery";
import { Img, Swatches } from "./ui";
import { capturePointer } from "../lib/pointer";

/* ---------- Magnifier: a clipped, scaled copy of its children follows the pointer ---------- */

export function Magnifier({
  children,
  scale = 2.5,
  radius = 90,
  touch = false,
  style,
  hint,
}: {
  children: ReactNode;
  scale?: number;
  radius?: number;
  /** also magnify while a finger is down (blocks page scroll over the area) */
  touch?: boolean;
  style?: CSSProperties;
  hint?: string;
}) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const [used, setUsed] = useState(false);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" && !touch) return;
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPt({ x: e.clientX - r.left, y: e.clientY - r.top });
    setUsed(true);
  };

  return (
    <div
      style={{
        position: "relative",
        // Vertical swipes still scroll the page; side-to-side drags magnify.
        touchAction: touch ? "pan-y" : undefined,
        ...style,
      }}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={() => setPt(null)}
      onPointerUp={(e) => e.pointerType !== "mouse" && setPt(null)}
      onPointerCancel={() => setPt(null)}
    >
      {children}
      {/* Always mounted so the magnified copy has loaded before the first hover. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          clipPath: pt
            ? `circle(${radius}px at ${pt.x}px ${pt.y}px)`
            : "circle(0px at 50% 50%)",
          visibility: pt ? "visible" : "hidden",
          overflow: "hidden",
          borderRadius: "inherit",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${scale})`,
            transformOrigin: pt ? `${pt.x}px ${pt.y}px` : "50% 50%",
          }}
        >
          {children}
        </div>
      </div>
      {pt && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: pt.x - radius,
            top: pt.y - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,.9)",
            boxShadow:
              "0 8px 30px rgba(0,0,0,.25), inset 0 0 0 1px rgba(0,0,0,.08)",
            pointerEvents: "none",
          }}
        />
      )}
      {hint && !used && (
        <span
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            background: "rgba(0,0,0,.55)",
            color: "#fff",
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 99,
            pointerEvents: "none",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

/** Product photo with a hover magnifier on mouse devices; plain image on touch. */
export function ZoomLens({
  src,
  alt,
  ratio,
  w = 1400,
  radius,
  eager,
}: {
  src: string;
  alt: string;
  ratio?: string;
  w?: number;
  radius?: string;
  eager?: boolean;
}) {
  const fine = useFinePointer();
  const img = (
    <Img
      src={src}
      alt={alt}
      w={w}
      ratio={ratio}
      radius={radius}
      eager={eager}
    />
  );
  if (!fine) return img;
  return (
    <Magnifier
      scale={2.2}
      radius={95}
      style={{ borderRadius: radius, overflow: "hidden" }}
    >
      {img}
    </Magnifier>
  );
}

/* ---------- Procedural performance-weave texture ---------- */

export function FabricTexture({
  color,
  style,
  weave = 14,
}: {
  color: string;
  style?: CSSProperties;
  weave?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const hex = colorHex(color);
  const dark = isDark(hex);
  const thread = shade(hex, dark ? 26 : -30);
  const light = shade(hex, dark ? 42 : 14);
  const s = weave;
  const h = s / 2;
  const lines = (x: number, y: number, horizontal: boolean) =>
    [0.2, 0.5, 0.8].map((f) =>
      horizontal ? (
        <line
          key={`h${x}${y}${f}`}
          x1={x}
          x2={x + h}
          y1={y + h * f}
          y2={y + h * f}
        />
      ) : (
        <line
          key={`v${x}${y}${f}`}
          y1={y}
          y2={y + h}
          x1={x + h * f}
          x2={x + h * f}
        />
      ),
    );
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block", ...style }}
      aria-hidden
    >
      <defs>
        <pattern
          id={`weave${uid}`}
          width={s}
          height={s}
          patternUnits="userSpaceOnUse"
        >
          <rect width={s} height={s} fill={hex} />
          <rect width={h} height={h} fill={light} opacity={0.35} />
          <rect x={h} y={h} width={h} height={h} fill={light} opacity={0.35} />
          <g
            stroke={thread}
            strokeWidth={0.9}
            strokeLinecap="round"
            opacity={0.55}
          >
            {lines(0, 0, true)}
            {lines(h, h, true)}
            {lines(h, 0, false)}
            {lines(0, h, false)}
          </g>
        </pattern>
        <filter id={`grain${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="4"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={dark ? 0.16 : 0.22} />
          </feComponentTransfer>
        </filter>
        <radialGradient id={`light${uid}`} cx="30%" cy="20%" r="90%">
          <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.12 : 0.22} />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.25 : 0.12} />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#weave${uid})`} />
      <rect width="400" height="300" filter={`url(#grain${uid})`} />
      <rect width="400" height="300" fill={`url(#light${uid})`} />
    </svg>
  );
}

/** Big fabric swatch with a magnifier and color picker. */
export function FabricLens({
  color,
  onColor,
  ratio = "4/3",
  radius = "var(--radius)",
  compact,
}: {
  color: string;
  onColor?: (c: string) => void;
  ratio?: string;
  radius?: string;
  compact?: boolean;
}) {
  const stock = COLORS.find((c) => c.name === color)?.stock ?? 10;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Magnifier
        scale={3}
        radius={compact ? 70 : 96}
        touch
        hint="Hover or drag sideways to see the weave"
        style={{
          aspectRatio: ratio,
          borderRadius: radius,
          overflow: "hidden",
          border: "1px solid var(--line)",
        }}
      >
        <FabricTexture color={color} />
      </Magnifier>
      <div className="row between wrap" style={{ gap: 10 }}>
        <div>
          <div style={{ fontSize: compact ? 14.5 : 16 }}>
            Performance weave ·{" "}
            <strong style={{ fontWeight: 600 }}>{color}</strong>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            60,000+ double rubs · stain-resistant ·{" "}
            {stock <= 6 ? `only ${stock} left` : "in stock"}
          </div>
        </div>
        {onColor && (
          <Swatches value={color} onChange={onColor} size={compact ? 26 : 30} />
        )}
      </div>
    </div>
  );
}

/* ---------- Spill test: wipe a stain off the fabric ---------- */

type SpillKind = "coffee" | "wine" | "paws";

const SPILLS: Record<
  SpillKind,
  {
    label: string;
    color: string;
    icon: typeof Droplets;
    blobs: [number, number, number][];
  }
> = {
  coffee: {
    label: "Coffee",
    color: "#5A3419",
    icon: Droplets,
    blobs: [
      [200, 150, 58],
      [248, 128, 34],
      [160, 182, 30],
      [236, 188, 26],
      [150, 128, 18],
      [290, 176, 12],
      [112, 150, 9],
    ],
  },
  wine: {
    label: "Red wine",
    color: "#6A1628",
    icon: Wine,
    blobs: [
      [182, 158, 46],
      [236, 140, 40],
      [214, 196, 24],
      [282, 118, 16],
      [132, 128, 14],
      [300, 186, 10],
      [150, 206, 8],
    ],
  },
  paws: {
    label: "Muddy paws",
    color: "#4B3A26",
    icon: PawPrint,
    blobs: [
      [130, 196, 22],
      [108, 164, 9],
      [124, 154, 9],
      [144, 154, 9],
      [158, 166, 9],
      [214, 132, 22],
      [192, 100, 9],
      [208, 90, 9],
      [228, 90, 9],
      [242, 102, 9],
      [290, 196, 22],
      [268, 164, 9],
      [284, 154, 9],
      [304, 154, 9],
      [318, 166, 9],
    ],
  },
};

const GRID = 26;
const STROKE = 26; // wipe radius in viewBox units

export function WipeTest({ color = "Dream Grey" }: { color?: string }) {
  const uid = useId().replace(/:/g, "");
  const reduced = usePrefersReducedMotion();
  const [kind, setKind] = useState<SpillKind>("coffee");
  const [strokes, setStrokes] = useState<string[]>([]);
  const [cleared, setCleared] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const wiped = useRef(new Set<number>());
  const anim = useRef(0);

  const spill = SPILLS[kind];

  // Sample points that sit inside the stain.
  const samples = useMemo(() => {
    const pts: { i: number; x: number; y: number }[] = [];
    for (let gx = 0; gx < GRID; gx++)
      for (let gy = 0; gy < GRID; gy++) {
        const x = (gx + 0.5) * (400 / GRID);
        const y = (gy + 0.5) * (300 / GRID);
        if (spill.blobs.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r))
          pts.push({ i: gx * GRID + gy, x, y });
      }
    return pts;
  }, [spill]);

  const reset = (next: SpillKind = kind) => {
    cancelAnimationFrame(anim.current);
    wiped.current = new Set();
    setStrokes([]);
    setCleared(false);
    setProgress(0);
    setKind(next);
  };

  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const wipeAt = (x: number, y: number) => {
    samples.forEach((p) => {
      if (Math.hypot(p.x - x, p.y - y) < STROKE) wiped.current.add(p.i);
    });
    const pct = samples.length ? wiped.current.size / samples.length : 1;
    setProgress(pct);
    if (pct >= 0.85) setCleared(true);
  };

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    // viewBox is sliced to cover; compute the same mapping.
    const k = Math.max(r.width / 400, r.height / 300);
    const ox = (r.width - 400 * k) / 2;
    const oy = (r.height - 300 * k) / 2;
    return {
      x: (e.clientX - r.left - ox) / k,
      y: (e.clientY - r.top - oy) / k,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (cleared) return;
    capturePointer(e.currentTarget, e.pointerId);
    drawing.current = true;
    const p = toSvg(e);
    setStrokes((s) => [...s, `M${p.x.toFixed(1)} ${p.y.toFixed(1)} l0.1 0`]);
    wipeAt(p.x, p.y);
  };
  const onMove = (e: React.PointerEvent) => {
    const p = toSvg(e);
    setCursor(p);
    if (!drawing.current || cleared) return;
    setStrokes((s) => {
      const copy = s.slice();
      copy[copy.length - 1] += ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      return copy;
    });
    wipeAt(p.x, p.y);
  };
  const onUp = () => {
    drawing.current = false;
  };

  const autoWipe = () => {
    if (reduced) {
      setProgress(1);
      setCleared(true);
      return;
    }
    const xs = spill.blobs.map((b) => b[0]);
    const ys = spill.blobs.map((b) => b[1]);
    const x0 = Math.min(...xs) - 50;
    const x1 = Math.max(...xs) + 50;
    const y0 = Math.min(...ys) - 50;
    const y1 = Math.max(...ys) + 50;
    const rows = Math.ceil((y1 - y0) / (STROKE * 1.4));
    const pts: { x: number; y: number }[] = [];
    for (let r = 0; r <= rows; r++) {
      const y = y0 + ((y1 - y0) * r) / rows;
      for (let t = 0; t <= 12; t++) {
        const f = t / 12;
        pts.push({ x: r % 2 ? x1 - (x1 - x0) * f : x0 + (x1 - x0) * f, y });
      }
    }
    let i = 0;
    setStrokes((s) => [...s, `M${pts[0].x} ${pts[0].y}`]);
    const step = () => {
      const batch = pts.slice(i, i + 2);
      i += 2;
      if (!batch.length) return;
      setStrokes((s) => {
        const copy = s.slice();
        copy[copy.length - 1] += batch.map((p) => ` L${p.x} ${p.y}`).join("");
        return copy;
      });
      batch.forEach((p) => wipeAt(p.x, p.y));
      anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        className="row wrap"
        style={{ gap: 8 }}
        role="radiogroup"
        aria-label="Spill type"
      >
        {(Object.keys(SPILLS) as SpillKind[]).map((k) => {
          const Icon = SPILLS[k].icon;
          return (
            <button
              key={k}
              role="radio"
              aria-checked={k === kind}
              className={`chip row ${k === kind ? "active" : ""}`}
              style={{ gap: 6 }}
              onClick={() => reset(k)}
            >
              <Icon size={14} /> {SPILLS[k].label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          border: "1px solid var(--line)",
          // Scrub side to side to wipe; vertical swipes keep scrolling the page.
          touchAction: "pan-y",
          cursor: cleared ? "default" : "none",
        }}
      >
        <FabricTexture
          color={color}
          style={{ position: "absolute", inset: 0 }}
        />
        <svg
          ref={svgRef}
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => {
            onUp();
            setCursor(null);
          }}
          role="img"
          aria-label={`${spill.label} spill on ${color} fabric, ${Math.round(progress * 100)}% wiped`}
        >
          <defs>
            <filter id={`goo${uid}`}>
              <feGaussianBlur stdDeviation="7" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
            </filter>
            <mask
              id={`mask${uid}`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="400"
              height="300"
            >
              <rect width="400" height="300" fill="#fff" />
              <g
                stroke="#000"
                strokeWidth={STROKE * 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                {strokes.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
            </mask>
          </defs>
          <g
            mask={`url(#mask${uid})`}
            style={{ opacity: cleared ? 0 : 1, transition: "opacity .6s ease" }}
          >
            <g
              filter={kind === "paws" ? undefined : `url(#goo${uid})`}
              fill={spill.color}
              opacity={0.82}
            >
              {spill.blobs.map(([cx, cy, r], i) => (
                <circle key={i} cx={cx} cy={cy} r={r} />
              ))}
            </g>
          </g>
          {cursor && !cleared && (
            <g
              pointerEvents="none"
              transform={`translate(${cursor.x} ${cursor.y})`}
            >
              <rect
                x={-STROKE}
                y={-STROKE * 0.7}
                width={STROKE * 2}
                height={STROKE * 1.4}
                rx={9}
                fill="#F4D35E"
                stroke="#C9A227"
                strokeWidth={2}
                opacity={0.92}
              />
              <rect
                x={-STROKE + 4}
                y={STROKE * 0.15}
                width={STROKE * 2 - 8}
                height={STROKE * 0.45}
                rx={4}
                fill="#5B8C5A"
                opacity={0.9}
              />
            </g>
          )}
        </svg>
        {cleared && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              className="card row"
              style={{
                gap: 10,
                padding: "12px 16px",
                animation: "morphCheck .3s ease",
                boxShadow: "var(--shadow)",
              }}
              role="status"
            >
              <Sparkles size={18} color="var(--accent)" />
              <span>
                <strong style={{ fontWeight: 600 }}>Spotless.</strong>{" "}
                <span className="muted">
                  The weave sheds spills before they set.
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="row between wrap" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 10, flex: 1, minWidth: 180 }}>
          <div className="bar" style={{ maxWidth: 220 }} aria-hidden>
            <span
              style={{
                width: `${Math.round(progress * 100)}%`,
                transition: "width .15s",
              }}
            />
          </div>
          <span className="muted" style={{ fontSize: 13.5 }}>
            {cleared
              ? "100% clean"
              : progress > 0
                ? `${Math.round(progress * 100)}% wiped`
                : "Scrub side to side across the stain"}
          </span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {!cleared && (
            <button className="btn btn-sm btn-outline" onClick={autoWipe}>
              Wipe it for me
            </button>
          )}
          <button
            className="text-btn row"
            style={{ gap: 5 }}
            onClick={() => reset()}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
