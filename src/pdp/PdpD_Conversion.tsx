import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  Lock,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";
import { COLORS, COUCHES, getById, type Product } from "../data/products";
import { BENEFITS } from "../data/content";
import { HOME_IMAGES, UGC } from "../data/images";
import { REVIEWS } from "../data/reviews";
import { useProductSelection } from "../hooks/useProductSelection";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { money } from "../lib/money";
import {
  Accordion,
  Breadcrumbs,
  ContentIcon,
  Img,
  QtyStepper,
  Stars,
  Swatches,
} from "../components/ui";
import {
  ComparisonTable,
  RatingSummary,
  UgcStrip,
} from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import {
  ConfigCompareModal,
  DeliveryEstimator,
  FinancingModal,
} from "../components/Interactive";
import {
  deliveryDate,
  detailItems,
  pad2,
  scrollToId,
  useCountdown,
} from "./shared";

const BUNDLES = [
  {
    id: "solo",
    label: "Couch only",
    desc: "Everything you need to lounge",
    extras: [] as { id: string; discount: number }[],
    popular: false,
  },
  {
    id: "ottoman",
    label: "Couch + Storage Ottoman",
    desc: "Hide blankets, pillows & remotes",
    extras: [{ id: "ottoman", discount: 100 }],
    popular: false,
  },
  {
    id: "complete",
    label: "Complete Comfort Set",
    desc: "+ Ottoman + spare cover set",
    extras: [
      { id: "ottoman", discount: 100 },
      { id: "covers", discount: 150 },
    ],
    popular: true,
  },
];

/** PDP Option D — conversion-focused: urgency, bundles, express pay, social proof high. */
export default function PdpD({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const cart = useCart();
  const { setBottomOffset } = useUI();
  const navigate = useNavigate();
  const t = useCountdown();
  const [idx, setIdx] = useState(0);
  const [bundleId, setBundleId] = useState("complete");
  const [showBar, setShowBar] = useState(false);
  const [financing, setFinancing] = useState(false);
  const [compare, setCompare] = useState(false);
  const buyRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => setIdx(0), [sel.color, product.slug]);

  useEffect(() => {
    const onScroll = () => {
      const r = buyRef.current?.getBoundingClientRect();
      setShowBar(!!r && r.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setBottomOffset(showBar ? 76 : 0);
  }, [showBar, setBottomOffset]);
  useEffect(() => () => setBottomOffset(0), [setBottomOffset]);

  const bundle = BUNDLES.find((b) => b.id === bundleId)!;
  const bundlePrice = (b: (typeof BUNDLES)[number]) =>
    product.price +
    b.extras.reduce((s, e) => s + getById(e.id).price - e.discount, 0);
  const bundleCompare = (b: (typeof BUNDLES)[number]) =>
    product.compare + b.extras.reduce((s, e) => s + getById(e.id).price, 0);
  const total = bundlePrice(bundle) * sel.qty;
  const stock = COLORS.find((c) => c.name === sel.color)!.stock;
  const viewers = 14 + ((product.slug.length * 7) % 17);
  const pctOff = Math.round((1 - product.price / product.compare) * 100);
  const images = sel.images;

  const addBundle = (silent = false) => {
    const lines = [
      { product, opts: { color: sel.color, qty: sel.qty, silent } },
      ...bundle.extras.map((e) => {
        const p = getById(e.id);
        return {
          product: p,
          opts: {
            qty: sel.qty,
            price: p.price - e.discount,
            compare: p.price,
            note: `${sel.color} · bundle price`,
            silent,
          },
        };
      }),
    ];
    if (silent) lines.forEach((l) => cart.add(l.product, l.opts));
    else cart.addMany(lines);
  };

  const express = () => {
    addBundle(true);
    navigate("/checkout");
  };

  const go = (d: number) =>
    setIdx((i) => (i + d + images.length) % images.length);

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
          ["--gap" as string]: "44px",
          paddingTop: 18,
          alignItems: "start",
        }}
      >
        <div className="sticky-col" style={{ top: 92 }}>
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <Img
              src={images[idx]}
              alt={`${product.name} photo ${idx + 1}`}
              w={1400}
              ratio="5/4"
              eager
            />
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {product.bestSeller && <span className="pill">Best seller</span>}
              <span className="pill pill-accent">{pctOff}% off</span>
            </div>
            <button
              className="icon-btn"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={() => go(1)}
              aria-label="Next photo"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ChevronRight size={18} />
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Photo ${i + 1}`}
                  style={{
                    width: i === idx ? 22 : 8,
                    height: 8,
                    borderRadius: 9,
                    border: 0,
                    background: i === idx ? "#fff" : "rgba(255,255,255,.6)",
                    cursor: "pointer",
                    transition: "width .2s",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${images.length},1fr)`,
              gap: 8,
              marginTop: 10,
            }}
          >
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setIdx(i)}
                style={{
                  padding: 0,
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  border:
                    i === idx
                      ? "2px solid var(--ink)"
                      : "1px solid var(--line)",
                  background: "none",
                }}
                aria-label={`Show photo ${i + 1}`}
              >
                <Img src={img} alt="" w={200} ratio="1" />
              </button>
            ))}
          </div>
          <div
            className="row desktop-only"
            style={{ gap: 12, marginTop: 16, fontSize: 14 }}
          >
            <div className="row" style={{ gap: 0 }}>
              {UGC.slice(0, 4).map((u, i) => (
                <Img
                  key={u.handle}
                  src={u.image}
                  alt=""
                  w={80}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    border: "2px solid var(--bg)",
                    marginLeft: i ? -10 : 0,
                  }}
                />
              ))}
            </div>
            <span className="muted">Loved in 5,000+ American homes</span>
          </div>
        </div>

        <div className="stack" style={{ ["--gap" as string]: "18px" }}>
          <div className="row wrap" style={{ gap: 10, fontSize: 14 }}>
            <button
              onClick={() => scrollToId("d-reviews")}
              className="row"
              style={{
                gap: 8,
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
                color: "var(--ink)",
                fontSize: 14,
              }}
            >
              <Stars size={14} /> 4.9{" "}
              <span className="muted" style={{ textDecoration: "underline" }}>
                (5,250 reviews)
              </span>
            </button>
            <span className="row muted" style={{ gap: 5 }}>
              <Eye size={14} /> {viewers} people viewing now
            </span>
          </div>
          <h1
            className="display"
            style={{ fontSize: "clamp(28px,3.4vw,42px)" }}
          >
            {product.name}
          </h1>
          <div
            className="stack"
            style={{ ["--gap" as string]: "6px", fontSize: 15 }}
          >
            {[
              "Machine-washable covers — even the base",
              'Fits through any 30" doorway, no tools needed',
              "Pet-proof fabric rated 60,000+ double rubs",
            ].map((b) => (
              <span key={b} className="row" style={{ gap: 8 }}>
                <Check size={16} color="var(--accent)" /> {b}
              </span>
            ))}
          </div>

          <div>
            <div
              className="row wrap"
              style={{ alignItems: "baseline", gap: 12 }}
            >
              <span className="display" style={{ fontSize: 38 }}>
                {money(product.price)}
              </span>
              <s className="muted" style={{ fontSize: 18 }}>
                {money(product.compare)}
              </s>
              <span className="pill pill-accent">
                You save {money(sel.savings).replace(".00", "")}
              </span>
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
              or 4 ×{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                {money(sel.split)}
              </strong>{" "}
              interest-free ·{" "}
              <button
                className="text-btn muted"
                style={{ fontSize: 14 }}
                onClick={() => setFinancing(true)}
              >
                See monthly plans
              </button>
            </div>
          </div>

          <div
            className="row between wrap"
            style={{
              gap: 10,
              background: "var(--soft)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "12px 16px",
            }}
          >
            <span className="row" style={{ gap: 8, fontSize: 14.5 }}>
              <Timer size={17} color="var(--accent)" /> 30% sale ends in
            </span>
            <span
              className="row"
              style={{ gap: 6, fontFamily: "var(--mono)", fontSize: 15 }}
            >
              {[pad2(t.h), pad2(t.m), pad2(t.s)].map((n, i) => (
                <span key={i} className="row" style={{ gap: 6 }}>
                  {i > 0 && <span className="muted">:</span>}
                  <span
                    style={{
                      background: "var(--ink)",
                      color: "var(--bg)",
                      borderRadius: 6,
                      padding: "4px 7px",
                      minWidth: 32,
                      textAlign: "center",
                    }}
                  >
                    {n}
                  </span>
                </span>
              ))}
            </span>
          </div>

          <div>
            <div
              className="row between wrap"
              style={{ marginBottom: 10, gap: 8 }}
            >
              <span className="label">
                Color:{" "}
                <span style={{ textTransform: "none", letterSpacing: 0 }}>
                  {sel.color}
                </span>
              </span>
              {stock <= 6 ? (
                <span className="row accent" style={{ gap: 5, fontSize: 13.5 }}>
                  <Flame size={14} /> Only {stock} left in {sel.color}
                </span>
              ) : (
                <span className="muted" style={{ fontSize: 13.5 }}>
                  In stock — ships in 48 hours
                </span>
              )}
            </div>
            <Swatches size={34} value={sel.color} onChange={sel.setColor} />
          </div>

          <div>
            <div className="row between label" style={{ marginBottom: 10 }}>
              <span>Size</span>
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
            <div className="row wrap" style={{ gap: 8 }}>
              {COUCHES.map((c) => (
                <button
                  key={c.slug}
                  className={`chip ${c.slug === product.slug ? "active" : ""}`}
                  onClick={() => sel.pickConfig(c.slug)}
                >
                  {c.shortName}
                </button>
              ))}
            </div>
          </div>

          <div
            role="radiogroup"
            aria-label="Bundle"
            className="stack"
            style={{ ["--gap" as string]: "10px" }}
          >
            <div className="label">Bundle & save</div>
            {BUNDLES.map((b) => {
              const active = b.id === bundleId;
              const save = bundleCompare(b) - bundlePrice(b) - sel.savings;
              return (
                <button
                  key={b.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setBundleId(b.id)}
                  className="row"
                  style={{
                    gap: 14,
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 14,
                    cursor: "pointer",
                    position: "relative",
                    color: "var(--ink)",
                    background: active ? "var(--surface)" : "transparent",
                    border: active
                      ? "2px solid var(--accent)"
                      : "1px solid var(--line)",
                    margin: active ? 0 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 99,
                      border: `2px solid ${active ? "var(--accent)" : "var(--line)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    {active && (
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 99,
                          background: "var(--accent)",
                        }}
                      />
                    )}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 15.5 }}>
                      {b.label}
                    </span>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {b.desc}
                    </span>
                    {save > 0 && (
                      <span
                        className="accent"
                        style={{ display: "block", fontSize: 13, marginTop: 2 }}
                      >
                        Extra {money(save).replace(".00", "")} off
                      </span>
                    )}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontSize: 16 }}>
                      {money(bundlePrice(b))}
                    </span>
                    <s className="muted" style={{ fontSize: 13 }}>
                      {money(bundleCompare(b))}
                    </s>
                  </span>
                  {b.popular && (
                    <span
                      className="pill pill-accent"
                      style={{
                        position: "absolute",
                        top: -10,
                        right: 14,
                        fontSize: 10,
                      }}
                    >
                      Most popular
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <QtyStepper value={sel.qty} onChange={sel.setQty} />
            <button
              ref={buyRef}
              className="btn btn-accent"
              style={{
                flex: 1,
                minWidth: 220,
                padding: "18px 24px",
                fontSize: 14.5,
              }}
              onClick={() => addBundle()}
            >
              Add to Cart — {money(total)}
            </button>
          </div>

          <div>
            <div
              className="row muted"
              style={{
                gap: 10,
                fontSize: 12,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              <hr className="divider" style={{ flex: 1 }} /> Express checkout{" "}
              <hr className="divider" style={{ flex: 1 }} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
              }}
            >
              <button
                onClick={express}
                style={{ ...expressBtn, background: "#5A31F4", color: "#fff" }}
              >
                shop<strong style={{ fontWeight: 800 }}>Pay</strong>
              </button>
              <button
                onClick={express}
                style={{ ...expressBtn, background: "#000", color: "#fff" }}
              >
                <strong style={{ fontWeight: 600 }}> Pay</strong>
              </button>
              <button
                onClick={express}
                style={{
                  ...expressBtn,
                  background: "#FFC439",
                  color: "#1a2a5a",
                }}
              >
                <strong style={{ fontWeight: 800, fontStyle: "italic" }}>
                  PayPal
                </strong>
              </button>
            </div>
          </div>

          <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
            <Truck size={18} color="var(--accent)" />
            <span>
              Order in the next{" "}
              <strong style={{ fontWeight: 600 }}>
                {t.h}h {t.m}m
              </strong>{" "}
              for free delivery by{" "}
              <strong style={{ fontWeight: 600 }}>{deliveryDate()}</strong>
            </span>
          </div>
          <DeliveryEstimator compact />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 10,
            }}
          >
            {[
              [Truck, "Free shipping"],
              [RotateCcw, "30-night trial"],
              [ShieldCheck, "10-year warranty"],
              [Lock, "Secure checkout"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Truck;
              return (
                <div
                  key={label as string}
                  className="row card"
                  style={{
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                >
                  <I size={17} color="var(--accent)" /> {label as string}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container section" id="d-reviews">
        <div
          className="row between wrap"
          style={{ gap: 16, marginBottom: 24, alignItems: "flex-end" }}
        >
          <h2 className="display h2">5,250 reasons to love it</h2>
          <button
            className="link-underline"
            onClick={() => scrollToId("reviews")}
          >
            See all reviews
          </button>
        </div>
        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "260px",
            ["--gap" as string]: "20px",
            alignItems: "stretch",
          }}
        >
          <RatingSummary compact />
          {REVIEWS.slice(0, 3).map((r) => (
            <article
              key={r.id}
              className="card card-pad stack"
              style={{ ["--gap" as string]: "10px" }}
            >
              <Stars rating={r.rating} />
              <h3 className="display" style={{ fontSize: 19 }}>
                “{r.title}”
              </h3>
              <p
                className="muted"
                style={{ margin: 0, fontSize: 15, lineHeight: 1.6, flex: 1 }}
              >
                {r.body}
              </p>
              <span style={{ fontSize: 13.5 }}>
                {r.name}{" "}
                <span className="muted">· Verified buyer · {r.config}</span>
              </span>
            </article>
          ))}
        </div>
      </section>

      <UgcStrip
        title="Loved in 5,000+ homes"
        subtitle="Tap a clip to shop the exact setup."
      />

      <section
        style={{
          marginTop: 72,
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          className="container grid-auto"
          style={{
            ["--min" as string]: "210px",
            ["--gap" as string]: "32px",
            padding: "44px 24px",
          }}
        >
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="stack"
              style={{ ["--gap" as string]: "8px" }}
            >
              <div className="icon-tile">
                <ContentIcon name={b.icon} />
              </div>
              <strong style={{ fontSize: 16, fontWeight: 600 }}>
                {b.title}
              </strong>
              <span className="muted" style={{ fontSize: 15 }}>
                {b.body}
              </span>
            </div>
          ))}
        </div>
      </section>

      <ComparisonTable title="GH2 vs. the others" />

      <section className="container-narrow section">
        <h2 className="display h3" style={{ marginBottom: 12 }}>
          Details
        </h2>
        <Accordion items={detailItems(product)} icon="chevron" />
      </section>

      <DeepReviews />
      <QandA />
      <FaqTabs />

      <section
        style={{
          margin: "96px 0 0",
          position: "relative",
          minHeight: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Img
          src={HOME_IMAGES.feelComfort}
          alt=""
          w={2000}
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20,16,12,.5)",
          }}
        />
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "40px 24px",
            color: "#fff",
          }}
        >
          <h2
            className="display"
            style={{ fontSize: "clamp(32px,5vw,60px)", marginBottom: 12 }}
          >
            Ready to feel the Cloud?
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 17, opacity: 0.9 }}>
            {pctOff}% off ends tonight · Free shipping · 30-night trial
          </p>
          <button
            className="btn btn-accent"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Claim {money(sel.savings).replace(".00", "")} off
          </button>
        </div>
      </section>

      {showBar && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            boxShadow: "0 -10px 40px rgba(0,0,0,.08)",
            animation: "fadeUp .25s ease",
          }}
        >
          <div
            className="container row between"
            style={{ padding: "12px 24px", gap: 12 }}
          >
            <div className="row" style={{ gap: 12, minWidth: 0 }}>
              <Img
                src={images[0]}
                alt=""
                w={120}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  flex: "none",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  className="display"
                  style={{
                    fontSize: 17,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {product.name}
                </div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {sel.color} · {bundle.label}
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 14 }}>
              <span className="desktop-only display" style={{ fontSize: 22 }}>
                {money(total)}
              </span>
              <button
                className="btn btn-accent"
                style={{ padding: "14px 24px", fontSize: 13 }}
                onClick={() => addBundle()}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      <FinancingModal
        open={financing}
        onClose={() => setFinancing(false)}
        amount={total}
      />
      <ConfigCompareModal
        open={compare}
        onClose={() => setCompare(false)}
        current={product.slug}
        color={sel.color}
        onChoose={(slug) => sel.pickConfig(slug, { keepScroll: true })}
      />
    </div>
  );
}

const expressBtn: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: "13px 8px",
  fontSize: 16,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
};
