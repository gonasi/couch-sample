import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  Blocks,
  Leaf,
  Minus,
  PawPrint,
  Plus,
  ShieldCheck,
  Waves,
  WashingMachine,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Truck,
} from "lucide-react";
import { sized } from "../data/images";
import { COLORS, COUCHES } from "../data/products";
import { moneyShort } from "../lib/money";
import { useScrollLock } from "../hooks/useScrollLock";

/* ---------- Img: Unsplash photo with the design's striped placeholder as fallback ---------- */
export function Img({
  src,
  alt,
  w = 1200,
  ratio,
  label,
  className = "",
  style,
  eager,
  radius,
  fit,
}: {
  src: string;
  alt: string;
  w?: number;
  ratio?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
  radius?: string;
  fit?: "cover" | "contain";
}) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  useEffect(() => setState("loading"), [src]);
  return (
    <div
      className={`media ${state !== "ok" ? "stripes" : ""} ${className}`}
      style={{ aspectRatio: ratio, borderRadius: radius, ...style }}
    >
      {state !== "error" && (
        <img
          src={sized(src, w)}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setState("ok")}
          onError={() => setState("error")}
          style={{ opacity: state === "ok" ? 1 : 0, objectFit: fit }}
          draggable={false}
        />
      )}
      {state === "error" && (
        <span className="media-placeholder">{label ?? alt}</span>
      )}
    </div>
  );
}

export function Stars({
  rating = 5,
  size = 15,
}: {
  rating?: number;
  size?: number;
}) {
  const full = Math.round(rating);
  return (
    <span
      className="stars"
      style={{ fontSize: size }}
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
  small,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  small?: boolean;
}) {
  const s = small ? 30 : 36;
  const btn: CSSProperties = {
    width: s,
    height: s,
    border: 0,
    background: "transparent",
    borderRadius: 999,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ink)",
  };
  return (
    <div
      className="row"
      style={{
        gap: 4,
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: small ? 3 : 6,
        background: "var(--surface)",
        flex: "none",
      }}
    >
      <button
        style={btn}
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={15} />
      </button>
      <span
        style={{ minWidth: 24, textAlign: "center", fontSize: small ? 15 : 16 }}
      >
        {value}
      </span>
      <button
        style={btn}
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

export function Swatches({
  value,
  onChange,
  size = 38,
}: {
  value: string;
  onChange: (c: string) => void;
  size?: number;
}) {
  return (
    <div
      className="row"
      style={{ gap: size > 30 ? 12 : 9 }}
      role="radiogroup"
      aria-label="Color"
    >
      {COLORS.map((c) => (
        <button
          key={c.name}
          title={c.name}
          aria-label={c.name}
          aria-checked={value === c.name}
          role="radio"
          className={`swatch ${value === c.name ? "active" : ""}`}
          style={{ width: size, height: size, background: c.hex }}
          onClick={() => onChange(c.name)}
        />
      ))}
    </div>
  );
}

export function ConfigPicker({
  current,
  onPick,
}: {
  current: string;
  onPick: (slug: string) => void;
}) {
  return (
    <div
      className="grid-auto"
      style={{ ["--min" as string]: "150px", ["--gap" as string]: "10px" }}
    >
      {COUCHES.map((p) => {
        const active = p.slug === current;
        return (
          <button
            key={p.slug}
            onClick={() => onPick(p.slug)}
            style={{
              textAlign: "left",
              padding: active ? "12px 14px" : "13px 15px",
              borderRadius: 12,
              border: active ? "2px solid var(--ink)" : "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 15 }}>{p.shortName}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {moneyShort(p.price)} · seats {p.seats}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function Accordion({
  items,
  defaultOpen = -1,
  icon = "plus",
  size = 16.5,
}: {
  items: { title: ReactNode; content: ReactNode }[];
  defaultOpen?: number;
  icon?: "plus" | "chevron";
  size?: number;
}) {
  const [open, setOpen] = useState<number>(defaultOpen);
  return (
    <div>
      {items.map((it, i) => (
        <div
          key={i}
          className={`acc ${icon === "chevron" ? "chevron" : ""} ${open === i ? "open" : ""}`}
        >
          <button
            className="acc-head"
            style={{ fontSize: size }}
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            {it.title}
            {icon === "plus" ? <Plus size={16} /> : <ChevronDown size={16} />}
          </button>
          {open === i && <div className="acc-body">{it.content}</div>}
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  width = 640,
  label,
  fullscreen,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  label?: string;
  fullscreen?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, [open]);
  if (!open) return null;
  // Portaled so a transformed/animated ancestor can't offset the fixed dialog.
  return createPortal(
    <>
      <div className="overlay" onClick={onClose} />
      <div
        ref={dialogRef}
        className={`modal ${fullscreen ? "full" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{ ["--w" as string]: `${width}px`, outline: "none" }}
      >
        <button
          className="icon-btn"
          aria-label="Close"
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 3 }}
        >
          <X size={17} />
        </button>
        {children}
      </div>
    </>,
    document.body,
  );
}

const ICONS = {
  paw: PawPrint,
  shield: ShieldCheck,
  blocks: Blocks,
  leaf: Leaf,
  waves: Waves,
  washing: WashingMachine,
};
export function ContentIcon({
  name,
  size = 19,
}: {
  name: keyof typeof ICONS;
  size?: number;
}) {
  const C = ICONS[name];
  return <C size={size} />;
}

export function TrustRow() {
  return (
    <div
      className="grid-auto"
      style={{
        ["--min" as string]: "150px",
        ["--gap" as string]: "14px",
        padding: "18px 0",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
        <Truck size={18} color="var(--accent)" />
        Free shipping, 2–5 days
      </div>
      <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
        <RotateCcw size={18} color="var(--accent)" />
        30-night home trial
      </div>
      <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
        <ShieldCheck size={18} color="var(--accent)" />
        10-year frame warranty
      </div>
    </div>
  );
}

export function CheckMark({ on }: { on: boolean }) {
  return on ? (
    <Check size={18} color="var(--accent)" style={{ margin: "0 auto" }} />
  ) : (
    <span className="muted">—</span>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; to?: string }[];
}) {
  return (
    <nav
      className="container row wrap muted"
      style={{ gap: 8, paddingTop: 26, fontSize: 13.5, letterSpacing: ".04em" }}
      aria-label="Breadcrumb"
    >
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 8 }}>
          {i > 0 && <span>/</span>}
          {it.to ? (
            <a href={`#${it.to}`} className="muted">
              {it.label}
            </a>
          ) : (
            <span style={{ color: "var(--ink)" }}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
