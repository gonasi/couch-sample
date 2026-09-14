import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { galleryFor, type Product } from "../data/products";
import { money, priceLabel } from "../lib/money";
import { Img, Swatches } from "./ui";

export default function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const [color, setColor] = useState("White");
  const isCouch = product.kind === "couch";
  const image = isCouch ? galleryFor(product, color)[0] : product.images[0];
  const savings = product.compare - product.price;

  return (
    <article
      className="card"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <Link
        to={`/product/${product.slug}`}
        style={{ position: "relative", display: "block" }}
        aria-label={product.name}
      >
        <Img
          src={image}
          alt={`${product.name} in ${color}`}
          w={800}
          ratio="4/3"
          className="zoom-hover"
          label={product.shortName}
        />
        {isCouch && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-start",
            }}
          >
            <span className="pill">
              Save {money(savings).replace(".00", "")}
            </span>
            <span className="pill pill-accent">30% off</span>
          </div>
        )}
        {product.bestSeller && (
          <span
            className="pill pill-soft"
            style={{ position: "absolute", top: 12, right: 12 }}
          >
            Best seller
          </span>
        )}
      </Link>
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
        }}
      >
        <Link
          to={`/product/${product.slug}`}
          className="display"
          style={{ fontSize: 22 }}
        >
          {product.name}
        </Link>
        <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{priceLabel(product.price)}</span>
          {savings > 0 && (
            <s className="muted" style={{ fontSize: 15 }}>
              {money(product.compare)}
            </s>
          )}
        </div>
        {isCouch ? (
          <Swatches size={24} value={color} onChange={setColor} />
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: 14.5 }}>
            {product.blurb}
          </p>
        )}
        <button
          className="btn btn-block"
          style={{ marginTop: "auto", padding: 14, fontSize: 13.5 }}
          onClick={() => cart.add(product, { color })}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
