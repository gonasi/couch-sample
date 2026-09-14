import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { galleryFor, splitPay, type Product } from "../data/products";
import { readStore, writeStore } from "../lib/money";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";

/** Shared color / qty / price state used by every PDP variant. */
export function useProductSelection(product: Product) {
  const navigate = useNavigate();
  const { variant } = useUI();
  const cart = useCart();
  const [color, setColorState] = useState<string>(() =>
    readStore("gh2-color", "White"),
  );
  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [product.slug]);

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
    pickConfig: (slug: string) =>
      navigate(`/product/${slug}?v=${variant}`, { replace: true }),
    addToCart: (overrides?: { qty?: number; silent?: boolean }) =>
      cart.add(product, {
        color,
        qty: overrides?.qty ?? qty,
        silent: overrides?.silent,
      }),
  };
}
