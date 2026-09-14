import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header, { AnnouncementTicker } from "./components/Header";
import Footer from "./components/Footer";
import DemoSwitcher from "./components/DemoSwitcher";
import { CartDrawer, SearchOverlay, Toasts } from "./components/Overlays";
import { isVariant, useUI } from "./context/UIContext";
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
  const { pathname, search } = useLocation();
  const v = new URLSearchParams(search).get("v");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, v]);
  return null;
}

export default function App() {
  const location = useLocation();
  const { variant } = useUI();

  // PDP B (Editorial Scroll) uses a transparent header over a full-bleed hero and no ticker.
  const slug = location.pathname.startsWith("/product/")
    ? location.pathname.split("/")[2]
    : null;
  const product = slug ? getProduct(slug) : undefined;
  const v = new URLSearchParams(location.search).get("v");
  const editorial =
    product?.kind === "couch" && (isVariant(v) ? v : variant) === "b";

  return (
    <>
      <ScrollToTop />
      {!editorial && <AnnouncementTicker />}
      <Header transparent={editorial} />
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
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <Toasts />
      <DemoSwitcher />
    </>
  );
}
