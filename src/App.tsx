import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header, { AnnouncementTicker } from "./components/Header";
import Footer from "./components/Footer";
import DemoSwitcher from "./components/DemoSwitcher";
import { CartDrawer, SearchOverlay, Toasts } from "./components/Overlays";
import { isVariant, useUI } from "./context/UIContext";
import { DEFAULT_CHROME, VARIANT_META } from "./data/variants";
import { getProduct } from "./data/products";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import { About, Policy, ReviewsPage, Support } from "./pages/InfoPages";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname, search, state } = useLocation();
  const v = new URLSearchParams(search).get("v");
  const keepScroll = !!(state as { keepScroll?: boolean } | null)?.keepScroll;
  useEffect(() => {
    // Size switches inside interactive PDPs keep the reader's place.
    if (keepScroll) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, v]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function App() {
  const location = useLocation();
  const { variant } = useUI();

  // Some PDP variants change the page chrome (transparent header, no ticker, no footer).
  const slug = location.pathname.startsWith("/product/")
    ? location.pathname.split("/")[2]
    : null;
  const product = slug ? getProduct(slug) : undefined;
  const v = new URLSearchParams(location.search).get("v");
  const chrome =
    product?.kind === "couch"
      ? VARIANT_META[isVariant(v) ? v : variant].chrome
      : DEFAULT_CHROME;

  return (
    <>
      <ScrollToTop />
      {chrome.ticker && <AnnouncementTicker />}
      <Header transparent={chrome.header === "transparent"} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route
            path="/support"
            element={<Navigate to="/support/faq" replace />}
          />
          <Route path="/support/:topic" element={<Support />} />
          <Route path="/policies/:slug" element={<Policy />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {chrome.footer && <Footer />}
      <CartDrawer />
      <SearchOverlay />
      <Toasts />
      <DemoSwitcher />
    </>
  );
}
