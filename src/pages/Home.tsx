import { useState } from "react";
import { Link } from "react-router-dom";
import { Hammer, Play, Plus, RefreshCw, Move } from "lucide-react";
import { BENEFITS, FEATURE_ROWS } from "../data/content";
import { HOME_IMAGES } from "../data/images";
import { COUCHES } from "../data/products";
import ProductCard from "../components/ProductCard";
import { ComparisonTable, UgcStrip } from "../components/Sections";
import { ContentIcon, Img } from "../components/ui";
import VideoModal from "../components/VideoModal";
import TesterHub from "../components/TesterHub";

export default function Home() {
  const [film, setFilm] = useState(false);
  return (
    <div className="page">
      <TesterHub />
      <section
        id="top"
        style={{
          position: "relative",
          minHeight: 640,
          display: "flex",
          alignItems: "flex-end",
          background: "var(--soft)",
          overflow: "hidden",
        }}
      >
        <Img
          src={HOME_IMAGES.hero}
          alt="Living room with a GH2 Cloud couch"
          w={2400}
          eager
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg,rgba(20,16,12,.72) 0%,rgba(20,16,12,.25) 45%,rgba(20,16,12,.05) 100%)",
          }}
        />
        <div style={{ position: "absolute", top: 24, right: 24 }}>
          <button
            onClick={() => setFilm(true)}
            className="pill pill-soft"
            style={{
              cursor: "pointer",
              padding: "10px 18px",
              fontSize: 12,
              border: 0,
            }}
          >
            <Play size={13} fill="currentColor" /> Watch the film
          </button>
        </div>
        <div
          className="container row wrap between"
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: 72,
            alignItems: "flex-end",
            gap: 32,
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <h1
              className="display"
              style={{
                fontSize: "clamp(48px,7vw,92px)",
                lineHeight: 0.98,
                marginBottom: 20,
              }}
            >
              Luxury You Can{" "}
              <em style={{ fontStyle: "italic", color: "var(--accentInk)" }}>
                Feel.
              </em>
            </h1>
            <div
              className="row"
              style={{ gap: 10, marginBottom: 26, fontSize: 15 }}
            >
              <span style={{ letterSpacing: ".12em" }}>★★★★★</span>
              <span>Rated 4.9 by 5,250+ Reviews</span>
            </div>
            <Link
              to="/shop"
              className="btn btn-accent"
              style={{ padding: "17px 34px", fontSize: 15 }}
            >
              Shop Cloud Couches →
            </Link>
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            <span
              className="pill pill-soft"
              style={{ padding: "10px 18px", fontSize: 13 }}
            >
              Free Gift with Order
            </span>
            <span
              className="pill pill-accent"
              style={{ padding: "10px 18px", fontSize: 13 }}
            >
              30% Sale Ends Soon
            </span>
          </div>
        </div>
      </section>

      <section id="shop" className="container" style={{ paddingTop: 96 }}>
        <div
          className="row wrap between"
          style={{ alignItems: "flex-end", gap: 20, marginBottom: 44 }}
        >
          <h2
            className="display"
            style={{ fontSize: "clamp(34px,4.6vw,58px)" }}
          >
            Designed for American Homes.
          </h2>
          <Link to="/shop" className="link-underline">
            Shop The Cloud Collection
          </Link>
        </div>
        <div className="grid-auto">
          {COUCHES.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <UgcStrip />

      <section
        style={{
          marginTop: 72,
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          className="container grid-auto"
          style={{
            ["--min" as string]: "210px",
            ["--gap" as string]: "32px",
            padding: "44px 24px",
          }}
        >
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="stack"
              style={{ ["--gap" as string]: "8px" }}
            >
              <div className="icon-tile">
                <ContentIcon name={b.icon} />
              </div>
              <strong style={{ fontSize: 16, fontWeight: 600 }}>
                {b.title}
              </strong>
              <span className="muted" style={{ fontSize: 15 }}>
                {b.body}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "96px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 72,
        }}
      >
        {FEATURE_ROWS.map((f, i) => (
          <div
            key={f.title}
            className="grid-auto"
            style={{
              ["--min" as string]: "300px",
              ["--gap" as string]: "44px",
              alignItems: "center",
            }}
          >
            <div style={{ order: i % 2 ? 2 : 1 }}>
              <Img
                src={HOME_IMAGES.features[f.image]}
                alt={f.title}
                w={1000}
                ratio="4/3"
                radius="var(--radius)"
                style={{ border: "1px solid var(--line)" }}
                className="zoom-hover"
              />
            </div>
            <div style={{ order: i % 2 ? 1 : 2 }}>
              <h3
                className="display"
                style={{
                  fontSize: "clamp(26px,3.2vw,40px)",
                  marginBottom: 16,
                  lineHeight: 1.08,
                }}
              >
                {f.title}
              </h3>
              <p className="muted lead" style={{ margin: "0 0 14px" }}>
                {f.lead}
              </p>
              <p className="lead" style={{ margin: 0 }}>
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <ComparisonTable />

      <section className="container" style={{ marginTop: 96 }}>
        <div
          className="card grid-auto"
          style={{
            ["--min" as string]: "300px",
            ["--gap" as string]: "44px",
            alignItems: "center",
            padding: 28,
          }}
        >
          <Img
            src={HOME_IMAGES.lastCouch}
            alt="5-piece Cloud in a living room"
            w={1000}
            ratio="4/3"
            radius="14px"
          />
          <div>
            <h3
              className="display"
              style={{
                fontSize: "clamp(26px,3.2vw,42px)",
                marginBottom: 24,
                lineHeight: 1.08,
              }}
            >
              The Last Couch You’ll Ever Need
            </h3>
            <div style={{ display: "grid", gap: 16, marginBottom: 28 }}>
              {[
                [RefreshCw, "Refresh Anytime and Replace Covers"],
                [Plus, "Buy Extra Pieces to Expand Your Setup"],
                [Hammer, "Durable Structure that’s Built to Last"],
                [Move, "Moves with You, Easy to Rearrange"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Plus;
                return (
                  <div
                    key={label as string}
                    className="row"
                    style={{ gap: 14 }}
                  >
                    <span
                      className="icon-tile"
                      style={{ width: 30, height: 30 }}
                    >
                      <I size={17} />
                    </span>
                    <span style={{ fontSize: 16.5 }}>{label as string}</span>
                  </div>
                );
              })}
            </div>
            <Link to="/product/5-piece-cloud?v=c" className="btn">
              Build Your Setup for Life
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: 72 }}>
        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "300px",
            ["--gap" as string]: "44px",
            alignItems: "center",
          }}
        >
          <div style={{ order: 2 }}>
            <span className="eyebrow">The Pit Cloud</span>
            <h3
              className="display"
              style={{
                fontSize: "clamp(26px,3.4vw,44px)",
                margin: "10px 0 16px",
                lineHeight: 1.08,
              }}
            >
              Designed for Ultimate Comfort
            </h3>
            <p className="muted lead" style={{ margin: "0 0 26px" }}>
              Sink into oversized seats designed for true lounging. Perfect for
              movie nights, slow Sundays, and full body relaxation. This is the
              configuration everyone upgrades to.
            </p>
            <Link to="/product/6-piece-pit-cloud" className="btn btn-outline">
              Shop the 6 Piece
            </Link>
          </div>
          <div style={{ order: 1 }}>
            <Img
              src={HOME_IMAGES.pitPromo}
              alt="6-piece pit, wide shot"
              w={1200}
              ratio="3/2"
              radius="var(--radius)"
              className="zoom-hover"
            />
          </div>
        </div>
      </section>

      <section
        style={{
          margin: "96px 0 0",
          position: "relative",
          minHeight: 460,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Img
          src={HOME_IMAGES.feelComfort}
          alt=""
          w={2200}
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20,16,12,.42)",
          }}
        />
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "40px 24px",
            color: "#fff",
          }}
        >
          <h2
            className="display"
            style={{ fontSize: "clamp(34px,5.5vw,68px)", marginBottom: 24 }}
          >
            Feel The Comfort
          </h2>
          <Link
            to="/shop"
            className="btn btn-accent"
            style={{ padding: "17px 34px", fontSize: 15 }}
          >
            Experience The Cloud →
          </Link>
        </div>
      </section>

      <VideoModal
        open={film}
        onClose={() => setFilm(false)}
        poster={HOME_IMAGES.hero}
        title="Luxury You Can Feel — 1:12"
      />
    </div>
  );
}
