import { useState, type FormEvent } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useUI } from "../context/UIContext";
import { POLICIES, SUPPORT_LINKS, SUPPORT_TOPICS } from "../data/content";
import { IMG } from "../data/images";
import { COLORS, COUCHES } from "../data/products";
import { Accordion, Breadcrumbs, Img } from "../components/ui";
import LayoutDiagram, { dimsFromLayout } from "../components/LayoutDiagram";
import { ReviewsSection, UgcStrip } from "../components/Sections";
import NotFound from "./NotFound";

export function Support() {
  const { topic } = useParams();
  const t = SUPPORT_TOPICS.find((s) => s.slug === topic);
  if (!t) return <NotFound />;

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Support", to: "/support/faq" },
          { label: t.title },
        ]}
      />
      <section
        className="container grid-auto"
        style={{
          ["--min" as string]: "240px",
          ["--gap" as string]: "48px",
          paddingTop: 28,
          alignItems: "start",
        }}
      >
        <nav className="card sticky-col" style={{ padding: 10, top: 92 }}>
          {SUPPORT_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              style={({ isActive }) => ({
                display: "block",
                padding: "10px 14px",
                borderRadius: 10,
                background: isActive ? "var(--soft)" : "transparent",
                fontSize: 15,
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="span-2" style={{ gridColumn: "span 2", minWidth: 0 }}>
          <span className="eyebrow">Support</span>
          <h1
            className="display"
            style={{
              fontSize: "clamp(34px,4.6vw,56px)",
              margin: "10px 0 12px",
            }}
          >
            {t.title}
          </h1>
          <p className="muted lead" style={{ margin: "0 0 32px" }}>
            {t.intro}
          </p>

          {t.slug === "faq" ? (
            <div style={{ borderTop: "1px solid var(--line)" }}>
              <Accordion
                defaultOpen={0}
                items={t.sections.map((s) => ({
                  title: s.heading,
                  content: s.body,
                }))}
              />
            </div>
          ) : t.slug === "size-guide" ? (
            <div
              className="grid-auto"
              style={{
                ["--min" as string]: "260px",
                ["--gap" as string]: "16px",
              }}
            >
              {COUCHES.map((c) => {
                const d = dimsFromLayout(c.layout!);
                return (
                  <Link
                    key={c.slug}
                    to={`/product/${c.slug}`}
                    className="card card-pad stack"
                    style={{ ["--gap" as string]: "10px" }}
                  >
                    <div
                      className="dots-bg"
                      style={{ borderRadius: 12, padding: 16 }}
                    >
                      <LayoutDiagram
                        modules={c.layout!}
                        color={COLORS[2].hex}
                        widthLabel={d.width}
                        depthLabel={d.depth}
                        maxWidth={260}
                      />
                    </div>
                    <div className="display" style={{ fontSize: 20 }}>
                      {c.name}
                    </div>
                    <div className="muted" style={{ fontSize: 14.5 }}>
                      {c.dims!.overall} · seats {c.seats}
                      <br />
                      {c.dims!.boxes}
                    </div>
                  </Link>
                );
              })}
              <div className="card card-pad" style={{ gridColumn: "1 / -1" }}>
                <strong style={{ fontWeight: 600 }}>Seat details</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  Seat height 18" · seat depth 44" · arm height 24". Largest box
                  34" × 30" × 26" fits a standard 30" doorway.
                </p>
              </div>
            </div>
          ) : (
            <div className="stack" style={{ ["--gap" as string]: "14px" }}>
              {t.sections.map((s) => (
                <div key={s.heading} className="card card-pad">
                  <h3
                    className="display"
                    style={{ fontSize: 21, marginBottom: 8 }}
                  >
                    {s.heading}
                  </h3>
                  <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
                    {s.body}
                  </p>
                </div>
              ))}
              {t.slug === "contact" && <ContactForm />}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const { toast } = useUI();
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Order question",
    message: "",
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !/^\S+@\S+\.\S+$/.test(form.email) ||
      form.message.length < 5
    ) {
      toast("Please fill in your name, a valid email and a message.", "error");
      return;
    }
    toast(
      `Thanks ${form.name.split(" ")[0]}! We’ll reply within 4 hours.`,
      "success",
    );
    setForm({ name: "", email: "", topic: "Order question", message: "" });
  };
  return (
    <form
      onSubmit={submit}
      className="card card-pad stack"
      style={{ marginTop: 10 }}
    >
      <h3 className="display" style={{ fontSize: 24 }}>
        Send us a message
      </h3>
      <div className="row wrap" style={{ gap: 12 }}>
        <label className="field" style={{ flex: 1, minWidth: 200 }}>
          Name
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="field" style={{ flex: 1, minWidth: 200 }}>
          Email
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
      </div>
      <label className="field">
        Topic
        <select
          className="input"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        >
          {[
            "Order question",
            "Product question",
            "Returns",
            "Assembly help",
            "Something else",
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Message
        <textarea
          className="input"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
        Send message
      </button>
    </form>
  );
}

export function Policy() {
  const { slug } = useParams();
  const p = slug ? POLICIES[slug] : undefined;
  if (!p) return <NotFound />;
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: p.title }]} />
      <section
        style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 0" }}
      >
        <span className="eyebrow">Policies</span>
        <h1
          className="display"
          style={{ fontSize: "clamp(34px,4.6vw,54px)", margin: "10px 0 28px" }}
        >
          {p.title}
        </h1>
        {p.body.map((para, i) => (
          <p
            key={i}
            className="lead"
            style={{
              margin: "0 0 18px",
              color: i ? "var(--muted)" : "var(--ink)",
            }}
          >
            {para}
          </p>
        ))}
        <p className="muted" style={{ fontSize: 14, marginTop: 32 }}>
          Last updated September 2026 · Questions?{" "}
          <Link to="/support/contact" style={{ textDecoration: "underline" }}>
            Contact us
          </Link>
        </p>
      </section>
    </div>
  );
}

export function About() {
  return (
    <div className="page">
      <section
        style={{
          position: "relative",
          minHeight: 480,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <Img
          src={IMG.sunnyLiving}
          alt=""
          w={2200}
          eager
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg,rgba(20,16,12,.7),rgba(20,16,12,.1))",
          }}
        />
        <div
          className="container"
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: 56,
            color: "#fff",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Our Story
          </span>
          <h1
            className="display"
            style={{
              fontSize: "clamp(40px,6vw,80px)",
              marginTop: 12,
              maxWidth: "16ch",
            }}
          >
            We just wanted a couch that fit through the door.
          </h1>
        </div>
      </section>
      <section
        style={{ maxWidth: 860, margin: "0 auto", padding: "72px 24px 0" }}
      >
        <p
          className="display"
          style={{
            fontSize: "clamp(22px,2.8vw,32px)",
            lineHeight: 1.4,
            margin: "0 0 28px",
          }}
        >
          GH2 started in a third-floor walk-up, with a beautiful sofa that
          didn’t survive the stairwell.
        </p>
        <div
          className="grid-auto muted"
          style={{
            ["--min" as string]: "260px",
            ["--gap" as string]: "28px",
            fontSize: 16.5,
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: 0 }}>
            So we built the one we wanted: deep, cloud-soft seating that ships
            in boxes small enough for any home, and snaps together in minutes
            with no tools.
          </p>
          <p style={{ margin: 0 }}>
            Then we made every cover washable — including the base — because
            life happens. Today more than 5,000 American homes lounge on a
            Cloud.
          </p>
        </div>
      </section>
      <section
        className="container section grid-auto"
        style={{ ["--min" as string]: "200px", ["--gap" as string]: "20px" }}
      >
        {[
          ["5,250+", "verified reviews"],
          ["4.9★", "average rating"],
          ["20 min", "average assembly"],
          ["30 nights", "risk-free trial"],
        ].map(([n, l]) => (
          <div
            key={l}
            className="card card-pad"
            style={{ textAlign: "center" }}
          >
            <div className="display" style={{ fontSize: 40 }}>
              {n}
            </div>
            <div className="muted">{l}</div>
          </div>
        ))}
      </section>
      <section className="container section" id="journal">
        <h2 className="display h2" style={{ marginBottom: 24 }}>
          From the journal
        </h2>
        <div className="grid-auto" style={{ ["--min" as string]: "280px" }}>
          {[
            [
              IMG.bohoLiving,
              "Small space, big lounging: 6 layouts under 600 sq ft",
              "/support/size-guide",
            ],
            [
              IMG.beagle,
              "The pet owner’s guide to a couch that survives",
              "/support/cleaning",
            ],
            [
              IMG.pillowsBench,
              "How we test fabric: 60,000 rubs and counting",
              "/policies/warranty",
            ],
          ].map(([img, title, to]) => (
            <Link
              key={title}
              to={to}
              className="card"
              style={{ overflow: "hidden" }}
            >
              <Img
                src={img}
                alt=""
                w={800}
                ratio="3/2"
                className="zoom-hover"
              />
              <div style={{ padding: 20 }}>
                <span className="eyebrow">Journal</span>
                <h3 className="display" style={{ fontSize: 21, marginTop: 8 }}>
                  {title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReviewsPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Reviews" }]} />
      <ReviewsSection title="Customer Reviews" />
      <UgcStrip />
    </div>
  );
}
