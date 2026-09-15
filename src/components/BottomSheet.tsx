import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useUI } from "../context/UIContext";
import { useBottomOffset } from "../hooks/useBottomOffset";
import { useScrollLock } from "../hooks/useScrollLock";
import { capturePointer } from "../lib/pointer";

export type SheetSnap = "peek" | "half" | "full";

const ORDER: SheetSnap[] = ["peek", "half", "full"];

/**
 * Draggable bottom sheet. The handle + peek row stay on screen; drag or tap them
 * to open to half or full height. Velocity decides the snap on release.
 */
export default function BottomSheet({
  snap,
  onSnap,
  peek,
  children,
  label,
  fullHeight = "86svh",
  offsetKey = "sheet",
}: {
  snap: SheetSnap;
  onSnap: (s: SheetSnap) => void;
  peek: ReactNode;
  children: ReactNode;
  label: string;
  fullHeight?: string;
  offsetKey?: string;
}) {
  const { drawerOpen } = useUI();
  const sheetRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ full: 0, peek: 0, vh: 0 });
  const [dragging, setDragging] = useState(false);
  // Read in move/up handlers so a very fast tap isn't missed before re-render.
  const draggingRef = useRef(false);
  const drag = useRef({
    startY: 0,
    startT: 0,
    t: 0,
    moved: false,
    samples: [] as { y: number; time: number }[],
  });

  const open = snap !== "peek";
  useScrollLock(open);
  useBottomOffset(offsetKey, metrics.peek);

  useLayoutEffect(() => {
    const measure = () =>
      setMetrics({
        full: sheetRef.current?.offsetHeight ?? 0,
        peek: headRef.current?.offsetHeight ?? 0,
        vh: window.innerHeight,
      });
    measure();
    const ro = new ResizeObserver(measure);
    if (sheetRef.current) ro.observe(sheetRef.current);
    if (headRef.current) ro.observe(headRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Never cover the cart drawer that add-to-cart opens.
  useEffect(() => {
    if (drawerOpen && open) onSnap("peek");
  }, [drawerOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onSnap("peek");
    window.addEventListener("keydown", onKey);
    sheetRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onSnap]);

  const visible = (s: SheetSnap) =>
    s === "peek"
      ? metrics.peek
      : s === "half"
        ? Math.min(metrics.full, Math.max(metrics.peek, metrics.vh * 0.55))
        : metrics.full;
  const translateFor = (s: SheetSnap) => Math.max(0, metrics.full - visible(s));
  const maxT = translateFor("peek");

  const onPointerDown = (e: React.PointerEvent) => {
    if (
      (e.target as HTMLElement).closest(
        "button:not(.sheet-handle), a, input, select, textarea",
      )
    )
      return;
    capturePointer(e.currentTarget, e.pointerId);
    const t = translateFor(snap);
    drag.current = {
      startY: e.clientY,
      startT: t,
      t,
      moved: false,
      samples: [{ y: e.clientY, time: performance.now() }],
    };
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const d = drag.current;
    const dy = e.clientY - d.startY;
    if (Math.abs(dy) > 5) d.moved = true;
    // rubber-band past the ends
    let t = d.startT + dy;
    if (t < 0) t = t / 4;
    if (t > maxT) t = maxT + (t - maxT) / 4;
    d.t = t;
    const now = performance.now();
    d.samples.push({ y: e.clientY, time: now });
    d.samples = d.samples.filter((s) => now - s.time < 100);
    if (sheetRef.current)
      sheetRef.current.style.transform = `translateY(${t}px)`;
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const d = drag.current;
    setDragging(false);
    if (!d.moved) {
      onSnap(snap === "peek" ? "full" : "peek");
      return;
    }
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const v =
      first && last && last.time > first.time
        ? (last.y - first.y) / (last.time - first.time)
        : 0;
    const snaps = ORDER.map((s) => ({ s, t: translateFor(s) }));
    let next: SheetSnap;
    if (Math.abs(v) > 0.5) {
      // flick: next snap in the flick direction from where the finger let go
      const candidates =
        v < 0
          ? snaps.filter((x) => x.t < d.t - 1)
          : snaps.filter((x) => x.t > d.t + 1);
      next = candidates.length
        ? candidates.sort(
            (a, b) => Math.abs(a.t - d.t) - Math.abs(b.t - d.t),
          )[0].s
        : v < 0
          ? "full"
          : "peek";
    } else {
      next = snaps.sort((a, b) => Math.abs(a.t - d.t) - Math.abs(b.t - d.t))[0]
        .s;
    }
    onSnap(next);
  };

  return createPortal(
    <>
      {open && (
        <div
          className="overlay"
          style={{ zIndex: 91 }}
          onClick={() => onSnap("peek")}
          aria-hidden
        />
      )}
      {/* Collapsed, the sheet sits under overlays and the cart drawer (z 90+). */}
      <div className="sheet-wrap" style={{ zIndex: open ? 92 : 89 }}>
        <div
          ref={sheetRef}
          className="sheet"
          role={open ? "dialog" : "region"}
          aria-modal={open || undefined}
          aria-label={label}
          tabIndex={-1}
          style={{
            height: fullHeight,
            outline: "none",
            transform: `translateY(${
              dragging
                ? drag.current.t
                : metrics.full
                  ? translateFor(snap)
                  : 9999
            }px)`,
            transition: dragging
              ? "none"
              : "transform .34s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <div
            ref={headRef}
            className="sheet-head"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <button
              className="sheet-handle"
              aria-label={open ? "Collapse" : "Expand"}
              aria-expanded={open}
              onClick={(e) => e.detail === 0 && onSnap(open ? "peek" : "full")}
              style={{
                display: "block",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            />
            {peek}
          </div>
          <div
            className="sheet-body"
            aria-hidden={!open}
            // At half height, size the scroll area to what's on screen so its end is reachable.
            style={
              open && metrics.full
                ? { flex: "none", height: Math.max(0, visible(snap) - metrics.peek) }
                : undefined
            }
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
