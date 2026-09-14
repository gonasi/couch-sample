import { useEffect, useState } from "react";
import type { Product } from "../data/products";

export function detailItems(product: Product) {
  const d = product.dims!;
  return [
    {
      title: "Dimensions & Fit",
      content: (
        <div style={{ display: "grid", gap: 5, lineHeight: 1.7 }}>
          <div>Overall: {d.overall}</div>
          <div>{d.seat}</div>
          <div>{d.boxes}</div>
          <div>{d.doorway}</div>
        </div>
      ),
    },
    {
      title: "Materials & Care",
      content:
        "Performance polyester blend rated 60,000+ double rubs. Feather-blend top layer over high-resilience foam core, kiln-dried hardwood frame. All covers, including base covers, are removable and machine washable cold, tumble dry low.",
    },
    {
      title: "Shipping & Returns",
      content:
        "Free curbside shipping across the lower 48. Orders ship within 48 hours and arrive in 2–5 business days. Sleep on it for 30 nights; if it is not right, we arrange pickup and refund in full.",
    },
    {
      title: "Assembly",
      content:
        "No tools required. Unzip, slide covers on, and press the ModuleLock™ connectors together. Most setups take under 20 minutes with one person.",
    },
  ];
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el)
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 90,
      behavior: "smooth",
    });
}

/** Counts down to local midnight — used for the "sale ends" timer. */
export function useCountdown() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      h: Math.floor(diff / 3.6e6),
      m: Math.floor((diff % 3.6e6) / 6e4),
      s: Math.floor((diff % 6e4) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function deliveryDate(businessDays = 5) {
  const d = new Date();
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
