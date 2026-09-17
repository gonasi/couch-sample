import { useEffect, useRef } from "react";
import { COUCHES, type Product } from "../data/products";
import { IMG } from "../data/images";
import { REVIEWS, REVIEW_STATS } from "../data/reviews";
import { useProductSelection } from "../hooks/useProductSelection";
import { ProductStage } from "../components/ProductStage";
import { useUI } from "../context/UIContext";
import { money, moneyShort } from "../lib/money";
import { Img, Swatches } from "../components/ui";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import { Hotspots } from "../components/Interactive";
import { FabricTexture, Magnifier } from "../components/Magnify";
import { RoomFitChecker } from "../components/RoomFit";
import { scrollToId } from "./shared";

/** PDP Option B — Editorial Scroll (faithful port of the design canvas). */
export default function PdpB({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const { setBottomOffset } = useUI();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBottomOffset(el.offsetHeight));
    ro.observe(el);
    return () => {
      ro.disconnect();
      setBottomOffset(0);
    };
  }, [setBottomOffset]);

  const specs = [
    [
      "Overall",
      product.dims!.overall.replace(' × 33" H', "").replace(/ [WD]/g, ""),
    ],
    ["Seat depth", "44 inches"],
    ["Durability", "60,000+ rubs"],
    ["Ships as", `${product.pieces} boxes`],
    ["Doorway", 'Fits 30"'],
    ["Assembly", "20 minutes"],
  ];

  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      <section
        style={{
          position: "relative",
          minHeight: "88vh",
          display: "flex",
          alignItems: "flex-end",
          background: "#2B3226",
          overflow: "hidden",
        }}
      >
        <ProductStage
          spin={sel.spin}
          src={sel.images[0]}
          alt={product.name}
          w={2400}
          eager
          style={{ position: "absolute", inset: 0, background: "#2B3226" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.08) 28%,rgba(0,0,0,.15) 55%,rgba(0,0,0,.72) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
            padding: "120px 28px 60px",
            color: "#F4F5EF",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Cloud Collection · No. {String(product.pieces).padStart(2, "0")}
          </span>
          <h1
            className="display"
            style={{
              fontSize: "clamp(52px,9vw,128px)",
              lineHeight: 0.92,
              margin: "14px 0 18px",
              maxWidth: "14ch",
            }}
          >
            {product.name}
          </h1>
          <p
            style={{
              maxWidth: "52ch",
              fontSize: 18,
              lineHeight: 1.6,
              opacity: 0.88,
              margin: "0 0 28px",
            }}
          >
            {product.blurb} A feather-blend top over a foam core, and covers
            that all come off and go in the machine.
          </p>
          <div className="row wrap" style={{ gap: 28, alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 42 }}>
              {moneyShort(sel.price)}
            </span>
            <s style={{ opacity: 0.6, fontSize: 18 }}>
              {moneyShort(sel.compare)}
            </s>
            <button
              onClick={() => scrollToId("owners")}
              style={{
                background: "none",
                border: 0,
                color: "inherit",
                cursor: "pointer",
                fontSize: 14,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                opacity: 0.85,
                padding: 0,
              }}
            >
              ★★★★★ 4.9 · 5,250 reviews
            </button>
          </div>
        </div>
      </section>

      <section
        style={{ maxWidth: 860, margin: "0 auto", padding: "84px 28px 0" }}
      >
        <p
          className="display"
          style={
            {
              fontSize: "clamp(24px,3.2vw,38px)",
              lineHeight: 1.35,
              margin: "0 0 28px",
              textWrap: "pretty",
            } as React.CSSProperties
          }
        >
          Most couches look good and don’t feel good. They flatten, they shift,
          and after a year you are rearranging cushions every time someone sits
          down.
        </p>
        <div
          className="grid-auto muted"
          style={{
            ["--min" as string]: "240px",
            ["--gap" as string]: "28px",
            fontSize: 16.5,
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: 0 }}>
            The Cloud is built the other way round. A plush feather-blend layer
            sits on a high-resilience foam core, so the seat gives at first
            contact and still holds you an hour later. The frame is kiln-dried
            hardwood, rated for a decade.
          </p>
          <p style={{ margin: 0 }}>
            Every cover unzips, including the base. Wash them cold, tumble dry
            low, put them back. When a cover finally wears out, you replace that
            one cover rather than the whole couch.
          </p>
        </div>
      </section>

      <section
        style={{ maxWidth: 1400, margin: "84px auto 0", padding: "0 28px" }}
        aria-label="Shop the room"
      >
        <div
          className="row between wrap"
          style={{ gap: 12, marginBottom: 18, alignItems: "baseline" }}
        >
          <h2
            className="display"
            style={{ fontSize: "clamp(30px,4vw,48px)", margin: 0 }}
          >
            Shop the room
          </h2>
          <span className="muted" style={{ fontSize: 15 }}>
            Tap a dot to see what’s in the picture.
          </span>
        </div>
        <Hotspots
          sceneId="bRoom"
          product={product}
          color={sel.color}
          radius="4px"
        />
      </section>

      <section
        className="grid-auto"
        style={{
          maxWidth: 1400,
          margin: "72px auto 0",
          padding: "0 28px",
          ["--min" as string]: "280px",
          ["--gap" as string]: "18px",
        }}
      >
        {[
          [IMG.fabricMacro, `Performance weave · ${sel.color} · hover to magnify`],
          [IMG.cushion, "Cushion cutaway"],
          [IMG.tools, "Connector detail"],
        ].map(([src, label], i) => (
          <figure
            key={i}
            style={{ margin: 0, marginTop: i === 1 ? 48 : 0 }}
          >
            {i === 0 ? (
              <Magnifier
                scale={3}
                radius={90}
                touch
                style={{
                  aspectRatio: "3/4",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <FabricTexture color={sel.color} />
              </Magnifier>
            ) : (
              <Img
                src={src}
                alt={label}
                w={900}
                ratio="3/4"
                radius="4px"
                className="zoom-hover"
              />
            )}
            <figcaption
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10.5,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                marginTop: 10,
              }}
              className="muted"
            >
              {label}
            </figcaption>
          </figure>
        ))}
      </section>

      <section
        style={{ maxWidth: 1100, margin: "96px auto 0", padding: "0 28px" }}
      >
        <h2
          className="display"
          style={{ fontSize: "clamp(34px,5vw,60px)", marginBottom: 36 }}
        >
          The specifications
        </h2>
        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "240px",
            ["--gap" as string]: "0",
            borderTop: "1px solid var(--line)",
          }}
        >
          {specs.map(([k, v]) => (
            <div
              key={k}
              style={{
                padding: "22px 24px 22px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                className="muted"
                style={{
                  fontSize: 12.5,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {k}
              </div>
              <div className="display" style={{ fontSize: 26 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
        <div
          className="grid-auto muted"
          style={{
            ["--min" as string]: "260px",
            ["--gap" as string]: "28px",
            marginTop: 40,
            fontSize: 15.5,
            lineHeight: 1.7,
          }}
        >
          {[
            [
              "Materials",
              "Performance polyester blend, feather-blend fill over high-resilience foam, kiln-dried hardwood frame, non-toxic throughout.",
            ],
            [
              "Care",
              "All covers unzip and machine wash cold. Tumble dry low. Spot clean with water and mild soap between washes.",
            ],
            [
              "Warranty",
              "Ten years on the frame, three on the cushions, 30-night home trial with free return pickup.",
            ],
          ].map(([k, v]) => (
            <div key={k}>
              <strong
                style={{
                  display: "block",
                  color: "var(--ink)",
                  fontSize: 16.5,
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                {k}
              </strong>
              {v}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 64 }}>
          <h3
            className="display"
            style={{ fontSize: "clamp(26px,3.4vw,40px)", margin: "0 0 8px" }}
          >
            Will it fit?
          </h3>
          <p className="muted" style={{ margin: "0 0 24px", fontSize: 16 }}>
            Enter your room and we’ll draw the {product.shortName} to scale.
          </p>
          <RoomFitChecker
            modules={product.layout!}
            color={sel.color}
            currentSlug={product.slug}
            onSuggest={(slug) => sel.pickConfig(slug, { keepScroll: true })}
          />
        </div>
      </section>

      <section
        id="owners"
        style={{
          margin: "96px 0 0",
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 28px" }}>
          <div
            className="row wrap"
            style={{ alignItems: "baseline", gap: 20, marginBottom: 8 }}
          >
            <h2
              className="display"
              style={{ fontSize: "clamp(32px,4.4vw,52px)" }}
            >
              What owners say
            </h2>
            <span className="stars">★★★★★</span>
            <span className="muted" style={{ fontSize: 15 }}>
              4.9 across 5,250 verified purchases
            </span>
          </div>
          <div
            className="grid-auto"
            style={{
              ["--min" as string]: "280px",
              ["--gap" as string]: "36px",
              marginTop: 40,
            }}
          >
            {REVIEWS.slice(0, 3).map((r) => (
              <figure key={r.id} style={{ margin: 0 }}>
                <blockquote
                  className="display"
                  style={{
                    fontSize: 24,
                    lineHeight: 1.4,
                    margin: "0 0 16px",
                    fontWeight: 400,
                  }}
                >
                  “{r.body.split(". ")[0].replace(/\.$/, "")}.”
                </blockquote>
                <figcaption className="muted" style={{ fontSize: 14.5 }}>
                  {r.name} · {r.location} · {r.color}, {r.config}
                </figcaption>
              </figure>
            ))}
          </div>
          <div
            className="grid-auto muted"
            style={{
              ["--min" as string]: "180px",
              ["--gap" as string]: "20px",
              marginTop: 48,
              paddingTop: 32,
              borderTop: "1px solid var(--line)",
              fontSize: 14.5,
            }}
          >
            {REVIEW_STATS.subRatings.map((s) => (
              <div key={s.label} className="row between">
                <span>{s.label}</span>
                <span style={{ color: "var(--ink)" }}>{s.value}</span>
              </div>
            ))}
          </div>
          <button
            className="link-underline"
            style={{ display: "inline-block", marginTop: 32 }}
            onClick={() => scrollToId("reviews")}
          >
            Read all 5,250 reviews
          </button>
        </div>
      </section>

      <DeepReviews />
      <QandA />
      <FaqTabs />

      <div
        ref={barRef}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
          boxShadow: "0 -10px 40px rgba(0,0,0,.07)",
        }}
      >
        <div
          className="row between wrap"
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "14px 28px",
            gap: "12px 20px",
          }}
        >
          <div className="row wrap" style={{ gap: 18 }}>
            <div>
              <div
                className="display"
                style={{ fontSize: 22, lineHeight: 1.1 }}
              >
                {product.name}
              </div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                {sel.color} · free shipping
              </div>
            </div>
            <Swatches size={28} value={sel.color} onChange={sel.setColor} />
            <select
              className="desktop-only"
              value={product.slug}
              onChange={(e) => sel.pickConfig(e.target.value)}
              aria-label="Configuration"
              style={{
                fontSize: 14.5,
                padding: "11px 14px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "var(--bg)",
              }}
            >
              {COUCHES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.shortName} · {moneyShort(c.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="row" style={{ gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div className="display" style={{ fontSize: 24 }}>
                {money(sel.price)}
              </div>
              <s className="muted" style={{ fontSize: 13.5 }}>
                {money(sel.compare)}
              </s>
            </div>
            <button
              className="btn"
              style={{ padding: "16px 34px", fontSize: 13.5 }}
              onClick={() => sel.addToCart({ qty: 1 })}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
