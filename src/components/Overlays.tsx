import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { ACCESSORIES, ALL_PRODUCTS } from "../data/products";
import { money, priceLabel } from "../lib/money";
import { Img, Modal, QtyStepper } from "./ui";

export function CartDrawer() {
  const { drawerOpen, closeDrawer } = useUI();
  const cart = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => closeDrawer(), [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;
  const upsells = ACCESSORIES.filter(
    (a) => !cart.items.some((it) => it.productId === a.id),
  ).slice(0, 2);

  return (
    <>
      <div className="overlay" onClick={closeDrawer} />
      <aside className="drawer" aria-label="Cart">
        <div
          className="row between"
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="display" style={{ fontSize: 24 }}>
            Your Cart{" "}
            <span
              className="muted"
              style={{
                fontFamily: "var(--body)",
                fontSize: 15,
                fontWeight: 400,
              }}
            >
              ({cart.count})
            </span>
          </div>
          <button
            className="icon-btn"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>
        {cart.count > 0 && (
          <div
            className="row"
            style={{
              gap: 10,
              padding: "12px 22px",
              background: "var(--soft)",
              fontSize: 14,
            }}
          >
            <Truck size={16} color="var(--accent)" />
            You’ve unlocked{" "}
            <strong style={{ fontWeight: 600 }}>free shipping</strong>.
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 22px" }}>
          {cart.items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 12px" }}>
              <ShoppingBag
                size={28}
                color="var(--muted)"
                style={{ margin: "0 auto" }}
              />
              <p style={{ fontSize: 18, margin: "16px 0 22px" }}>
                Your cart is currently empty.
              </p>
              <button
                className="btn"
                onClick={() => {
                  closeDrawer();
                  navigate("/shop");
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.items.map((it) => (
              <div
                key={it.key}
                className="row"
                style={{
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--line)",
                  alignItems: "flex-start",
                }}
              >
                <Link to={`/product/${it.slug}`} style={{ flex: "none" }}>
                  <Img
                    src={it.image}
                    alt={it.name}
                    w={240}
                    style={{ width: 88, height: 72, borderRadius: 10 }}
                  />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="row between"
                    style={{ alignItems: "flex-start", gap: 8 }}
                  >
                    <Link
                      to={`/product/${it.slug}`}
                      className="display"
                      style={{ fontSize: 16.5 }}
                    >
                      {it.name}
                    </Link>
                    <div style={{ textAlign: "right", fontSize: 15 }}>
                      {priceLabel(it.price * it.qty)}
                      {it.compare > it.price && (
                        <div>
                          <s className="muted" style={{ fontSize: 13 }}>
                            {money(it.compare * it.qty)}
                          </s>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="muted"
                    style={{ fontSize: 13.5, margin: "2px 0 10px" }}
                  >
                    {[it.color, it.note].filter(Boolean).join(" · ") ||
                      "Accessory"}
                  </div>
                  <div className="row between">
                    <QtyStepper
                      small
                      value={it.qty}
                      min={0}
                      onChange={(q) => cart.setQty(it.key, q)}
                    />
                    <button
                      className="text-btn"
                      onClick={() => cart.remove(it.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {cart.items.length > 0 && upsells.length > 0 && (
            <div style={{ padding: "18px 0" }}>
              <div className="label muted" style={{ marginBottom: 10 }}>
                Complete your setup
              </div>
              <div className="stack" style={{ ["--gap" as string]: "10px" }}>
                {upsells.map((p) => (
                  <div
                    key={p.id}
                    className="card row"
                    style={{ gap: 12, padding: 10, borderRadius: 14 }}
                  >
                    <Img
                      src={p.images[0]}
                      alt={p.name}
                      w={160}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        flex: "none",
                      }}
                    />
                    <div style={{ flex: 1, fontSize: 14.5 }}>
                      {p.name}
                      <div className="muted" style={{ fontSize: 13 }}>
                        {priceLabel(p.price)}
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => cart.add(p, { silent: true })}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {cart.items.length > 0 && (
          <div
            style={{
              padding: 22,
              borderTop: "1px solid var(--line)",
              background: "var(--surface)",
            }}
            className="stack"
          >
            <div className="row between" style={{ fontSize: 15 }}>
              <span className="muted">Sale savings</span>
              <span className="accent">−{money(cart.savings)}</span>
            </div>
            <div className="row between" style={{ alignItems: "baseline" }}>
              <span>Subtotal</span>
              <span className="display" style={{ fontSize: 26 }}>
                {money(cart.subtotal)}
              </span>
            </div>
            <button
              className="btn btn-block"
              onClick={() => {
                closeDrawer();
                navigate("/checkout");
              }}
            >
              <Lock size={15} /> Checkout
            </button>
            <button
              className="btn btn-outline btn-block"
              onClick={() => {
                closeDrawer();
                navigate("/cart");
              }}
            >
              View Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 30);
      const onKey = (e: KeyboardEvent) =>
        e.key === "Escape" && setSearchOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter((p) =>
      (p.name + " " + p.blurb + " " + p.kind).toLowerCase().includes(s),
    );
  }, [q]);

  if (!searchOpen) return null;
  const go = (slug: string) => {
    setSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  return (
    <>
      <div className="overlay" onClick={() => setSearchOpen(false)} />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 95,
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          animation: "fadeUp .2s ease",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div className="container" style={{ padding: "22px 24px 28px" }}>
          <div
            className="row"
            style={{
              gap: 12,
              borderBottom: "1px solid var(--ink)",
              paddingBottom: 12,
            }}
          >
            <Search size={22} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && results[0] && go(results[0].slug)
              }
              placeholder="Search couches, covers, ottomans…"
              aria-label="Search products"
              style={{
                flex: 1,
                border: 0,
                background: "transparent",
                fontSize: 22,
                outline: "none",
                fontFamily: "var(--display)",
              }}
            />
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>
          <div className="label muted" style={{ margin: "18px 0 12px" }}>
            {q
              ? `${results.length} result${results.length === 1 ? "" : "s"}`
              : "Popular"}
          </div>
          {results.length === 0 ? (
            <p className="muted">
              No products match “{q}”. Try “pit”, “ottoman” or “cover”.
            </p>
          ) : (
            <div
              className="grid-auto"
              style={{
                ["--min" as string]: "220px",
                ["--gap" as string]: "14px",
              }}
            >
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go(p.slug)}
                  className="card row"
                  style={{
                    gap: 12,
                    padding: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--ink)",
                  }}
                >
                  <Img
                    src={p.images[0]}
                    alt={p.name}
                    w={160}
                    style={{
                      width: 64,
                      height: 56,
                      borderRadius: 10,
                      flex: "none",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 15 }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: 13.5 }}>
                      {priceLabel(p.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Toasts() {
  const { toasts, bottomOffset } = useUI();
  return (
    <div
      className="toasts"
      style={{ bottom: 24 + bottomOffset }}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.tone === "error" ? "error" : ""}`}
        >
          {t.tone === "success" && <CheckCircle2 size={17} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
  fullscreen,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  fullscreen?: boolean;
}) {
  const prev = () =>
    index !== null && onIndex((index - 1 + images.length) % images.length);
  const next = () => index !== null && onIndex((index + 1) % images.length);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft")
        onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onIndex]);

  return (
    <Modal
      open={index !== null}
      onClose={onClose}
      width={1100}
      label="Image viewer"
      fullscreen={fullscreen}
    >
      {index !== null && (
        <div
          style={{
            position: "relative",
            background: "#111",
            height: fullscreen ? "100%" : undefined,
          }}
        >
          <ZoomStage
            key={images[index]}
            src={images[index]}
            alt={`Photo ${index + 1}`}
            fullscreen={fullscreen}
            onPrev={prev}
            onNext={next}
          />
          <button
            className="icon-btn"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
            onClick={prev}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="icon-btn"
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
            onClick={next}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#fff",
              fontSize: 13,
              letterSpacing: ".1em",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            {index + 1} / {images.length}
          </div>
        </div>
      )}
    </Modal>
  );
}

const MAX_ZOOM = 4;
const TAP_ZOOM = 2.5;

/**
 * Pan/zoom surface: double-click or double-tap to zoom at a point, wheel or pinch
 * to zoom, drag to pan, swipe to change photo when not zoomed, +/−/0 keys.
 */
function ZoomStage({
  src,
  alt,
  fullscreen,
  onPrev,
  onNext,
}: {
  src: string;
  alt: string;
  fullscreen?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const view = useRef({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    downX: 0,
    downY: 0,
    downT: 0,
    lastX: 0,
    lastY: 0,
    startDist: 0,
    startScale: 1,
    pinched: false,
  });
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);

  const apply = (animate = false) => {
    const el = layerRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const v = view.current;
    const maxX = ((v.s - 1) * wrap.clientWidth) / 2;
    const maxY = ((v.s - 1) * wrap.clientHeight) / 2;
    v.x = Math.max(-maxX, Math.min(maxX, v.x));
    v.y = Math.max(-maxY, Math.min(maxY, v.y));
    el.style.transition = animate ? "transform .25s ease" : "none";
    el.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`;
    setZoomed(v.s > 1.01);
  };

  const zoomAt = (clientX: number, clientY: number, scale: number, animate = false) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const v = view.current;
    const next = Math.max(1, Math.min(MAX_ZOOM, scale));
    const px = clientX - (r.left + r.width / 2);
    const py = clientY - (r.top + r.height / 2);
    v.x = px - ((px - v.x) * next) / v.s;
    v.y = py - ((py - v.y) * next) / v.s;
    v.s = next;
    if (next === 1) {
      v.x = 0;
      v.y = 0;
    }
    apply(animate);
  };

  const zoomCenter = (scale: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) zoomAt(r.left + r.width / 2, r.top + r.height / 2, scale, true);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // React's onWheel is passive; we need preventDefault to stop the page scrolling.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, view.current.s * Math.exp(-e.deltaY * 0.0018));
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomCenter(view.current.s * 1.5);
      if (e.key === "-" || e.key === "_") zoomCenter(view.current.s / 1.5);
      if (e.key === "0") zoomCenter(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      wrap.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      Object.assign(g, {
        downX: e.clientX,
        downY: e.clientY,
        downT: performance.now(),
        lastX: e.clientX,
        lastY: e.clientY,
        pinched: false,
      });
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.startDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      g.startScale = view.current.s;
      g.pinched = true;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (g.startScale * dist) / g.startDist);
      return;
    }
    if (view.current.s > 1) {
      view.current.x += e.clientX - g.lastX;
      view.current.y += e.clientY - g.lastY;
      apply();
    }
    g.lastX = e.clientX;
    g.lastY = e.clientY;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0 || g.pinched) {
      if (pointers.current.size === 0) g.pinched = false;
      return;
    }
    const dx = e.clientX - g.downX;
    const dy = e.clientY - g.downY;
    const quick = performance.now() - g.downT < 300;
    if (Math.hypot(dx, dy) < 10 && quick) {
      const now = performance.now();
      const lt = lastTap.current;
      if (now - lt.t < 320 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 30) {
        zoomAt(e.clientX, e.clientY, view.current.s > 1.01 ? 1 : TAP_ZOOM, true);
        lastTap.current = { t: 0, x: 0, y: 0 };
      } else lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      return;
    }
    if (view.current.s <= 1.01 && Math.abs(dx) > 50 && Math.abs(dy) < 80) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        cursor: zoomed ? "grab" : "zoom-in",
        height: fullscreen ? "100dvh" : undefined,
        aspectRatio: fullscreen ? undefined : "3/2",
        userSelect: "none",
      }}
    >
      <div
        ref={layerRef}
        style={{ width: "100%", height: "100%", transformOrigin: "50% 50%" }}
      >
        <Img
          src={src}
          alt={alt}
          w={2000}
          fit={fullscreen ? "contain" : "cover"}
          style={{ background: "#111", width: "100%", height: "100%" }}
          eager
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#fff",
          fontSize: 12,
          letterSpacing: ".06em",
          background: "rgba(0,0,0,.45)",
          padding: "5px 10px",
          borderRadius: 99,
          pointerEvents: "none",
          opacity: zoomed ? 0 : 0.9,
          transition: "opacity .3s",
        }}
      >
        Double-tap or scroll to zoom
      </div>
      {zoomed && (
        <button
          className="btn btn-sm"
          onClick={() => zoomCenter(1)}
          style={{ position: "absolute", top: 12, right: 64, zIndex: 2 }}
        >
          Reset zoom
        </button>
      )}
    </div>
  );
}
