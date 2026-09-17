import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical, X } from "lucide-react";
import { useUI } from "../context/UIContext";
import { DEFAULT_PRODUCT } from "../data/products";
import { VARIANTS, VARIANT_META } from "../data/variants";
import { readStore, writeStore } from "../lib/money";

const GROUPS = [
  { group: "core", title: "Core page layouts", range: "A–E" },
  { group: "interactive", title: "Interactive concepts", range: "F–I", isNew: true },
  { group: "reference", title: "Retail reference", range: "J", isNew: true },
] as const;

/** Links for product testers to open each PDP variant. Shown at the top of the home page. */
export default function TesterHub() {
  const { variant, setVariant } = useUI();
  const [hidden, setHidden] = useState(() =>
    readStore("gh2-hub-hidden", false),
  );

  const toggle = (v: boolean) => {
    setHidden(v);
    writeStore("gh2-hub-hidden", v);
  };

  if (hidden) {
    return (
      <div className="container" style={{ paddingTop: 12 }}>
        <button
          className="chip row"
          style={{ gap: 6 }}
          onClick={() => toggle(false)}
        >
          <FlaskConical size={13} color="var(--accent)" /> Show tester links
        </button>
      </div>
    );
  }

  return (
    <section
      className="container"
      style={{ paddingTop: 20, paddingBottom: 20 }}
      aria-label="Product testing links"
    >
      <div
        className="card"
        style={{ padding: "20px 22px", border: "1.5px dashed var(--accent)" }}
      >
        <div
          className="row between wrap"
          style={{ gap: 10, marginBottom: 16, alignItems: "flex-start" }}
        >
          <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
            <span className="icon-tile" style={{ width: 38, height: 38 }}>
              <FlaskConical size={18} />
            </span>
            <div>
              <div className="display" style={{ fontSize: 21 }}>
                Product testing: compare {VARIANTS.length} product page designs
              </div>
              <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>
                Open each version, pick a color and size, add to cart and check
                out. Everything is mocked — no real orders or payments.
              </div>
            </div>
          </div>
          <button
            className="text-btn row"
            style={{ gap: 4 }}
            onClick={() => toggle(true)}
          >
            <X size={13} /> Hide
          </button>
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          {GROUPS.map((g) => (
            <div key={g.group}>
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <span className="label" style={{ fontSize: 12 }}>
                  {g.title} ({g.range})
                </span>
                {"isNew" in g && <span className="pill pill-accent">New</span>}
              </div>
              <div
                className="grid-auto"
                style={{
                  ["--min" as string]: "200px",
                  ["--gap" as string]: "10px",
                }}
              >
                {VARIANTS.filter((v) => VARIANT_META[v].group === g.group).map(
                  (v) => (
                    <Link
                      key={v}
                      to={`/product/${DEFAULT_PRODUCT}?v=${v}`}
                      onClick={() => setVariant(v)}
                      className="card"
                      style={{
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        background: "var(--bg)",
                        borderColor:
                          variant === v ? "var(--ink)" : "var(--line)",
                      }}
                    >
                      <div className="row between">
                        <span className="row" style={{ gap: 8 }}>
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 99,
                              background:
                                g.group === "interactive"
                                  ? "var(--accent)"
                                  : "var(--ink)",
                              color: "var(--bg)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                            }}
                          >
                            {v.toUpperCase()}
                          </span>
                          <strong style={{ fontWeight: 600, fontSize: 15 }}>
                            {VARIANT_META[v].name}
                          </strong>
                        </span>
                        <ArrowRight size={15} />
                      </div>
                      <span
                        className="muted"
                        style={{ fontSize: 13, lineHeight: 1.45 }}
                      >
                        {VARIANT_META[v].blurb}
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
