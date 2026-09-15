import { useEffect, useState, type RefObject } from "react";

/**
 * 0 → 1 as a tall section scrolls past: 0 when its top reaches the top of the
 * viewport, 1 when its bottom reaches the bottom. Pass no ref for whole-page progress.
 */
export function useScrollProgress(ref?: RefObject<HTMLElement>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    let last = -1;
    const measure = () => {
      frame = 0;
      let next: number;
      if (ref) {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        next = span <= 0 ? (r.top <= 0 ? 1 : 0) : -r.top / span;
      } else {
        const span =
          document.documentElement.scrollHeight - window.innerHeight;
        next = span <= 0 ? 0 : window.scrollY / span;
      }
      next = Math.min(1, Math.max(0, next));
      if (Math.abs(next - last) > 0.001) {
        last = next;
        setP(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
  return p;
}
