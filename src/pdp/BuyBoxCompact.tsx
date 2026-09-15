import type { Product } from "../data/products";
import type { useProductSelection } from "../hooks/useProductSelection";
import { money } from "../lib/money";
import { ConfigPicker, QtyStepper, Stars, Swatches } from "../components/ui";
import {
  DeliveryEstimator,
  FinancingCalculator,
} from "../components/Interactive";

type Selection = ReturnType<typeof useProductSelection>;

/** Minimal buy box (name, price, color, size, qty, add) reused by the interactive variants. */
export default function BuyBoxCompact({
  product,
  sel,
  eyebrow = "Cloud Collection",
  financing = true,
  delivery = false,
}: {
  product: Product;
  sel: Selection;
  eyebrow?: string;
  financing?: boolean;
  delivery?: boolean;
}) {
  return (
    <div className="stack" style={{ ["--gap" as string]: "18px" }}>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display h2" style={{ margin: "8px 0 6px" }}>
          {product.name}
        </h2>
        <div className="row" style={{ gap: 8, fontSize: 14 }}>
          <Stars size={14} /> 4.9{" "}
          <span className="muted">· 5,250+ reviews</span>
        </div>
      </div>
      <div className="row wrap" style={{ gap: 10, alignItems: "baseline" }}>
        <span className="display" style={{ fontSize: 32 }}>
          {money(sel.price)}
        </span>
        <s className="muted">{money(sel.compare)}</s>
        <span className="pill pill-accent">
          Save {money(sel.savings).replace(".00", "")}
        </span>
      </div>
      <div>
        <div className="row between label" style={{ marginBottom: 10 }}>
          <span>Color</span>
          <span
            className="muted"
            style={{ letterSpacing: 0, textTransform: "none" }}
          >
            {sel.color}
          </span>
        </div>
        <Swatches value={sel.color} onChange={sel.setColor} size={34} />
      </div>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>
          Size
        </div>
        <ConfigPicker
          current={product.slug}
          onPick={(slug) => sel.pickConfig(slug, { keepScroll: true })}
        />
      </div>
      <div className="row wrap" style={{ gap: 12 }}>
        <QtyStepper value={sel.qty} onChange={sel.setQty} />
        <button
          className="btn"
          style={{ flex: 1, minWidth: 200, padding: "16px 24px" }}
          onClick={() => sel.addToCart()}
        >
          Add to Cart — {money(sel.price * sel.qty)}
        </button>
      </div>
      {financing && (
        <div
          style={{ padding: 14, borderRadius: 14, background: "var(--soft)" }}
        >
          <FinancingCalculator compact amount={sel.price * sel.qty} />
        </div>
      )}
      {delivery && <DeliveryEstimator />}
    </div>
  );
}
