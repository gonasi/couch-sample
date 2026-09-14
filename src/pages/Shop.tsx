import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LayoutGrid, Ruler } from "lucide-react";
import { ACCESSORIES, ALL_PRODUCTS, COUCHES } from "../data/products";
import ProductCard from "../components/ProductCard";
import { Breadcrumbs } from "../components/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "couches", label: "Couches" },
  { key: "accessories", label: "Extra pieces & covers" },
  { key: "seats-4", label: "Seats 4" },
  { key: "seats-5", label: "Seats 5" },
  { key: "seats-6", label: "Seats 6" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const filter = params.get("filter") ?? "all";
  const sort = params.get("sort") ?? "featured";

  const list = useMemo(() => {
    let l = ALL_PRODUCTS;
    if (filter === "couches") l = COUCHES;
    else if (filter === "accessories") l = ACCESSORIES;
    else if (filter.startsWith("seats-"))
      l = COUCHES.filter((c) => c.seats === Number(filter.split("-")[1]));
    if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [filter, sort]);

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next, { replace: true });
  };

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />
      <section className="container" style={{ paddingTop: 24 }}>
        <span className="eyebrow">The Cloud Collection</span>
        <div
          className="row wrap between"
          style={{ alignItems: "flex-end", gap: 20, margin: "10px 0 28px" }}
        >
          <h1 className="display" style={{ fontSize: "clamp(38px,5vw,64px)" }}>
            Shop All
          </h1>
          <span className="muted">{list.length} products</span>
        </div>
        <div
          className="row wrap between"
          style={{
            gap: 14,
            paddingBottom: 22,
            marginBottom: 28,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="row wrap" style={{ gap: 8 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? "active" : ""}`}
                onClick={() => set("filter", f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="row muted" style={{ gap: 8, fontSize: 14 }}>
            Sort
            <select
              value={sort}
              onChange={(e) => set("sort", e.target.value)}
              className="input input-pill"
              style={{ width: "auto", padding: "9px 14px", fontSize: 14 }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
        <div className="grid-auto">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div
          className="grid-auto section"
          style={{ ["--min" as string]: "300px", ["--gap" as string]: "20px" }}
        >
          <div className="card card-pad row wrap between" style={{ gap: 16 }}>
            <div className="row" style={{ gap: 14 }}>
              <span className="icon-tile" style={{ width: 44, height: 44 }}>
                <LayoutGrid size={20} />
              </span>
              <div>
                <div className="display" style={{ fontSize: 20 }}>
                  Not sure which layout?
                </div>
                <div className="muted" style={{ fontSize: 14.5 }}>
                  Build yours step by step.
                </div>
              </div>
            </div>
            <Link to="/product/5-piece-cloud?v=c" className="btn btn-sm">
              Open builder
            </Link>
          </div>
          <div className="card card-pad row wrap between" style={{ gap: 16 }}>
            <div className="row" style={{ gap: 14 }}>
              <span className="icon-tile" style={{ width: 44, height: 44 }}>
                <Ruler size={20} />
              </span>
              <div>
                <div className="display" style={{ fontSize: 20 }}>
                  Will it fit?
                </div>
                <div className="muted" style={{ fontSize: 14.5 }}>
                  Every size, with diagrams.
                </div>
              </div>
            </div>
            <Link to="/support/size-guide" className="btn btn-outline btn-sm">
              Size guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
