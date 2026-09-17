import { useState } from "react";
import { Check, Ruler, ShieldPlus, Truck } from "lucide-react";
import {
  COLORS,
  COUCHES,
  FABRIC_FAMILIES,
  swatchUrl,
  type FabricFamily,
  type Product,
} from "../data/products";
import { REVIEW_STATS } from "../data/reviews";
import { useProductSelection } from "../hooks/useProductSelection";
import { money } from "../lib/money";
import { Accordion, Breadcrumbs, Img, Modal, QtyStepper, Stars, TrustRow } from "../components/ui";
import { ProductStage, isRender, isSpinnable } from "../components/ProductStage";
import { ConfigOptions } from "../components/FeaturePicker";
import { Proportions } from "../components/Proportions";
import { PhoneHandoff } from "../components/PhoneHandoff";
import { FeatureCards, UgcStrip } from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import { Lightbox } from "../components/Overlays";
import { DeliveryEstimator } from "../components/Interactive";
import { detailItems, deliveryDate } from "./shared";

/** Four things worth knowing before the option stack. */
const KEY_POINTS = [
  "Covers unzip and machine wash",
  "Feather-blend top over a foam core",
  "Tool-free modular connectors",
  "Kiln-dried hardwood frame",
];

/** One numbered section of the buy box, with the current choice summarised in the header. */
function Step({
  n,
  title,
  summary,
  aside,
  children,
}: {
  n: number;
  title: string;
  summary: string;
  aside?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        borderTop: "1px solid var(--line)",
        paddingTop: 18,
        marginTop: 18,
        display: "grid",
        gap: 12,
      }}
    >
      <div>
        <span className="label">
          {n}. {title}
        </span>
        <div className="row between wrap" style={{ gap: 8, marginTop: 5 }}>
          <span style={{ fontSize: 15.5 }}>{summary}</span>
          {aside && (
            <button className="text-btn row" style={{ gap: 5, fontSize: 13.5 }} onClick={aside.onClick}>
              <Ruler size={14} /> {aside.label}
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * PDP Option J - Guided Steps.
 *
 * Mirrors the information architecture of a modern modular-sofa PDP: a sticky 360 stage
 * with a left thumb rail, a phone handoff and a to-scale proportions panel beneath it, and
 * a buy box built as numbered steps that each restate the current choice. Every option
 * group is driven by the mirrored render manifest, so the page can only offer what exists.
 */
export default function PdpJ({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [family, setFamily] = useState<FabricFamily>(
    () => COLORS.find((c) => c.name === sel.color)?.family ?? "Performance",
  );
  const [dims, setDims] = useState(false);

  const armsLabel = sel.spinCfg.ARMS
    ? (sel.spinCfg.ARMS.charAt(0) + sel.spinCfg.ARMS.slice(1).toLowerCase())
    : "Regular";
  const inFamily = COLORS.filter((c) => c.family === family);
  const stock = COLORS.find((c) => c.name === sel.color)?.stock ?? 10;

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: product.name },
        ]}
      />

      <section
        className="container grid-auto"
        style={{
          ["--min" as string]: "340px",
          ["--gap" as string]: "56px",
          paddingTop: 20,
          alignItems: "start",
        }}
      >
        {/* ---------------- stage ---------------- */}
        <div className="sticky-col" style={{ display: "grid", gap: 14, top: 88 }}>
          <div className="stage-with-rail">
            <div className="stage-rail" role="tablist" aria-label="Media">
              {sel.images.slice(0, 5).map((img, i) => (
                <button
                  key={img + i}
                  role="tab"
                  aria-selected={active === i}
                  aria-label={`View ${i + 1}`}
                  className={`rail-thumb ${active === i ? "active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <Img src={img} alt="" w={160} ratio="1" />
                  {i === 0 && isSpinnable(sel.spin) && <span className="thumb-360">360°</span>}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", minWidth: 0 }}>
              {active === 0 && isRender(sel.spin) ? (
                <ProductStage
                  spin={sel.spin}
                  src={sel.images[0]}
                  alt={`${product.name} in ${sel.color}`}
                  ratio="4/3"
                  radius="var(--radius)"
                  eager
                  onExpand={() => setLightbox(0)}
                />
              ) : (
                <button
                  onClick={() => setLightbox(active)}
                  style={{
                    padding: 0,
                    border: 0,
                    background: "none",
                    display: "block",
                    width: "100%",
                    cursor: "zoom-in",
                  }}
                  aria-label="Open image viewer"
                >
                  <Img
                    src={sel.images[active]}
                    alt={`${product.name} in ${sel.color}`}
                    w={1400}
                    ratio="4/3"
                    radius="var(--radius)"
                    eager
                  />
                </button>
              )}
            </div>
          </div>

          <PhoneHandoff url={sel.shareUrl()} label={`${product.name} in ${sel.color}`} />
          <Proportions product={product} />
        </div>

        {/* ---------------- buy box ---------------- */}
        <div>
          <span className="eyebrow">Cloud Collection</span>
          <h1 className="display h1" style={{ margin: "8px 0 0" }}>
            {product.name}
          </h1>

          <div className="row wrap" style={{ gap: 10, marginTop: 10, alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 30 }}>
              {money(sel.price)}
            </span>
            <span className="muted" style={{ textDecoration: "line-through" }}>
              {money(sel.compare)}
            </span>
            <span className="pill pill-accent">Save {money(sel.savings)}</span>
          </div>

          <div className="row" style={{ gap: 8, marginTop: 8, fontSize: 14 }}>
            <Stars size={14} /> {REVIEW_STATS.average}
            <span className="muted">
              ({REVIEW_STATS.total.toLocaleString()} reviews)
            </span>
          </div>

          <ul className="key-points">
            {KEY_POINTS.map((k) => (
              <li key={k} className="row" style={{ gap: 7 }}>
                <Check size={14} /> {k}
              </li>
            ))}
          </ul>

          {/* 1 ------------------------------------------------ */}
          <Step
            n={1}
            title="Size & style"
            summary={`${product.shortName} · ${armsLabel} arms`}
            aside={{ label: "Full dimensions", onClick: () => setDims(true) }}
          >
            <div>
              <span className="label">Seat size</span>
              <div className="row wrap" style={{ gap: 8, marginTop: 7 }} role="radiogroup" aria-label="Seat size">
                {COUCHES.map((c) => (
                  <button
                    key={c.id}
                    role="radio"
                    aria-checked={c.slug === product.slug}
                    className={`chip ${c.slug === product.slug ? "active" : ""}`}
                    onClick={() => sel.pickConfig(c.slug, { keepScroll: true, params: { color: sel.fabric.slug } })}
                  >
                    {c.shortName}
                  </button>
                ))}
              </div>
            </div>
            <ConfigOptions
              productSlug={product.slug}
              cfg={sel.spinCfg}
              fabricCode={sel.fabric.code}
              onChange={sel.setOption}
              only={["ARMS"]}
            />
          </Step>

          {/* 2 ------------------------------------------------ */}
          <Step n={2} title="Fabric colour" summary={`${sel.color} · ${family}`}>
            <div className="row wrap" style={{ gap: 6 }} role="tablist" aria-label="Fabric family">
              {FABRIC_FAMILIES.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={family === f}
                  className={`chip ${family === f ? "active" : ""}`}
                  style={{ padding: "6px 12px", fontSize: 12.5 }}
                  onClick={() => setFamily(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="swatch-row" style={{ ["--sw" as string]: "42px", gap: 10 }} role="radiogroup" aria-label="Fabric">
              {inFamily.map((c) => {
                const photo = swatchUrl(c.name);
                return (
                  <button
                    key={c.name}
                    role="radio"
                    aria-checked={sel.color === c.name}
                    aria-label={c.name}
                    title={c.name}
                    className={`swatch ${sel.color === c.name ? "active" : ""}`}
                    style={{
                      width: 42,
                      height: 42,
                      background: photo ? `url(${photo}) center/cover` : c.hex,
                    }}
                    onClick={() => sel.setColor(c.name)}
                  />
                );
              })}
            </div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              {stock <= 6 ? `Only ${stock} left in ${sel.color}.` : `In stock in ${sel.color}.`} Free
              swatches ship in two days.
            </p>
          </Step>

          {/* 3 ------------------------------------------------ */}
          <Step n={3} title="Configuration" summary={`${product.seats} seats · ${product.pieces} pieces`}>
            <ConfigOptions
              productSlug={product.slug}
              cfg={sel.spinCfg}
              fabricCode={sel.fabric.code}
              onChange={sel.setOption}
              only={["CHAISE", "OTTOMAN", "CUSHION"]}
            />
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              Every piece is modular — add a corner or an ottoman later and the layout changes
              in minutes.
            </p>
          </Step>

          {/* ---------------- purchase ---------------- */}
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 18, paddingTop: 18, display: "grid", gap: 12 }}>
            <span className="row muted" style={{ gap: 6, fontSize: 14 }}>
              <Truck size={15} /> Free delivery — arrives {deliveryDate()}
            </span>
            <div className="row" style={{ gap: 10 }}>
              <QtyStepper value={sel.qty} onChange={sel.setQty} />
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => sel.addToCart()}>
                Add to cart — {money(sel.price * sel.qty)}
              </button>
            </div>
            <TrustRow />

            <div className="card card-pad row between wrap" style={{ gap: 12 }}>
              <span className="row" style={{ gap: 9 }}>
                <ShieldPlus size={18} />
                <span style={{ display: "grid" }}>
                  <strong style={{ fontSize: 14.5 }}>Add Cloud Protect+</strong>
                  <span className="muted" style={{ fontSize: 13 }}>
                    Three years of accidental damage cover
                  </span>
                </span>
              </span>
              <span className="pill">{money(190)}</span>
            </div>

            <DeliveryEstimator compact />
            <Accordion items={detailItems(product)} icon="plus" />
          </div>
        </div>
      </section>

      <FeatureCards />
      <UgcStrip />
      <DeepReviews />
      <QandA />
      <FaqTabs />

      {lightbox !== null && (
        <Lightbox
          images={sel.images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndex={setLightbox}
        />
      )}
      <Modal open={dims} onClose={() => setDims(false)} width={520} label="Full dimensions">
        <h3 className="display" style={{ fontSize: 22, margin: "0 0 4px" }}>
          {product.name}
        </h3>
        <p className="muted" style={{ fontSize: 13.5, margin: "0 0 16px" }}>
          {product.seats} seats · {product.pieces} pieces
        </p>
        <div style={{ display: "grid", gap: 8, fontSize: 14.5, lineHeight: 1.7 }}>
          <div className="row between">
            <span className="muted">Overall</span>
            <span>{product.dims?.overall}</span>
          </div>
          <div className="row between">
            <span className="muted">Seat</span>
            <span>{product.dims?.seat}</span>
          </div>
          <div className="row between">
            <span className="muted">Ships as</span>
            <span>{product.dims?.boxes}</span>
          </div>
          <div className="row between">
            <span className="muted">Doorway</span>
            <span>{product.dims?.doorway}</span>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Proportions product={product} />
        </div>
      </Modal>
    </div>
  );
}
