import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Info,
  Lock,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { useCart, type CartItem } from "../context/CartContext";
import { money, priceLabel, writeStore } from "../lib/money";
import { Img } from "../components/ui";
import { DiscountForm, OrderTotals } from "./CartPage";
import { deliveryDate } from "../pdp/shared";

export interface Order {
  id: string;
  placedAt: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  delivery: { label: string; price: number; eta: string };
  payment: string;
  items: CartItem[];
  subtotal: number;
  savings: number;
  discount: number;
  total: number;
}

const DELIVERY = [
  {
    id: "standard",
    label: "Free standard delivery",
    desc: "Curbside, 2–5 business days",
    price: 0,
    days: 5,
  },
  {
    id: "expedited",
    label: "Expedited delivery",
    desc: "Curbside, 1–2 business days",
    price: 149,
    days: 2,
  },
  {
    id: "whiteglove",
    label: "White-glove delivery",
    desc: "In-room assembly & packaging removal",
    price: 199,
    days: 7,
  },
];

const PAYMENT = [
  {
    id: "card",
    label: "Credit or debit card",
    desc: "Demo only — no card details are collected",
    icon: CreditCard,
  },
  {
    id: "split",
    label: "4 interest-free payments",
    desc: "Pay 25% today, the rest every 2 weeks",
    icon: Sparkles,
  },
  {
    id: "paypal",
    label: "PayPal",
    desc: "You’d be redirected to PayPal to finish",
    icon: Wallet,
  },
];

const STATES = [
  "AL",
  "AZ",
  "CA",
  "CO",
  "CT",
  "FL",
  "GA",
  "IL",
  "MA",
  "MD",
  "MI",
  "MN",
  "NC",
  "NJ",
  "NY",
  "OH",
  "OR",
  "PA",
  "TN",
  "TX",
  "UT",
  "VA",
  "WA",
  "WI",
];

const EMPTY = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apt: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};
const DEMO = {
  email: "jordan@example.com",
  firstName: "Jordan",
  lastName: "Rivera",
  address: "1200 Congress Ave",
  apt: "Apt 4B",
  city: "Austin",
  state: "TX",
  zip: "78701",
  phone: "(512) 555-0142",
};

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof EMPTY, string>>
  >({});
  const [deliveryId, setDeliveryId] = useState("standard");
  const [paymentId, setPaymentId] = useState("card");
  const [placing, setPlacing] = useState(false);

  const delivery = DELIVERY.find((d) => d.id === deliveryId)!;

  if (cart.count === 0 && !placing) {
    return (
      <div
        className="page container"
        style={{ padding: "96px 24px", textAlign: "center" }}
      >
        <h1 className="display h2">Your cart is empty</h1>
        <p className="muted" style={{ margin: "12px 0 24px" }}>
          Add a Cloud to your cart to check out.
        </p>
        <Link to="/shop" className="btn">
          Shop Cloud Couches
        </Link>
      </div>
    );
  }

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    };

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    (["firstName", "lastName", "address", "city"] as const).forEach((k) => {
      if (!form[k].trim()) e[k] = "Required";
    });
    if (!form.state) e.state = "Select a state";
    if (!/^\d{5}$/.test(form.zip)) e.zip = "5-digit ZIP";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const place = () => {
    setPlacing(true);
    setTimeout(() => {
      const id = "GH2-" + Math.floor(100000 + Math.random() * 900000);
      const order: Order = {
        id,
        placedAt: new Date().toISOString(),
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        address: [form.address, form.apt].filter(Boolean).join(", "),
        city: form.city,
        state: form.state,
        zip: form.zip,
        delivery: {
          label: delivery.label,
          price: delivery.price,
          eta: deliveryDate(delivery.days),
        },
        payment: PAYMENT.find((p) => p.id === paymentId)!.label,
        items: cart.items,
        subtotal: cart.subtotal,
        savings: cart.savings,
        discount: cart.discountAmount,
        total: cart.total + delivery.price,
      };
      writeStore("gh2-last-order", order);
      cart.clear();
      navigate(`/order/${id}`);
    }, 1400);
  };

  const field = (
    k: keyof typeof EMPTY,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className="field" style={{ flex: 1, minWidth: 140 }}>
      {label}
      <input
        className={`input ${errors[k] ? "invalid" : ""}`}
        value={form[k]}
        onChange={set(k)}
        {...props}
      />
      {errors[k] && <span className="err">{errors[k]}</span>}
    </label>
  );

  const stepHeader = (i: number, title: string, summary: ReactNode) => (
    <div className="row between" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 12 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 99,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flex: "none",
            background:
              step > i
                ? "var(--accent)"
                : step === i
                  ? "var(--ink)"
                  : "var(--soft)",
            color: step >= i ? "var(--bg)" : "var(--muted)",
          }}
        >
          {step > i ? <Check size={14} /> : i + 1}
        </span>
        <div>
          <div className="display" style={{ fontSize: 21 }}>
            {title}
          </div>
          {step > i && (
            <div className="muted" style={{ fontSize: 14 }}>
              {summary}
            </div>
          )}
        </div>
      </div>
      {step > i && (
        <button className="text-btn" onClick={() => setStep(i)}>
          Edit
        </button>
      )}
    </div>
  );

  const optionCard = (active: boolean): React.CSSProperties => ({
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: 12,
    border: active ? "2px solid var(--ink)" : "1px solid var(--line)",
    margin: active ? 0 : 1,
    background: "var(--surface)",
    color: "var(--ink)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 14,
    width: "100%",
  });

  return (
    <div className="page">
      <div
        style={{
          background: "var(--soft)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          className="container row"
          style={{ gap: 10, padding: "12px 24px", fontSize: 14 }}
        >
          <Info size={16} color="var(--accent)" />
          <span>
            <strong style={{ fontWeight: 600 }}>Demo store</strong> — no payment
            is taken and no real order is placed.
          </span>
        </div>
      </div>
      <section
        style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 24px" }}
      >
        <Link
          to="/cart"
          className="row muted"
          style={{ gap: 4, fontSize: 14, marginBottom: 14 }}
        >
          <ChevronLeft size={16} /> Back to cart
        </Link>
        <div className="row wrap between" style={{ gap: 12, marginBottom: 28 }}>
          <h1
            className="display"
            style={{ fontSize: "clamp(32px,4.4vw,48px)" }}
          >
            Checkout
          </h1>
          <span className="row muted" style={{ gap: 6, fontSize: 14 }}>
            <Lock size={14} /> Secure checkout
          </span>
        </div>

        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "320px",
            ["--gap" as string]: "32px",
            alignItems: "start",
          }}
        >
          <div
            className="span-2 stack"
            style={{
              gridColumn: "span 2",
              minWidth: 0,
              ["--gap" as string]: "14px",
            }}
          >
            {/* Step 1 */}
            <div className="card card-pad">
              {stepHeader(
                0,
                "Contact & shipping",
                `${form.email} · ${form.address}, ${form.city} ${form.state} ${form.zip}`,
              )}
              {step === 0 && (
                <div
                  className="stack"
                  style={{ marginTop: 22, animation: "fadeUp .2s ease" }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => {
                      setForm(DEMO);
                      setErrors({});
                    }}
                  >
                    <Sparkles size={14} /> Autofill demo details
                  </button>
                  {field("email", "Email", {
                    type: "email",
                    autoComplete: "off",
                    placeholder: "you@example.com",
                  })}
                  <div
                    className="row wrap"
                    style={{ gap: 12, alignItems: "flex-start" }}
                  >
                    {field("firstName", "First name", { autoComplete: "off" })}
                    {field("lastName", "Last name", { autoComplete: "off" })}
                  </div>
                  {field("address", "Street address", { autoComplete: "off" })}
                  {field("apt", "Apartment, suite (optional)", {
                    autoComplete: "off",
                  })}
                  <div
                    className="row wrap"
                    style={{ gap: 12, alignItems: "flex-start" }}
                  >
                    {field("city", "City", { autoComplete: "off" })}
                    <label className="field" style={{ flex: 1, minWidth: 110 }}>
                      State
                      <select
                        className={`input ${errors.state ? "invalid" : ""}`}
                        value={form.state}
                        onChange={set("state")}
                      >
                        <option value="">Select</option>
                        {STATES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <span className="err">{errors.state}</span>
                      )}
                    </label>
                    {field("zip", "ZIP", {
                      inputMode: "numeric",
                      maxLength: 5,
                      autoComplete: "off",
                    })}
                  </div>
                  {field("phone", "Phone (for delivery updates, optional)", {
                    type: "tel",
                    autoComplete: "off",
                  })}
                  <button
                    className="btn"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => validate() && setStep(1)}
                  >
                    Continue to delivery
                  </button>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              className="card card-pad"
              style={{ opacity: step < 1 ? 0.6 : 1 }}
            >
              {stepHeader(
                1,
                "Delivery",
                `${delivery.label} · arrives by ${deliveryDate(delivery.days)}`,
              )}
              {step === 1 && (
                <div
                  className="stack"
                  style={{
                    marginTop: 22,
                    ["--gap" as string]: "10px",
                    animation: "fadeUp .2s ease",
                  }}
                >
                  {DELIVERY.map((d) => (
                    <button
                      key={d.id}
                      style={optionCard(d.id === deliveryId)}
                      onClick={() => setDeliveryId(d.id)}
                    >
                      <Truck
                        size={20}
                        color={
                          d.id === deliveryId ? "var(--accent)" : "var(--muted)"
                        }
                      />
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 15.5 }}>
                          {d.label}
                        </span>
                        <span className="muted" style={{ fontSize: 13.5 }}>
                          {d.desc} · arrives by {deliveryDate(d.days)}
                        </span>
                      </span>
                      <span>{d.price ? money(d.price) : "Free"}</span>
                    </button>
                  ))}
                  <button
                    className="btn"
                    style={{ alignSelf: "flex-start", marginTop: 8 }}
                    onClick={() => setStep(2)}
                  >
                    Continue to payment
                  </button>
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div
              className="card card-pad"
              style={{ opacity: step < 2 ? 0.6 : 1 }}
            >
              {stepHeader(2, "Payment", "")}
              {step === 2 && (
                <div
                  className="stack"
                  style={{
                    marginTop: 22,
                    ["--gap" as string]: "10px",
                    animation: "fadeUp .2s ease",
                  }}
                >
                  {PAYMENT.map((p) => {
                    const I = p.icon;
                    return (
                      <button
                        key={p.id}
                        style={optionCard(p.id === paymentId)}
                        onClick={() => setPaymentId(p.id)}
                      >
                        <I
                          size={20}
                          color={
                            p.id === paymentId
                              ? "var(--accent)"
                              : "var(--muted)"
                          }
                        />
                        <span style={{ flex: 1 }}>
                          <span style={{ display: "block", fontSize: 15.5 }}>
                            {p.label}
                          </span>
                          <span className="muted" style={{ fontSize: 13.5 }}>
                            {p.id === "split"
                              ? `4 × ${money((cart.total + delivery.price) / 4)} — ${p.desc}`
                              : p.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  <div
                    className="row"
                    style={{
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "var(--soft)",
                      fontSize: 13.5,
                      marginTop: 6,
                    }}
                  >
                    <Info
                      size={16}
                      color="var(--accent)"
                      style={{ flex: "none" }}
                    />
                    This is a demo. Placing the order will not charge anything
                    or collect payment details.
                  </div>
                  <button
                    className="btn btn-accent"
                    style={{ marginTop: 8, padding: 18 }}
                    onClick={place}
                    disabled={placing}
                  >
                    {placing ? (
                      <>
                        <span className="spinner" /> Placing order…
                      </>
                    ) : (
                      <>
                        <Lock size={15} /> Place order —{" "}
                        {money(cart.total + delivery.price)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside
            className="card sticky-col"
            style={{ padding: 24, display: "grid", gap: 14 }}
          >
            <h3 className="display" style={{ fontSize: 22 }}>
              Order Summary
            </h3>
            <div
              className="stack"
              style={{
                ["--gap" as string]: "12px",
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              {cart.items.map((it) => (
                <div key={it.key} className="row" style={{ gap: 12 }}>
                  <div style={{ position: "relative", flex: "none" }}>
                    <Img
                      src={it.image}
                      alt={it.name}
                      w={160}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                      }}
                    />
                    <span
                      className="cart-badge"
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        minWidth: 20,
                        height: 20,
                        fontSize: 11,
                      }}
                    >
                      {it.qty}
                    </span>
                  </div>
                  <div style={{ flex: 1, fontSize: 14.5, minWidth: 0 }}>
                    {it.name}
                    <div className="muted" style={{ fontSize: 13 }}>
                      {[it.color, it.note].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span style={{ fontSize: 14.5 }}>
                    {priceLabel(it.price * it.qty)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <DiscountForm />
            <OrderTotals shipping={delivery.price} />
          </aside>
        </div>
      </section>
    </div>
  );
}
