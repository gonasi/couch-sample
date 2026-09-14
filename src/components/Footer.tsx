import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useUI } from "../context/UIContext";
import { Modal } from "./ui";

export default function Footer() {
  const { toast } = useUI();
  const [email, setEmail] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast("Please enter a valid email address.", "error");
      return;
    }
    toast("You’re on the list! Check your inbox for 10% off.", "success");
    setEmail("");
  };

  const col = (
    title: string,
    links: {
      label: string;
      to?: string;
      onClick?: () => void;
      href?: string;
    }[],
  ) => (
    <div>
      <h4 className="display" style={{ fontSize: 19, marginBottom: 16 }}>
        {title}
      </h4>
      <div style={{ display: "grid", gap: 10, fontSize: 15 }}>
        {links.map((l) =>
          l.to ? (
            <Link key={l.label} to={l.to}>
              {l.label}
            </Link>
          ) : (
            <a
              key={l.label}
              href={l.href ?? "#"}
              onClick={(e) => {
                if (l.onClick) {
                  e.preventDefault();
                  l.onClick();
                }
              }}
              className="row"
              style={{ gap: 9 }}
            >
              {l.label}
            </a>
          ),
        )}
      </div>
    </div>
  );

  return (
    <footer className="site-footer">
      <div
        className="container grid-auto"
        style={{
          ["--min" as string]: "200px",
          ["--gap" as string]: "40px",
          paddingTop: 72,
          paddingBottom: 32,
        }}
      >
        <div>
          <h4 className="display" style={{ fontSize: 19, marginBottom: 16 }}>
            Need Help?
          </h4>
          <div style={{ display: "grid", gap: 10, fontSize: 15 }}>
            <a href="tel:+18334427632" className="row" style={{ gap: 9 }}>
              <Phone size={16} />
              +1 (833) 442-7632
            </a>
            <a
              href="mailto:service@gh2cloud.ca"
              onClick={(e) => {
                e.preventDefault();
                toast("Demo: this would open your email app.");
              }}
              className="row"
              style={{ gap: 9 }}
            >
              <Mail size={16} />
              service@gh2cloud.ca
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setChatOpen(true);
              }}
              className="row"
              style={{ gap: 9 }}
            >
              <MessageCircle size={16} />
              24/7 Live Chat
            </a>
            <Link to="/product/fabric-swatch-booklet">Get a Fabric Patch</Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast("Accessibility preferences saved for this session.");
              }}
            >
              Accessibility Menu
            </a>
          </div>
        </div>
        {col("Shop & Explore", [
          { label: "Shop All", to: "/shop" },
          { label: "Extra Pieces", to: "/shop?filter=accessories" },
          { label: "Extra Covers", to: "/product/replacement-cover-set" },
          { label: "Assembly Instructions", to: "/support/assembly" },
          { label: "Size Guide", to: "/support/size-guide" },
          { label: "Fabric & Materials", to: "/support/cleaning" },
          { label: "Reviews", to: "/reviews" },
        ])}
        {col("About Us", [
          { label: "Contact Us", to: "/support/contact" },
          { label: "FAQ’s", to: "/support/faq" },
          { label: "Warranty", to: "/policies/warranty" },
          { label: "Blogs", to: "/about" },
          { label: "Our Story", to: "/about" },
          { label: "View My Order", to: "/order/latest" },
        ])}
        {col("Policies", [
          { label: "Shipping Policy", to: "/policies/shipping" },
          { label: "Return and Refund Policy", to: "/policies/returns" },
          { label: "Privacy Policy", to: "/policies/privacy" },
          { label: "Terms of Service", to: "/policies/terms" },
        ])}
        <div>
          <h4 className="display" style={{ fontSize: 19, marginBottom: 16 }}>
            Stay in Touch
          </h4>
          <p
            style={{
              fontSize: 15,
              opacity: 0.85,
              margin: "0 0 14px",
              lineHeight: 1.55,
            }}
          >
            Join our mailing list for exclusive updates and offers.
          </p>
          <form onSubmit={subscribe} className="row wrap" style={{ gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              style={{
                flex: 1,
                minWidth: 140,
                fontSize: 14,
                padding: "12px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.28)",
                background: "transparent",
                color: "var(--bg)",
              }}
            />
            <button type="submit" className="btn btn-accent btn-sm">
              Join
            </button>
          </form>
          <div className="row" style={{ gap: 16, marginTop: 18, fontSize: 14 }}>
            {["Instagram", "Facebook", "Pinterest"].map((s) => (
              <a
                key={s}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast(`Demo: would open GH2 on ${s}.`);
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div
        className="container row between wrap"
        style={{ paddingBottom: 40, fontSize: 13, opacity: 0.6, gap: 12 }}
      >
        <span>© 2026 GH2 Cloud</span>
        <span>
          Demo store for product testing — no real orders or payments.
        </span>
      </div>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </footer>
  );
}

const REPLIES: [RegExp, string][] = [
  [
    /ship|deliver/i,
    "Orders ship within 48 hours and arrive in 2–5 business days — free across the lower 48.",
  ],
  [
    /return|trial|refund/i,
    "You get 30 nights to try it. If it’s not right, we pick it up free and refund in full.",
  ],
  [
    /wash|clean|stain/i,
    "Every cover unzips, including the base. Machine wash cold, tumble dry low.",
  ],
  [
    /size|fit|door|dimension/i,
    'The largest box is 34" × 30" × 26" and fits a standard 30" doorway. Check our Size Guide for every layout.',
  ],
  [
    /pet|dog|cat/i,
    "Our performance fabric is rated 60,000+ double rubs and resists snags from claws.",
  ],
];

function ChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ from: "bot" | "me"; text: string }[]>([
    {
      from: "bot",
      text: "Hi! I’m Ava from GH2. Ask me anything about shipping, sizing, washing or returns.",
    },
  ]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [msgs],
  );

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const q = text;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setText("");
    const reply =
      REPLIES.find(([re]) => re.test(q))?.[1] ??
      "Great question! A specialist will follow up by email shortly. Anything else I can help with?";
    setTimeout(() => setMsgs((m) => [...m, { from: "bot", text: reply }]), 700);
  };

  return (
    <Modal open={open} onClose={onClose} width={420} label="Live chat">
      <div style={{ color: "var(--ink)" }}>
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="display" style={{ fontSize: 20 }}>
            Live Chat
          </div>
          <div className="muted row" style={{ fontSize: 13, gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9,
                background: "#3aa55d",
              }}
            />{" "}
            Typically replies instantly
          </div>
        </div>
        <div
          style={{
            height: 320,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--bg)",
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.from === "me" ? "flex-end" : "flex-start",
                background: m.from === "me" ? "var(--ink)" : "var(--surface)",
                color: m.from === "me" ? "var(--bg)" : "var(--ink)",
                border: m.from === "me" ? 0 : "1px solid var(--line)",
                padding: "10px 14px",
                borderRadius: 16,
                maxWidth: "80%",
                fontSize: 14.5,
                lineHeight: 1.45,
                animation: "fadeUp .2s ease",
              }}
            >
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={send}
          className="row"
          style={{ padding: 12, gap: 8, borderTop: "1px solid var(--line)" }}
        >
          <input
            className="input input-pill"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            aria-label="Message"
          />
          <button
            className="icon-btn"
            type="submit"
            aria-label="Send"
            style={{ background: "var(--ink)", color: "var(--bg)", border: 0 }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Modal>
  );
}
