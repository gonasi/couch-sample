import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Heart,
  MapPin,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { useUI } from "../context/UIContext";
import { useCart } from "../context/CartContext";
import {
  COUCHES,
  colorHex,
  getById,
  type Product,
} from "../data/products";
import {
  FINANCING_TERMS,
  HOTSPOT_SCENES,
  ZIP_REGIONS,
  type HotspotSceneId,
} from "../data/content";
import { useSaved } from "../hooks/useSaved";
import {
  money,
  moneyShort,
  priceLabel,
  readStore,
  writeStore,
} from "../lib/money";
import { buildShareUrl, shareLink } from "../lib/share";
import {
  DEFAULT_ROOM,
  FIT_COPY,
  fitInRoom,
  footprint,
  type FitTone,
  type Room,
} from "../lib/layout";
import { deliveryDate } from "../pdp/shared";
import LayoutDiagram from "./LayoutDiagram";
import { Img, Modal } from "./ui";

/* ---------- Save + share ---------- */

export function SaveShare({
  slug,
  color,
  params,
  layout = "icons",
  title = "GH2 Cloud",
}: {
  slug: string;
  color?: string;
  /** extra query params for the share link (e.g. quiz answers, layout) */
  params?: Record<string, string>;
  layout?: "icons" | "row";
  title?: string;
}) {
  const { variant, toast } = useUI();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(slug);
  const [bump, setBump] = useState(0);

  const onSave = () => {
    const now = toggle(slug);
    setBump((b) => b + 1);
    toast(
      now ? "Saved to your wishlist" : "Removed from your wishlist",
      now ? "success" : "default",
    );
  };
  const onShare = () =>
    shareLink(
      buildShareUrl(slug, {
        v: variant,
        ...(color ? { color } : {}),
        ...params,
      }),
      title,
      toast,
    );

  if (layout === "row") {
    return (
      <div className="row" style={{ gap: 8 }}>
        <button
          className="chip row"
          style={{ gap: 6 }}
          onClick={onSave}
          aria-pressed={saved}
        >
          <Heart
            key={bump}
            size={14}
            fill={saved ? "var(--accent)" : "none"}
            color={saved ? "var(--accent)" : "currentColor"}
            style={{ animation: bump ? "pop .35s ease" : undefined }}
          />
          {saved ? "Saved" : "Save"}
        </button>
        <button className="chip row" style={{ gap: 6 }} onClick={onShare}>
          <Share2 size={14} /> Share
        </button>
      </div>
    );
  }
  return (
    <div className="row" style={{ gap: 8 }}>
      <button
        className="icon-btn"
        onClick={onSave}
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        style={{ boxShadow: "0 4px 14px rgba(0,0,0,.12)" }}
      >
        <Heart
          key={bump}
          size={17}
          fill={saved ? "var(--accent)" : "none"}
          color={saved ? "var(--accent)" : "currentColor"}
          style={{ animation: bump ? "pop .35s ease" : undefined }}
        />
      </button>
      <button
        className="icon-btn"
        onClick={onShare}
        aria-label="Share this couch"
        style={{ boxShadow: "0 4px 14px rgba(0,0,0,.12)" }}
      >
        <Share2 size={16} />
      </button>
    </div>
  );
}

/* ---------- Financing ---------- */

export function monthlyPayment(amount: number, months: number, apr: number) {
  if (apr === 0) return amount / months;
  const r = apr / 100 / 12;
  return (amount * r) / (1 - Math.pow(1 + r, -months));
}

export function FinancingCalculator({
  amount,
  compact,
  defaultTerm = "12",
}: {
  amount: number;
  compact?: boolean;
  defaultTerm?: string;
}) {
  const [termId, setTermId] = useState(defaultTerm);
  const term =
    FINANCING_TERMS.find((t) => t.id === termId) ?? FINANCING_TERMS[2];
  const payIn4 = !!term.payIn4;
  const each = payIn4
    ? amount / 4
    : monthlyPayment(amount, term.months, term.apr);
  const total = payIn4 ? amount : each * term.months;
  const interest = Math.max(0, total - amount);
  const needsApproval = term.id === "12" && amount < 1500;
  const labelId = useId();

  return (
    <div style={{ display: "grid", gap: compact ? 8 : 12 }}>
      <div
        className="row wrap"
        style={{ gap: 6 }}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        <span id={labelId} className="visually-hidden">
          Payment plan
        </span>
        {FINANCING_TERMS.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={t.id === termId}
            className={`chip ${t.id === termId ? "active" : ""}`}
            style={
              compact ? { padding: "5px 10px", fontSize: 12.5 } : undefined
            }
            onClick={() => setTermId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="row between wrap"
        style={{ gap: 8, alignItems: "baseline" }}
        aria-live="polite"
      >
        <span className="display" style={{ fontSize: compact ? 22 : 34 }}>
          {money(each)}
          <span
            className="muted"
            style={{ fontSize: compact ? 13 : 15, fontFamily: "var(--body)" }}
          >
            {payIn4 ? " every 2 weeks" : "/mo"}
          </span>
        </span>
        <span className="muted" style={{ fontSize: compact ? 12.5 : 14 }}>
          {term.apr === 0 ? "0% APR" : `${term.apr}% APR est.`} · total{" "}
          {moneyShort(total)}
          {interest > 0 ? ` (${moneyShort(interest)} interest)` : ""}
        </span>
      </div>
      {needsApproval && (
        <span className="muted" style={{ fontSize: 12.5 }}>
          12 months at 0% APR is for orders over $1,500.
        </span>
      )}
    </div>
  );
}

export function FinancingModal({
  open,
  onClose,
  amount,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
}) {
  const [state, setState] = useState<"idle" | "checking" | "done">("idle");
  useEffect(() => {
    if (!open) setState("idle");
  }, [open]);
  const check = () => {
    setState("checking");
    window.setTimeout(() => setState("done"), 1300);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={560}
      label="Financing calculator"
    >
      <div style={{ padding: "30px 28px 26px", display: "grid", gap: 18 }}>
        <div>
          <span className="eyebrow">Pay over time</span>
          <h2 className="display h3" style={{ margin: "8px 0 4px" }}>
            Bring it home for {money(amount / 12)}/mo
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 15 }}>
            Pick a plan to see your payment on {money(amount)}.
          </p>
        </div>
        <FinancingCalculator amount={amount} />
        <div className="card" style={{ padding: 14, background: "var(--bg)" }}>
          {state === "done" ? (
            <div
              className="row"
              style={{ gap: 10, animation: "fadeUp .25s ease" }}
            >
              <span className="icon-tile" style={{ width: 34, height: 34 }}>
                <Check size={17} />
              </span>
              <div>
                <strong style={{ fontWeight: 600 }}>
                  You’re pre-qualified for up to{" "}
                  {moneyShort(
                    Math.max(5000, Math.ceil(amount / 500) * 500 + 1500),
                  )}
                </strong>
                <div className="muted" style={{ fontSize: 13.5 }}>
                  Demo only. Choose your plan at checkout.
                </div>
              </div>
            </div>
          ) : (
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="row muted" style={{ gap: 8, fontSize: 14 }}>
                <ShieldCheck size={16} color="var(--accent)" /> Won’t affect
                your credit score
              </span>
              <button
                className="btn btn-sm"
                onClick={check}
                disabled={state === "checking"}
              >
                {state === "checking" ? (
                  <span className="spinner" />
                ) : (
                  "Check eligibility"
                )}
              </button>
            </div>
          )}
        </div>
        <Link
          to="/support/financing"
          className="link-underline muted"
          style={{ fontSize: 14 }}
          onClick={onClose}
        >
          How financing works
        </Link>
      </div>
    </Modal>
  );
}

/* ---------- Delivery estimate ---------- */

export function DeliveryEstimator({ compact }: { compact?: boolean }) {
  const [zip, setZip] = useState<string>(() => readStore("gh2-zip", ""));
  const [draft, setDraft] = useState(zip);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(!zip);

  const region = /^\d{5}$/.test(zip) ? ZIP_REGIONS[+zip[0]] : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(draft)) {
      setError("Enter a 5-digit ZIP code");
      return;
    }
    setError("");
    setZip(draft);
    writeStore("gh2-zip", draft);
    setEditing(false);
  };

  return (
    <div
      className={compact ? "" : "card"}
      style={{
        padding: compact ? 0 : 16,
        display: "grid",
        gap: 8,
        fontSize: compact ? 14 : 15,
      }}
    >
      {region && !editing ? (
        <div
          className="row between wrap"
          style={{ gap: 8, animation: "fadeUp .25s ease" }}
          aria-live="polite"
        >
          <span className="row" style={{ gap: 9, alignItems: "flex-start" }}>
            <Truck
              size={17}
              color="var(--accent)"
              style={{ marginTop: 2, flex: "none" }}
            />
            <span>
              Arrives{" "}
              <strong style={{ fontWeight: 600 }}>
                {deliveryDate(region.min)} – {deliveryDate(region.max)}
              </strong>
              <span className="muted"> to {zip} · free curbside</span>
            </span>
          </span>
          <button className="text-btn" onClick={() => setEditing(true)}>
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="row wrap" style={{ gap: 8 }}>
          <label className="row" style={{ gap: 8, flex: 1, minWidth: 180 }}>
            <MapPin size={16} color="var(--accent)" style={{ flex: "none" }} />
            <span className="visually-hidden">ZIP code</span>
            <input
              className={`input ${error ? "invalid" : ""}`}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="ZIP for delivery date"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
              style={{ padding: "9px 12px", fontSize: 14 }}
            />
          </label>
          <button className="btn btn-sm btn-outline" type="submit">
            Check
          </button>
          {error && (
            <span
              style={{ color: "#C2412D", fontSize: 13, width: "100%" }}
              role="alert"
            >
              {error}
            </span>
          )}
        </form>
      )}
    </div>
  );
}

/* ---------- Compare sizes ---------- */

export const TONE_COLOR: Record<FitTone, string> = {
  great: "#3F7D4E",
  tight: "#B7791F",
  no: "#C2412D",
};

export function ConfigCompareTable({
  current,
  color,
  onChoose,
}: {
  current: string;
  color: string;
  onChoose: (slug: string) => void;
}) {
  const room = readStore<Room | null>("gh2-room", null);
  const rows: { label: string; get: (p: Product) => React.ReactNode }[] = [
    { label: "Seats", get: (p) => p.seats },
    { label: "Pieces", get: (p) => p.pieces },
    { label: "Overall", get: (p) => p.dims!.overall.replace(' × 33" H', "") },
    { label: "Boxes", get: (p) => p.dims!.boxes.replace("Ships in ", "") },
    ...(room
      ? [
          {
            label: `Your room (${Math.round(room.w / 12)}×${Math.round(room.d / 12)} ft)`,
            get: (p: Product) => {
              const tone = fitInRoom(footprint(p.layout!), room).tone;
              return (
                <span style={{ color: TONE_COLOR[tone], fontWeight: 600 }}>
                  {tone === "great"
                    ? "Fits"
                    : tone === "tight"
                      ? "Tight"
                      : "Too big"}
                </span>
              );
            },
          },
        ]
      : []),
  ];
  const cols = `minmax(96px,120px) repeat(${COUCHES.length}, minmax(150px,1fr))`;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 6 }}>
      <div
        style={{ display: "grid", gridTemplateColumns: cols, minWidth: 700 }}
        role="table"
        aria-label="Compare sizes"
      >
        <div role="row" style={{ display: "contents" }}>
          <div role="columnheader" />
          {COUCHES.map((p) => {
            const active = p.slug === current;
            return (
              <div
                key={p.slug}
                role="columnheader"
                style={{
                  padding: "12px 10px",
                  display: "grid",
                  gap: 8,
                  alignContent: "start",
                  background: active ? "var(--soft)" : undefined,
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <div
                  className="dots-bg"
                  style={{ borderRadius: 10, padding: 8 }}
                >
                  <LayoutDiagram
                    modules={p.layout!}
                    color={colorHex(color)}
                    showDims={false}
                    maxWidth={130}
                  />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {p.shortName}
                </div>
                <div>
                  <span style={{ fontSize: 15 }}>{moneyShort(p.price)}</span>{" "}
                  <s className="muted" style={{ fontSize: 13 }}>
                    {moneyShort(p.compare)}
                  </s>
                </div>
              </div>
            );
          })}
        </div>
        {rows.map((r) => (
          <div key={r.label} role="row" style={{ display: "contents" }}>
            <div
              role="rowheader"
              className="muted"
              style={{
                padding: "10px 0",
                fontSize: 13,
                borderTop: "1px solid var(--line)",
              }}
            >
              {r.label}
            </div>
            {COUCHES.map((p) => (
              <div
                key={p.slug}
                role="cell"
                style={{
                  padding: "10px",
                  fontSize: 14,
                  borderTop: "1px solid var(--line)",
                  background: p.slug === current ? "var(--soft)" : undefined,
                }}
              >
                {r.get(p)}
              </div>
            ))}
          </div>
        ))}
        <div role="row" style={{ display: "contents" }}>
          <div />
          {COUCHES.map((p) => {
            const active = p.slug === current;
            return (
              <div
                key={p.slug}
                style={{
                  padding: 10,
                  background: active ? "var(--soft)" : undefined,
                  borderRadius: "0 0 12px 12px",
                }}
              >
                <button
                  className={`btn btn-sm btn-block ${active ? "" : "btn-outline"}`}
                  onClick={() => onChoose(p.slug)}
                  aria-pressed={active}
                >
                  {active ? (
                    <>
                      <Check size={14} /> Selected
                    </>
                  ) : (
                    "Choose"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ConfigCompareModal({
  open,
  onClose,
  current,
  color,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  current: string;
  color: string;
  onChoose: (slug: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} width={980} label="Compare sizes">
      <div style={{ padding: "28px 24px 22px" }}>
        <span className="eyebrow">Compare sizes</span>
        <h2 className="display h3" style={{ margin: "8px 0 18px" }}>
          Which Cloud fits your life?
        </h2>
        <ConfigCompareTable
          current={current}
          color={color}
          onChoose={(slug) => {
            onChoose(slug);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

/* ---------- Hotspots ---------- */

export function Hotspots({
  sceneId,
  mode = "shop",
  product,
  color = "White",
  radius = "var(--radius)",
  onActive,
  hint = true,
}: {
  sceneId: HotspotSceneId;
  mode?: "shop" | "info";
  /** couch on the current page, used by "couch" spots */
  product?: Product;
  color?: string;
  radius?: string;
  onActive?: (i: number | null) => void;
  hint?: boolean;
}) {
  const scene = HOTSPOT_SCENES[sceneId];
  const cart = useCart();
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActiveState] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const spots = useMemo(
    () => scene.spots.filter((s) => s.productId !== "couch" || product),
    [scene, product],
  );

  const setActive = (i: number | null) => {
    setActiveState(i);
    onActive?.(i);
    if (i !== null) setTouched(true);
  };

  useEffect(() => {
    if (active === null) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        btnRefs.current[active]?.focus();
        setActive(null);
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSpotKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      (i + (e.key === "ArrowRight" ? 1 : spots.length - 1)) % spots.length;
    btnRefs.current[next]?.focus();
    setActive(next);
  };

  const spot = active !== null ? spots[active] : null;
  const shopProduct =
    spot?.productId === "couch"
      ? product
      : spot?.productId
        ? getById(spot.productId)
        : undefined;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <Img
        src={scene.image}
        alt={scene.alt}
        w={1800}
        ratio={scene.ratio}
        radius={radius}
      />
      {spots.map((s, i) => (
        <button
          key={s.title}
          ref={(el) => (btnRefs.current[i] = el)}
          className="hotspot"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          aria-expanded={active === i}
          aria-label={
            mode === "info" ? `${i + 1}. ${s.title}` : `Shop ${s.title}`
          }
          onClick={() => setActive(active === i ? null : i)}
          onKeyDown={(e) => onSpotKey(e, i)}
        >
          {mode === "info" ? (
            i + 1
          ) : active === i ? (
            <X size={14} />
          ) : (
            <Plus size={15} />
          )}
        </button>
      ))}
      {spot && active !== null && (
        <div
          className="hotspot-pop"
          role="dialog"
          aria-label={spot.title}
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            transform: `translate(${spot.x > 55 ? "calc(-100% - 22px)" : "22px"}, ${spot.y > 55 ? "calc(-100% + 16px)" : "-16px"})`,
          }}
        >
          {mode === "shop" && shopProduct ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div
                className="row"
                style={{ gap: 10, alignItems: "flex-start" }}
              >
                <Img
                  src={
                    shopProduct.kind === "couch"
                      ? (shopProduct.colorImages?.[
                          color as keyof typeof shopProduct.colorImages
                        ] ?? shopProduct.images[0])
                      : shopProduct.images[0]
                  }
                  alt=""
                  w={200}
                  ratio="1"
                  radius="10px"
                  style={{ width: 58, flex: "none" }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {shopProduct.kind === "couch"
                      ? `${shopProduct.name}`
                      : shopProduct.name}
                  </div>
                  <div
                    className="muted"
                    style={{ fontSize: 13, lineHeight: 1.4 }}
                  >
                    {spot.body}
                  </div>
                </div>
              </div>
              <div className="row between">
                <span style={{ fontSize: 15 }}>
                  {priceLabel(shopProduct.price)}
                  {shopProduct.kind === "couch" && (
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {" "}
                      · {color}
                    </span>
                  )}
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    cart.add(
                      shopProduct,
                      shopProduct.kind === "couch" ? { color } : {},
                    );
                    setActive(null);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <span
                className="display"
                style={{ fontSize: 24, lineHeight: 1, color: "var(--accent)" }}
              >
                0{active + 1}
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {spot.title}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 13.5, lineHeight: 1.45 }}
                >
                  {spot.body}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {hint && !touched && (
        <span
          className="row"
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            gap: 6,
            background: "rgba(0,0,0,.55)",
            color: "#fff",
            fontSize: 12.5,
            padding: "6px 11px",
            borderRadius: 99,
            pointerEvents: "none",
          }}
        >
          <Sparkles size={13} />{" "}
          {mode === "shop"
            ? "Tap the dots to shop the look"
            : "Tap the numbers to look inside"}
        </span>
      )}
    </div>
  );
}

/* ---------- Room fit summary pill ---------- */

export function FitPill({
  tone,
  children,
}: {
  tone: FitTone;
  children?: React.ReactNode;
}) {
  return (
    <span
      className="row"
      style={{
        gap: 6,
        display: "inline-flex",
        padding: "5px 11px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 600,
        color: TONE_COLOR[tone],
        background: `color-mix(in srgb, ${TONE_COLOR[tone]} 12%, transparent)`,
      }}
      aria-live="polite"
    >
      {tone === "no" ? <X size={14} /> : <Check size={14} />}
      {children ?? FIT_COPY[tone]}
    </span>
  );
}

export const roomFromStore = () => readStore<Room>("gh2-room", DEFAULT_ROOM);
