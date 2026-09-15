import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  Baby,
  BedDouble,
  Check,
  CornerDownRight,
  Film,
  Heart,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  Maximize2,
  Moon,
  PawPrint,
  RotateCcw,
  Sofa,
  Sparkles,
  User,
  Users,
  UsersRound,
  Wine,
  type LucideIcon,
} from "lucide-react";
import {
  colorHex,
  getProduct,
  type ColorName,
  type Product,
} from "../data/products";
import { IMG } from "../data/images";
import {
  QUIZ,
  decodeAnswers,
  encodeAnswers,
  reasonsFor,
  recommend,
  type QuizIcon,
} from "../data/quiz";
import { useProductSelection } from "../hooks/useProductSelection";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { useCart } from "../context/CartContext";
import { money, moneyShort } from "../lib/money";
import LayoutDiagram, { dimsFromLayout } from "../components/LayoutDiagram";
import { FinancingCalculator, SaveShare } from "../components/Interactive";
import {
  Breadcrumbs,
  Img,
  QtyStepper,
  Stars,
  Swatches,
  TrustRow,
} from "../components/ui";
import { FeatureCards } from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import BuyBoxCompact from "./BuyBoxCompact";

const ICONS: Record<QuizIcon, LucideIcon> = {
  home: Home,
  sofa: Sofa,
  open: Maximize2,
  corner: CornerDownRight,
  one: User,
  few: Users,
  many: UsersRound,
  film: Film,
  armchair: Armchair,
  bed: BedDouble,
  wine: Wine,
  moon: Moon,
  sparkle: Sparkles,
  paw: PawPrint,
  baby: Baby,
  heart: Heart,
};

type Phase = "intro" | "quiz" | "results" | "skip";

/** PDP Option G — Style Quiz: five questions pick the size and color, then a results page. */
export default function PdpG({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const [params, setParams] = useSearchParams();
  const initial = decodeAnswers(params.get("q"));
  const [phase, setPhase] = useState<Phase>(initial ? "results" : "intro");
  const [answers, setAnswers] = useState<number[]>(initial ?? []);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const timer = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Keep results in sync if someone lands on (or navigates to) a ?q= link.
  const q = params.get("q");
  useEffect(() => {
    const a = decodeAnswers(q);
    if (a && encodeAnswers(a) !== encodeAnswers(answers)) {
      setAnswers(a);
      setPhase("results");
    }
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTop = () =>
    topRef.current &&
    window.scrollTo({
      top: Math.max(
        0,
        topRef.current.getBoundingClientRect().top + window.scrollY - 100,
      ),
      behavior: reduced ? "auto" : "smooth",
    });

  const finish = (a: number[]) => {
    const rec = recommend(a);
    sel.setColor(rec.color);
    setEditing(false);
    setPhase("results");
    const code = encodeAnswers(a);
    if (rec.product.slug !== product.slug)
      sel.pickConfig(rec.product.slug, { params: { q: code } });
    else {
      setParams({ v: "g", q: code }, { replace: true });
      scrollTop();
    }
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const next = [...answers];
    next[step] = i;
    setAnswers(next);
    timer.current = window.setTimeout(
      () => {
        setPicked(null);
        const complete =
          next.length === QUIZ.length && next.every((x) => x !== undefined);
        if (editing && complete) finish(next);
        else if (step + 1 < QUIZ.length) setStep(step + 1);
        else finish(next);
      },
      reduced ? 60 : 380,
    );
  };

  const back = () => {
    if (step === 0) setPhase("intro");
    else setStep(step - 1);
  };

  useEffect(() => {
    if (phase !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.("input, select, textarea"))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        e.preventDefault();
        pick(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const start = () => {
    setAnswers([]);
    setStep(0);
    setEditing(false);
    setPhase("quiz");
    setParams({ v: "g" }, { replace: true });
  };

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: "Find your Cloud" },
        ]}
      />
      <div ref={topRef} />

      {phase === "intro" && (
        <Intro onStart={start} onSkip={() => setPhase("skip")} />
      )}

      {phase === "quiz" && (
        <section className="container" style={{ paddingTop: 22 }}>
          <div
            className="card"
            style={{
              maxWidth: 920,
              margin: "0 auto",
              padding: "26px clamp(18px,4vw,40px) 34px",
            }}
          >
            <div className="row between" style={{ gap: 12, marginBottom: 12 }}>
              <button
                className="text-btn row"
                style={{ gap: 5 }}
                onClick={back}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <span
                className="muted"
                style={{ fontSize: 13.5 }}
                aria-live="polite"
              >
                Question {step + 1} of {QUIZ.length}
              </span>
            </div>
            <div className="bar" style={{ height: 6 }} aria-hidden>
              <span
                style={{
                  width: `${((step + (picked !== null ? 1 : 0)) / QUIZ.length) * 100}%`,
                  transition: "width .35s ease",
                }}
              />
            </div>
            <div key={step} style={{ animation: "fadeUp .3s ease" }}>
              <h1 className="display h2" style={{ margin: "26px 0 6px" }}>
                {QUIZ[step].title}
              </h1>
              <p className="muted" style={{ margin: "0 0 22px", fontSize: 16 }}>
                {QUIZ[step].subtitle}
              </p>
              <div
                role="radiogroup"
                aria-label={QUIZ[step].title}
                className="grid-auto"
                style={{
                  ["--min" as string]: QUIZ[step].options[0].image
                    ? "190px"
                    : "220px",
                  ["--gap" as string]: "12px",
                }}
              >
                {QUIZ[step].options.map((o, i) => {
                  const on =
                    picked === i || (picked === null && answers[step] === i);
                  const Icon = o.icon ? ICONS[o.icon] : null;
                  return (
                    <button
                      key={o.label}
                      role="radio"
                      aria-checked={on}
                      onClick={() => pick(i)}
                      style={{
                        position: "relative",
                        textAlign: "left",
                        padding: o.image ? 0 : "18px 18px 16px",
                        borderRadius: 16,
                        overflow: "hidden",
                        border: on
                          ? "2px solid var(--accent)"
                          : "1px solid var(--line)",
                        background: on
                          ? "color-mix(in srgb, var(--accent) 7%, var(--surface))"
                          : "var(--surface)",
                        color: "var(--ink)",
                        cursor: "pointer",
                        transform: picked === i ? "scale(.98)" : undefined,
                        transition:
                          "transform .15s, border-color .15s, background .15s",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      {o.image && (
                        <Img src={o.image} alt="" w={500} ratio="4/3" />
                      )}
                      <div
                        style={{
                          padding: o.image ? "0 14px 14px" : 0,
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        {Icon && (
                          <span
                            className="icon-tile"
                            style={{ width: 40, height: 40 }}
                          >
                            <Icon size={19} />
                          </span>
                        )}
                        <span style={{ fontSize: 17, fontWeight: 600 }}>
                          {o.label}
                        </span>
                        <span className="muted" style={{ fontSize: 14 }}>
                          {o.sub}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 24,
                          height: 24,
                          borderRadius: 99,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontFamily: "var(--mono)",
                          background: on ? "var(--accent)" : "var(--soft)",
                          color: on ? "var(--accentInk)" : "var(--muted)",
                          animation: picked === i ? "pop .3s ease" : undefined,
                        }}
                      >
                        {on ? <Check size={13} /> : i + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p
                className="muted desktop-only"
                style={{ margin: "18px 0 0", fontSize: 13, display: "block" }}
              >
                Tip: press 1–4 to answer.
              </p>
            </div>
          </div>
        </section>
      )}

      {phase === "results" && answers.length === QUIZ.length && (
        <Results
          product={product}
          sel={sel}
          answers={answers}
          onRetake={start}
          onEdit={(i) => {
            setStep(i);
            setEditing(true);
            setPhase("quiz");
          }}
        />
      )}

      {phase === "skip" && (
        <section className="container" style={{ paddingTop: 22 }}>
          <div
            className="grid-auto"
            style={{
              ["--min" as string]: "330px",
              ["--gap" as string]: "44px",
              alignItems: "start",
            }}
          >
            <Img
              src={sel.images[0]}
              alt={`${product.name} in ${sel.color}`}
              w={1400}
              ratio="4/3"
              radius="var(--radius)"
              eager
            />
            <div className="stack" style={{ ["--gap" as string]: "16px" }}>
              <BuyBoxCompact product={product} sel={sel} />
              <button
                className="card row between"
                onClick={start}
                style={{
                  padding: "14px 16px",
                  cursor: "pointer",
                  color: "var(--ink)",
                  textAlign: "left",
                }}
              >
                <span className="row" style={{ gap: 10 }}>
                  <Sparkles size={17} color="var(--accent)" /> Not sure about
                  the size? Take the 60-second quiz.
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="container" style={{ marginTop: 44 }}>
        <TrustRow />
      </div>
      <FeatureCards />
      <DeepReviews />
      <QandA />
      <FaqTabs />
    </div>
  );
}

function Intro({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <section className="container" style={{ paddingTop: 22 }}>
      <div
        className="card grid-auto"
        style={{
          ["--min" as string]: "320px",
          ["--gap" as string]: "0",
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            padding: "clamp(28px,5vw,56px)",
            display: "grid",
            alignContent: "center",
            gap: 18,
          }}
        >
          <span className="eyebrow">Find your Cloud</span>
          <h1 className="display h1" style={{ margin: 0 }}>
            Your perfect couch in 60 seconds
          </h1>
          <p className="muted lead" style={{ margin: 0 }}>
            Five quick questions about your room and your people. We’ll match
            the size and color, and tell you why.
          </p>
          <div className="row wrap" style={{ gap: 10, marginTop: 6 }}>
            <button
              className="btn"
              onClick={onStart}
              style={{ padding: "16px 28px" }}
              autoFocus
            >
              Start the quiz <ArrowRight size={15} />
            </button>
            <button className="btn btn-ghost" onClick={onSkip}>
              Skip, show me the couch
            </button>
          </div>
          <div className="row wrap muted" style={{ gap: 16, fontSize: 13.5 }}>
            <span className="row" style={{ gap: 6 }}>
              <Check size={14} color="var(--accent)" /> 5 questions
            </span>
            <span className="row" style={{ gap: 6 }}>
              <Check size={14} color="var(--accent)" /> No email needed
            </span>
            <span className="row" style={{ gap: 6 }}>
              <Check size={14} color="var(--accent)" /> 30-night trial on every
              match
            </span>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            padding: 6,
            minHeight: 320,
          }}
        >
          <Img
            src={IMG.whiteLiving}
            alt=""
            w={700}
            style={{ gridRow: "span 2", height: "100%" }}
            radius="calc(var(--radius) - 6px)"
          />
          <Img
            src={IMG.darkSectional}
            alt=""
            w={500}
            style={{ height: "100%" }}
            radius="calc(var(--radius) - 6px)"
          />
          <Img
            src={IMG.beigeSectional}
            alt=""
            w={500}
            style={{ height: "100%" }}
            radius="calc(var(--radius) - 6px)"
          />
        </div>
      </div>
    </section>
  );
}

function MatchRing({ value, size = 84 }: { value: number; size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flex: "none" }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--soft)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </svg>
      <span
        className="display"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size / 4.6,
          whiteSpace: "nowrap",
        }}
      >
        {value}%
      </span>
    </div>
  );
}

function Results({
  product,
  sel,
  answers,
  onRetake,
  onEdit,
}: {
  product: Product;
  sel: ReturnType<typeof useProductSelection>;
  answers: number[];
  onRetake: () => void;
  onEdit: (i: number) => void;
}) {
  const cart = useCart();
  const rec = useMemo(() => recommend(answers), [answers]);
  const [view, setView] = useState<"photo" | "layout">("photo");
  const [qty, setQty] = useState(1);
  const code = encodeAnswers(answers);

  // Show whichever of the two picks is in the URL; otherwise the top match.
  const shown =
    product.slug === rec.alt.slug
      ? rec.alt
      : product.slug === rec.product.slug
        ? product
        : rec.product;
  const other = shown.slug === rec.product.slug ? rec.alt : rec.product;
  const isTop = shown.slug === rec.product.slug;
  const pct = isTop ? rec.match : rec.altMatch;
  const hex = colorHex(sel.color);
  const dims = dimsFromLayout(shown.layout!);
  const photo = shown.colorImages?.[sel.color as ColorName] ?? shown.images[0];

  const sectionRef = useRef<HTMLElement>(null);
  const choose = (p: Product) => {
    const target = getProduct(p.slug)!;
    sel.pickConfig(target.slug, { keepScroll: true, params: { q: code } });
    // The switch card sits low on phones; bring the new headline back into view.
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0)
      window.scrollTo({ top: top + window.scrollY - 90, behavior: "smooth" });
  };

  const header = (
    <div className="row" style={{ gap: 16 }}>
      <MatchRing value={pct} />
      <div>
        <span className="eyebrow">
          {isTop ? "Your best match" : "Also a great fit"}
        </span>
        <h1 className="display h1" style={{ margin: "6px 0 4px" }}>
          {shown.name}
        </h1>
        <div className="row" style={{ gap: 8, fontSize: 14 }}>
          <Stars size={14} /> 4.9{" "}
          <span className="muted">· in {sel.color}</span>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="container"
      style={{ paddingTop: 22, animation: "fadeUp .35s ease" }}
    >
      {/* On phones the match headline leads, above the photo. */}
      <div className="g-head-mobile" style={{ marginBottom: 18 }}>
        {header}
      </div>
      <div
        className="grid-auto"
        style={{
          ["--min" as string]: "330px",
          ["--gap" as string]: "44px",
          alignItems: "start",
        }}
      >
        <div
          className="card sticky-col"
          style={{ top: 92, overflow: "hidden" }}
        >
          <div
            className="row between"
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div className="seg">
              <button
                className={view === "photo" ? "active" : ""}
                onClick={() => setView("photo")}
              >
                <span className="row" style={{ gap: 6 }}>
                  <ImageIcon size={13} /> Photo
                </span>
              </button>
              <button
                className={view === "layout" ? "active" : ""}
                onClick={() => setView("layout")}
              >
                <span className="row" style={{ gap: 6 }}>
                  <LayoutGrid size={13} /> Layout
                </span>
              </button>
            </div>
            <SaveShare
              slug={shown.slug}
              color={sel.color}
              params={{ q: code }}
              title="My Cloud match"
            />
          </div>
          {view === "photo" ? (
            <Img
              key={photo}
              src={photo}
              alt={`${shown.name} in ${sel.color}`}
              w={1400}
              ratio="4/3"
              eager
            />
          ) : (
            <div
              className="dots-bg"
              style={{
                aspectRatio: "4/3",
                display: "flex",
                alignItems: "center",
                padding: 24,
              }}
            >
              <LayoutDiagram
                modules={shown.layout!}
                color={hex}
                widthLabel={dims.width}
                depthLabel={dims.depth}
                maxWidth={440}
              />
            </div>
          )}
          <div
            style={{ padding: "12px 14px", borderTop: "1px solid var(--line)" }}
          >
            <div
              className="muted"
              style={{
                fontSize: 12,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your answers
            </div>
            <div className="row wrap" style={{ gap: 6 }}>
              {answers.map((a, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => onEdit(i)}
                  title="Change this answer"
                  style={{ fontSize: 12.5 }}
                >
                  {QUIZ[i].short[a]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="stack" style={{ ["--gap" as string]: "20px" }}>
          <div className="g-head-desktop">{header}</div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {reasonsFor(answers, shown, sel.color).map((r, i) => (
              <li
                key={r}
                className="row"
                style={{
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 15.5,
                  animation: `fadeUp .4s ease ${0.1 + i * 0.08}s both`,
                }}
              >
                <span
                  className="icon-tile"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    flex: "none",
                  }}
                >
                  <Check size={13} />
                </span>
                {r}
              </li>
            ))}
          </ul>

          <div>
            <div className="row between label" style={{ marginBottom: 10 }}>
              <span>
                Color{" "}
                {sel.color === rec.color && (
                  <span className="pill pill-soft" style={{ marginLeft: 6 }}>
                    Recommended
                  </span>
                )}
              </span>
              <span
                className="muted"
                style={{ letterSpacing: 0, textTransform: "none" }}
              >
                {sel.color}
              </span>
            </div>
            <Swatches value={sel.color} onChange={sel.setColor} size={34} />
          </div>

          <div className="row wrap" style={{ gap: 10, alignItems: "baseline" }}>
            <span className="display" style={{ fontSize: 34 }}>
              {money(shown.price)}
            </span>
            <s className="muted">{money(shown.compare)}</s>
            <span className="pill pill-accent">
              Save {moneyShort(shown.compare - shown.price)}
            </span>
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <QtyStepper value={qty} onChange={setQty} />
            <button
              className="btn"
              style={{ flex: 1, minWidth: 200, padding: "16px 24px" }}
              onClick={() => cart.add(shown, { color: sel.color, qty })}
            >
              Add my match — {money(shown.price * qty)}
            </button>
          </div>

          <div
            style={{ padding: 14, borderRadius: 14, background: "var(--soft)" }}
          >
            <FinancingCalculator compact amount={shown.price * qty} />
          </div>

          <button
            className="card row"
            onClick={() => choose(other)}
            style={{
              gap: 14,
              padding: 14,
              textAlign: "left",
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            <div
              className="dots-bg"
              style={{ width: 96, borderRadius: 10, padding: 8, flex: "none" }}
            >
              <LayoutDiagram
                modules={other.layout!}
                color={hex}
                showDims={false}
                maxWidth={80}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="muted"
                style={{
                  fontSize: 12,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                {other.slug === rec.product.slug
                  ? `Best match · ${rec.match}%`
                  : `Also consider · ${rec.altMatch}% match`}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{other.name}</div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Seats {other.seats} · {moneyShort(other.price)}
              </div>
            </div>
            <ArrowRight size={16} />
          </button>

          <button
            className="text-btn row"
            style={{ gap: 6, justifySelf: "start" }}
            onClick={onRetake}
          >
            <RotateCcw size={14} /> Retake the quiz
          </button>
        </div>
      </div>
    </section>
  );
}
