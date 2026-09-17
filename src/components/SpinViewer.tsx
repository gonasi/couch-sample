import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { RotateCcw } from "lucide-react";
import type { SpinSet } from "../data/spin.generated";
import { cached, frameUrl, isCached, preload, preloadOrder } from "../lib/spin";
import { capturePointer } from "../lib/pointer";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { useInView } from "../hooks/useInView";
import { readStore, writeStore } from "../lib/money";

/** Dragging right should rotate as if you pushed the near edge right, which for Cylindo's
 *  frame ordering means the index decreases. Confirmed against the live renders. */
const DIR = -1;
const DEAD_ZONE = 8; // px before we commit to spinning vs scrolling
const FLING_MIN = 0.25; // px/ms
const FRICTION = 0.94; // per 16.67ms
const STOP = 0.02;

const wrap = (i: number, n: number) => ((i % n) + n) % n;

export function SpinViewer({
  set,
  combo,
  size,
  frames,
  alt,
  ratio,
  radius,
  className = "",
  style,
  eager,
  onExpand,
}: {
  set: SpinSet;
  combo: string;
  size: number;
  frames: number[];
  alt: string;
  /** The HOST's aspect box. Frames are 16:10 and letterbox into it - never the reverse. */
  ratio?: string;
  radius?: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
  onExpand?: () => void;
}) {
  const n = frames.length;
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(hostRef, { once: true, threshold: 0.1 });

  const url = useCallback(
    (i: number) => frameUrl(set, combo, size, frames[wrap(i, n)]),
    [set, combo, size, frames, n],
  );

  // `idx` is where the pointer says we are; `shown` is what is actually painted. They
  // diverge whenever a frame isn't decoded yet - see the anti-flicker rule below.
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const [nudging, setNudging] = useState(false);

  const gen = useRef(0);
  const raf = useRef(0);
  const drag = useRef<{
    id: number;
    x0: number;
    y0: number;
    base: number;
    accum: number;
    axis: "?" | "x" | "y";
    ring: { x: number; t: number }[];
  } | null>(null);

  const stopInertia = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  };

  /* ---------------- anti-flicker: never point <img> at an undecoded URL ---------------- */
  useEffect(() => {
    const u = url(idx);
    if (isCached(u)) {
      setShown(idx);
      return;
    }
    const mine = gen.current;
    preload(u).then((img) => {
      // Only upgrade if the user hasn't moved on and the combo hasn't changed.
      if (img && gen.current === mine) setShown((s) => (idx === idxRef.current ? idx : s));
    });
  }, [idx, url]);

  // read the live idx inside async callbacks without re-subscribing
  const idxRef = useRef(0);
  idxRef.current = idx;

  /* ---------------- combo change: swap only once the same angle is decoded ------------- */
  const firstCombo = useRef(true);
  useEffect(() => {
    gen.current++;
    stopInertia();
    if (firstCombo.current) {
      firstCombo.current = false;
      return;
    }
    // Preload the CURRENT angle in the new fabric, so the change reads as a pure material
    // swap with no rotation jump and no white flash.
    const mine = gen.current;
    preload(url(idxRef.current)).then(() => {
      if (gen.current === mine) setShown(idxRef.current);
    });
  }, [combo]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- background preload, spiralling out from the current angle ---------- */
  useEffect(() => {
    if (!inView || n <= 1) return;
    const mine = gen.current;
    let cancelled = false;
    const order = preloadOrder(n).map((o) => wrap(o + idxRef.current, n));
    (async () => {
      // Never compete with the visible frame: wait for it first.
      await preload(url(idxRef.current));
      for (const i of order) {
        if (cancelled || gen.current !== mine) return;
        await preload(url(i));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, combo, n, url]);

  /* ---------------- drag-ahead: jump the queue for where the finger is heading --------- */
  const warmAhead = (from: number, dir: number) => {
    for (let k = 1; k <= 3; k++) preload(url(from + dir * k));
  };

  /* ---------------- pointer ---------------- */
  const onPointerDown = (e: React.PointerEvent) => {
    stopInertia();
    setNudging(false);
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      base: idxRef.current,
      accum: 0,
      axis: "?",
      ring: [{ x: e.clientX, t: performance.now() }],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;

    if (d.axis === "?") {
      if (Math.hypot(dx, dy) < DEAD_ZONE) return;
      // Vertical wins -> release and let the page scroll for the rest of this gesture.
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "y") {
        drag.current = null;
        return;
      }
      capturePointer(hostRef.current, e.pointerId);
    }

    const w = hostRef.current?.clientWidth ?? 640;
    const pxPerFrame = Math.max(6, w / (n * 1.5));
    d.accum = dx;
    // Round ONCE off the total delta; rounding per-move accumulates drift.
    const next = wrap(d.base + DIR * Math.round(d.accum / pxPerFrame), n);
    if (next !== idxRef.current) {
      warmAhead(next, next - idxRef.current > 0 ? 1 : -1);
      setIdx(next);
    }

    d.ring.push({ x: e.clientX, t: performance.now() });
    if (d.ring.length > 5) d.ring.shift();
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.axis !== "x" || reduced || d.ring.length < 2) return;

    const first = d.ring[0];
    const last = d.ring[d.ring.length - 1];
    const dt = last.t - first.t;
    if (dt <= 0) return;
    let v = (last.x - first.x) / dt; // px/ms
    if (Math.abs(v) < FLING_MIN) return;

    const w = hostRef.current?.clientWidth ?? 640;
    const pxPerFrame = Math.max(6, w / (n * 1.5));
    let carry = 0;
    let prev = performance.now();
    const mine = gen.current;

    const tick = () => {
      if (gen.current !== mine) return;
      const now = performance.now();
      // Clamp: a backgrounded tab returns a huge dt and would teleport the sofa.
      const step = Math.min(50, now - prev);
      prev = now;
      v *= FRICTION ** (step / 16.67);
      carry += v * step;
      const move = Math.trunc(carry / pxPerFrame);
      if (move) {
        carry -= move * pxPerFrame;
        const next = wrap(idxRef.current + DIR * move, n);
        warmAhead(next, move > 0 ? DIR : -DIR);
        setIdx(next);
      }
      if (Math.abs(v) > STOP) raf.current = requestAnimationFrame(tick);
      else raf.current = 0;
    };
    raf.current = requestAnimationFrame(tick);
    void e;
  };

  /* ---------------- keyboard ---------------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const q = Math.max(1, Math.round(n / 4));
    const map: Record<string, number> = {
      ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1,
      PageDown: -q, PageUp: q,
    };
    if (e.key in map) {
      stopInertia();
      setNudging(false);
      setIdx((i) => wrap(i + map[e.key], n));
    } else if (e.key === "Home") setIdx(0);
    else if (e.key === "End") setIdx(n - 1);
    else return;
    e.preventDefault();
  };

  /* ---------------- first-visit nudge ---------------- */
  useEffect(() => {
    if (!inView || reduced || n <= 1) return;
    if (readStore("gh2-spun", false)) return;
    let t = 0;
    const seq = [1, 2, 3, 2, 1, 0];
    setNudging(true);
    const step = (k: number) => {
      if (k >= seq.length) {
        setNudging(false);
        return;
      }
      setIdx(wrap(seq[k], n));
      t = window.setTimeout(() => step(k + 1), 150);
    };
    const start = window.setTimeout(() => step(0), 600);
    return () => {
      clearTimeout(start);
      clearTimeout(t);
    };
  }, [inView, reduced, n]);

  useEffect(() => () => stopInertia(), []);

  const markSpun = () => {
    if (!readStore("gh2-spun", false)) writeStore("gh2-spun", true);
  };

  const src = cached(url(shown))?.src ?? url(shown);

  return (
    <div
      ref={hostRef}
      className={`media spin-stage ${className}`}
      style={{ aspectRatio: ratio, borderRadius: radius, ...style }}
      role="slider"
      tabIndex={0}
      aria-label={`Rotate ${alt}`}
      aria-valuemin={1}
      aria-valuemax={n}
      aria-valuenow={shown + 1}
      aria-valuetext={`View ${shown + 1} of ${n}`}
      onPointerDown={(e) => { markSpun(); onPointerDown(e); }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={(e) => { markSpun(); onKeyDown(e); }}
      onDoubleClick={onExpand}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        // 16:10 frames must letterbox into the host box. `cover` would crop each frame
        // differently and the sofa would visibly breathe while spinning.
        style={{ objectFit: "contain" }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />
      {nudging && (
        <span className="pill pill-soft spin-hint">
          <RotateCcw size={13} /> Drag to spin
        </span>
      )}
    </div>
  );
}
