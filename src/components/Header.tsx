import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { SUPPORT_LINKS, TICKER } from "../data/content";

export function AnnouncementTicker() {
  const group = (
    <div className="ticker-group">
      {TICKER.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
  return (
    <div className="ticker" role="marquee">
      <div className="ticker-track">
        {group}
        {group}
      </div>
    </div>
  );
}

export default function Header({
  transparent = false,
}: {
  transparent?: boolean;
}) {
  const { count } = useCart();
  const { openDrawer, setSearchOpen } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const isTransparent = transparent && !scrolled && !menuOpen;
  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "accent" : "";

  return (
    <header
      className={`site-header ${isTransparent ? "transparent" : ""}`}
      style={transparent ? { position: "fixed", left: 0, right: 0 } : undefined}
    >
      <div className="header-inner">
        <nav className="nav">
          <button
            className="nav-btn mobile-only"
            aria-label="Open menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink to="/" end className={(s) => `desktop-only ${navClass(s)}`}>
            Home
          </NavLink>
          <NavLink to="/shop" className={(s) => `desktop-only ${navClass(s)}`}>
            Shop
          </NavLink>
          <div className="dropdown desktop-only">
            <button className="nav-btn">
              Support <ChevronDown size={14} />
            </button>
            <div className="dropdown-menu">
              {SUPPORT_LINKS.map((l) => (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <Link to="/" className="logo" aria-label="GH2 home">
          GH2
        </Link>
        <div className="nav" style={{ justifyContent: "flex-end", gap: 20 }}>
          <button
            className="nav-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={17} />
            <span className="desktop-only">Search</span>
          </button>
          <button
            className="nav-btn"
            onClick={openDrawer}
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={17} />
            <span className="desktop-only">Cart</span>
            <span className={`cart-badge ${bump ? "bump" : ""}`}>{count}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            padding: "12px 16px 20px",
            animation: "fadeUp .2s ease",
          }}
        >
          <div
            className="stack"
            style={{ ["--gap" as string]: "2px", fontSize: 17 }}
          >
            <Link to="/" style={{ padding: "10px 0" }}>
              Home
            </Link>
            <Link to="/shop" style={{ padding: "10px 0" }}>
              Shop All
            </Link>
            <Link to="/reviews" style={{ padding: "10px 0" }}>
              Reviews
            </Link>
            <div
              className="label muted"
              style={{ marginTop: 12, marginBottom: 4 }}
            >
              Support
            </div>
            {SUPPORT_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{ padding: "8px 0", fontSize: 15.5 }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
