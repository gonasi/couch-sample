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

export type Variant = "a" | "b" | "c" | "d";
export const isVariant = (s: string | null | undefined): s is Variant =>
  s === "a" || s === "b" || s === "c" || s === "d";

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
  /** height of any fixed bottom bar, so floating UI can sit above it */
  bottomOffset: number;
  setBottomOffset: (n: number) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeName>(() =>
    readStore<ThemeName>("gh2-theme", "editorial"),
  );
  const [variant, setVariantState] = useState<Variant>(() => {
    const v = readStore<string>("gh2-variant", "a");
    return isVariant(v) ? v : "a";
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bottomOffset, setBottomOffset] = useState(0);
  const nextId = useRef(1);

  useEffect(() => {
    applyTheme(theme);
    writeStore("gh2-theme", theme);
  }, [theme]);

  const setVariant = useCallback((v: Variant) => {
    setVariantState(v);
    writeStore("gh2-variant", v);
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = drawerOpen || searchOpen ? "hidden" : "";
  }, [drawerOpen, searchOpen]);

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
