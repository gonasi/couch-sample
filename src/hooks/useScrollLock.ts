import { useEffect } from "react";

let locks = 0;

/** Locks body scroll while `active`. Counted, so overlapping overlays don't fight. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    document.body.style.overflow = "hidden";
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) document.body.style.overflow = "";
    };
  }, [active]);
}
