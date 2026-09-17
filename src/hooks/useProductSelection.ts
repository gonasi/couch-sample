import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  COLORS,
  DEFAULT_COLOR,
  fabricByName,
  fabricBySlug,
  galleryFor,
  isColorName,
  splitPay,
  type Product,
} from "../data/products";
import type { SpinConfig } from "../data/spin.generated";
import {
  defaultConfig,
  resolveSpin,
  setForProduct,
  slugify,
  stillFor,
  type SpinSource,
} from "../lib/spin";
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

/** URLs carry fabric slugs, never display names: buildShareUrl puts the query inside the
 *  hash and URLSearchParams encodes a space as "+", which round-trips badly. */
const colorFromParam = (v: string | null) => fabricBySlug(v ?? "")?.name ?? null;

/** Anything persisted from an older build (e.g. "White") must be rejected, not trusted -
 *  several call sites do COLORS.find(...)! and would throw on an unknown value. */
const validStored = (v: string) => (isColorName(v) ? v : DEFAULT_COLOR);

/** Geometry axes for a product, i.e. everything the renderer varies except the fabric. */
const geomAxes = (slug: string) =>
  Object.keys(setForProduct(slug)?.axes ?? {}).filter((a) => a !== "FABRIC");

function geomFromParams(slug: string, params: URLSearchParams): SpinConfig {
  const base = defaultConfig(slug) ?? {};
  const set = setForProduct(slug);
  if (!set) return {};
  const out: SpinConfig = {};
  for (const axis of geomAxes(slug)) {
    const want = params.get(axis.toLowerCase());
    const match = want && set.axes[axis].find((o) => slugify(o) === want);
    out[axis] = match || base[axis];
  }
  return out;
}

/** Shared fabric / geometry / qty / price state used by every PDP variant. */
export function useProductSelection(product: Product) {
  const navigate = useNavigate();
  const { variant } = useUI();
  const cart = useCart();
  const [params] = useSearchParams();

  const [color, setColorState] = useState<string>(
    () => colorFromParam(params.get("color")) ?? validStored(readStore("gh2-fabric", DEFAULT_COLOR)),
  );
  const [spinCfg, setSpinCfg] = useState<SpinConfig>(() => geomFromParams(product.slug, params));
  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [product.slug]);
  // Geometry axes differ per product (SF-1 has CUSHION), so reset when the product changes.
  useEffect(() => setSpinCfg(geomFromParams(product.slug, params)), [product.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => writeStore("gh2-fabric", color), []); // eslint-disable-line react-hooks/exhaustive-deps

  const setColor = (c: string) => {
    setColorState(c);
    writeStore("gh2-fabric", c);
  };

  const fabric = fabricByName(color) ?? COLORS[0];
  const cfg = useMemo<SpinConfig>(() => ({ ...spinCfg, FABRIC: fabric.code }), [spinCfg, fabric.code]);

  const images = useMemo(() => {
    const still = stillFor(product.slug, cfg);
    return still ? [still, ...product.images].slice(0, 5) : galleryFor(product, color);
  }, [product, color, cfg]);

  const spin: SpinSource = useMemo(
    () => resolveSpin(product.slug, cfg, images[0]),
    [product.slug, cfg, images],
  );

  /** Set one geometry axis. Functional so two changes in the same tick both land -
   *  merging from a captured `spinCfg` would silently drop the first. */
  const setOption = (axis: string, code: string) =>
    setSpinCfg((prev) => ({ ...prev, [axis]: code }));

  /** Geometry as URL params, for share links and ?v= navigation. */
  const cfgParams = useMemo(() => {
    const out: Record<string, string> = { color: fabric.slug };
    for (const [axis, value] of Object.entries(spinCfg)) out[axis.toLowerCase()] = slugify(value);
    return out;
  }, [spinCfg, fabric.slug]);

  return {
    product,
    color,
    setColor,
    fabric,
    spin,
    spinCfg,
    setSpinCfg,
    setOption,
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
      buildShareUrl(product.slug, { v: variant, ...cfgParams, ...extra }),
    addToCart: (overrides?: { qty?: number; silent?: boolean }) =>
      cart.add(product, {
        color,
        qty: overrides?.qty ?? qty,
        silent: overrides?.silent,
      }),
  };
}
