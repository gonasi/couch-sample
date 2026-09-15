import { useEffect, useState } from "react";

/** Returns the id of the last section whose top has scrolled above `offset`. */
export function useScrollSpy(ids: string[], offset = 140) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 1) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key, offset]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}
