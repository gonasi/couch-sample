import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Camera, Play, ThumbsUp } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { COMPARISON, PDP_FEATURES } from "../data/content";
import { REVIEW_PHOTOS, UGC } from "../data/images";
import { ACCESSORIES, getProduct } from "../data/products";
import { REVIEWS, REVIEW_STATS, type ReviewTag } from "../data/reviews";
import { priceLabel } from "../lib/money";
import { CheckMark, ContentIcon, Img, Modal, Stars } from "./ui";

/* ---------- Reviews (card style, from PDP Option A / site canvas) ---------- */
const FILTERS: { key: "all" | ReviewTag; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photos", label: "With photos" },
  { key: "pets", label: "Pet owners" },
  { key: "small", label: "Small spaces" },
  { key: "recent", label: "Most recent" },
];

export function RatingSummary({ compact }: { compact?: boolean }) {
  return (
    <div className="card card-pad">
      <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
        <span className="display" style={{ fontSize: 52, lineHeight: 1 }}>
          {REVIEW_STATS.average}
        </span>
        <Stars />
      </div>
      <p className="muted" style={{ fontSize: 14.5, margin: "8px 0 20px" }}>
        Based on {REVIEW_STATS.total.toLocaleString()} verified purchases
      </p>
      <div style={{ display: "grid", gap: 9, fontSize: 13.5 }}>
        {REVIEW_STATS.distribution.map((d) => (
          <div key={d.stars} className="row" style={{ gap: 10 }}>
            <span className="muted" style={{ width: 30 }}>
              {d.stars}★
            </span>
            <span className="bar">
              <span style={{ width: `${d.pct}%` }} />
            </span>
            <span className="muted" style={{ width: 40, textAlign: "right" }}>
              {d.pct}%
            </span>
          </div>
        ))}
      </div>
      {!compact && (
        <div
          style={{
            display: "grid",
            gap: 8,
            marginTop: 22,
            paddingTop: 20,
            borderTop: "1px solid var(--line)",
            fontSize: 14,
          }}
          className="muted"
        >
          {REVIEW_STATS.subRatings.map((s) => (
            <div key={s.label} className="row between">
              <span>{s.label}</span>
              <span style={{ color: "var(--ink)" }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewsSection({
  title = "Reviews",
  id = "reviews",
}: {
  title?: string;
  id?: string;
}) {
  const { toast } = useUI();
  const [filter, setFilter] = useState<"all" | ReviewTag>("all");
  const [shown, setShown] = useState(4);
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const [writeOpen, setWriteOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const list = useMemo(() => {
    const l =
      filter === "all"
        ? REVIEWS
        : REVIEWS.filter((r) => r.tags.includes(filter));
    return filter === "recent"
      ? [...l].sort((a, b) => a.daysAgo - b.daysAgo)
      : l;
  }, [filter]);

  return (
    <section className="container section" id={id}>
      <div className="row between wrap" style={{ marginBottom: 28, gap: 16 }}>
        <h2 className="display h2">{title}</h2>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setWriteOpen(true)}
        >
          Write a review
        </button>
      </div>
      <div
        className="grid-auto"
        style={{
          ["--min" as string]: "280px",
          ["--gap" as string]: "36px",
          alignItems: "start",
        }}
      >
        <RatingSummary />
        <div
          className="span-2"
          style={{
            gridColumn: "span 2",
            minWidth: 0,
            display: "grid",
            gap: 16,
          }}
        >
          <div className="row wrap" style={{ gap: 8 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? "active" : ""}`}
                onClick={() => {
                  setFilter(f.key);
                  setShown(4);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {list.slice(0, shown).map((r, idx) => (
            <article
              key={r.id}
              className="card"
              style={{ padding: 22, animation: "fadeUp .3s ease" }}
            >
              <div className="row between wrap" style={{ gap: 16 }}>
                <div className="row" style={{ gap: 12 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      background: "var(--soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    {r.initials}
                  </span>
                  <div>
                    <div style={{ fontSize: 15.5 }}>{r.name}</div>
                    <div className="muted row" style={{ fontSize: 13, gap: 6 }}>
                      <BadgeCheck size={13} />
                      Verified buyer · {r.location}
                    </div>
                  </div>
                </div>
                <Stars rating={r.rating} />
              </div>
              <h5
                className="display"
                style={{ fontSize: 18, margin: "16px 0 8px" }}
              >
                {r.title}
              </h5>
              <p
                className="muted"
                style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65 }}
              >
                {r.body}
              </p>
              {r.photos > 0 && (
                <div className="row" style={{ gap: 10, marginTop: 14 }}>
                  {Array.from({ length: r.photos }).map((_, i) => {
                    const src = REVIEW_PHOTOS[(idx + i) % REVIEW_PHOTOS.length];
                    return (
                      <button
                        key={i}
                        onClick={() => setPhoto(src)}
                        style={{
                          padding: 0,
                          border: 0,
                          background: "none",
                          cursor: "zoom-in",
                        }}
                        aria-label="View review photo"
                      >
                        <Img
                          src={src}
                          alt="Customer photo"
                          w={200}
                          style={{
                            width: 74,
                            height: 74,
                            borderRadius: 10,
                            border: "1px solid var(--line)",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
              <div
                className="row between wrap"
                style={{ marginTop: 14, gap: 10 }}
              >
                <span className="muted" style={{ fontSize: 13 }}>
                  {r.color} · {r.config} · {r.when}
                </span>
                <button
                  className="chip row"
                  style={{
                    gap: 6,
                    padding: "6px 12px",
                    ...(helpful[r.id] ? { background: "var(--soft)" } : {}),
                  }}
                  onClick={() =>
                    setHelpful((h) => ({ ...h, [r.id]: !h[r.id] }))
                  }
                >
                  <ThumbsUp size={13} /> Helpful (
                  {r.helpful + (helpful[r.id] ? 1 : 0)})
                </button>
              </div>
            </article>
          ))}
          {shown < list.length ? (
            <button
              className="btn btn-outline"
              style={{
                justifySelf: "start",
                padding: "14px 26px",
                fontSize: 13.5,
              }}
              onClick={() => setShown((s) => s + 4)}
            >
              Load more reviews
            </button>
          ) : (
            <p className="muted" style={{ fontSize: 14 }}>
              Showing {list.length} of{" "}
              {filter === "all"
                ? REVIEW_STATS.total.toLocaleString()
                : list.length}{" "}
              reviews.
            </p>
          )}
        </div>
      </div>
      <Modal
        open={!!photo}
        onClose={() => setPhoto(null)}
        width={720}
        label="Customer photo"
      >
        {photo && <Img src={photo} alt="Customer photo" w={1400} ratio="4/3" />}
      </Modal>
      <WriteReviewModal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        onDone={() => {
          setWriteOpen(false);
          toast("Thanks! Your review is pending moderation.", "success");
        }}
      />
    </section>
  );
}

function WriteReviewModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || body.trim().length < 10) {
      setError("Add a title and at least a sentence about your couch.");
      return;
    }
    setError("");
    setTitle("");
    setBody("");
    onDone();
  };
  return (
    <Modal open={open} onClose={onClose} width={520} label="Write a review">
      <form onSubmit={submit} style={{ padding: 28 }} className="stack">
        <h3 className="display" style={{ fontSize: 26 }}>
          Write a review
        </h3>
        <div className="row" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              style={{
                border: 0,
                background: "none",
                cursor: "pointer",
                fontSize: 28,
                color: "var(--accent)",
                padding: 0,
              }}
            >
              {n <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
        <label className="field">
          Title
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum it up"
          />
        </label>
        <label className="field">
          Review
          <textarea
            className="input"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="How has your Cloud been?"
          />
        </label>
        {error && (
          <span style={{ color: "#c0392b", fontSize: 13.5 }}>{error}</span>
        )}
        <button className="btn" type="submit">
          Submit review
        </button>
      </form>
    </Modal>
  );
}

/* ---------- Pairs well with ---------- */
export function PairsWellWith({
  title = "Pairs well with",
}: {
  title?: string;
}) {
  const cart = useCart();
  return (
    <section className="container section">
      <div
        className="row between"
        style={{ alignItems: "flex-end", gap: 20, marginBottom: 24 }}
      >
        <h2 className="display" style={{ fontSize: "clamp(26px,3.2vw,38px)" }}>
          {title}
        </h2>
        <Link to="/shop" className="link-underline">
          Shop all
        </Link>
      </div>
      <div
        className="grid-auto"
        style={{ ["--min" as string]: "220px", ["--gap" as string]: "20px" }}
      >
        {ACCESSORIES.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Link to={`/product/${p.slug}`}>
              <Img
                src={p.images[0]}
                alt={p.name}
                w={600}
                ratio="4/3"
                className="zoom-hover"
              />
            </Link>
            <div className="row between" style={{ padding: 16, gap: 10 }}>
              <Link to={`/product/${p.slug}`}>
                <div style={{ fontSize: 16 }}>{p.name}</div>
                <div className="muted" style={{ fontSize: 14.5 }}>
                  {priceLabel(p.price)}
                </div>
              </Link>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => cart.add(p)}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Feature cards ---------- */
export function FeatureCards() {
  return (
    <section className="container section">
      <div
        className="grid-auto"
        style={{ ["--min" as string]: "260px", ["--gap" as string]: "28px" }}
      >
        {PDP_FEATURES.map((f) => (
          <div key={f.title} className="card card-pad">
            <span className="accent">
              <ContentIcon name={f.icon} size={22} />
            </span>
            <h4
              className="display"
              style={{ fontSize: 21, margin: "14px 0 8px" }}
            >
              {f.title}
            </h4>
            <p
              className="muted"
              style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}
            >
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Comparison table ---------- */
export function ComparisonTable({
  title = "Why Customers Love the GH2 Cloud Couch",
}: {
  title?: string;
}) {
  return (
    <section
      style={{ maxWidth: 1000, margin: "96px auto 0", padding: "0 24px" }}
    >
      <h2
        className="display"
        style={{
          fontSize: "clamp(28px,3.8vw,46px)",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        {title}
      </h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          className="cmp-row"
          style={{ padding: "18px 20px", background: "var(--soft)" }}
        >
          <span />
          {COMPARISON.columns.map((c, i) => (
            <strong
              key={c}
              className={i === 0 ? "display" : "muted"}
              style={
                {
                  textAlign: "center",
                  fontSize: i === 0 ? 17 : 15,
                  fontWeight: i === 0 ? "var(--dweight)" : 500,
                } as React.CSSProperties
              }
            >
              {c}
            </strong>
          ))}
        </div>
        {COMPARISON.rows.map((r) => (
          <div key={r.label} className="cmp-row">
            <span style={{ fontSize: 16 }}>{r.label}</span>
            {r.values.map((v, i) => (
              <span
                key={i}
                style={{ textAlign: "center", opacity: i === 0 ? 1 : 0.7 }}
              >
                <CheckMark on={v} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- UGC strip ---------- */
export function UgcStrip({
  title = "Real Homes. Real Comfort.",
  subtitle = "See how customers are transforming their spaces with GH2.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const item = open !== null ? UGC[open] : null;
  const product = item ? getProduct(item.product) : undefined;
  return (
    <section className="container section">
      <h2
        className="display"
        style={{ fontSize: "clamp(30px,4vw,50px)", marginBottom: 8 }}
      >
        {title}
      </h2>
      <p className="muted" style={{ fontSize: 17, margin: "0 0 28px" }}>
        {subtitle}
      </p>
      <div className="scroll-x">
        {UGC.map((u, i) => (
          <button
            key={u.handle}
            onClick={() => setOpen(i)}
            style={{
              padding: 0,
              border: 0,
              background: "none",
              cursor: "pointer",
              position: "relative",
              textAlign: "left",
            }}
            aria-label={`Play clip from ${u.handle}`}
          >
            <Img
              src={u.image}
              alt={u.caption}
              w={500}
              ratio="9/16"
              radius="var(--radius)"
              style={{ border: "1px solid var(--line)" }}
              className="zoom-hover"
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "var(--radius)",
                background:
                  "linear-gradient(180deg,transparent 55%,rgba(0,0,0,.55))",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 34,
                height: 34,
                borderRadius: 99,
                background: "rgba(255,255,255,.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#111",
              }}
            >
              <Play size={14} fill="#111" />
            </span>
            <span
              style={{
                position: "absolute",
                left: 14,
                bottom: 14,
                right: 14,
                color: "#fff",
                fontSize: 13.5,
              }}
            >
              <strong style={{ display: "block", fontWeight: 600 }}>
                {u.handle}
              </strong>
              {u.caption}
            </span>
          </button>
        ))}
      </div>
      <Modal
        open={!!item}
        onClose={() => setOpen(null)}
        width={760}
        label="Customer clip"
      >
        {item && (
          <div
            className="grid-auto"
            style={{ ["--min" as string]: "260px", ["--gap" as string]: "0" }}
          >
            <div style={{ position: "relative", background: "#111" }}>
              <Img src={item.image} alt={item.caption} w={900} ratio="9/14" />
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 16,
                  height: 3,
                  background: "rgba(255,255,255,.3)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    background: "#fff",
                    transformOrigin: "left",
                    animation: "ugcProgress 8s linear infinite",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span className="row muted" style={{ gap: 6, fontSize: 13 }}>
                <Camera size={14} /> {item.handle}
              </span>
              <h3 className="display" style={{ fontSize: 26 }}>
                “{item.caption}”
              </h3>
              <Stars />
              {product && (
                <div
                  className="card row"
                  style={{ gap: 12, padding: 12, marginTop: "auto" }}
                >
                  <Img
                    src={product.images[0]}
                    alt={product.name}
                    w={200}
                    style={{
                      width: 64,
                      height: 56,
                      borderRadius: 10,
                      flex: "none",
                    }}
                  />
                  <div style={{ flex: 1, fontSize: 14.5 }}>
                    <div>{product.name}</div>
                    <div className="muted">{priceLabel(product.price)}</div>
                  </div>
                </div>
              )}
              {product && (
                <Link
                  to={`/product/${product.slug}`}
                  className="btn"
                  onClick={() => setOpen(null)}
                >
                  Shop this look
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
