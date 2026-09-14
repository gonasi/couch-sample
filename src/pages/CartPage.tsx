import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, RotateCcw, ShoppingBag, Tag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { money, priceLabel } from "../lib/money";
import { Img, QtyStepper } from "../components/ui";
import { PairsWellWith } from "../components/Sections";

export default function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  return (
    <div className="page">
      <section
        style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 24px" }}
      >
        <div
          className="row wrap between"
          style={{ alignItems: "baseline", gap: 16, marginBottom: 32 }}
        >
          <h1
            className="display"
            style={{ fontSize: "clamp(32px,4.4vw,52px)" }}
          >
            Your Cart
          </h1>
          <Link to="/shop" className="link-underline">
            Continue shopping
          </Link>
        </div>

        {cart.count === 0 ? (
          <div
            className="card"
            style={{ padding: "72px 24px", textAlign: "center" }}
          >
            <ShoppingBag
              size={28}
              color="var(--muted)"
              style={{ margin: "0 auto" }}
            />
            <p style={{ fontSize: 18, margin: "16px 0 22px" }}>
              Your cart is currently empty.
            </p>
            <Link to="/shop" className="btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div
            className="grid-auto"
            style={{
              ["--min" as string]: "300px",
              ["--gap" as string]: "32px",
              alignItems: "start",
            }}
          >
            <div
              className="card span-2"
              style={{ gridColumn: "span 2", minWidth: 0, overflow: "hidden" }}
            >
              {cart.items.map((it) => (
                <div
                  key={it.key}
                  className="row wrap"
                  style={{
                    gap: 18,
                    padding: 20,
                    borderBottom: "1px solid var(--line)",
                    alignItems: "flex-start",
                  }}
                >
                  <Link to={`/product/${it.slug}`}>
                    <Img
                      src={it.image}
                      alt={it.name}
                      w={300}
                      style={{
                        width: 120,
                        height: 96,
                        borderRadius: 12,
                        flex: "none",
                        border: "1px solid var(--line)",
                      }}
                    />
                  </Link>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 180,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Link
                      to={`/product/${it.slug}`}
                      className="display"
                      style={{ fontSize: 19 }}
                    >
                      {it.name}
                    </Link>
                    {it.color && (
                      <div className="muted" style={{ fontSize: 14.5 }}>
                        Color: {it.color}
                      </div>
                    )}
                    {it.note && (
                      <div className="muted" style={{ fontSize: 14.5 }}>
                        {it.note}
                      </div>
                    )}
                    <div className="muted" style={{ fontSize: 14.5 }}>
                      Ships in 2–5 business days
                    </div>
                    <button
                      className="text-btn"
                      style={{ alignSelf: "flex-start", marginTop: 4 }}
                      onClick={() => cart.remove(it.key)}
                    >
                      Remove
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 10,
                    }}
                  >
                    <QtyStepper
                      small
                      min={0}
                      value={it.qty}
                      onChange={(q) => cart.setQty(it.key, q)}
                    />
                    <div style={{ fontSize: 18 }}>
                      {priceLabel(it.price * it.qty)}
                    </div>
                    {it.compare > it.price && (
                      <s className="muted" style={{ fontSize: 14 }}>
                        {money(it.compare * it.qty)}
                      </s>
                    )}
                  </div>
                </div>
              ))}
              <div
                className="row wrap muted"
                style={{ padding: "18px 20px", gap: 10, fontSize: 14.5 }}
              >
                <Tag size={16} color="var(--accent)" />
                Discount CLOUD30 applied automatically at checkout.
              </div>
            </div>

            <aside
              className="card sticky-col"
              style={{ padding: 24, display: "grid", gap: 14 }}
            >
              <h3 className="display" style={{ fontSize: 22, marginBottom: 4 }}>
                Order Summary
              </h3>
              <OrderTotals />
              <DiscountForm />
              <button
                className="btn"
                style={{ padding: 17 }}
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </button>
              <div
                className="muted"
                style={{ display: "grid", gap: 9, fontSize: 14, marginTop: 6 }}
              >
                <span className="row" style={{ gap: 9 }}>
                  <Lock size={15} />
                  Secure encrypted checkout
                </span>
                <span className="row" style={{ gap: 9 }}>
                  <CreditCard size={15} />4 interest-free payments available
                </span>
                <span className="row" style={{ gap: 9 }}>
                  <RotateCcw size={15} />
                  30-night trial, free returns
                </span>
              </div>
            </aside>
          </div>
        )}
      </section>
      <PairsWellWith title="You might also like" />
    </div>
  );
}

export function OrderTotals({
  shipping = 0,
  shippingLabel = "Free",
}: {
  shipping?: number;
  shippingLabel?: string;
}) {
  const cart = useCart();
  const row = (label: string, value: string, accent?: boolean) => (
    <div className="row between" style={{ fontSize: 15.5 }}>
      <span className="muted">{label}</span>
      <span className={accent ? "accent" : ""}>{value}</span>
    </div>
  );
  return (
    <>
      {row(
        `Subtotal (${cart.count} item${cart.count === 1 ? "" : "s"})`,
        money(cart.subtotal),
      )}
      {row("Sale savings", `−${money(cart.savings)}`, true)}
      {cart.discount &&
        cart.discountAmount > 0 &&
        row(
          `Code ${cart.discount.code}`,
          `−${money(cart.discountAmount)}`,
          true,
        )}
      {row("Shipping", shipping ? money(shipping) : shippingLabel)}
      {row("Sales tax", "Not collected")}
      <div
        className="row between"
        style={{
          alignItems: "baseline",
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
          fontSize: 16,
        }}
      >
        <span>Total</span>
        <span className="display" style={{ fontSize: 28 }}>
          {money(cart.total + shipping)}
        </span>
      </div>
    </>
  );
}

export function DiscountForm() {
  const cart = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = cart.applyCode(code);
    setMsg(r);
    if (r.ok) setCode("");
  };
  return (
    <div>
      <form onSubmit={submit} className="row" style={{ gap: 8, marginTop: 4 }}>
        <input
          className="input input-pill"
          style={{
            fontSize: 14,
            padding: "12px 14px",
            background: "var(--bg)",
          }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Discount code"
          aria-label="Discount code"
        />
        <button type="submit" className="btn btn-outline btn-sm">
          Apply
        </button>
      </form>
      {cart.discount && (
        <div className="row between" style={{ marginTop: 10, fontSize: 13.5 }}>
          <span className="pill pill-soft">
            <Tag size={12} /> {cart.discount.code}
          </span>
          <button
            className="text-btn row"
            style={{ gap: 4 }}
            onClick={() => {
              cart.removeCode();
              setMsg(null);
            }}
          >
            <X size={12} /> Remove
          </button>
        </div>
      )}
      {msg && !msg.ok && (
        <div style={{ marginTop: 8, fontSize: 13.5, color: "#c0392b" }}>
          {msg.message}
        </div>
      )}
      {msg && msg.ok && (
        <div style={{ marginTop: 8, fontSize: 13.5 }} className="accent">
          {msg.message}
        </div>
      )}
      {!cart.discount && !msg && (
        <div className="muted" style={{ marginTop: 8, fontSize: 12.5 }}>
          Demo tip: try <strong>WELCOME100</strong>
        </div>
      )}
    </div>
  );
}
