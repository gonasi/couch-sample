import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, FlaskConical } from "lucide-react";
import { useUI, type Variant } from "../context/UIContext";
import { THEME_LABELS, type ThemeName } from "../theme/themes";
import { COUCHES, DEFAULT_PRODUCT } from "../data/products";
import { readStore, writeStore } from "../lib/money";

export const VARIANT_NAMES: Record<Variant, string> = {
  a: "Classic Gallery",
  b: "Editorial Scroll",
  c: "Configurator",
  d: "Conversion",
};

/** Floating control used by testers to flip between PDP variants and themes. */
export default function DemoSwitcher() {
  const { variant, setVariant, theme, setTheme, bottomOffset } = useUI();
  const [open, setOpen] = useState(() => readStore("gh2-switcher-open", window.innerWidth > 700));
  const location = useLocation();
  const navigate = useNavigate();

  const productSlug = location.pathname.startsWith("/product/")
    ? location.pathname.split("/")[2]
    : null;
  const onCouchPage =
    productSlug && COUCHES.some((c) => c.slug === productSlug);

  const toggle = (v: boolean) => {
    setOpen(v);
    writeStore("gh2-switcher-open", v);
  };

  const pickVariant = (v: Variant) => {
    setVariant(v);
    navigate(`/product/${onCouchPage ? productSlug : DEFAULT_PRODUCT}?v=${v}`, {
      replace: !!onCouchPage,
    });
  };

  return (
    <div className="demo-switcher" style={{ bottom: 16 + bottomOffset }}>
      {open ? (
        <div style={{ padding: 12, display: "grid", gap: 10, width: 262 }}>
          <div className="row between">
            <span
              className="row"
              style={{
                gap: 6,
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}
            >
              <FlaskConical size={14} color="var(--accent)" /> Demo controls
            </span>
            <button
              onClick={() => toggle(false)}
              aria-label="Collapse demo controls"
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: 4,
                color: "var(--ink)",
              }}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 5 }}>
              Product page ·{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                {VARIANT_NAMES[variant]}
              </strong>
            </div>
            <div className="seg">
              {(["a", "b", "c", "d"] as Variant[]).map((v) => (
                <button
                  key={v}
                  className={
                    variant === v && onCouchPage
                      ? "active"
                      : variant === v
                        ? "active"
                        : ""
                  }
                  style={{ flex: 1 }}
                  onClick={() => pickVariant(v)}
                  title={VARIANT_NAMES[v]}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 5 }}>
              Theme
            </div>
            <div className="seg">
              {(Object.keys(THEME_LABELS) as ThemeName[]).map((t) => (
                <button
                  key={t}
                  className={theme === t ? "active" : ""}
                  style={{ flex: 1 }}
                  onClick={() => setTheme(t)}
                >
                  {THEME_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => toggle(true)}
          className="row"
          style={{
            gap: 7,
            border: 0,
            background: "transparent",
            padding: "10px 14px",
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}
        >
          <FlaskConical size={14} color="var(--accent)" /> PDP{" "}
          {variant.toUpperCase()} · {THEME_LABELS[theme]}
        </button>
      )}
    </div>
  );
}
