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
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
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
    >
      {index !== null && (
        <div style={{ position: "relative", background: "#111" }}>
          <Img
            src={images[index]}
            alt={`Photo ${index + 1}`}
            w={2000}
            ratio="3/2"
            style={{ background: "#111" }}
          />
          <button
            className="icon-btn"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onClick={() => onIndex((index - 1 + images.length) % images.length)}
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
            }}
            onClick={() => onIndex((index + 1) % images.length)}
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
            }}
          >
            {index + 1} / {images.length}
          </div>
        </div>
      )}
    </Modal>
  );
}
