import { useEffect, useState } from "react";
import { Expand, Play, Ruler } from "lucide-react";
import type { Product } from "../data/products";
import { useProductSelection } from "../hooks/useProductSelection";
import { money } from "../lib/money";
import {
  Accordion,
  Breadcrumbs,
  ConfigPicker,
  Img,
  QtyStepper,
  Stars,
  Swatches,
  TrustRow,
} from "../components/ui";
import { FeatureCards, PairsWellWith } from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import { Lightbox } from "../components/Overlays";
import VideoModal from "../components/VideoModal";
import { ZoomLens } from "../components/Magnify";
import { ProductStage, isRender, isSpinnable } from "../components/ProductStage";
import { ConfigOptions } from "../components/FeaturePicker";
import { ConfigCompareModal, SaveShare } from "../components/Interactive";
import { RoomFitChecker } from "../components/RoomFit";
import { detailItems, scrollToId } from "./shared";

/** PDP Option A — Classic Gallery (faithful port of the design canvas). */
export default function PdpA({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [video, setVideo] = useState(false);
  const [compare, setCompare] = useState(false);
  const keepPick = (slug: string) => sel.pickConfig(slug, { keepScroll: true });

  useEffect(() => setActive(0), [sel.color, product.slug]);

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
          ["--min" as string]: "330px",
          ["--gap" as string]: "52px",
          paddingTop: 22,
          alignItems: "start",
        }}
      >
        <div
          className="sticky-col"
          style={{ display: "grid", gap: 12, top: 92 }}
        >
          <div style={{ position: "relative" }}>
            {active === 0 && isSpinnable(sel.spin) ? (
              /* Outside the <button> on purpose: a drag that starts and ends inside a
                 button fires a click on pointerup, which would open the Lightbox on
                 every spin. Double-click and the corner icon still expand. */
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                }}
              >
                <ProductStage
                  spin={sel.spin}
                  src={sel.images[0]}
                  alt={`${product.name} in ${sel.color}`}
                  ratio="4/3"
                  eager
                  onExpand={() => setLightbox(0)}
                />
              </div>
            ) : (
              <button
                onClick={() => setLightbox(active)}
                style={{
                  padding: 0,
                  border: 0,
                  background: "none",
                  cursor: "zoom-in",
                  display: "block",
                  width: "100%",
                }}
                aria-label="Open image viewer"
              >
                <div
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                  }}
                >
                  {active === 0 && isRender(sel.spin) ? (
                    /* A still-only configuration is still a 16:10 render, so it goes
                       through ProductStage; ZoomLens would inherit object-fit: cover
                       and crop the sofa. */
                    <ProductStage
                      spin={sel.spin}
                      src={sel.images[0]}
                      alt={`${product.name} in ${sel.color}`}
                      ratio="4/3"
                      eager
                    />
                  ) : (
                    <ZoomLens
                      src={sel.images[active]}
                      alt={`${product.name} in ${sel.color}`}
                      w={1400}
                      ratio="4/3"
                      eager
                    />
                  )}
                </div>
              </button>
            )}
            <div style={{ position: "absolute", right: 16, top: 16 }}>
              <SaveShare
                slug={product.slug}
                color={sel.color}
                title={product.name}
              />
            </div>
            <span
              className="pill pill-soft"
              style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                fontFamily: "var(--mono)",
                fontSize: 11,
              }}
            >
              {active + 1} / {sel.images.length}
            </span>
            <button
              className="icon-btn"
              onClick={() => setLightbox(active)}
              aria-label="Expand"
              style={{ position: "absolute", right: 16, bottom: 16 }}
            >
              <Expand size={16} />
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 10,
            }}
          >
            {sel.images.slice(0, 4).map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                style={{
                  padding: 0,
                  background: "none",
                  cursor: "pointer",
                  borderRadius: 10,
                  border:
                    active === i
                      ? "2px solid var(--ink)"
                      : "1px solid var(--line)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Img src={img} alt="" w={220} ratio="1" />
                {i === 0 && isSpinnable(sel.spin) && (
                  <span className="thumb-360">360°</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setVideo(true)}
              aria-label="Play product video"
              style={{
                padding: 0,
                background: "none",
                cursor: "pointer",
                borderRadius: 10,
                border: "1px solid var(--line)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Img
                src={sel.images[4] ?? sel.images[0]}
                alt=""
                w={220}
                ratio="1"
                style={{ filter: "brightness(.75)" }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Play size={18} fill="#fff" />
              </span>
            </button>
          </div>
        </div>

        <div className="stack" style={{ ["--gap" as string]: "22px" }}>
          <div>
            <span className="eyebrow">Cloud Collection</span>
            <h1 className="display h1" style={{ margin: "10px 0 12px" }}>
              {product.name}
            </h1>
            <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
              <Stars />
              <span>4.9</span>
              <button
                className="text-btn"
                style={{ textDecoration: "none", fontSize: 14.5 }}
                onClick={() => scrollToId("reviews")}
              >
                · 5,250+ reviews
              </button>
            </div>
          </div>
          <div className="row wrap" style={{ alignItems: "baseline", gap: 12 }}>
            <span className="display" style={{ fontSize: 34 }}>
              {money(sel.price)}
            </span>
            <s className="muted" style={{ fontSize: 17 }}>
              {money(sel.compare)}
            </s>
            <span className="pill pill-accent" style={{ fontSize: 11.5 }}>
              Save {money(sel.savings).replace(".00", "")}
            </span>
          </div>
          <p className="muted" style={{ margin: "-10px 0 0", fontSize: 14.5 }}>
            or 4 interest-free payments of {money(sel.split)}. No sales tax
            collected at checkout.
          </p>
          <p
            className="muted"
            style={
              {
                margin: 0,
                fontSize: 16.5,
                lineHeight: 1.65,
                textWrap: "pretty",
              } as React.CSSProperties
            }
          >
            {product.description}
          </p>

          <div>
            <div className="row between label" style={{ marginBottom: 12 }}>
              <span>Color</span>
              <span
                className="muted"
                style={{ letterSpacing: 0, textTransform: "none" }}
              >
                {sel.color}
              </span>
            </div>
            <Swatches value={sel.color} onChange={sel.setColor} />
          </div>

          <div>
            <div className="row between label" style={{ marginBottom: 12 }}>
              <span>Shape</span>
            </div>
            <ConfigOptions
              productSlug={product.slug}
              cfg={sel.spinCfg}
              fabricCode={sel.fabric.code}
              onChange={sel.setOption}
            />
          </div>

          <div>
            <div className="row between label" style={{ marginBottom: 12 }}>
              <span>Configuration</span>
              <button
                className="text-btn row"
                style={{
                  gap: 5,
                  letterSpacing: 0,
                  textTransform: "none",
                  fontSize: 14,
                }}
                onClick={() => setCompare(true)}
              >
                <Ruler size={14} /> Compare sizes
              </button>
            </div>
            <ConfigPicker current={product.slug} onPick={keepPick} />
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <QtyStepper value={sel.qty} onChange={sel.setQty} />
            <button
              className="btn"
              style={{ flex: 1, minWidth: 220, padding: "17px 28px" }}
              onClick={() => sel.addToCart()}
            >
              Add to Cart — {money(sel.price * sel.qty)}
            </button>
          </div>

          <TrustRow />
          <Accordion
            items={(() => {
              const items = detailItems(product);
              items.splice(1, 0, {
                title: "Will it fit your room?",
                content: (
                  <RoomFitChecker
                    compact
                    modules={product.layout!}
                    color={sel.color}
                    currentSlug={product.slug}
                    onSuggest={keepPick}
                  />
                ),
              });
              return items;
            })()}
            defaultOpen={0}
            icon="chevron"
          />
        </div>
      </section>

      <FeatureCards />
      <DeepReviews />
      <QandA />
      <FaqTabs />
      <PairsWellWith />

      <Lightbox
        images={sel.images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
      <ConfigCompareModal
        open={compare}
        onClose={() => setCompare(false)}
        current={product.slug}
        color={sel.color}
        onChoose={keepPick}
      />
      <VideoModal
        open={video}
        onClose={() => setVideo(false)}
        poster={sel.images[1] ?? sel.images[0]}
        title={`${product.name} — 0:45`}
      />
    </div>
  );
}
