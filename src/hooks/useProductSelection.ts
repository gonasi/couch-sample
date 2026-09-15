import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { COLORS, galleryFor, splitPay, type Product } from "../data/products";
import { readStore, writeStore } from "../lib/money";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { buildShareUrl } from "../lib/share";

export interface PickOptions {
  /** keep the scroll position (interactive variants) */
  keepScroll?: boolean;
  /** extra query params to carry over, besides ?v= */
  params?: Record<string, string>;
}

const validColor = (c: string | null) =>
  c && COLORS.some((x) => x.name === c) ? c : null;

/** Shared color / qty / price state used by every PDP variant. */
export function useProductSelection(product: Product) {
  const navigate = useNavigate();
  const { variant } = useUI();
  const cart = useCart();
  const [params] = useSearchParams();
  const [color, setColorState] = useState<string>(
    () => validColor(params.get("color")) ?? readStore("gh2-color", "White"),
  );
  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [product.slug]);
  useEffect(() => writeStore("gh2-color", color), []); // eslint-disable-line react-hooks/exhaustive-deps

  const setColor = (c: string) => {
    setColorState(c);
    writeStore("gh2-color", c);
  };

  const images = galleryFor(product, color);

  return {
    product,
    color,
    setColor,
    qty,
    setQty,
    images,
    price: product.price,
    compare: product.compare,
    savings: product.compare - product.price,
    split: splitPay(product.price),
    pickConfig: (slug: string, opts: PickOptions = {}) => {
      const q = new URLSearchParams({ v: variant, ...opts.params });
      navigate(`/product/${slug}?${q}`, {
        replace: true,
        state: opts.keepScroll ? { keepScroll: true } : undefined,
      });
    },
    shareUrl: (extra: Record<string, string> = {}) =>
      buildShareUrl(product.slug, { v: variant, color, ...extra }),
    addToCart: (overrides?: { qty?: number; silent?: boolean }) =>
      cart.add(product, {
        color,
        qty: overrides?.qty ?? qty,
        silent: overrides?.silent,
      }),
  };
}
