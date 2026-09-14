import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Home, Package, Truck } from "lucide-react";
import { useUI } from "../context/UIContext";
import { money, priceLabel, readStore } from "../lib/money";
import { Img } from "../components/ui";
import type { Order } from "./Checkout";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { toast } = useUI();
  const order = readStore<Order | null>("gh2-last-order", null);
  const match = order && (id === "latest" || order.id === id) ? order : null;

  if (!match) return <OrderLookup />;

  const placed = new Date(match.placedAt);
  const steps = [
    {
      icon: CheckCircle2,
      label: "Order placed",
      date: placed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      done: true,
    },
    {
      icon: Package,
      label: "Ships within 48 hours",
      date: "Processing",
      done: false,
    },
    { icon: Truck, label: "Out for delivery", date: "—", done: false },
    {
      icon: Home,
      label: "Delivered",
      date: `Est. ${match.delivery.eta}`,
      done: false,
    },
  ];

  return (
    <div
      className="page"
      style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px 0" }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 99,
            background: "var(--accent)",
            color: "var(--accentInk)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pop .5s ease",
          }}
        >
          <CheckCircle2 size={32} />
        </span>
        <p className="eyebrow" style={{ margin: "20px 0 8px" }}>
          Order {match.id}
        </p>
        <h1 className="display" style={{ fontSize: "clamp(34px,5vw,56px)" }}>
          Thank you, {match.firstName}!
        </h1>
        <p
          className="muted lead"
          style={{ margin: "12px auto 0", maxWidth: 520 }}
        >
          Your Cloud is on its way. We sent a confirmation to{" "}
          <strong style={{ color: "var(--ink)" }}>{match.email}</strong> (not
          really — this is a demo).
        </p>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 16,
          }}
        >
          {steps.map((s, i) => {
            const I = s.icon;
            return (
              <div
                key={s.label}
                className="stack"
                style={{ ["--gap" as string]: "6px", position: "relative" }}
              >
                <div className="row" style={{ gap: 8 }}>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 99,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: s.done ? "var(--accent)" : "var(--soft)",
                      color: s.done ? "var(--accentInk)" : "var(--muted)",
                      flex: "none",
                    }}
                  >
                    <I size={17} />
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      style={{
                        flex: 1,
                        height: 2,
                        background: s.done ? "var(--accent)" : "var(--line)",
                      }}
                    />
                  )}
                </div>
                <strong style={{ fontWeight: 500, fontSize: 15 }}>
                  {s.label}
                </strong>
                <span className="muted" style={{ fontSize: 13.5 }}>
                  {s.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="grid-auto"
        style={{
          ["--min" as string]: "300px",
          ["--gap" as string]: "20px",
          alignItems: "start",
        }}
      >
        <div className="card card-pad stack">
          <h3 className="display" style={{ fontSize: 22 }}>
            Items
          </h3>
          {match.items.map((it) => (
            <div key={it.key} className="row" style={{ gap: 12 }}>
              <Img
                src={it.image}
                alt={it.name}
                w={160}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  flex: "none",
                }}
              />
              <div style={{ flex: 1, fontSize: 15 }}>
                {it.name} × {it.qty}
                <div className="muted" style={{ fontSize: 13 }}>
                  {[it.color, it.note].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span>{priceLabel(it.price * it.qty)}</span>
            </div>
          ))}
          <hr className="divider" />
          <div className="row between muted" style={{ fontSize: 15 }}>
            <span>You saved</span>
            <span className="accent">
              {money(match.savings + match.discount)}
            </span>
          </div>
          <div className="row between" style={{ fontSize: 15 }}>
            <span className="muted">Delivery</span>
            <span>
              {match.delivery.price ? money(match.delivery.price) : "Free"}
            </span>
          </div>
          <div className="row between" style={{ alignItems: "baseline" }}>
            <span>Total paid</span>
            <span className="display" style={{ fontSize: 28 }}>
              {money(match.total)}
            </span>
          </div>
        </div>
        <div
          className="card card-pad stack"
          style={{ ["--gap" as string]: "18px" }}
        >
          <div>
            <div className="label muted" style={{ marginBottom: 6 }}>
              Shipping to
            </div>
            <div style={{ lineHeight: 1.6 }}>
              {match.firstName} {match.lastName}
              <br />
              {match.address}
              <br />
              {match.city}, {match.state} {match.zip}
            </div>
          </div>
          <div>
            <div className="label muted" style={{ marginBottom: 6 }}>
              Delivery
            </div>
            {match.delivery.label} — arrives by {match.delivery.eta}
          </div>
          <div>
            <div className="label muted" style={{ marginBottom: 6 }}>
              Payment
            </div>
            {match.payment}
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            <Link to="/shop" className="btn">
              Continue shopping
            </Link>
            <button
              className="btn btn-outline"
              onClick={() =>
                toast("Tracking will be available once your order ships.")
              }
            >
              Track order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderLookup() {
  const { toast } = useUI();
  const [email, setEmail] = useState("");
  const [num, setNum] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    toast(
      num
        ? `We couldn’t find order ${num} for that email.`
        : "Enter your order number.",
      "error",
    );
  };
  return (
    <div
      className="page"
      style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px 0" }}
    >
      <h1 className="display h2" style={{ marginBottom: 10 }}>
        View my order
      </h1>
      <p className="muted" style={{ margin: "0 0 24px" }}>
        No recent order on this device. Look one up with your email and order
        number — or place a demo order first.
      </p>
      <form onSubmit={submit} className="stack card card-pad">
        <label className="field">
          Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Order number
          <input
            className="input"
            placeholder="GH2-123456"
            value={num}
            onChange={(e) => setNum(e.target.value)}
          />
        </label>
        <button className="btn" type="submit">
          Find order
        </button>
      </form>
    </div>
  );
}
