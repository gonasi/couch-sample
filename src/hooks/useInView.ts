import { useEffect, useState, type RefObject } from "react";

/** True while the element intersects the viewport (or once it has, with `once`). */
export function useInView(
  ref: RefObject<Element>,
  { threshold = 0.15, once = false, rootMargin = "0px" } = {},
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, once, rootMargin]);
  return inView;
}
