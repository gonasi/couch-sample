import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, Blocks, Check, ChevronLeft, ChevronRight, Expand, Flame, Gift, Lock, Package, RotateCcw, ShieldCheck, Sofa, Truck, X } from "lucide-react";
import { COLORS, COUCHES, type Product } from "../data/products";
import { HOME_IMAGES, IMG } from "../data/images";
import { BUYBOX_QUOTES, DEEP_REVIEWS, PRESS } from "../data/reviewsDeep";
import { useProductSelection } from "../hooks/useProductSelection";
import { useUI } from "../context/UIContext";
import { money } from "../lib/money";
import { Accordion, Breadcrumbs, Img, QtyStepper, Stars } from "../components/ui";
import { ComparisonTable, UgcStrip } from "../components/Sections";
import { Lightbox } from "../components/Overlays";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import { deliveryDate, detailItems, pad2, scrollToId, useCountdown } from "./shared";

const short = (n: number) => money(n).replace(".00", "");

/** PDP Option E — long-form, high-converting sales page with deep social proof. */
export default function PdpE({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const navigate = useNavigate();
  const { setBottomOffset } = useUI();
  const t = useCountdown();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActive(0), [sel.color, product.slug]);

  useEffect(() => {
    const id = setInterval(
      () => setQuoteIdx((i) => (i + 1) % BUYBOX_QUOTES.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const r = buyRef.current?.getBoundingClientRect();
      setShowBar(!!r && r.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => setBottomOffset(showBar ? 76 : 0),
    [showBar, setBottomOffset],
  );
  useEffect(() => () => setBottomOffset(0), [setBottomOffset]);

  const pctOff = Math.round((sel.savings / sel.compare) * 100);
  const stock = COLORS.find((c) => c.name === sel.color)!.stock;
  const quote = BUYBOX_QUOTES[quoteIdx];
  const buyNow = () => {
    sel.addToCart({ silent: true });
    navigate("/checkout");
  };
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: product.name },
        ]}
      />

      {/* ---------- Above the fold ---------- */}
      <section
        className="container grid-auto"
        style={{
          ["--min" as string]: "340px",
          ["--gap" as string]: "48px",
          paddingTop: 18,
          alignItems: "start",
        }}
      >
        <div className="sticky-col" style={{ top: 92 }}>
          <div className="gallery-e">
            <div className="thumbs">
              {sel.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  style={{
                    padding: 0,
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "none",
                    border:
                      i === active
                        ? "2px solid var(--ink)"
                        : "1px solid var(--line)",
                  }}
                >
                  <Img src={img} alt="" w={200} ratio="1" />
                </button>
              ))}
            </div>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                border: "1px solid var(--line)",
              }}
            >
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
                  ratio="1"
                  eager
                />
              </button>
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "flex-start",
                }}
              >
                <span className="pill">#1 best-selling modular</span>
                <span className="pill pill-accent">{pctOff}% off today</span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setLightbox(active)}
                aria-label="Expand"
                style={{ position: "absolute", right: 14, bottom: 14 }}
              >
                <Expand size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={() =>
                  setActive(
                    (active - 1 + sel.images.length) % sel.images.length,
                  )
                }
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
                onClick={() => setActive((active + 1) % sel.images.length)}
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
            </div>
          </div>
        </div>

        <div
          ref={buyRef}
          className="stack"
          style={{ ["--gap" as string]: "18px" }}
        >
          <div className="row wrap" style={{ gap: "8px 14px", fontSize: 14 }}>
            <button
              onClick={() => scrollToId("reviews")}
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
              <Stars size={15} />{" "}
              <strong style={{ fontWeight: 600 }}>4.9</strong>
              <span className="muted" style={{ textDecoration: "underline" }}>
                5,250 reviews
              </span>
            </button>
            <span className="row muted" style={{ gap: 5 }}>
              <BadgeCheck size={15} color="var(--accent)" /> 98% would recommend
            </span>
          </div>

          <div>
            <h1
              className="display"
              style={{ fontSize: "clamp(30px,3.6vw,46px)" }}
            >
              {product.name}
            </h1>
            <p
              className="muted"
              style={{ margin: "8px 0 0", fontSize: 16.5, lineHeight: 1.55 }}
            >
              The deep, cloud-soft modular couch with washable-everything
              covers. Ships in boxes, clicks together in 20 minutes.
            </p>
          </div>

          <div>
            <div
              className="row wrap"
              style={{ alignItems: "baseline", gap: 12 }}
            >
              <span className="display" style={{ fontSize: 40 }}>
                {money(sel.price)}
              </span>
              <s className="muted" style={{ fontSize: 18 }}>
                {money(sel.compare)}
              </s>
              <span className="pill pill-accent">
                Save {short(sel.savings)} ({pctOff}%)
              </span>
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              As low as{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                {short(Math.ceil(sel.price / 12))}/mo
              </strong>{" "}
              at 0% APR or 4 × {money(sel.split)} interest-free.{" "}
              <Link
                to="/support/financing"
                className="muted"
                style={{ textDecoration: "underline" }}
              >
                Check eligibility
              </Link>
            </div>
          </div>

          <div
            key={quoteIdx}
            className="row"
            style={{
              gap: 12,
              background: "var(--soft)",
              borderRadius: 14,
              padding: "12px 16px",
              animation: "fadeIn .4s ease",
            }}
          >
            <Img
              src={DEEP_REVIEWS[quoteIdx % 6].photos[0] ?? IMG.beagle}
              alt=""
              w={100}
              style={{ width: 42, height: 42, borderRadius: 99, flex: "none" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Stars size={12} />
              <div style={{ fontSize: 14.5, lineHeight: 1.4 }}>
                “{quote.text}”
              </div>
              <div className="muted row" style={{ fontSize: 12.5, gap: 4 }}>
                {quote.name} <BadgeCheck size={12} /> Verified buyer
              </div>
            </div>
          </div>

          <div
            className="row wrap between"
            style={{
              gap: 10,
              border: "1.5px dashed var(--accent)",
              borderRadius: 14,
              padding: "12px 16px",
            }}
          >
            <span className="row" style={{ gap: 10, fontSize: 14.5 }}>
              <Gift size={18} color="var(--accent)" />
              <span>
                <strong style={{ fontWeight: 600 }}>FREE Cloud Throw</strong>{" "}
                ($129 value) with every couch
              </span>
            </span>
            <span
              className="muted"
              style={{ fontFamily: "var(--mono)", fontSize: 13 }}
            >
              ends {pad2(t.h)}:{pad2(t.m)}:{pad2(t.s)}
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
                  <Flame size={14} /> Low stock — {stock} left
                </span>
              ) : (
                <span className="row muted" style={{ gap: 5, fontSize: 13.5 }}>
                  <Check size={14} /> In stock, ships in 48h
                </span>
              )}
            </div>
            <div className="row wrap" style={{ gap: 16 }}>
              {COLORS.map((c) => {
                const on = c.name === sel.color;
                return (
                  <button
                    key={c.name}
                    onClick={() => sel.setColor(c.name)}
                    aria-label={c.name}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--ink)",
                    }}
                  >
                    <span
                      className={`swatch ${on ? "active" : ""}`}
                      style={{
                        width: 40,
                        height: 40,
                        background: c.hex,
                        display: "block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: on ? "var(--ink)" : "var(--muted)",
                      }}
                    >
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span className="label">Size</span>
              <Link
                to="/support/size-guide"
                className="muted"
                style={{ fontSize: 13.5, textDecoration: "underline" }}
              >
                Size guide
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 10,
              }}
            >
              {COUCHES.map((c) => {
                const on = c.slug === product.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => sel.pickConfig(c.slug)}
                    style={{
                      textAlign: "left",
                      padding: on ? "11px 13px" : "12px 14px",
                      borderRadius: 12,
                      border: on
                        ? "2px solid var(--ink)"
                        : "1px solid var(--line)",
                      background: "var(--surface)",
                      color: "var(--ink)",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {c.bestSeller && (
                      <span
                        className="pill pill-accent"
                        style={{
                          position: "absolute",
                          top: -9,
                          right: 10,
                          fontSize: 9.5,
                          padding: "4px 8px",
                        }}
                      >
                        Most popular
                      </span>
                    )}
                    <div style={{ fontSize: 15 }}>{c.shortName}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      Seats {c.seats} ·{" "}
                      {c.dims!.overall.replace(' × 33" H', "")}
                    </div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {short(c.price)}{" "}
                      <s className="muted" style={{ fontSize: 12 }}>
                        {short(c.compare)}
                      </s>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <QtyStepper value={sel.qty} onChange={sel.setQty} />
            <button
              className="btn"
              style={{ flex: 1, minWidth: 220, padding: "17px 24px" }}
              onClick={() => sel.addToCart()}
            >
              Add to Cart — {money(sel.price * sel.qty)}
            </button>
          </div>
          <button
            className="btn btn-accent btn-block"
            style={{ padding: 17, marginTop: -6 }}
            onClick={buyNow}
          >
            Buy it now
          </button>

          <div
            className="row wrap"
            style={{ gap: 6, justifyContent: "center" }}
          >
            <span
              className="row muted"
              style={{ gap: 5, fontSize: 12.5, marginRight: 4 }}
            >
              <Lock size={13} /> Secure checkout
            </span>
            {[
              "VISA",
              "Mastercard",
              "AMEX",
              "PayPal",
              "Apple Pay",
              "Affirm",
            ].map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "4px 7px",
                  background: "var(--surface)",
                }}
              >
                {p}
              </span>
            ))}
          </div>

          <div
            className="row"
            style={{
              gap: 10,
              fontSize: 14.5,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <Truck size={18} color="var(--accent)" style={{ flex: "none" }} />
            <span>
              Free delivery by{" "}
              <strong style={{ fontWeight: 600 }}>{deliveryDate()}</strong> ·
              ships in 48 hours from our US warehouse
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
              textAlign: "center",
            }}
          >
            {[
              [RotateCcw, "30-night", "risk-free trial"],
              [ShieldCheck, "10-year", "frame warranty"],
              [Truck, "Free", "shipping & returns"],
            ].map(([Icon, a, b]) => {
              const I = Icon as typeof Truck;
              return (
                <div
                  key={a as string}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 12,
                    background: "var(--soft)",
                  }}
                >
                  <I
                    size={20}
                    color="var(--accent)"
                    style={{ margin: "0 auto 4px" }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {a as string}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {b as string}
                  </div>
                </div>
              );
            })}
          </div>

          <Accordion
            icon="chevron"
            items={[
              ...detailItems(product),
              {
                title: "What’s in the box",
                content: `${product.pieces} modules with covers pre-fitted, ModuleLock™ connectors, non-slip felt pads, a care card and your free Cloud Throw.`,
              },
            ]}
          />
        </div>
      </section>

      {/* ---------- Press ---------- */}
      <section
        style={{
          marginTop: 80,
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="container" style={{ padding: "36px 24px" }}>
          <div
            className="label muted"
            style={{ textAlign: "center", marginBottom: 18 }}
          >
            As featured in
          </div>
          <div
            className="row wrap"
            style={{ justifyContent: "center", gap: "14px 48px" }}
          >
            {PRESS.map((p, i) => (
              <span
                key={p.name}
                className="display"
                style={{
                  fontSize: 22,
                  opacity: 0.6,
                  fontStyle: i % 2 ? "italic" : "normal",
                }}
              >
                {p.name}
              </span>
            ))}
          </div>
          <div
            className="grid-auto"
            style={{
              ["--min" as string]: "240px",
              ["--gap" as string]: "24px",
              marginTop: 28,
            }}
          >
            {PRESS.slice(0, 3).map((p) => (
              <figure key={p.name} style={{ margin: 0, textAlign: "center" }}>
                <blockquote
                  className="display"
                  style={{ fontSize: 19, lineHeight: 1.4, margin: "0 0 6px" }}
                >
                  “{p.quote}”
                </blockquote>
                <figcaption className="muted" style={{ fontSize: 13 }}>
                  — {p.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section
        className="container section grid-auto"
        style={{ ["--min" as string]: "200px", ["--gap" as string]: "16px" }}
      >
        {[
          ["4.9/5", "average from 5,250 reviews"],
          ["98%", "would recommend to a friend"],
          ["30,000+", "homes lounging on a Cloud"],
          ["20 min", "average assembly, no tools"],
        ].map(([n, l]) => (
          <div
            key={l}
            className="card card-pad"
            style={{ textAlign: "center" }}
          >
            <div className="display" style={{ fontSize: 40 }}>
              {n}
            </div>
            <div className="muted" style={{ fontSize: 14.5 }}>
              {l}
            </div>
          </div>
        ))}
      </section>

      {/* ---------- How it works ---------- */}
      <section className="container section">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="eyebrow">How it works</span>
          <h2 className="display h2" style={{ marginTop: 10 }}>
            From box to cloud in 20 minutes
          </h2>
        </div>
        <div className="grid-auto" style={{ ["--min" as string]: "260px" }}>
          {[
            {
              img: IMG.dogInBox,
              Icon: Package,
              title: "Arrives in compact boxes",
              body: 'Every module ships vacuum-packed in a box that fits through any 30" doorway. No freight trucks, no stuck-in-the-stairwell moments.',
            },
            {
              img: IMG.tools,
              Icon: Blocks,
              title: "Click the modules together",
              body: "Slide the ModuleLock™ connectors into place until they click. No tools, no hardware, no instructions required.",
            },
            {
              img: IMG.sunnyLiving,
              Icon: Sofa,
              title: "Sink in — and rearrange anytime",
              body: "Pit on Friday, L-shape on Sunday. Add pieces as your home grows, and wash any cover whenever life happens.",
            },
          ].map((s, i) => (
            <div key={s.title} className="card" style={{ overflow: "hidden" }}>
              <Img src={s.img} alt={s.title} w={800} ratio="4/3" />
              <div style={{ padding: 22 }}>
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      background: "var(--accent)",
                      color: "var(--accentInk)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                    }}
                  >
                    {i + 1}
                  </span>
                  <s.Icon size={18} color="var(--accent)" />
                </div>
                <h3
                  className="display"
                  style={{ fontSize: 21, marginBottom: 6 }}
                >
                  {s.title}
                </h3>
                <p
                  className="muted"
                  style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Before / after ---------- */}
      <section className="container section">
        <h2
          className="display h2"
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          Why people are switching
        </h2>
        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "300px",
            ["--gap" as string]: "20px",
            maxWidth: 980,
            margin: "0 auto",
          }}
        >
          <div className="card card-pad" style={{ background: "transparent" }}>
            <div className="label muted" style={{ marginBottom: 14 }}>
              Your old couch
            </div>
            {[
              "Cushions flatten within a year",
              "Stains are forever",
              "Won’t fit through the door",
              "Gaps open between pieces",
              "Stuck with one layout",
            ].map((x) => (
              <div
                key={x}
                className="row muted"
                style={{
                  gap: 10,
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 15.5,
                }}
              >
                <X size={17} /> {x}
              </div>
            ))}
          </div>
          <div
            className="card card-pad"
            style={{ border: "2px solid var(--accent)" }}
          >
            <div className="label accent" style={{ marginBottom: 14 }}>
              The GH2 Cloud
            </div>
            {[
              "Feather-blend over resilient foam core",
              "Every cover unzips & machine washes",
              "Ships in boxes that fit any doorway",
              "ModuleLock™ keeps pieces flush",
              "Rearrange or expand anytime",
            ].map((x) => (
              <div
                key={x}
                className="row"
                style={{
                  gap: 10,
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 15.5,
                }}
              >
                <Check size={17} color="var(--accent)" /> {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Anatomy ---------- */}
      <section
        className="container section grid-auto"
        style={{
          ["--min" as string]: "320px",
          ["--gap" as string]: "48px",
          alignItems: "center",
        }}
      >
        <Img
          src={IMG.cushion}
          alt="Cushion detail"
          w={1000}
          ratio="4/5"
          radius="var(--radius)"
        />
        <div>
          <span className="eyebrow">Inside the cushion</span>
          <h2 className="display h2" style={{ margin: "10px 0 24px" }}>
            Four layers of cloud
          </h2>
          {[
            [
              "Feather-blend topper",
              "The soft, sink-in feel everyone talks about.",
            ],
            [
              "Fiber comfort wrap",
              "Bounces back after every sit so seats never look slumped.",
            ],
            [
              "High-resilience foam core",
              "Support that holds you up an hour later — and a year later.",
            ],
            [
              "Kiln-dried hardwood frame",
              "Won’t warp or creak. Backed by a 10-year warranty.",
            ],
          ].map(([h, b], i) => (
            <div
              key={h}
              className="row"
              style={{
                gap: 16,
                alignItems: "flex-start",
                padding: "14px 0",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span
                className="display"
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  color: "var(--accent)",
                  minWidth: 32,
                }}
              >
                0{i + 1}
              </span>
              <div>
                <div style={{ fontSize: 17 }}>{h}</div>
                <div className="muted" style={{ fontSize: 15 }}>
                  {b}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <UgcStrip
        title="#MyCloudCouch"
        subtitle="Real homes, real mess, real comfort. Tap a clip to shop the setup."
      />
      <ComparisonTable title="How the Cloud stacks up" />

      {/* ---------- Promise ---------- */}
      <section className="container section">
        <div
          className="card grid-auto"
          style={{
            ["--min" as string]: "260px",
            ["--gap" as string]: "36px",
            padding: 36,
            alignItems: "center",
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 190,
                height: 190,
                borderRadius: 999,
                border: "2px dashed var(--accent)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: "var(--soft)",
              }}
            >
              <span className="display" style={{ fontSize: 60, lineHeight: 1 }}>
                30
              </span>
              <span className="label">Nights</span>
              <span className="muted" style={{ fontSize: 12.5 }}>
                risk-free
              </span>
            </div>
          </div>
          <div className="span-2" style={{ gridColumn: "span 2" }}>
            <h2 className="display h2" style={{ marginBottom: 14 }}>
              The Cloud Promise
            </h2>
            <p className="lead" style={{ margin: "0 0 12px" }}>
              Sit on it, spill on it, let the dog on it. If it isn’t the most
              comfortable couch you’ve ever owned within 30 nights, we’ll pick
              it up for free and refund every cent.
            </p>
            <p className="muted" style={{ margin: "0 0 22px" }}>
              No restocking fees. No hoops. — The GH2 founders
            </p>
            <div className="row wrap" style={{ gap: 12 }}>
              <button className="btn btn-accent" onClick={toTop}>
                Try it risk-free
              </button>
              <Link to="/policies/returns" className="link-underline">
                Return policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DeepReviews />
      <QandA />
      <FaqTabs />

      {/* ---------- Final CTA ---------- */}
      <section
        style={{
          margin: "96px 0 0",
          position: "relative",
          minHeight: 420,
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
            background: "rgba(20,16,12,.55)",
          }}
        />
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "40px 24px",
            color: "#fff",
            maxWidth: 640,
          }}
        >
          <Stars size={18} />
          <h2
            className="display"
            style={{ fontSize: "clamp(32px,5vw,60px)", margin: "10px 0 12px" }}
          >
            Your last couch starts here
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 17, opacity: 0.9 }}>
            {money(sel.price)}{" "}
            <s style={{ opacity: 0.7 }}>{money(sel.compare)}</s> · free throw ·
            free shipping · 30-night trial
          </p>
          <div
            className="row wrap"
            style={{ gap: 12, justifyContent: "center" }}
          >
            <button className="btn btn-accent" onClick={() => sel.addToCart()}>
              Add to Cart
            </button>
            <button
              className="btn"
              style={{ background: "#fff", color: "#111" }}
              onClick={toTop}
            >
              Choose color & size
            </button>
          </div>
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
                src={sel.images[0]}
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
                <div className="muted row" style={{ fontSize: 13, gap: 6 }}>
                  <Stars size={11} /> 4.9 · {sel.color}
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 14 }}>
              <span className="desktop-only" style={{ textAlign: "right" }}>
                <span
                  className="display"
                  style={{ fontSize: 22, display: "block" }}
                >
                  {money(sel.price)}
                </span>
                <s className="muted" style={{ fontSize: 12.5 }}>
                  {money(sel.compare)}
                </s>
              </span>
              <button
                className="btn"
                style={{ padding: "14px 24px", fontSize: 13 }}
                onClick={() => sel.addToCart()}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <Lightbox
        images={sel.images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </div>
  );
}

