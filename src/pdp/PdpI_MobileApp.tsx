import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Heart,
  PawPrint,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  WashingMachine,
} from "lucide-react";
import { COLORS, COUCHES, colorHex, type Product } from "../data/products";
import { useProductSelection } from "../hooks/useProductSelection";
import { ProductStage, isSpinnable } from "../components/ProductStage";
import type { SpinSource } from "../lib/spin";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useSaved } from "../hooks/useSaved";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useUI } from "../context/UIContext";
import { money, moneyShort } from "../lib/money";
import LayoutDiagram from "../components/LayoutDiagram";
import BottomSheet, { type SheetSnap } from "../components/BottomSheet";
import {
  ConfigCompareTable,
  DeliveryEstimator,
  FinancingCalculator,
  Hotspots,
  SaveShare,
} from "../components/Interactive";
import { RoomFitChecker } from "../components/RoomFit";
import { Accordion, Img, QtyStepper, Stars } from "../components/ui";
import { RatingSummary } from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import { Lightbox } from "../components/Overlays";
import { detailItems, scrollToId } from "./shared";

const TABS = [
  { id: "i-overview", label: "Overview" },
  { id: "i-details", label: "Details" },
  { id: "i-reviews", label: "Reviews" },
  { id: "i-qa", label: "Q&A" },
];

const HIGHLIGHTS = [
  {
    icon: WashingMachine,
    title: "Washable everything",
    body: "Every cover unzips, even the base.",
  },
  {
    icon: PawPrint,
    title: "Pet-proof weave",
    body: "60,000+ double rubs, snag resistant.",
  },
  {
    icon: Truck,
    title: "Free 2–5 day delivery",
    body: 'Boxes fit a 30" doorway.',
  },
  {
    icon: ShieldCheck,
    title: "30-night trial",
    body: "Free pickup if it's not right.",
  },
];

/** PDP Option I — Mobile App-style: swipe gallery, tabs and a draggable bottom-sheet buy box. */
export default function PdpI({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const navigate = useNavigate();
  const { toast, openDrawer } = useUI();
  const { isSaved, toggle } = useSaved();
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const [comparing, setComparing] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(0);
  const small = useMediaQuery("(max-width: 560px)");
  const headerH = small ? 62 : 72;
  const active = useScrollSpy(
    TABS.map((t) => t.id),
    headerH + 60,
  );
  const hex = colorHex(sel.color);
  const stock = COLORS.find((c) => c.name === sel.color)!.stock;

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const add = () => {
    sel.addToCart({ silent: true });
    navigator.vibrate?.(15);
    toast(`Added ${product.shortName} in ${sel.color}`, "success");
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2600);
  };
  const viewCart = () => {
    setSnap("peek");
    openDrawer();
  };
  const pickSize = (slug: string) => sel.pickConfig(slug, { keepScroll: true });

  const addButton = (big?: boolean) => (
    <button
      className={`btn ${added ? "btn-accent" : ""}`}
      onClick={added ? viewCart : add}
      style={{
        padding: big ? "16px 22px" : "12px 18px",
        width: big ? "100%" : undefined,
        whiteSpace: "nowrap",
        minWidth: big ? undefined : 132,
      }}
    >
      {added ? (
        <span
          className="row"
          style={{ gap: 6, animation: "morphCheck .25s ease" }}
        >
          <Check size={15} /> {big ? "Added · View cart" : "View cart"}
        </span>
      ) : (
        <span className="row" style={{ gap: 6 }}>
          <ShoppingBag size={15} /> Add to cart
        </span>
      )}
    </button>
  );

  return (
    <div className="page" style={{ paddingBottom: 120 }}>
      <div className="app-shell">
        <Gallery
          images={sel.images}
          spin={sel.spin}
          alt={`${product.name} in ${sel.color}`}
          saved={isSaved(product.slug)}
          onSave={() => {
            if (!isSaved(product.slug)) {
              toggle(product.slug);
              toast("Saved to your wishlist", "success");
            }
          }}
          top={
            <>
              <button
                className="icon-btn"
                aria-label="Back"
                onClick={() =>
                  window.history.length > 1 ? navigate(-1) : navigate("/shop")
                }
                style={{ boxShadow: "0 4px 14px rgba(0,0,0,.14)" }}
              >
                <ArrowLeft size={17} />
              </button>
              <SaveShare
                slug={product.slug}
                color={sel.color}
                title={product.name}
              />
            </>
          }
        />

        <div style={{ padding: "18px 18px 0", display: "grid", gap: 14, gridTemplateColumns: "minmax(0,1fr)" }}>
          <div>
            <div
              className="row between"
              style={{ gap: 10, alignItems: "flex-start" }}
            >
              <h1
                className="display"
                style={{ fontSize: 30, margin: 0, lineHeight: 1.1 }}
              >
                {product.name}
              </h1>
              {product.bestSeller && (
                <span className="pill pill-accent">Best seller</span>
              )}
            </div>
            <button
              className="row text-btn"
              style={{
                gap: 6,
                marginTop: 6,
                textDecoration: "none",
                fontSize: 14,
              }}
              onClick={() => scrollToId("i-reviews", headerH + 56)}
            >
              <Stars size={14} /> 4.9{" "}
              <span className="muted">· 5,250 reviews</span>
            </button>
          </div>
          <div className="row wrap" style={{ gap: 10, alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 30 }}>
              {money(sel.price)}
            </span>
            <s className="muted">{money(sel.compare)}</s>
            <span className="pill pill-accent">
              −{Math.round((sel.savings / sel.compare) * 100)}%
            </span>
          </div>

          <div>
            <div
              className="row between"
              style={{ marginBottom: 8, fontSize: 14 }}
            >
              <span>
                Color: <strong style={{ fontWeight: 600 }}>{sel.color}</strong>
              </span>
              {stock <= 6 && (
                <span className="accent" style={{ fontSize: 13 }}>
                  Only {stock} left
                </span>
              )}
            </div>
            <div
              className="row"
              style={{ gap: 8, overflowX: "auto", paddingBottom: 2 }}
              role="radiogroup"
              aria-label="Color"
            >
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  role="radio"
                  aria-checked={c.name === sel.color}
                  className={`chip row ${c.name === sel.color ? "active" : ""}`}
                  style={{ gap: 7, flex: "none" }}
                  onClick={() => sel.setColor(c.name)}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 99,
                      background: c.hex,
                      border: "1px solid var(--line)",
                    }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              className="row between"
              style={{ marginBottom: 8, fontSize: 14 }}
            >
              <span>
                Size:{" "}
                <strong style={{ fontWeight: 600 }}>{product.shortName}</strong>
              </span>
              <button
                className="text-btn row"
                style={{ gap: 5, fontSize: 13 }}
                onClick={() => {
                  setComparing(true);
                  setSnap("full");
                }}
              >
                <Ruler size={13} /> Compare
              </button>
            </div>
            <div
              className="scroll-x"
              style={{ gridAutoColumns: "150px", gap: 10, paddingBottom: 6 }}
            >
              {COUCHES.map((c) => {
                const on = c.slug === product.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => pickSize(c.slug)}
                    aria-pressed={on}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 14,
                      border: on
                        ? "2px solid var(--ink)"
                        : "1px solid var(--line)",
                      background: "var(--surface)",
                      color: "var(--ink)",
                      cursor: "pointer",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div
                      className="dots-bg"
                      style={{
                        borderRadius: 9,
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        padding: 6,
                      }}
                    >
                      <LayoutDiagram
                        modules={c.layout!}
                        color={hex}
                        showDims={false}
                        maxWidth={110}
                        maxHeight={52}
                      />
                    </div>
                    <span style={{ fontSize: 14 }}>{c.shortName}</span>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      Seats {c.seats} · {moneyShort(c.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* sticky tabs */}
        <div
          role="tablist"
          aria-label="Sections"
          style={{
            position: "sticky",
            top: "var(--header-h)",
            zIndex: 20,
            background: "var(--surface)",
            borderBottom: "1px solid var(--line)",
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: `repeat(${TABS.length},1fr)`,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => scrollToId(t.id, headerH + 50)}
              style={{
                border: 0,
                background: "none",
                padding: "14px 4px 12px",
                fontSize: 14,
                cursor: "pointer",
                color: active === t.id ? "var(--ink)" : "var(--muted)",
                fontWeight: active === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: -1,
              left: `${(TABS.findIndex((t) => t.id === active) / TABS.length) * 100}%`,
              width: `${100 / TABS.length}%`,
              height: 2,
              background: "var(--ink)",
              transition: "left .25s cubic-bezier(.2,.8,.2,1)",
            }}
          />
        </div>

        <section
          id="i-overview"
          style={{ padding: "22px 18px 0", display: "grid", gap: 18, gridTemplateColumns: "minmax(0,1fr)" }}
        >
          <p
            className="muted"
            style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}
          >
            {product.description}
          </p>
          <div
            className="scroll-x"
            style={{ gridAutoColumns: "72%", gap: 10, paddingBottom: 6 }}
          >
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="card"
                style={{
                  padding: 14,
                  display: "grid",
                  gap: 6,
                  background: "var(--bg)",
                }}
              >
                <span className="icon-tile" style={{ width: 34, height: 34 }}>
                  <h.icon size={17} />
                </span>
                <strong style={{ fontWeight: 600, fontSize: 15 }}>
                  {h.title}
                </strong>
                <span className="muted" style={{ fontSize: 13.5 }}>
                  {h.body}
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className="label" style={{ marginBottom: 10 }}>
              Shop the look
            </div>
            <Hotspots
              sceneId="livingRoom"
              product={product}
              color={sel.color}
              radius="16px"
            />
          </div>
        </section>

        <section
          id="i-details"
          style={{ padding: "30px 18px 0", display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1fr)" }}
        >
          <h2 className="display" style={{ fontSize: 24, margin: 0 }}>
            Details
          </h2>
          <Accordion
            icon="chevron"
            size={15.5}
            items={[
              ...detailItems(product),
              {
                title: "Will it fit?",
                content: (
                  <RoomFitChecker
                    compact
                    modules={product.layout!}
                    color={sel.color}
                    currentSlug={product.slug}
                    onSuggest={pickSize}
                  />
                ),
              },
            ]}
          />
          <DeliveryEstimator />
        </section>

        <section id="i-reviews" style={{ paddingTop: 30 }}>
          <div style={{ padding: "0 18px" }}>
            <RatingSummary compact />
          </div>
          <DeepReviews />
        </section>

        <section id="i-qa" style={{ paddingTop: 8, paddingBottom: 40 }}>
          <QandA />
          <FaqTabs />
        </section>
      </div>

      <BottomSheet
        snap={snap}
        onSnap={(s) => {
          setSnap(s);
          if (s === "peek") setComparing(false);
        }}
        label="Buy options"
        offsetKey="i-sheet"
        peek={
          <div className="row" style={{ gap: 12, padding: "2px 16px 14px" }}>
            <Img
              src={sel.images[0]}
              alt=""
              w={160}
              ratio="1"
              radius="10px"
              style={{ width: 46, flex: "none" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {money(sel.price)}
              </div>
              <div
                className="muted"
                style={{
                  fontSize: 12.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.shortName} · {sel.color} ·{" "}
                <span style={{ textDecoration: "underline" }}>options</span>
              </div>
            </div>
            {addButton()}
          </div>
        }
      >
        {comparing ? (
          <div style={{ display: "grid", gap: 14 }}>
            <button
              className="text-btn row"
              style={{ gap: 4, justifySelf: "start" }}
              onClick={() => setComparing(false)}
            >
              <ChevronLeft size={15} /> Back to options
            </button>
            <h3 className="display" style={{ fontSize: 22, margin: 0 }}>
              Compare sizes
            </h3>
            <ConfigCompareTable
              current={product.slug}
              color={sel.color}
              onChoose={(slug) => {
                pickSize(slug);
                setComparing(false);
              }}
            />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div className="row between" style={{ marginBottom: 10 }}>
                <span className="label">Size</span>
                <button
                  className="text-btn row"
                  style={{ gap: 5, fontSize: 13 }}
                  onClick={() => setComparing(true)}
                >
                  <Ruler size={13} /> Compare sizes
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {COUCHES.map((c) => {
                  const on = c.slug === product.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => pickSize(c.slug)}
                      aria-pressed={on}
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderRadius: 12,
                        border: on
                          ? "2px solid var(--ink)"
                          : "1px solid var(--line)",
                        background: "var(--surface)",
                        color: "var(--ink)",
                        cursor: "pointer",
                        display: "grid",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <LayoutDiagram
                          modules={c.layout!}
                          color={hex}
                          showDims={false}
                          maxWidth={96}
                          maxHeight={46}
                        />
                      </div>
                      <span style={{ fontSize: 14 }}>{c.shortName}</span>
                      <span className="muted" style={{ fontSize: 12.5 }}>
                        {moneyShort(c.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="row between" style={{ marginBottom: 10 }}>
                <span className="label">Color</span>
                <span className="muted" style={{ fontSize: 13.5 }}>
                  {sel.color}
                </span>
              </div>
              <div className="row" style={{ gap: 10 }}>
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    aria-label={c.name}
                    aria-pressed={c.name === sel.color}
                    className={`swatch ${c.name === sel.color ? "active" : ""}`}
                    style={{ width: 38, height: 38, background: c.hex }}
                    onClick={() => sel.setColor(c.name)}
                  />
                ))}
              </div>
            </div>
            <div className="row between">
              <span className="label">Quantity</span>
              <QtyStepper value={sel.qty} onChange={sel.setQty} small />
            </div>
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: "var(--soft)",
              }}
            >
              <FinancingCalculator
                compact
                amount={sel.price * sel.qty}
                defaultTerm="p4"
              />
            </div>
            <DeliveryEstimator compact />
            {addButton(true)}
            <div
              className="row muted"
              style={{ gap: 8, fontSize: 12.5, justifyContent: "center" }}
            >
              <Heart size={12} /> Double-tap any photo to save it
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function Gallery({
  images,
  alt,
  saved,
  onSave,
  top,
  spin,
}: {
  images: string[];
  alt: string;
  saved: boolean;
  onSave: () => void;
  top: React.ReactNode;
  spin: SpinSource;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );
  const [hint, setHint] = useState(true);
  const down = useRef({ x: 0, y: 0, t: 0 });
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const tapTimer = useRef(0);
  const burstId = useRef(0);

  useEffect(() => {
    ref.current?.scrollTo({ left: 0 });
    setSlide(0);
  }, [images[0]]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearTimeout(tapTimer.current), []);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
    if (el.scrollLeft > 20) setHint(false);
  };

  const onPointerUp = (e: React.PointerEvent, i: number) => {
    const d = down.current;
    if (
      Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 ||
      performance.now() - d.t > 320
    )
      return;
    const now = performance.now();
    const lt = lastTap.current;
    if (
      now - lt.t < 300 &&
      Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 40
    ) {
      window.clearTimeout(tapTimer.current);
      lastTap.current = { t: 0, x: 0, y: 0 };
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const id = ++burstId.current;
      setBursts((b) => [
        ...b,
        { id, x: e.clientX - r.left, y: e.clientY - r.top },
      ]);
      window.setTimeout(
        () => setBursts((b) => b.filter((x) => x.id !== id)),
        900,
      );
      onSave();
      return;
    }
    lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    tapTimer.current = window.setTimeout(() => setLightbox(i), 300);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={ref}
        className="snap-gallery"
        onScroll={onScroll}
        style={{ touchAction: "pan-x pan-y" }}
      >
        {images.map((src, i) => {
          /* Slide 0 is the spin stage. A horizontal drag cannot both spin and page a
             scroll-snap scroller, so slide 0 claims the gesture outright: the carousel
             will not swipe past it, and the dots / chevrons are the way out. The
             double-tap-to-save and tap-to-lightbox handlers are skipped there too. */
          const isSpin = i === 0 && isSpinnable(spin);
          return (
          <div
            key={src + i}
            style={{
              position: "relative",
              cursor: isSpin ? "grab" : "zoom-in",
              touchAction: isSpin ? "none" : undefined,
            }}
            onPointerDown={(e) => {
              if (isSpin) { e.stopPropagation(); return; }
              down.current = { x: e.clientX, y: e.clientY, t: performance.now() };
            }}
            onPointerUp={(e) => { if (!isSpin) onPointerUp(e, i); }}
          >
            {isSpin ? (
              <ProductStage
                spin={spin}
                src={src}
                alt={alt}
                ratio="4/5"
                eager
              />
            ) : (
            <Img
              src={src}
              alt={`${alt}, photo ${i + 1}`}
              w={1000}
              ratio="4/5"
              eager={i === 0}
            />
            )}
            {i === slide &&
              bursts.map((b) => (
                <Heart
                  key={b.id}
                  size={96}
                  fill="#fff"
                  color="#fff"
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: b.x,
                    top: b.y,
                    pointerEvents: "none",
                    filter: "drop-shadow(0 6px 18px rgba(0,0,0,.35))",
                    animation: "heartBurst .85s ease forwards",
                  }}
                />
              ))}
          </div>
          );
        })}
      </div>
      <div
        className="row between"
        style={{ position: "absolute", top: 14, left: 14, right: 14 }}
      >
        {top}
      </div>
      {saved && (
        <span
          className="pill row"
          style={{
            position: "absolute",
            left: 14,
            bottom: 16,
            gap: 5,
            background: "rgba(0,0,0,.55)",
            color: "#fff",
          }}
        >
          <Heart size={12} fill="#fff" /> Saved
        </span>
      )}
      {hint && images.length > 1 && (
        <span
          className="pill"
          style={{
            position: "absolute",
            right: 14,
            bottom: 16,
            background: "rgba(0,0,0,.55)",
            color: "#fff",
            animation: "nudgeX 1.6s ease-in-out 3",
          }}
        >
          Swipe ›
        </span>
      )}
      <div
        className="row"
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          gap: 6,
        }}
      >
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Photo ${i + 1}`}
            aria-current={i === slide}
            onClick={() =>
              ref.current?.scrollTo({
                left: i * ref.current.clientWidth,
                behavior: "smooth",
              })
            }
            style={{
              width: i === slide ? 20 : 7,
              height: 7,
              borderRadius: 99,
              border: 0,
              padding: 0,
              background: i === slide ? "#fff" : "rgba(255,255,255,.55)",
              transition: "width .25s",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
      <Lightbox
        images={images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
        fullscreen
      />
    </div>
  );
}
