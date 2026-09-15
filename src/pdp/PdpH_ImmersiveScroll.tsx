import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ShoppingBag } from "lucide-react";
import { COUCHES, colorHex, type Product } from "../data/products";
import { useProductSelection } from "../hooks/useProductSelection";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useInView } from "../hooks/useInView";
import {
  useMediaQuery,
  usePrefersReducedMotion,
} from "../hooks/useMediaQuery";
import { useBottomOffset } from "../hooks/useBottomOffset";
import { mixHex } from "../lib/color";
import { money, moneyShort } from "../lib/money";
import IsoCouch, {
  clamp01,
  easeInOut,
  easeOutBack,
  isoModules,
  lerp,
  morphModules,
  type IsoScene,
} from "../components/IsoCouch";
import { Hotspots } from "../components/Interactive";
import { FabricLens, WipeTest } from "../components/Magnify";
import { Img, Stars, Swatches } from "../components/ui";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import BuyBoxCompact from "./BuyBoxCompact";
import { scrollToId } from "./shared";

const CHAPTERS = [
  {
    eyebrow: "01 · Delivery",
    title: "Arrives in boxes that fit any door",
    body: "Every module ships in its own box, the largest 34 × 30 × 26 inches. No freight truck, no stairwell standoff.",
  },
  {
    eyebrow: "02 · Setup",
    title: "Unbox. Click. Sit.",
    body: "ModuleLock™ connectors pull each piece flush against the next. Most setups take under 20 minutes, with no tools.",
  },
  {
    eyebrow: "03 · Fabric",
    title: "Four colors, all of them washable",
    body: "A performance weave rated for 60,000+ double rubs. Tap a color to make it yours.",
  },
  {
    eyebrow: "04 · Layout",
    title: "Rearrange it whenever life does",
    body: "Sofa today, pit on Friday, corner sectional when you move. Same modules, new shape.",
  },
  {
    eyebrow: "05 · Comfort",
    title: "Four layers of cloud",
    body: "A feather-blend topper over a fiber wrap and a high-resilience foam core, on a kiln-dried hardwood frame.",
  },
];
const N = CHAPTERS.length;
const CYCLE = ["White", "Light Grey", "Khaki", "Black"].map(colorHex);

/** Pure scene for chapter `ch` at local progress `t` (0–1). */
function sceneAt(
  ch: number,
  t: number,
  product: Product,
  hex: string,
  userColor: boolean,
): { scene: IsoScene; layoutSlug?: string } {
  const base = isoModules(product.layout!, "b");
  switch (ch) {
    case 0: {
      const n = base.length;
      return {
        scene: {
          color: hex,
          spread: 1.35,
          modules: base.map((m, i) => {
            const local = clamp01((t - (i / n) * 0.5) / 0.45);
            return {
              ...m,
              boxed: 1,
              dz: (1 - easeOutBack(local)) * 150,
              opacity: clamp01(local * 4),
            };
          }),
        },
      };
    }
    case 1: {
      const unbox = easeInOut(clamp01(t / 0.55));
      const close = easeInOut(clamp01((t - 0.35) / 0.65));
      return {
        scene: {
          color: hex,
          spread: lerp(1.35, 1, close),
          modules: base.map((m) => ({ ...m, boxed: 1 - unbox })),
        },
      };
    }
    case 2: {
      let color = hex;
      if (!userColor) {
        const seq = [...CYCLE, hex];
        const u = Math.min(3.999, t * 4);
        const i = Math.floor(u);
        const f = easeInOut(clamp01((u - i - 0.45) / 0.55));
        color = mixHex(seq[i], seq[i + 1], f);
      }
      return { scene: { color, modules: base } };
    }
    case 3: {
      const others = COUCHES.filter((c) => c.slug !== product.slug);
      const seq = [product, ...others, product];
      const mods = seq.map((p, i) => isoModules(p.layout!, `p${i}`));
      const steps = seq.length - 1;
      const u = Math.min(steps - 0.0001, t * steps);
      const i = Math.floor(u);
      const f = easeInOut(clamp01((u - i - 0.35) / 0.65));
      return {
        scene: { color: hex, modules: morphModules(mods[i], mods[i + 1], f) },
        layoutSlug: seq[f > 0.5 ? i + 1 : i].slug,
      };
    }
    default: {
      const target = base.find((m) => m.kind === "seat") ?? base[0];
      const e = easeInOut(clamp01(t / 0.7));
      return {
        scene: {
          color: hex,
          explode: { key: target.key, amount: e },
          modules: base.map((m) =>
            m.key === target.key ? m : { ...m, opacity: 1 - 0.75 * e },
          ),
        },
      };
    }
  }
}

/** PDP Option H — Immersive Scroll: a 3D-style couch unboxes, recolors and rearranges as you scroll. */
export default function PdpH({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const reduced = usePrefersReducedMotion();
  const hex = colorHex(sel.color);
  const pageP = useScrollProgress();
  const [userColor, setUserColor] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const buyRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef, { threshold: 0.05 });
  const buyVisible = useInView(buyRef, { threshold: 0.1 });
  const showPill = !heroVisible && !buyVisible;
  useBottomOffset("h-pill", showPill ? 80 : 0);

  const pickColor = (c: string) => {
    sel.setColor(c);
    setUserColor(true);
  };

  const heroScene: IsoScene = useMemo(
    () => ({ color: hex, modules: isoModules(product.layout!, "h") }),
    [hex, product.layout],
  );

  return (
    <div className="page">
      {!reduced && (
        <div
          className="progress-top"
          style={{ transform: `scaleX(${pageP})` }}
          aria-hidden
        />
      )}

      {/* ---------- hero ---------- */}
      <section
        ref={heroRef}
        style={{
          background: "var(--ink)",
          color: "var(--bg)",
          minHeight: "100svh",
          paddingTop: "calc(var(--header-h) + 24px)",
          paddingBottom: 48,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 55% at 68% 58%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="container h-stage-grid"
          style={{ position: "relative", width: "100%" }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <span
              className="eyebrow"
              style={{
                color: "color-mix(in srgb, var(--accent) 70%, var(--bg))",
              }}
            >
              GH2 Cloud · {product.name}
            </span>
            <h1
              className="display"
              style={{
                fontSize: "clamp(36px,5vw,72px)",
                lineHeight: 1.02,
                margin: 0,
              }}
            >
              The couch that builds itself around you.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.6,
                opacity: 0.78,
                maxWidth: 480,
              }}
            >
              Scroll to watch it arrive, click together, change color and
              reshape itself.
            </p>
            <div
              className="row wrap"
              style={{ gap: 14, alignItems: "baseline" }}
            >
              <span className="display" style={{ fontSize: 34 }}>
                {money(sel.price)}
              </span>
              <s style={{ opacity: 0.55 }}>{money(sel.compare)}</s>
              <span
                className="row"
                style={{ gap: 6, fontSize: 14, opacity: 0.85 }}
              >
                <Stars size={14} /> 4.9 · 5,250+ reviews
              </span>
            </div>
            <div className="row wrap" style={{ gap: 10 }}>
              <button
                className="btn btn-accent"
                onClick={() => scrollToId("h-story", 0)}
              >
                Watch it build <ChevronDown size={15} />
              </button>
              <button
                className="btn btn-outline"
                style={{
                  color: "var(--bg)",
                  borderColor: "color-mix(in srgb, var(--bg) 40%, transparent)",
                }}
                onClick={() => scrollToId("h-buy")}
              >
                Buy now
              </button>
            </div>
          </div>
          <div
            className="h-stage"
            style={{ display: "grid", gap: 14, justifyItems: "center" }}
          >
            <div
              style={{
                width: "100%",
                animation: reduced
                  ? undefined
                  : "floatY 6s ease-in-out infinite",
              }}
            >
              <IsoCouch
                scene={heroScene}
                title={`${product.name} in ${sel.color}`}
              />
            </div>
            <div className="row" style={{ gap: 12 }}>
              <Swatches value={sel.color} onChange={pickColor} size={30} />
              <span style={{ fontSize: 14, opacity: 0.8 }}>{sel.color}</span>
            </div>
          </div>
        </div>
        {!reduced && (
          <ChevronDown
            size={22}
            aria-hidden
            style={{
              position: "absolute",
              bottom: 18,
              left: "50%",
              marginLeft: -11,
              opacity: 0.6,
              animation: "bounceY 1.6s ease-in-out infinite",
            }}
          />
        )}
      </section>

      {/* ---------- scrollytelling ---------- */}
      {reduced ? (
        <StaticStory
          product={product}
          hex={hex}
          color={sel.color}
          onColor={pickColor}
          onPick={(slug) => sel.pickConfig(slug, { keepScroll: true })}
        />
      ) : (
        <Story
          product={product}
          hex={hex}
          color={sel.color}
          userColor={userColor}
          onColor={pickColor}
          onPick={(slug) => sel.pickConfig(slug, { keepScroll: true })}
        />
      )}

      {/* ---------- stats ---------- */}
      <section className="container section">
        <div
          className="grid-auto"
          style={{ ["--min" as string]: "180px", ["--gap" as string]: "14px" }}
        >
          <Stat value={5250} suffix="+" label="five-star reviews" />
          <Stat value={60000} suffix="+" label="double rubs of durability" />
          <Stat value={20} suffix=" min" label="average setup time" />
          <Stat value={30} suffix=" nights" label="to decide at home" />
        </div>
      </section>

      {/* ---------- shop the look ---------- */}
      <section className="container section">
        <div
          className="row between wrap"
          style={{ gap: 12, marginBottom: 18, alignItems: "baseline" }}
        >
          <h2 className="display h2" style={{ margin: 0 }}>
            Shop the living room
          </h2>
          <span className="muted">Tap the dots to add a piece.</span>
        </div>
        <Hotspots sceneId="livingRoom" product={product} color={sel.color} />
      </section>

      {/* ---------- touch the fabric ---------- */}
      <section className="container section">
        <h2 className="display h2" style={{ margin: "0 0 8px" }}>
          Get close to the fabric
        </h2>
        <p className="muted" style={{ margin: "0 0 24px", fontSize: 16 }}>
          Magnify the weave, then spill something on it.
        </p>
        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "320px",
            ["--gap" as string]: "24px",
            alignItems: "start",
          }}
        >
          <div className="card card-pad">
            <FabricLens color={sel.color} onColor={pickColor} />
          </div>
          <div className="card card-pad">
            <WipeTest color={sel.color} />
          </div>
        </div>
      </section>

      {/* ---------- buy ---------- */}
      <section ref={buyRef} id="h-buy" className="container section">
        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "330px",
            ["--gap" as string]: "44px",
            alignItems: "center",
          }}
        >
          <Img
            src={sel.images[0]}
            alt={`${product.name} in ${sel.color}`}
            w={1400}
            ratio="4/3"
            radius="var(--radius)"
          />
          <BuyBoxCompact
            product={product}
            sel={sel}
            eyebrow="Make it yours"
            delivery
          />
        </div>
      </section>

      <DeepReviews />
      <QandA />
      <FaqTabs />

      {/* ---------- floating buy pill ---------- */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 16,
          zIndex: 60,
          transform: `translate(-50%, ${showPill ? 0 : 120}%)`,
          opacity: showPill ? 1 : 0,
          transition: "transform .35s cubic-bezier(.2,.8,.2,1), opacity .25s",
          pointerEvents: showPill ? "auto" : "none",
        }}
        aria-hidden={!showPill}
      >
        <div
          className="row"
          style={{
            gap: 12,
            background: "var(--ink)",
            color: "var(--bg)",
            borderRadius: 999,
            padding: "8px 8px 8px 16px",
            boxShadow: "0 12px 40px rgba(0,0,0,.25)",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 99,
              background: hex,
              border:
                "1.5px solid color-mix(in srgb, var(--bg) 60%, transparent)",
            }}
          />
          <span style={{ fontSize: 14 }}>
            {product.shortName} · {moneyShort(sel.price)}
          </span>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => sel.addToCart()}
            tabIndex={showPill ? 0 : -1}
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function Story({
  product,
  hex,
  color,
  userColor,
  onColor,
  onPick,
}: {
  product: Product;
  hex: string;
  color: string;
  userColor: boolean;
  onColor: (c: string) => void;
  onPick: (slug: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref);
  const seg = Math.min(N - 0.0001, p * N);
  const ch = Math.floor(seg);
  const t = seg - ch;
  const { scene, layoutSlug } = sceneAt(ch, t, product, hex, userColor);
  const held = COUCHES.find((c) => c.slug === layoutSlug);
  const mobile = useMediaQuery("(max-width: 900px)");

  const jump = (
    chapter: number,
    local = 0.02,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((chapter + local) / N) * span, behavior });
  };

  // The size sequence starts and ends on the current couch, so after choosing a
  // size, land at the end of the chapter where the stage shows that couch.
  const choose = (slug: string) => {
    onPick(slug);
    jump(3, 0.99, "instant" as ScrollBehavior);
  };

  const dots = (
    <nav className={mobile ? "row" : "h-dots"} style={mobile ? { gap: 10, marginBottom: 2 } : undefined} aria-label="Chapters">
      {CHAPTERS.map((c, i) => (
        <button
          key={c.title}
          className="h-dot"
          aria-label={c.title}
          aria-current={i === ch ? "step" : undefined}
          onClick={() => jump(i)}
        />
      ))}
    </nav>
  );

  const others = COUCHES.filter((c) => c.slug !== product.slug);
  const sequence = [product, ...others];

  return (
    <section
      id="h-story"
      ref={ref}
      style={{
        height: `${(N + 1) * 100}svh`,
        background: "var(--ink)",
        color: "var(--bg)",
        position: "relative",
      }}
      aria-label="How the Cloud works"
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          paddingTop: "calc(var(--header-h) + 12px)",
          paddingBottom: 56,
          overflow: "hidden",
        }}
      >
        <div className="container h-stage-grid">
          <div
            style={{
              display: "grid",
              gap: 14,
              alignContent: "center",
            }}
          >
            {mobile && dots}
            <div key={ch} style={{ display: "grid", gap: 14, animation: "fadeUp .35s ease" }}>
            <span
              className="eyebrow"
              style={{
                color: "color-mix(in srgb, var(--accent) 70%, var(--bg))",
              }}
            >
              {CHAPTERS[ch].eyebrow}
            </span>
            <h2
              className="display"
              style={{
                fontSize: "clamp(30px,4.4vw,56px)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {CHAPTERS[ch].title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                opacity: 0.78,
                maxWidth: 460,
              }}
            >
              {CHAPTERS[ch].body}
            </p>

            {ch === 2 && (
              <div className="row wrap" style={{ gap: 12, marginTop: 4 }}>
                <Swatches value={color} onChange={onColor} size={34} />
                <span style={{ opacity: 0.8 }}>
                  {userColor ? color : "Tap one to lock it in"}
                </span>
              </div>
            )}
            {ch === 3 && (
              <div style={{ display: "grid", gap: 12, marginTop: 4 }}>
                <div className="row wrap" style={{ gap: 8 }}>
                  {sequence.map((c, i) => {
                    const active = held?.slug === c.slug;
                    return (
                      <button
                        key={c.slug}
                        className="chip"
                        onClick={() => jump(3, (i + 0.08) / sequence.length)}
                        style={{
                          background: active ? "var(--bg)" : "transparent",
                          color: active ? "var(--ink)" : "var(--bg)",
                          borderColor:
                            "color-mix(in srgb, var(--bg) 35%, transparent)",
                        }}
                        aria-pressed={active}
                      >
                        {c.shortName}
                      </button>
                    );
                  })}
                </div>
                {held && (
                  <div className="row wrap" style={{ gap: 12 }}>
                    <span style={{ opacity: 0.85 }}>
                      {held.name} · seats {held.seats} ·{" "}
                      {moneyShort(held.price)}
                    </span>
                    {held.slug !== product.slug ? (
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => choose(held.slug)}
                      >
                        Choose this size <ArrowRight size={13} />
                      </button>
                    ) : (
                      <span
                        className="pill"
                        style={{
                          background:
                            "color-mix(in srgb, var(--bg) 16%, transparent)",
                          color: "var(--bg)",
                        }}
                      >
                        Your pick
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            {ch === 4 && (
              <button
                className="btn btn-accent"
                style={{ justifySelf: "start", marginTop: 6 }}
                onClick={() => scrollToId("h-buy")}
              >
                Try it for 30 nights <ArrowRight size={14} />
              </button>
            )}
            </div>

            <div
              style={{
                height: 3,
                maxWidth: 220,
                background: "color-mix(in srgb, var(--bg) 18%, transparent)",
                borderRadius: 9,
                marginTop: 10,
              }}
              aria-hidden
            >
              <div
                style={{
                  height: "100%",
                  width: `${t * 100}%`,
                  background: "var(--accent)",
                  borderRadius: 9,
                }}
              />
            </div>
          </div>
          <div className="h-stage" style={{ minHeight: 0 }}>
            <IsoCouch
              scene={scene}
              labelColor="var(--bg)"
              title={CHAPTERS[ch].title}
              // Phones: frame the couch tighter and use bigger, shorter labels.
              viewBox={mobile ? "-150 -112 300 196" : undefined}
              labelSize={mobile ? 11 : 7.5}
              shortLabels={mobile}
              style={{ maxHeight: mobile ? "42svh" : "min(62svh, 560px)" }}
            />
          </div>
        </div>

        {!mobile && dots}
      </div>
    </section>
  );
}

/** Reduced-motion version: each chapter as a still. */
function StaticStory({
  product,
  hex,
  color,
  onColor,
  onPick,
}: {
  product: Product;
  hex: string;
  color: string;
  onColor: (c: string) => void;
  onPick: (slug: string) => void;
}) {
  return (
    <section
      id="h-story"
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
        padding: "40px 0 72px",
      }}
    >
      <div className="container" style={{ display: "grid", gap: 56 }}>
        {CHAPTERS.map((c, i) => {
          const still = i === 0 ? 1 : i === 3 ? 0 : 1;
          const { scene } = sceneAt(i, still, product, hex, true);
          return (
            <div key={c.title} className="h-stage-grid">
              <div style={{ display: "grid", gap: 12 }}>
                <span
                  className="eyebrow"
                  style={{
                    color: "color-mix(in srgb, var(--accent) 70%, var(--bg))",
                  }}
                >
                  {c.eyebrow}
                </span>
                <h2 className="display h2" style={{ margin: 0 }}>
                  {c.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    opacity: 0.78,
                    fontSize: 17,
                    lineHeight: 1.6,
                  }}
                >
                  {c.body}
                </p>
                {i === 2 && (
                  <Swatches value={color} onChange={onColor} size={32} />
                )}
                {i === 3 && (
                  <div className="row wrap" style={{ gap: 8 }}>
                    {COUCHES.map((cc) => (
                      <button
                        key={cc.slug}
                        className="chip"
                        onClick={() => onPick(cc.slug)}
                        aria-pressed={cc.slug === product.slug}
                        style={{
                          color:
                            cc.slug === product.slug
                              ? "var(--ink)"
                              : "var(--bg)",
                          background:
                            cc.slug === product.slug
                              ? "var(--bg)"
                              : "transparent",
                        }}
                      >
                        {cc.shortName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="h-stage">
                <IsoCouch
                  scene={scene}
                  labelColor="var(--bg)"
                  title={c.title}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, threshold: 0.4 });
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) return setN(value);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = clamp01((now - start) / 1200);
      setN(Math.round(value * easeInOut(k)));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, value, reduced]);
  return (
    <div ref={ref} className="card card-pad" style={{ textAlign: "center" }}>
      <div className="display" style={{ fontSize: "clamp(30px,3.6vw,44px)" }}>
        {n.toLocaleString("en-US")}
        {suffix}
      </div>
      <div className="muted" style={{ fontSize: 14.5 }}>
        {label}
      </div>
    </div>
  );
}

