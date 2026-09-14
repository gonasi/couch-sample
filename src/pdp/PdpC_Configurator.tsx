import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  Flame,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Lock,
  Truck,
} from "lucide-react";
import {
  COLORS,
  COUCHES,
  getById,
  type Module,
  type Product,
} from "../data/products";
import { useProductSelection } from "../hooks/useProductSelection";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { money, moneyShort, priceLabel } from "../lib/money";
import LayoutDiagram, {
  dimsFromLayout,
  type ExtraModule,
} from "../components/LayoutDiagram";
import { Breadcrumbs, Img, QtyStepper, Stars } from "../components/ui";
import { FeatureCards } from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import { deliveryDate } from "./shared";

const STEPS = ["Layout", "Fabric", "Add-ons", "Review"];

interface Addons {
  ottoman: number;
  covers: boolean;
  corner: boolean;
  swatches: boolean;
}

function placeExtras(layout: Module[], addons: Addons): ExtraModule[] {
  const extras: ExtraModule[] = [];
  const taken = new Set(layout.map((m) => `${m.x},${m.y}`));
  let maxX = Math.max(...layout.map((m) => m.x));
  if (addons.corner) {
    maxX += 1;
    extras.push({ x: maxX, y: 0, kind: "corner", back: ["n", "e"] });
    taken.add(`${maxX},0`);
  }
  let placed = 0;
  for (let y = 1; y < 6 && placed < addons.ottoman; y++) {
    for (let x = 0; x <= maxX && placed < addons.ottoman; x++) {
      if (!taken.has(`${x},${y}`)) {
        extras.push({ x, y, kind: "ottoman", back: [] });
        taken.add(`${x},${y}`);
        placed++;
      }
    }
  }
  return extras;
}

/** PDP Option C — step-by-step Configurator with live layout diagram. */
export default function PdpC({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const cart = useCart();
  const { toast } = useUI();
  const [params] = useSearchParams();
  const [step, setStep] = useState(() => Number(params.get("step") ?? 0) || 0);
  const [view, setView] = useState<"diagram" | "photo">("diagram");
  const [addons, setAddons] = useState<Addons>(() => ({
    ottoman: Number(params.get("ottoman") ?? 0) || 0,
    covers: params.get("covers") === "1",
    corner: params.get("corner") === "1",
    swatches: params.get("swatches") === "1",
  }));

  const ottoman = getById("ottoman");
  const covers = getById("covers");
  const corner = getById("corner");
  const swatches = getById("swatches");

  const extras = useMemo(
    () => placeExtras(product.layout!, addons),
    [product.layout, addons],
  );
  const allModules = [...product.layout!, ...extras];
  const dims = dimsFromLayout(allModules);
  const seats = (product.seats ?? 0) + (addons.corner ? 1 : 0);
  const pieces =
    (product.pieces ?? 0) + addons.ottoman + (addons.corner ? 1 : 0);
  const hex = COLORS.find((c) => c.name === sel.color)!.hex;

  const lines = [
    {
      label: `${product.name}`,
      sub: sel.color,
      price: product.price,
      compare: product.compare,
    },
    ...(addons.ottoman
      ? [
          {
            label: `Extra Ottoman × ${addons.ottoman}`,
            sub: sel.color,
            price: ottoman.price * addons.ottoman,
            compare: ottoman.compare * addons.ottoman,
          },
        ]
      : []),
    ...(addons.corner
      ? [
          {
            label: "Corner Module",
            sub: sel.color,
            price: corner.price,
            compare: corner.compare,
          },
        ]
      : []),
    ...(addons.covers
      ? [
          {
            label: "Replacement Cover Set",
            sub: sel.color,
            price: covers.price,
            compare: covers.compare,
          },
        ]
      : []),
    ...(addons.swatches
      ? [
          {
            label: "Fabric Swatch Booklet",
            sub: "All 4 colors",
            price: 0,
            compare: 0,
          },
        ]
      : []),
  ];
  const total = lines.reduce((t, l) => t + l.price, 0);
  const compareTotal = lines.reduce((t, l) => t + l.compare, 0);

  const addSetup = () => {
    cart.addMany([
      { product, opts: { color: sel.color } },
      ...(addons.ottoman
        ? [{ product: ottoman, opts: { qty: addons.ottoman, note: sel.color } }]
        : []),
      ...(addons.corner
        ? [{ product: corner, opts: { note: sel.color } }]
        : []),
      ...(addons.covers
        ? [{ product: covers, opts: { note: sel.color } }]
        : []),
      ...(addons.swatches ? [{ product: swatches }] : []),
    ]);
  };

  const share = async () => {
    const q = new URLSearchParams({
      v: "c",
      step: "3",
      ottoman: String(addons.ottoman),
      covers: addons.covers ? "1" : "0",
      corner: addons.corner ? "1" : "0",
      swatches: addons.swatches ? "1" : "0",
    });
    const url = `${window.location.origin}${window.location.pathname}#/product/${product.slug}?${q}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Setup link copied to clipboard", "success");
    } catch {
      toast("Copy this link: " + url);
    }
  };

  const choiceCard = (active: boolean) =>
    ({
      textAlign: "left",
      padding: active ? 15 : 16,
      borderRadius: 14,
      border: active ? "2px solid var(--ink)" : "1px solid var(--line)",
      background: "var(--surface)",
      color: "var(--ink)",
      cursor: "pointer",
      position: "relative",
      transition: "border-color .15s",
    }) as React.CSSProperties;

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: "Build your Cloud" },
        ]}
      />

      <section className="container" style={{ paddingTop: 18 }}>
        <div
          className="row between wrap"
          style={{ gap: 16, alignItems: "flex-end" }}
        >
          <div>
            <span className="eyebrow">Build your Cloud</span>
            <h1 className="display h1" style={{ marginTop: 10 }}>
              Design your setup
            </h1>
          </div>
          <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
            <Stars /> 4.9 <span className="muted">· 5,250+ reviews</span>
          </div>
        </div>

        <div
          className="grid-auto"
          style={{
            ["--min" as string]: "340px",
            ["--gap" as string]: "40px",
            marginTop: 28,
            alignItems: "start",
          }}
        >
          {/* visual */}
          <div
            className="card sticky-col"
            style={{ top: 92, overflow: "hidden" }}
          >
            <div
              className="row between"
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div className="seg">
                <button
                  className={view === "diagram" ? "active" : ""}
                  onClick={() => setView("diagram")}
                >
                  <span className="row" style={{ gap: 6 }}>
                    <LayoutGrid size={13} /> Layout
                  </span>
                </button>
                <button
                  className={view === "photo" ? "active" : ""}
                  onClick={() => setView("photo")}
                >
                  <span className="row" style={{ gap: 6 }}>
                    <ImageIcon size={13} /> Photo
                  </span>
                </button>
              </div>
              <span className="pill pill-soft">
                {seats} seats · {pieces} pieces
              </span>
            </div>
            {view === "diagram" ? (
              <div
                className="dots-bg"
                style={{
                  padding: "36px 24px",
                  minHeight: 360,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LayoutDiagram
                  modules={product.layout!}
                  extras={extras}
                  color={hex}
                  widthLabel={dims.width}
                  depthLabel={dims.depth}
                  maxWidth={460}
                />
              </div>
            ) : (
              <Img
                src={sel.images[0]}
                alt={`${product.name} in ${sel.color}`}
                w={1400}
                ratio="4/3"
              />
            )}
            <div
              className="grid-auto"
              style={{
                ["--min" as string]: "90px",
                ["--gap" as string]: "0",
                borderTop: "1px solid var(--line)",
              }}
            >
              {[
                ["Width", dims.width],
                ["Depth", dims.depth],
                ["Seats", String(seats)],
                ["Boxes", String(pieces)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    padding: "14px 16px",
                    borderRight: "1px solid var(--line)",
                  }}
                >
                  <div
                    className="muted"
                    style={{
                      fontSize: 11,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                    }}
                  >
                    {k}
                  </div>
                  <div className="display" style={{ fontSize: 22 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* steps */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 6,
                marginBottom: 20,
              }}
            >
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(i)}
                  style={{
                    background: "none",
                    border: 0,
                    borderBottom: `2px solid ${i === step ? "var(--ink)" : "var(--line)"}`,
                    padding: "8px 2px 12px",
                    cursor: "pointer",
                    color: i <= step ? "var(--ink)" : "var(--muted)",
                    textAlign: "left",
                  }}
                >
                  <span className="row" style={{ gap: 8, fontSize: 14 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 99,
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          i < step
                            ? "var(--accent)"
                            : i === step
                              ? "var(--ink)"
                              : "var(--soft)",
                        color: i <= step ? "var(--bg)" : "var(--muted)",
                        flex: "none",
                      }}
                    >
                      {i < step ? <Check size={12} /> : i + 1}
                    </span>
                    <span
                      className="desktop-only"
                      style={{ display: "inline" }}
                    >
                      {s}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div key={step} style={{ animation: "fadeUp .25s ease" }}>
              {step === 0 && (
                <>
                  <h2
                    className="display"
                    style={{ fontSize: 26, marginBottom: 6 }}
                  >
                    Choose your layout
                  </h2>
                  <p
                    className="muted"
                    style={{ margin: "0 0 18px", fontSize: 15 }}
                  >
                    Every layout uses the same modules — you can always add
                    pieces later.
                  </p>
                  <div
                    className="grid-auto"
                    style={{
                      ["--min" as string]: "200px",
                      ["--gap" as string]: "12px",
                    }}
                  >
                    {COUCHES.map((c) => {
                      const active = c.slug === product.slug;
                      return (
                        <button
                          key={c.slug}
                          style={choiceCard(active)}
                          onClick={() => sel.pickConfig(c.slug)}
                        >
                          {c.bestSeller && (
                            <span
                              className="pill pill-accent"
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                fontSize: 10,
                              }}
                            >
                              Popular
                            </span>
                          )}
                          <div
                            style={{
                              height: 96,
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 10,
                            }}
                          >
                            <LayoutDiagram
                              modules={c.layout!}
                              color={hex}
                              showDims={false}
                              maxWidth={130}
                            />
                          </div>
                          <div style={{ fontSize: 16 }}>{c.shortName}</div>
                          <div className="muted" style={{ fontSize: 13.5 }}>
                            Seats {c.seats} ·{" "}
                            {c.dims!.overall.replace(' × 33" H', "")}
                          </div>
                          <div
                            className="row"
                            style={{ gap: 8, marginTop: 6, fontSize: 15 }}
                          >
                            {moneyShort(c.price)}
                            <s className="muted" style={{ fontSize: 13 }}>
                              {moneyShort(c.compare)}
                            </s>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2
                    className="display"
                    style={{ fontSize: 26, marginBottom: 6 }}
                  >
                    Pick your fabric
                  </h2>
                  <p
                    className="muted"
                    style={{ margin: "0 0 18px", fontSize: 15 }}
                  >
                    Performance weave, 60,000+ double rubs, pet-friendly and
                    fully washable.
                  </p>
                  <div
                    className="grid-auto"
                    style={{
                      ["--min" as string]: "200px",
                      ["--gap" as string]: "12px",
                    }}
                  >
                    {COLORS.map((c) => {
                      const active = c.name === sel.color;
                      return (
                        <button
                          key={c.name}
                          style={choiceCard(active)}
                          onClick={() => sel.setColor(c.name)}
                        >
                          <div className="row" style={{ gap: 14 }}>
                            <span
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 99,
                                background: c.hex,
                                border: "1px solid var(--line)",
                                flex: "none",
                                boxShadow: "inset 0 -6px 12px rgba(0,0,0,.08)",
                              }}
                            />
                            <div>
                              <div style={{ fontSize: 16 }}>{c.name}</div>
                              {c.stock <= 6 ? (
                                <div
                                  className="row accent"
                                  style={{ gap: 4, fontSize: 13 }}
                                >
                                  <Flame size={13} /> Only {c.stock} left
                                </div>
                              ) : (
                                <div className="muted" style={{ fontSize: 13 }}>
                                  In stock
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className="card row between wrap"
                    style={{
                      marginTop: 14,
                      padding: "14px 16px",
                      gap: 10,
                      fontSize: 14.5,
                    }}
                  >
                    <span>Not sure? Feel every color at home first.</span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setAddons((a) => ({ ...a, swatches: true }));
                        toast(
                          "Free swatch booklet added to your setup",
                          "success",
                        );
                      }}
                      disabled={addons.swatches}
                    >
                      {addons.swatches ? "Swatches added" : "Add free swatches"}
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2
                    className="display"
                    style={{ fontSize: 26, marginBottom: 6 }}
                  >
                    Complete the setup
                  </h2>
                  <p
                    className="muted"
                    style={{ margin: "0 0 18px", fontSize: 15 }}
                  >
                    Add-ons ship with your couch and lock onto the same
                    connectors.
                  </p>
                  <div
                    className="stack"
                    style={{ ["--gap" as string]: "10px" }}
                  >
                    {[
                      {
                        p: ottoman,
                        control: (
                          <QtyStepper
                            small
                            min={0}
                            value={addons.ottoman}
                            onChange={(n) =>
                              setAddons((a) => ({
                                ...a,
                                ottoman: Math.min(n, 3),
                              }))
                            }
                          />
                        ),
                      },
                      { p: corner, key: "corner" as const },
                      { p: covers, key: "covers" as const },
                      { p: swatches, key: "swatches" as const },
                    ].map(({ p, control, key }) => {
                      const on = key ? addons[key] : addons.ottoman > 0;
                      return (
                        <div
                          key={p.id}
                          className="row"
                          style={{
                            ...choiceCard(on),
                            cursor: "default",
                            gap: 14,
                          }}
                        >
                          <Img
                            src={p.images[0]}
                            alt={p.name}
                            w={200}
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 10,
                              flex: "none",
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15.5 }}>{p.name}</div>
                            <div className="muted" style={{ fontSize: 13.5 }}>
                              {p.blurb}
                            </div>
                            <div style={{ fontSize: 14, marginTop: 2 }}>
                              {priceLabel(p.price)}
                            </div>
                          </div>
                          {control ?? (
                            <button
                              className={`btn btn-sm ${on ? "" : "btn-outline"}`}
                              onClick={() =>
                                setAddons((a) => ({ ...a, [key!]: !a[key!] }))
                              }
                              style={{ minWidth: 92 }}
                            >
                              {on ? (
                                <>
                                  <Check size={14} /> Added
                                </>
                              ) : (
                                "Add"
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2
                    className="display"
                    style={{ fontSize: 26, marginBottom: 18 }}
                  >
                    Review your Cloud
                  </h2>
                  <div className="card" style={{ overflow: "hidden" }}>
                    {[
                      ["Layout", `${product.name} · seats ${seats}`, 0],
                      ["Fabric", sel.color, 1],
                      [
                        "Add-ons",
                        lines.length > 1
                          ? lines
                              .slice(1)
                              .map((l) => l.label)
                              .join(", ")
                          : "None",
                        2,
                      ],
                    ].map(([k, v, s]) => (
                      <div
                        key={k as string}
                        className="row between"
                        style={{
                          padding: "14px 18px",
                          borderBottom: "1px solid var(--line)",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div
                            className="muted label"
                            style={{ fontSize: 11.5 }}
                          >
                            {k}
                          </div>
                          <div style={{ fontSize: 15.5 }}>{v}</div>
                        </div>
                        <button
                          className="text-btn"
                          onClick={() => setStep(s as number)}
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                    <div
                      className="row"
                      style={{ padding: "14px 18px", gap: 10, fontSize: 14.5 }}
                    >
                      <Truck size={17} color="var(--accent)" /> Free delivery by{" "}
                      <strong style={{ fontWeight: 600 }}>
                        {deliveryDate()}
                      </strong>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={share}
                  >
                    <Link2 size={14} /> Share this setup
                  </button>
                </>
              )}
            </div>

            <div className="row between" style={{ marginTop: 22, gap: 10 }}>
              <button
                className="btn btn-ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </button>
              {step < 3 ? (
                <button className="btn" onClick={() => setStep((s) => s + 1)}>
                  Next: {STEPS[step + 1]}
                </button>
              ) : (
                <button className="btn btn-accent" onClick={addSetup}>
                  Add setup to cart
                </button>
              )}
            </div>

            <div className="card card-pad" style={{ marginTop: 22 }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <h3 className="display" style={{ fontSize: 22 }}>
                  Your setup
                </h3>
                <span className="pill pill-accent">30% off</span>
              </div>
              <div className="stack" style={{ ["--gap" as string]: "10px" }}>
                {lines.map((l) => (
                  <div
                    key={l.label}
                    className="row between"
                    style={{ fontSize: 15, alignItems: "flex-start", gap: 12 }}
                  >
                    <div>
                      {l.label}
                      <div className="muted" style={{ fontSize: 13 }}>
                        {l.sub}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {priceLabel(l.price)}
                      {l.compare > l.price && (
                        <div>
                          <s className="muted" style={{ fontSize: 12.5 }}>
                            {money(l.compare)}
                          </s>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <hr className="divider" style={{ margin: "16px 0" }} />
              <div className="row between" style={{ fontSize: 15 }}>
                <span className="muted">You save</span>
                <span className="accent">−{money(compareTotal - total)}</span>
              </div>
              <div
                className="row between"
                style={{ alignItems: "baseline", marginTop: 8 }}
              >
                <span>Total</span>
                <span className="display" style={{ fontSize: 30 }}>
                  {money(total)}
                </span>
              </div>
              <p
                className="muted"
                style={{
                  fontSize: 13.5,
                  margin: "4px 0 16px",
                  textAlign: "right",
                }}
              >
                or 4 × {money(total / 4)} interest-free
              </p>
              <button className="btn btn-block" onClick={addSetup}>
                <Lock size={14} /> Add setup to cart — {money(total)}
              </button>
            </div>
          </div>
        </div>
      </section>

      <FeatureCards />
      <DeepReviews />
      <QandA />
      <FaqTabs />
    </div>
  );
}
