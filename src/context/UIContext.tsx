import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { applyTheme, type ThemeName } from "../theme/themes";
import { readStore, writeStore } from "../lib/money";
import { DEFAULT_VARIANT, type Variant } from "../data/variants";
import { useScrollLock } from "../hooks/useScrollLock";

export { VARIANTS, DEFAULT_VARIANT, isVariant, type Variant } from "../data/variants";

interface Toast {
  id: number;
  message: string;
  tone: "default" | "success" | "error";
}

interface UIState {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  variant: Variant;
  setVariant: (v: Variant) => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
  /** height of the tallest fixed bottom bar, so floating UI can sit above it */
  bottomOffset: number;
  /** legacy single-owner setter (variants B, D, E) */
  setBottomOffset: (n: number) => void;
  /** keyed setter so several bars/sheets can coexist; 0 removes the entry */
  setBottomOffsetFor: (key: string, n: number) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeName>(() =>
    readStore<ThemeName>("gh2-theme", "editorial"),
  );
  // Every load starts on the default variant, deliberately ignoring whatever the
  // tester last picked - we want everyone landing on the same page. A ?v= in the URL
  // still wins (ProductPage syncs it), so hub links, the switcher and shared
  // configuration links all keep working.
  const [variant, setVariantState] = useState<Variant>(DEFAULT_VARIANT);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const nextId = useRef(1);

  useEffect(() => {
    applyTheme(theme);
    writeStore("gh2-theme", theme);
  }, [theme]);

  const setVariant = useCallback((v: Variant) => setVariantState(v), []);

  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "default") => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message, tone }]);
      window.setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        3200,
      );
    },
    [],
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useScrollLock(drawerOpen || searchOpen);

  const setBottomOffsetFor = useCallback((key: string, n: number) => {
    setOffsets((o) => {
      if ((o[key] ?? 0) === n) return o;
      const next = { ...o };
      if (n > 0) next[key] = n;
      else delete next[key];
      return next;
    });
  }, []);
  const setBottomOffset = useCallback(
    (n: number) => setBottomOffsetFor("legacy", n),
    [setBottomOffsetFor],
  );
  const bottomOffset = Math.max(0, ...Object.values(offsets));

  return (
    <UIContext.Provider
      value={{
        drawerOpen,
        openDrawer,
        closeDrawer,
        searchOpen,
        setSearchOpen,
        theme,
        setTheme: setThemeState,
        variant,
        setVariant,
        toasts,
        toast,
        bottomOffset,
        setBottomOffset,
        setBottomOffsetFor,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
