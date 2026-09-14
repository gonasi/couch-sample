import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getProduct, type Product } from "../data/products";
import { isVariant, useUI } from "../context/UIContext";
import { useCart } from "../context/CartContext";
import { money, priceLabel } from "../lib/money";
import { Breadcrumbs, Img, QtyStepper, TrustRow } from "../components/ui";
import { PairsWellWith } from "../components/Sections";
import PdpA from "../pdp/PdpA_ClassicGallery";
import PdpB from "../pdp/PdpB_EditorialScroll";
import PdpC from "../pdp/PdpC_Configurator";
import PdpD from "../pdp/PdpD_Conversion";
import PdpE from "../pdp/PdpE_LongForm";
import NotFound from "./NotFound";

export default function ProductPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { variant, setVariant } = useUI();
  const product = getProduct(slug);
  const v = params.get("v");

  useEffect(() => {
    if (isVariant(v) && v !== variant) setVariant(v);
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (product) document.title = `${product.name} — GH2 Cloud`;
    return () => {
      document.title = "GH2 Cloud — Luxury You Can Feel";
    };
  }, [product]);

  if (!product) return <NotFound />;
  if (product.kind === "accessory") return <AccessoryPage product={product} />;

  switch (isVariant(v) ? v : variant) {
    case "b":
      return <PdpB product={product} />;
    case "c":
      return <PdpC product={product} />;
    case "d":
      return <PdpD product={product} />;
    case "e":
      return <PdpE product={product} />;
    default:
      return <PdpA product={product} />;
  }
}

function AccessoryPage({ product }: { product: Product }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  useEffect(() => {
    setQty(1);
    setActive(0);
  }, [product.slug]);

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: product.name },
        ]}
      />
      <section
        className="container grid-auto"
        style={{
          ["--min" as string]: "330px",
          ["--gap" as string]: "52px",
          paddingTop: 22,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Img
            src={product.images[active]}
            alt={product.name}
            w={1400}
            ratio="4/3"
            radius="var(--radius)"
            eager
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 10,
            }}
          >
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActive(i)}
                style={{
                  padding: 0,
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  border:
                    i === active
                      ? "2px solid var(--ink)"
                      : "1px solid var(--line)",
                  background: "none",
                }}
              >
                <Img src={img} alt="" w={200} ratio="1" />
              </button>
            ))}
          </div>
        </div>
        <div className="stack" style={{ ["--gap" as string]: "22px" }}>
          <div>
            <span className="eyebrow">Extra pieces & covers</span>
            <h1 className="display h1" style={{ marginTop: 10 }}>
              {product.name}
            </h1>
          </div>
          <span className="display" style={{ fontSize: 34 }}>
            {priceLabel(product.price)}
          </span>
          <p className="muted lead" style={{ margin: 0 }}>
            {product.description}
          </p>
          <div className="row wrap" style={{ gap: 12 }}>
            <QtyStepper value={qty} onChange={setQty} />
            <button
              className="btn"
              style={{ flex: 1, minWidth: 220, padding: "17px 28px" }}
              onClick={() => cart.add(product, { qty })}
            >
              Add to Cart
              {product.price > 0 ? ` — ${money(product.price * qty)}` : ""}
            </button>
          </div>
          <TrustRow />
        </div>
      </section>
      <PairsWellWith title="Complete your setup" />
    </div>
  );
}
