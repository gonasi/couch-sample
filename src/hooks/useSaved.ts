import { useCallback, useEffect, useState } from "react";
import { readStore, writeStore } from "../lib/money";

const KEY = "gh2-saved";
const EVENT = "gh2-saved-change";

/** Wishlist of product slugs in localStorage, kept in sync across components. */
export function useSaved() {
  const [saved, setSaved] = useState<string[]>(() => readStore(KEY, []));

  useEffect(() => {
    const sync = () => setSaved(readStore(KEY, []));
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = useCallback((slug: string) => {
    const list = readStore<string[]>(KEY, []);
    const next = list.includes(slug)
      ? list.filter((s) => s !== slug)
      : [...list, slug];
    writeStore(KEY, next);
    window.dispatchEvent(new Event(EVENT));
    return next.includes(slug);
  }, []);

  return {
    saved,
    isSaved: (slug: string) => saved.includes(slug),
    toggle,
  };
}
