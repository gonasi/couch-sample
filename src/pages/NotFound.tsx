import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="page container"
      style={{ padding: "120px 24px", textAlign: "center" }}
    >
      <p className="eyebrow">404</p>
      <h1
        className="display"
        style={{ fontSize: "clamp(36px,5vw,60px)", margin: "12px 0 16px" }}
      >
        This page took a nap.
      </h1>
      <p className="muted lead" style={{ margin: "0 0 28px" }}>
        We couldn’t find what you were looking for.
      </p>
      <div className="row wrap" style={{ gap: 10, justifyContent: "center" }}>
        <Link to="/" className="btn">
          Go home
        </Link>
        <Link to="/shop" className="btn btn-outline">
          Shop all
        </Link>
      </div>
    </div>
  );
}
