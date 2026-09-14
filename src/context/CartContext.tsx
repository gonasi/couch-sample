import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStore, writeStore } from "../lib/money";
import { useUI } from "./UIContext";
import type { Product } from "../data/products";

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  color: string | null;
  note?: string;
  price: number;
  compare: number;
  qty: number;
  image: string;
}

export interface Discount {
  code: string;
  label: string;
  amount: (subtotal: number) => number;
}

const DISCOUNTS: Record<string, Omit<Discount, "code">> = {
  CLOUD30: { label: "30% sale pricing (already applied)", amount: () => 0 },
  WELCOME100: {
    label: "$100 off your first order",
    amount: (s) => Math.min(100, s),
  },
};

interface AddOptions {
  qty?: number;
  color?: string | null;
  note?: string;
  price?: number;
  compare?: number;
  silent?: boolean;
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  compareTotal: number;
  savings: number;
  discount: Discount | null;
  discountAmount: number;
  total: number;
  add: (product: Product, opts?: AddOptions) => void;
  addMany: (lines: { product: Product; opts?: AddOptions }[]) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyCode: (code: string) => { ok: boolean; message: string };
  removeCode: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { openDrawer, toast } = useUI();
  const [items, setItems] = useState<CartItem[]>(() =>
    readStore<CartItem[]>("gh2-cart", []),
  );
  const [code, setCode] = useState<string | null>(() =>
    readStore<string | null>("gh2-code", null),
  );

  useEffect(() => writeStore("gh2-cart", items), [items]);
  useEffect(() => writeStore("gh2-code", code), [code]);

  const merge = (list: CartItem[], product: Product, opts: AddOptions = {}) => {
    const color = product.kind === "couch" ? (opts.color ?? "White") : null;
    const key = [product.id, color ?? "", opts.note ?? ""].join("|");
    const qty = opts.qty ?? 1;
    const next = list.slice();
    const i = next.findIndex((it) => it.key === key);
    if (i > -1) next[i] = { ...next[i], qty: next[i].qty + qty };
    else
      next.push({
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        color,
        note: opts.note,
        price: opts.price ?? product.price,
        compare: opts.compare ?? product.compare,
        qty,
        image: product.images[0],
      });
    return next;
  };

  const add: CartState["add"] = (product, opts = {}) => {
    setItems((list) => merge(list, product, opts));
    if (!opts.silent) {
      openDrawer();
      toast(`Added ${product.name} to your cart`, "success");
    }
  };

  const addMany: CartState["addMany"] = (lines) => {
    setItems((list) =>
      lines.reduce((acc, l) => merge(acc, l.product, l.opts), list),
    );
    openDrawer();
    toast(
      `Added ${lines.length} item${lines.length > 1 ? "s" : ""} to your cart`,
      "success",
    );
  };

  const totals = useMemo(() => {
    const count = items.reduce((t, it) => t + it.qty, 0);
    const subtotal = items.reduce((t, it) => t + it.price * it.qty, 0);
    const compareTotal = items.reduce((t, it) => t + it.compare * it.qty, 0);
    const d = code && DISCOUNTS[code] ? { code, ...DISCOUNTS[code] } : null;
    const discountAmount = d ? d.amount(subtotal) : 0;
    return {
      count,
      subtotal,
      compareTotal,
      savings: compareTotal - subtotal,
      discount: d,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount),
    };
  }, [items, code]);

  const value: CartState = {
    items,
    ...totals,
    add,
    addMany,
    setQty: (key, qty) =>
      setItems((list) =>
        qty <= 0
          ? list.filter((it) => it.key !== key)
          : list.map((it) => (it.key === key ? { ...it, qty } : it)),
      ),
    remove: (key) => setItems((list) => list.filter((it) => it.key !== key)),
    clear: () => {
      setItems([]);
      setCode(null);
    },
    applyCode: (raw) => {
      const c = raw.trim().toUpperCase();
      if (!c) return { ok: false, message: "Enter a discount code." };
      if (!DISCOUNTS[c])
        return {
          ok: false,
          message: `“${c}” isn’t a valid code. Try WELCOME100.`,
        };
      setCode(c);
      return { ok: true, message: `${c} applied — ${DISCOUNTS[c].label}.` };
    },
    removeCode: () => setCode(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
