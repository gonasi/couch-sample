import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Camera, Check, ChevronLeft, ChevronRight, CircleHelp, MessageCircle, Phone, Search, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { REVIEW_STATS } from "../data/reviews";
import { DEEP_REVIEWS, FAQ_CATEGORIES, QUESTIONS, REVIEW_HIGHLIGHT, TOPICS, type Topic } from "../data/reviewsDeep";
import { useUI } from "../context/UIContext";
import { scrollToId } from "../pdp/shared";
import { Accordion, Img, Modal, Stars } from "./ui";
import { WriteReviewModal } from "./Sections";
import { Lightbox } from "./Overlays";

// Full reviews, customer Q&A and FAQ sections shared by every PDP variant.

const ago = (d: number) => {
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.round(d / 7)} week${Math.round(d / 7) > 1 ? "s" : ""} ago`;
  return `${Math.round(d / 30)} month${Math.round(d / 30) > 1 ? "s" : ""} ago`;
};

/* ================= Reviews ================= */
export function DeepReviews() {
  const { toast } = useUI();
  const [star, setStar] = useState<number | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [config, setConfig] = useState("all");
  const [page, setPage] = useState(1);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [writeOpen, setWriteOpen] = useState(false);
  const [photoIdx, setPhotoIdx] = useState<number | null>(null);
  const PAGE = 5;

  const allPhotos = useMemo(
    () => Array.from(new Set(DEEP_REVIEWS.flatMap((r) => r.photos))),
    [],
  );
  const configs = useMemo(
    () => Array.from(new Set(DEEP_REVIEWS.map((r) => r.config))),
    [],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = DEEP_REVIEWS.filter(
      (r) =>
        (star === null || r.rating === star) &&
        (!topic || r.topics.includes(topic)) &&
        (config === "all" || r.config === config) &&
        (!q ||
          `${r.title} ${r.body} ${r.name} ${r.location}`
            .toLowerCase()
            .includes(q)),
    );
    const s = [...l];
    if (sort === "recent") s.sort((a, b) => a.daysAgo - b.daysAgo);
    if (sort === "highest")
      s.sort((a, b) => b.rating - a.rating || a.daysAgo - b.daysAgo);
    if (sort === "lowest")
      s.sort((a, b) => a.rating - b.rating || a.daysAgo - b.daysAgo);
    if (sort === "helpful") s.sort((a, b) => b.helpful - a.helpful);
    if (sort === "photos")
      s.sort(
        (a, b) => b.photos.length - a.photos.length || a.daysAgo - b.daysAgo,
      );
    return s;
  }, [star, topic, query, sort, config]);

  useEffect(() => setPage(1), [star, topic, query, sort, config]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice((page - 1) * PAGE, page * PAGE);
  const filtersOn = star !== null || !!topic || !!query || config !== "all";
  const clear = () => {
    setStar(null);
    setTopic(null);
    setQuery("");
    setConfig("all");
  };
  const goPage = (p: number) => {
    setPage(p);
    scrollToId("review-list");
  };
  const vote = (id: string, v: "up" | "down") =>
    setVotes((vs) => ({
      ...vs,
      [id]: vs[id] === v ? (undefined as unknown as "up") : v,
    }));

  return (
    <section className="container section" id="reviews">
      <div
        className="row between wrap"
        style={{ gap: 16, marginBottom: 24, alignItems: "flex-end" }}
      >
        <div>
          <span className="eyebrow">Customer reviews</span>
          <h2 className="display h2" style={{ marginTop: 8 }}>
            5,250 reviews. 4.9 stars.
          </h2>
        </div>
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
          ["--min" as string]: "260px",
          ["--gap" as string]: "16px",
          alignItems: "stretch",
        }}
      >
        <div className="card card-pad">
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
            <span className="display" style={{ fontSize: 60, lineHeight: 1 }}>
              4.9
            </span>
            <div>
              <Stars size={18} />
              <div className="muted" style={{ fontSize: 13.5 }}>
                {REVIEW_STATS.total.toLocaleString()} verified reviews
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 18, fontSize: 15 }}>
            <BadgeCheck size={18} color="var(--accent)" />
            <span>
              <strong style={{ fontWeight: 600 }}>98%</strong> of reviewers
              recommend this product
            </span>
          </div>
        </div>

        <div className="card card-pad" style={{ display: "grid", gap: 7 }}>
          {REVIEW_STATS.distribution.map((d) => {
            const on = star === d.stars;
            return (
              <button
                key={d.stars}
                onClick={() => setStar(on ? null : d.stars)}
                className="row"
                style={{
                  gap: 10,
                  fontSize: 13.5,
                  background: on ? "var(--soft)" : "transparent",
                  border: 0,
                  borderRadius: 8,
                  padding: "4px 6px",
                  cursor: "pointer",
                  color: "var(--ink)",
                }}
                aria-pressed={on}
              >
                <span style={{ width: 34, textAlign: "left" }}>
                  {d.stars} ★
                </span>
                <span className="bar">
                  <span style={{ width: `${d.pct}%` }} />
                </span>
                <span
                  className="muted"
                  style={{ width: 48, textAlign: "right" }}
                >
                  {Math.round(
                    (d.pct / 100) * REVIEW_STATS.total,
                  ).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="card card-pad" style={{ display: "grid", gap: 12 }}>
          {[
            ["Comfort", 4.9],
            ["Quality", 4.9],
            ["Ease of assembly", 4.8],
            ["Value", 4.7],
          ].map(([label, v]) => (
            <div key={label as string}>
              <div
                className="row between"
                style={{ fontSize: 13.5, marginBottom: 4 }}
              >
                <span className="muted">{label}</span>
                <span>{v}</span>
              </div>
              <span className="bar" style={{ display: "block" }}>
                <span style={{ width: `${((v as number) / 5) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="row" style={{ gap: 8, fontSize: 14, marginBottom: 10 }}>
          <Camera size={16} /> Customer photos
        </div>
        <div
          className="row"
          style={{ gap: 10, overflowX: "auto", paddingBottom: 6 }}
        >
          {allPhotos.map((src, i) => (
            <button
              key={src}
              onClick={() => setPhotoIdx(i)}
              style={{
                padding: 0,
                border: 0,
                background: "none",
                cursor: "zoom-in",
                flex: "none",
              }}
              aria-label="View customer photo"
            >
              <Img
                src={src}
                alt="Customer photo"
                w={240}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: 20,
          padding: "20px 22px",
          background: "var(--soft)",
        }}
      >
        <div className="row" style={{ gap: 8, marginBottom: 8, fontSize: 14 }}>
          <Sparkles size={16} color="var(--accent)" />{" "}
          <strong style={{ fontWeight: 600 }}>Review highlights</strong>
          <span className="muted" style={{ fontSize: 12.5 }}>
            summarized from 5,250 reviews
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.65 }}>
          {REVIEW_HIGHLIGHT}
        </p>
        <div className="row wrap" style={{ gap: 8 }}>
          {TOPICS.map((tp) => (
            <button
              key={tp.key}
              className={`chip ${topic === tp.key ? "active" : ""}`}
              onClick={() => setTopic(topic === tp.key ? null : tp.key)}
              style={{
                background: topic === tp.key ? undefined : "var(--surface)",
              }}
            >
              {tp.label}{" "}
              <span style={{ opacity: 0.6 }}>
                ({tp.mentions.toLocaleString()})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        id="review-list"
        className="row wrap"
        style={{
          gap: 10,
          marginTop: 24,
          paddingBottom: 16,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <label
          className="row"
          style={{
            flex: "1 1 240px",
            gap: 8,
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "0 14px",
            background: "var(--surface)",
          }}
        >
          <Search size={16} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviews (e.g. “dog”, “assembly”)"
            aria-label="Search reviews"
            style={{
              flex: 1,
              border: 0,
              background: "transparent",
              padding: "12px 0",
              fontSize: 14.5,
              outline: "none",
              minWidth: 0,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{
                border: 0,
                background: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: 0,
                display: "flex",
              }}
            >
              <X size={15} />
            </button>
          )}
        </label>
        <select
          className="input input-pill"
          style={{ width: "auto", padding: "11px 14px", fontSize: 14 }}
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          aria-label="Filter by size"
        >
          <option value="all">All sizes</option>
          {configs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="input input-pill"
          style={{ width: "auto", padding: "11px 14px", fontSize: 14 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort reviews"
        >
          <option value="recent">Most recent</option>
          <option value="helpful">Most helpful</option>
          <option value="photos">With photos first</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      <div
        className="row between wrap"
        style={{ gap: 10, margin: "14px 0", fontSize: 14 }}
      >
        <span className="muted">
          {list.length === 0
            ? "No matching reviews"
            : `Showing ${(page - 1) * PAGE + 1}–${Math.min(page * PAGE, list.length)} of ${list.length} ${filtersOn ? "matching " : ""}reviews`}
          {star !== null && ` · ${star} stars`}
          {topic && ` · ${TOPICS.find((x) => x.key === topic)!.label}`}
        </span>
        {filtersOn && (
          <button className="text-btn" onClick={clear}>
            Clear all filters
          </button>
        )}
      </div>

      <div className="stack" style={{ ["--gap" as string]: "14px" }}>
        {shown.length === 0 && (
          <div className="card card-pad" style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 14px" }}>
              No reviews match those filters.
            </p>
            <button className="btn btn-outline btn-sm" onClick={clear}>
              Clear filters
            </button>
          </div>
        )}
        {shown.map((r) => (
          <article
            key={r.id}
            className="card"
            style={{ padding: 24, animation: "fadeUp .25s ease" }}
          >
            <div className="review-grid">
              <div className="stack" style={{ ["--gap" as string]: "8px" }}>
                <div className="row" style={{ gap: 10 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      background: "var(--soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flex: "none",
                    }}
                  >
                    {r.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div>
                    <div style={{ fontSize: 15.5 }}>{r.name}</div>
                    <div
                      className="row"
                      style={{ gap: 4, fontSize: 12.5, color: "var(--accent)" }}
                    >
                      <BadgeCheck size={13} /> Verified buyer
                    </div>
                  </div>
                </div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {r.location}
                </div>
                <div style={{ display: "grid", gap: 3, fontSize: 13 }}>
                  <span>
                    <span className="muted">Size:</span> {r.config}
                  </span>
                  <span>
                    <span className="muted">Color:</span> {r.color}
                  </span>
                </div>
                <div className="row wrap" style={{ gap: 5 }}>
                  {r.household.map((h) => (
                    <span
                      key={h}
                      className="pill pill-soft"
                      style={{ fontSize: 10, padding: "4px 8px" }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="row between wrap" style={{ gap: 8 }}>
                  <Stars rating={r.rating} />
                  <span className="muted" style={{ fontSize: 13 }}>
                    {ago(r.daysAgo)}
                  </span>
                </div>
                <h4
                  className="display"
                  style={{ fontSize: 19, margin: "10px 0 8px" }}
                >
                  {r.title}
                </h4>
                <p
                  className="muted"
                  style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7 }}
                >
                  {r.body}
                </p>
                {r.photos.length > 0 && (
                  <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
                    {r.photos.map((src) => (
                      <button
                        key={src}
                        onClick={() => setPhotoIdx(allPhotos.indexOf(src))}
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
                          w={220}
                          style={{
                            width: 84,
                            height: 84,
                            borderRadius: 10,
                            border: "1px solid var(--line)",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                <div
                  className="row"
                  style={{ gap: 6, fontSize: 13.5, marginTop: 12 }}
                >
                  {r.recommend ? (
                    <>
                      <Check size={15} color="var(--accent)" /> Yes, I recommend
                      this product
                    </>
                  ) : (
                    <span className="muted">Would not recommend</span>
                  )}
                </div>
                {r.response && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "14px 16px",
                      background: "var(--soft)",
                      borderRadius: 12,
                      borderLeft: "3px solid var(--accent)",
                      fontSize: 14.5,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ fontWeight: 600 }}>
                      Response from GH2
                    </strong>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {r.response}
                    </div>
                  </div>
                )}
                <div
                  className="row wrap"
                  style={{ gap: 8, marginTop: 14, fontSize: 13 }}
                >
                  <span className="muted">Was this helpful?</span>
                  <button
                    className={`chip row ${votes[r.id] === "up" ? "active" : ""}`}
                    style={{ gap: 5, padding: "5px 11px" }}
                    onClick={() => vote(r.id, "up")}
                  >
                    <ThumbsUp size={13} />{" "}
                    {r.helpful + (votes[r.id] === "up" ? 1 : 0)}
                  </button>
                  <button
                    className={`chip row ${votes[r.id] === "down" ? "active" : ""}`}
                    style={{ gap: 5, padding: "5px 11px" }}
                    onClick={() => vote(r.id, "down")}
                  >
                    <ThumbsDown size={13} />{" "}
                    {r.unhelpful + (votes[r.id] === "down" ? 1 : 0)}
                  </button>
                  <button
                    className="text-btn"
                    style={{ fontSize: 12.5 }}
                    onClick={() =>
                      toast("Thanks — our team will review this report.")
                    }
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pages > 1 && (
        <div
          className="row"
          style={{ gap: 6, justifyContent: "center", marginTop: 24 }}
        >
          <button
            className="icon-btn"
            disabled={page === 1}
            onClick={() => goPage(page - 1)}
            aria-label="Previous page"
            style={{ opacity: page === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goPage(i + 1)}
              className="icon-btn"
              aria-current={page === i + 1}
              style={
                page === i + 1
                  ? {
                      background: "var(--ink)",
                      color: "var(--bg)",
                      borderColor: "var(--ink)",
                    }
                  : undefined
              }
            >
              {i + 1}
            </button>
          ))}
          <button
            className="icon-btn"
            disabled={page === pages}
            onClick={() => goPage(page + 1)}
            aria-label="Next page"
            style={{ opacity: page === pages ? 0.4 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Lightbox
        images={allPhotos}
        index={photoIdx}
        onClose={() => setPhotoIdx(null)}
        onIndex={setPhotoIdx}
      />
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

/* ================= Q&A ================= */
export function QandA() {
  const { toast } = useUI();
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(4);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");

  const list = QUESTIONS.filter(
    (x) =>
      !query ||
      `${x.q} ${x.answers.map((a) => a.text).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 10) {
      toast("Please write a question of at least 10 characters.", "error");
      return;
    }
    toast("Question submitted — we usually answer within 24 hours.", "success");
    setOpen(false);
    setQuestion("");
    setName("");
  };

  return (
    <section className="container-narrow section" id="questions">
      <div
        className="row between wrap"
        style={{ gap: 16, marginBottom: 20, alignItems: "flex-end" }}
      >
        <div>
          <span className="eyebrow">Customer questions</span>
          <h2 className="display h2" style={{ marginTop: 8 }}>
            {QUESTIONS.length * 34} questions answered
          </h2>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setOpen(true)}
        >
          <CircleHelp size={15} /> Ask a question
        </button>
      </div>
      <label
        className="row"
        style={{
          gap: 8,
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "0 14px",
          background: "var(--surface)",
          marginBottom: 16,
        }}
      >
        <Search size={16} color="var(--muted)" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(4);
          }}
          placeholder="Have a question? Search for answers"
          aria-label="Search questions"
          style={{
            flex: 1,
            border: 0,
            background: "transparent",
            padding: "12px 0",
            fontSize: 14.5,
            outline: "none",
          }}
        />
      </label>

      <div className="stack" style={{ ["--gap" as string]: "12px" }}>
        {list.length === 0 && (
          <div className="card card-pad" style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 12px" }}>No answers yet for “{query}”.</p>
            <button
              className="btn btn-sm"
              onClick={() => {
                setQuestion(query);
                setOpen(true);
              }}
            >
              Ask this question
            </button>
          </div>
        )}
        {list.slice(0, shown).map((x) => (
          <div key={x.id} className="card" style={{ padding: 20 }}>
            <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
              <button
                onClick={() => setVoted((v) => ({ ...v, [x.id]: !v[x.id] }))}
                aria-label="Upvote question"
                style={{
                  flex: "none",
                  width: 46,
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  background: voted[x.id] ? "var(--soft)" : "transparent",
                  cursor: "pointer",
                  padding: "6px 0",
                  color: "var(--ink)",
                  fontSize: 13,
                }}
              >
                ▲<div>{x.votes + (voted[x.id] ? 1 : 0)}</div>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16.5, fontWeight: 500 }}>Q: {x.q}</div>
                <div
                  className="muted"
                  style={{ fontSize: 12.5, margin: "2px 0 10px" }}
                >
                  Asked by {x.asker} · {ago(x.daysAgo)}
                </div>
                {x.answers.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 0 0",
                      borderTop: i ? "1px solid var(--line)" : 0,
                      marginTop: i ? 10 : 0,
                    }}
                  >
                    <div style={{ fontSize: 15, lineHeight: 1.6 }}>
                      <strong style={{ fontWeight: 600 }}>A:</strong> {a.text}
                    </div>
                    <div
                      className="row"
                      style={{
                        gap: 5,
                        fontSize: 12.5,
                        marginTop: 4,
                        color:
                          a.role === "GH2 Team"
                            ? "var(--accent)"
                            : "var(--muted)",
                      }}
                    >
                      <BadgeCheck size={13} /> {a.by} · {a.role} ·{" "}
                      {ago(a.daysAgo)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {shown < list.length && (
        <button
          className="btn btn-outline"
          style={{ marginTop: 16 }}
          onClick={() => setShown((s) => s + 4)}
        >
          Show more questions
        </button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        width={520}
        label="Ask a question"
      >
        <form onSubmit={submit} className="stack" style={{ padding: 28 }}>
          <h3 className="display" style={{ fontSize: 26 }}>
            Ask a question
          </h3>
          <p className="muted" style={{ margin: 0, fontSize: 14.5 }}>
            Our team and verified owners typically answer within 24 hours.
          </p>
          <label className="field">
            Your question
            <textarea
              className="input"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Will the 6 piece fit a 12 ft wall?"
            />
          </label>
          <label className="field">
            Name (optional)
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button className="btn" type="submit">
            Submit question
          </button>
        </form>
      </Modal>
    </section>
  );
}

/* ================= FAQ ================= */
export function FaqTabs() {
  const { toast } = useUI();
  const [cat, setCat] = useState(FAQ_CATEGORIES[0].key);
  const current = FAQ_CATEGORIES.find((c) => c.key === cat)!;
  return (
    <section className="container-narrow section" id="faq">
      <span className="eyebrow">FAQ</span>
      <h2 className="display h2" style={{ margin: "8px 0 20px" }}>
        Frequently asked questions
      </h2>
      <div className="row wrap" style={{ gap: 8, marginBottom: 12 }}>
        {FAQ_CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`chip ${cat === c.key ? "active" : ""}`}
            onClick={() => setCat(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div key={cat} style={{ borderTop: "1px solid var(--line)" }}>
        <Accordion
          defaultOpen={0}
          items={current.items.map((f) => ({ title: f.q, content: f.a }))}
        />
      </div>
      <div
        className="card row wrap between"
        style={{ marginTop: 24, padding: "18px 20px", gap: 12 }}
      >
        <div>
          <div className="display" style={{ fontSize: 20 }}>
            Still have questions?
          </div>
          <div className="muted" style={{ fontSize: 14 }}>
            Real people, 24/7. Average reply under 2 minutes.
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <Link to="/support/contact" className="btn btn-sm">
            <MessageCircle size={14} /> Message us
          </Link>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => toast("Call +1 (833) 442-7632 — open 24/7")}
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </section>
  );
}
