import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  Copy,
  Eraser,
  Keyboard,
  Link2,
  Lock,
  Redo2,
  RotateCw,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import {
  COUCHES,
  colorHex,
  type ColorName,
  type ModuleKind,
  type Product,
} from "../data/products";
import { useProductSelection } from "../hooks/useProductSelection";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useBottomOffset } from "../hooks/useBottomOffset";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { money, moneyShort, readStore, writeStore } from "../lib/money";
import {
  CELL_D,
  CELL_W,
  MODULE_PRICING,
  decodeLayout,
  encodeLayout,
  footprint,
  inches,
  matchPreset,
  nearestPreset,
  oneAwayHint,
  pieceCounts,
  priceFor,
  type FitTone,
} from "../lib/layout";
import { buildShareUrl, shareLink } from "../lib/share";
import { capturePointer } from "../lib/pointer";
import LayoutDiagram, { ModuleShape } from "../components/LayoutDiagram";
import { RoomInputs, RoomSvg, WALL, useRoom } from "../components/RoomFit";
import { FitPill, SaveShare } from "../components/Interactive";
import { Breadcrumbs, Stars, Swatches, TrustRow } from "../components/ui";
import { FeatureCards } from "../components/Sections";
import { DeepReviews, FaqTabs, QandA } from "../components/DeepSections";
import {
  DEFAULT_BACK,
  canPlace,
  firstFree,
  freeNear,
  gridFor,
  inGrid,
  initPlanner,
  newId,
  placePreset,
  plannerReducer,
  withIds,
  type PlacedModule,
} from "./roomPlanner";

const PLANNER_KEY = "gh2-planner";
const KINDS: ModuleKind[] = ["corner", "seat", "ottoman"];
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function countsLabel(mods: PlacedModule[]) {
  const c = pieceCounts(mods);
  return KINDS.filter((k) => c[k])
    .map((k) => plural(c[k], k))
    .join(" · ");
}

interface Preview {
  id: string;
  px: number;
  py: number;
  x: number;
  y: number;
  valid: boolean;
}

interface Ghost {
  kind: ModuleKind;
  cx: number;
  cy: number;
  cell: { x: number; y: number; valid: boolean } | null;
}

/** PDP Option F — Room Planner: drag modules onto your floor plan and price the build. */
export default function PdpF({ product }: { product: Product }) {
  const sel = useProductSelection(product);
  const cart = useCart();
  const { toast } = useUI();
  const [params] = useSearchParams();
  const [room, setRoom] = useRoom();
  const grid = gridFor(room);
  const hex = colorHex(sel.color);
  const mobile = useMediaQuery("(max-width: 900px)");

  const [state, dispatch] = useReducer(plannerReducer, undefined, () => {
    const fromUrl = decodeLayout(params.get("layout"));
    if (fromUrl) return initPlanner(withIds(fromUrl));
    const saved = readStore<{ slug: string; layout: string } | null>(
      PLANNER_KEY,
      null,
    );
    const savedLayout =
      saved?.slug === product.slug ? decodeLayout(saved.layout) : null;
    if (savedLayout) return initPlanner(withIds(savedLayout));
    return initPlanner(placePreset(product.layout!, grid));
  });
  const { present, selected } = state;
  const selectedModule = present.find((m) => m.id === selected) ?? null;

  const [live, setLive] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const announce = (msg: string) => setLive(msg);

  /* ----- persistence + size changes from outside the planner ----- */
  useEffect(() => {
    writeStore(PLANNER_KEY, {
      slug: product.slug,
      layout: encodeLayout(present),
    });
  }, [present, product.slug]);

  const pickedRef = useRef<string | null>(null);
  const prevSlug = useRef(product.slug);
  useEffect(() => {
    if (prevSlug.current === product.slug) return;
    prevSlug.current = product.slug;
    if (pickedRef.current === product.slug) {
      pickedRef.current = null;
      return;
    }
    dispatch({ type: "load", modules: placePreset(product.layout!, grid) });
  }, [product.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----- derived ----- */
  const fp = footprint(present);
  const invalidIds = new Set(
    present.filter((m) => !inGrid(grid, m.x, m.y)).map((m) => m.id),
  );
  const front = room.d - (fp.minY + fp.rows) * CELL_D;
  const tone: FitTone =
    invalidIds.size > 0
      ? "no"
      : front >= 36 || !present.length
        ? "great"
        : "tight";
  const fitText =
    tone === "no"
      ? `${plural(invalidIds.size, "piece")} outside the room`
      : !present.length
        ? "Drag pieces into the room"
        : tone === "great"
          ? `Fits with a ${inches(front)} walkway`
          : `Fits, with only ${inches(Math.max(0, front))} to walk`;

  const match = useMemo(() => matchPreset(present), [present]);
  const custom = priceFor(present);
  const price = match ? match.product.price : custom.price;
  const compare = match ? match.product.compare : custom.compare;
  const hint = match ? null : oneAwayHint(present);
  const canBuy = present.length > 0 && invalidIds.size === 0;

  /* ----- actions ----- */
  const addAt = (kind: ModuleKind, cell: { x: number; y: number } | null) => {
    if (!cell) {
      toast("No free space left. Make the room bigger first.", "error");
      announce("No free space left");
      return;
    }
    dispatch({
      type: "add",
      module: {
        id: newId(),
        kind,
        x: cell.x,
        y: cell.y,
        back: [...DEFAULT_BACK[kind]],
      },
    });
    announce(`Added a ${kind} at column ${cell.x + 1}, row ${cell.y + 1}`);
  };

  const rotate = () => {
    if (!selectedModule || selectedModule.kind === "ottoman") return;
    dispatch({ type: "rotate", id: selectedModule.id });
    announce("Rotated");
  };
  const duplicate = () => {
    if (!selectedModule) return;
    const cell = freeNear(present, grid, selectedModule.x, selectedModule.y);
    if (!cell) return announce("No free space to duplicate into");
    dispatch({
      type: "duplicate",
      id: selectedModule.id,
      newId: newId(),
      ...cell,
    });
    announce(`Duplicated the ${selectedModule.kind}`);
  };
  const remove = () => {
    if (!selectedModule) return;
    dispatch({ type: "remove", id: selectedModule.id });
    announce(`Removed the ${selectedModule.kind}`);
  };

  const loadPreset = (p: Product) => {
    dispatch({ type: "load", modules: placePreset(p.layout!, grid) });
    if (p.slug !== product.slug) {
      pickedRef.current = p.slug;
      sel.pickConfig(p.slug, { keepScroll: true });
    }
    announce(`Loaded the ${p.name}`);
  };

  const addBuild = () => {
    if (!canBuy) return;
    if (match) {
      cart.add(match.product, {
        color: sel.color,
        note: match.exact ? undefined : "Custom arrangement",
      });
      return;
    }
    const near = nearestPreset(present);
    const build: Product = {
      id: "custom-build",
      slug: near.slug,
      name: "Custom Cloud Build",
      shortName: "Custom",
      kind: "couch",
      price: custom.price,
      compare: custom.compare,
      blurb: "",
      description: "",
      images: [near.colorImages?.[sel.color as ColorName] ?? near.images[0]],
    };
    cart.add(build, {
      color: sel.color,
      price: custom.price,
      compare: custom.compare,
      note: `${countsLabel(present)} · ${fp.widthIn}" × ${fp.depthIn}"`,
    });
  };

  const share = () =>
    shareLink(
      buildShareUrl(product.slug, {
        v: "f",
        color: sel.color,
        layout: encodeLayout(present),
      }),
      "My Cloud layout",
      toast,
    );

  /* ----- pointer: move modules on the canvas ----- */
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: string;
    grabX: number;
    grabY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const [preview, setPreviewState] = useState<Preview | null>(null);
  const previewRef = useRef<Preview | null>(null);
  const setPreview = (p: Preview | null) => {
    previewRef.current = p;
    setPreviewState(p);
  };

  // Taps on empty floor deselect; swipes there scroll the page (touch-action: pan-y).
  const bgTap = useRef<{ x: number; y: number } | null>(null);

  // Handles are sized in screen pixels, so measure how many px one inch is.
  const [pxPerIn, setPxPerIn] = useState(2);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const vb = svg.viewBox.baseVal;
      if (vb?.width) setPxPerIn(svg.getBoundingClientRect().width / vb.width);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    // Pieces and handles must not scroll the page when dragged, in every browser.
    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as Element).closest?.("[data-module], [data-handle]"))
        e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current) e.preventDefault();
    };
    svg.addEventListener("touchstart", onTouchStart, { passive: false });
    svg.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      ro.disconnect();
      svg.removeEventListener("touchstart", onTouchStart);
      svg.removeEventListener("touchmove", onTouchMove);
    };
  }, [room.w, room.d]);
  const handleR = Math.max(7, 13 / pxPerIn); // ~26px across
  const handleHit = Math.max(handleR, 22 / pxPerIn); // ~44px touch target

  const toRoom = (clientX: number, clientY: number) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x - WALL, y: p.y - WALL };
  };

  const onModuleDown = (e: React.PointerEvent, m: PlacedModule) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const p = toRoom(e.clientX, e.clientY);
    if (!p) return;
    capturePointer(svgRef.current, e.pointerId);
    drag.current = {
      id: m.id,
      grabX: p.x - m.x * CELL_W,
      grabY: p.y - m.y * CELL_D,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    dispatch({ type: "select", id: m.id });
    wrapRef.current?.focus({ preventScroll: true });
  };

  const onSvgMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4)
      return;
    d.moved = true;
    const p = toRoom(e.clientX, e.clientY);
    if (!p) return;
    const px = p.x - d.grabX;
    const py = p.y - d.grabY;
    const x = clamp(Math.round(px / CELL_W), 0, grid.cols - 1);
    const y = clamp(Math.round(py / CELL_D), 0, grid.rows - 1);
    setPreview({
      id: d.id,
      px,
      py,
      x,
      y,
      valid: canPlace(present, grid, d.id, x, y),
    });
  };

  const onSvgUp = (e: React.PointerEvent) => {
    const bg = bgTap.current;
    bgTap.current = null;
    if (bg && !drag.current) {
      if (Math.hypot(e.clientX - bg.x, e.clientY - bg.y) < 8)
        dispatch({ type: "select", id: null });
      return;
    }
    const d = drag.current;
    const pv = previewRef.current;
    drag.current = null;
    setPreview(null);
    if (!d?.moved || !pv) return;
    if (pv.valid) {
      dispatch({ type: "move", id: d.id, x: pv.x, y: pv.y });
      announce(`Moved to column ${pv.x + 1}, row ${pv.y + 1}`);
    } else announce("Blocked: that spot is taken");
  };

  /* ----- pointer: drag new pieces in from the palette ----- */
  const paletteDrag = useRef<{
    kind: ModuleKind;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const [ghost, setGhostState] = useState<Ghost | null>(null);
  const ghostRef = useRef<Ghost | null>(null);
  const setGhost = (g: Ghost | null) => {
    ghostRef.current = g;
    setGhostState(g);
  };

  const onPaletteDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    kind: ModuleKind,
  ) => {
    if (e.button !== 0) return;
    capturePointer(e.currentTarget, e.pointerId);
    paletteDrag.current = {
      kind,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  };
  const onPaletteMove = (e: React.PointerEvent) => {
    const d = paletteDrag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6)
      return;
    d.moved = true;
    const r = svgRef.current?.getBoundingClientRect();
    const over =
      !!r &&
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    const p = over ? toRoom(e.clientX, e.clientY) : null;
    let cell: Ghost["cell"] = null;
    if (p) {
      const x = Math.floor(p.x / CELL_W);
      const y = Math.floor(p.y / CELL_D);
      if (inGrid(grid, x, y))
        cell = { x, y, valid: canPlace(present, grid, null, x, y) };
    }
    setGhost({ kind: d.kind, cx: e.clientX, cy: e.clientY, cell });
  };
  const onPaletteUp = () => {
    const d = paletteDrag.current;
    const g = ghostRef.current;
    paletteDrag.current = null;
    setGhost(null);
    if (!d) return;
    if (!d.moved) addAt(d.kind, firstFree(present, grid));
    else if (g?.cell?.valid) addAt(d.kind, g.cell);
    else if (g?.cell) announce("That spot is taken");
    wrapRef.current?.focus({ preventScroll: true });
  };

  /* ----- keyboard ----- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("input, select, textarea")) return;
    const mod = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    if (mod && key === "z") {
      e.preventDefault();
      dispatch({ type: e.shiftKey ? "redo" : "undo" });
      announce(e.shiftKey ? "Redo" : "Undo");
      return;
    }
    if (mod && key === "y") {
      e.preventDefault();
      dispatch({ type: "redo" });
      return;
    }
    if (mod || e.altKey) return;
    if (["1", "2", "3"].includes(e.key)) {
      e.preventDefault();
      addAt(KINDS[+e.key - 1], firstFree(present, grid));
      return;
    }
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (!selectedModule) return;
    if (arrows[e.key]) {
      e.preventDefault();
      const [dx, dy] = arrows[e.key];
      const nx = selectedModule.x + dx;
      const ny = selectedModule.y + dy;
      if (canPlace(present, grid, selectedModule.id, nx, ny)) {
        dispatch({ type: "move", id: selectedModule.id, x: nx, y: ny });
        announce(`Column ${nx + 1}, row ${ny + 1}`);
      } else announce("Blocked");
    } else if (key === "r") {
      e.preventDefault();
      rotate();
    } else if (key === "d") {
      e.preventDefault();
      duplicate();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      remove();
    } else if (e.key === "Escape") {
      dispatch({ type: "select", id: null });
    }
  };

  /* ----- mobile buy bar ----- */
  useBottomOffset("planner-bar", mobile ? 70 : 0);

  const cellX = (x: number) => x * CELL_W + 1;
  const cellY = (y: number) => y * CELL_D + 1;

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: "Room planner" },
        ]}
      />

      <section className="container" style={{ paddingTop: 18 }}>
        <div
          className="row between wrap"
          style={{ gap: 16, alignItems: "flex-end" }}
        >
          <div>
            <span className="eyebrow">Room planner</span>
            <h1 className="display h1" style={{ marginTop: 10 }}>
              Plan your Cloud, to scale
            </h1>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: 16 }}>
              Drag corners, seats and ottomans into your room. Every square is
              one 33" × 44" module.
            </p>
          </div>
          <div className="row" style={{ gap: 10, fontSize: 14.5 }}>
            <Stars /> 4.9 <span className="muted">· 5,250+ reviews</span>
          </div>
        </div>

        <div className="planner-layout" style={{ marginTop: 26 }}>
          {/* ---------- canvas ---------- */}
          <div
            className="card"
            style={{ overflow: "hidden" }}
            onKeyDown={onKeyDown}
          >
            <div
              className="row between wrap"
              style={{
                gap: 10,
                padding: "12px 14px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                className="row wrap"
                style={{ gap: 8 }}
                aria-label="Add pieces"
              >
                {KINDS.map((k, i) => (
                  <button
                    key={k}
                    className="tool-btn"
                    style={{
                      touchAction: "none",
                      padding: "6px 10px 6px 6px",
                      cursor: "grab",
                    }}
                    onPointerDown={(e) => onPaletteDown(e, k)}
                    onPointerMove={onPaletteMove}
                    onPointerUp={onPaletteUp}
                    onPointerCancel={() => {
                      paletteDrag.current = null;
                      setGhost(null);
                    }}
                    onClick={(e) =>
                      e.detail === 0 && addAt(k, firstFree(present, grid))
                    }
                    title={`Drag in, tap, or press ${i + 1}`}
                  >
                    <svg width="26" height="32" viewBox="0 0 33 44" aria-hidden>
                      <ModuleShape
                        m={{ kind: k, back: DEFAULT_BACK[k] }}
                        x={1}
                        y={1}
                        w={31}
                        h={42}
                        color={hex}
                      />
                    </svg>
                    <span style={{ textAlign: "left", lineHeight: 1.15 }}>
                      <span style={{ display: "block" }}>
                        {MODULE_PRICING[k].label}
                      </span>
                      <span className="muted" style={{ fontSize: 11.5 }}>
                        {moneyShort(MODULE_PRICING[k].price)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="tool-btn"
                  onClick={() => dispatch({ type: "undo" })}
                  disabled={!state.past.length}
                  aria-label="Undo"
                  title="Undo (⌘Z)"
                >
                  <Undo2 size={15} />
                </button>
                <button
                  className="tool-btn"
                  onClick={() => dispatch({ type: "redo" })}
                  disabled={!state.future.length}
                  aria-label="Redo"
                  title="Redo (⇧⌘Z)"
                >
                  <Redo2 size={15} />
                </button>
                <span
                  style={{
                    width: 1,
                    alignSelf: "stretch",
                    background: "var(--line)",
                  }}
                />
                <button
                  className="tool-btn"
                  onClick={rotate}
                  disabled={
                    !selectedModule || selectedModule.kind === "ottoman"
                  }
                  aria-label="Rotate back cushions"
                  title="Rotate (R)"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  className="tool-btn"
                  onClick={duplicate}
                  disabled={!selectedModule}
                  aria-label="Duplicate"
                  title="Duplicate (D)"
                >
                  <Copy size={15} />
                </button>
                <button
                  className="tool-btn"
                  onClick={remove}
                  disabled={!selectedModule}
                  aria-label="Delete piece"
                  title="Delete (⌫)"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  className="tool-btn"
                  onClick={() => {
                    dispatch({ type: "clear" });
                    announce("Cleared the room");
                  }}
                  disabled={!present.length}
                  aria-label="Clear all"
                  title="Clear all"
                >
                  <Eraser size={15} />
                </button>
                <button
                  className="tool-btn desktop-only"
                  onClick={() => setShowKeys((v) => !v)}
                  aria-pressed={showKeys}
                  aria-label="Keyboard shortcuts"
                  title="Keyboard shortcuts"
                >
                  <Keyboard size={15} />
                </button>
              </div>
            </div>

            {showKeys && (
              <div
                className="muted row wrap"
                style={{
                  gap: "6px 16px",
                  padding: "10px 14px",
                  fontSize: 13,
                  background: "var(--bg)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {[
                  ["Arrows", "move"],
                  ["R", "rotate"],
                  ["D", "duplicate"],
                  ["⌫", "delete"],
                  ["1 2 3", "add corner / seat / ottoman"],
                  ["⌘Z", "undo"],
                  ["⇧⌘Z", "redo"],
                ].map(([k, v]) => (
                  <span key={k}>
                    <kbd
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11.5,
                        border: "1px solid var(--line)",
                        borderRadius: 5,
                        padding: "1px 5px",
                        background: "var(--surface)",
                        color: "var(--ink)",
                      }}
                    >
                      {k}
                    </kbd>{" "}
                    {v}
                  </span>
                ))}
              </div>
            )}

            <div
              ref={wrapRef}
              className="dots-bg planner-canvas"
              tabIndex={0}
              aria-label="Room planner. Select a piece, then use arrow keys to move, R to rotate, D to duplicate, Delete to remove."
              style={{ padding: "22px 18px", outline: "none" }}
            >
              <RoomSvg
                room={room}
                modules={[]}
                color={sel.color}
                showWalkway={false}
                maxWidth={720}
                maxHeight="min(62vh, 600px)"
                svgRef={svgRef}
                role="group"
                aria-label={`Floor plan with ${plural(present.length, "piece")}`}
                onPointerMove={onSvgMove}
                onPointerUp={onSvgUp}
                onPointerCancel={() => {
                  bgTap.current = null;
                  drag.current = null;
                  setPreview(null);
                }}
                onPointerDown={(e) => {
                  bgTap.current = { x: e.clientX, y: e.clientY };
                }}
              >
                <defs>
                  <pattern
                    id="planner-hatch"
                    width="8"
                    height="8"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="8"
                      stroke="var(--accent)"
                      strokeWidth="1.2"
                      opacity="0.22"
                    />
                  </pattern>
                </defs>
                {/* snap grid */}
                {Array.from({ length: grid.cols * grid.rows }, (_, i) => {
                  const x = i % grid.cols;
                  const y = Math.floor(i / grid.cols);
                  return (
                    <rect
                      key={i}
                      x={cellX(x)}
                      y={cellY(y)}
                      width={CELL_W - 2}
                      height={CELL_D - 2}
                      rx={3}
                      fill="none"
                      stroke="var(--line)"
                      strokeWidth={0.8}
                      strokeDasharray="3 3"
                    />
                  );
                })}
                {/* walkway in front of the couch */}
                {present.length > 0 && front > 0 && invalidIds.size === 0 && (
                  <g pointerEvents="none">
                    <rect
                      x={0}
                      y={(fp.minY + fp.rows) * CELL_D}
                      width={room.w}
                      height={front}
                      fill="url(#planner-hatch)"
                    />
                    <text
                      x={room.w / 2}
                      y={(fp.minY + fp.rows) * CELL_D + front / 2 + 2}
                      textAnchor="middle"
                      fontFamily="var(--mono)"
                      fontSize={Math.max(6, room.w / 30)}
                      fill="var(--accent)"
                    >
                      {inches(front)} walkway
                    </text>
                  </g>
                )}
                {/* drop target */}
                {(preview || ghost?.cell) && (
                  <rect
                    x={cellX(preview ? preview.x : ghost!.cell!.x) - 1}
                    y={cellY(preview ? preview.y : ghost!.cell!.y) - 1}
                    width={CELL_W}
                    height={CELL_D}
                    rx={5}
                    fill={
                      (preview ? preview.valid : ghost!.cell!.valid)
                        ? "var(--accent)"
                        : "#C2412D"
                    }
                    opacity={0.18}
                    stroke={
                      (preview ? preview.valid : ghost!.cell!.valid)
                        ? "var(--accent)"
                        : "#C2412D"
                    }
                    strokeWidth={1.5}
                    pointerEvents="none"
                  />
                )}
                {/* modules (the dragged one renders last, following the pointer) */}
                {[...present]
                  .sort((a, b) =>
                    a.id === preview?.id ? 1 : b.id === preview?.id ? -1 : 0,
                  )
                  .map((m) => {
                    const dragging = preview?.id === m.id;
                    const x = dragging ? preview!.px + 1 : cellX(m.x);
                    const y = dragging ? preview!.py + 1 : cellY(m.y);
                    const isSel = m.id === selected;
                    return (
                      <g
                        key={m.id}
                        data-module={m.id}
                        role="button"
                        tabIndex={-1}
                        aria-pressed={isSel}
                        aria-label={`${m.kind}, column ${m.x + 1}, row ${m.y + 1}`}
                        onPointerDown={(e) => onModuleDown(e, m)}
                        style={{
                          transition: dragging ? "none" : "transform .15s",
                          filter: dragging
                            ? "drop-shadow(0 6px 8px rgba(0,0,0,.25))"
                            : undefined,
                        }}
                      >
                        <ModuleShape
                          m={m}
                          x={x}
                          y={y}
                          w={CELL_W - 2}
                          h={CELL_D - 2}
                          color={hex}
                          tone={
                            invalidIds.has(m.id)
                              ? "invalid"
                              : isSel
                                ? "selected"
                                : undefined
                          }
                        />
                        {isSel && !dragging && (
                          <rect
                            x={x - 2}
                            y={y - 2}
                            width={CELL_W + 2}
                            height={CELL_D + 2}
                            rx={6}
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth={1.4}
                            pointerEvents="none"
                          />
                        )}
                      </g>
                    );
                  })}
                {/* quick actions on the selected piece */}
                {selectedModule && !preview && (
                  <g>
                    {selectedModule.kind !== "ottoman" && (
                      <g
                        data-handle
                        role="button"
                        aria-label="Rotate"
                        style={{ cursor: "pointer" }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          rotate();
                        }}
                      >
                        <circle
                          cx={cellX(selectedModule.x) + CELL_W - 3}
                          cy={cellY(selectedModule.y) - 1}
                          r={handleHit}
                          fill="transparent"
                        />
                        <circle
                          cx={cellX(selectedModule.x) + CELL_W - 3}
                          cy={cellY(selectedModule.y) - 1}
                          r={handleR}
                          fill="var(--ink)"
                          stroke="var(--bg)"
                          strokeWidth={handleR * 0.12}
                        />
                        <RotateCw
                          x={cellX(selectedModule.x) + CELL_W - 3 - handleR * 0.62}
                          y={cellY(selectedModule.y) - 1 - handleR * 0.62}
                          width={handleR * 1.24}
                          height={handleR * 1.24}
                          color="var(--bg)"
                          strokeWidth={2.6}
                        />
                      </g>
                    )}
                    <g
                      data-handle
                      role="button"
                      aria-label="Delete"
                      style={{ cursor: "pointer" }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        remove();
                      }}
                    >
                      <circle
                        cx={cellX(selectedModule.x) - 1}
                        cy={cellY(selectedModule.y) - 1}
                        r={handleHit}
                        fill="transparent"
                      />
                      <circle
                        cx={cellX(selectedModule.x) - 1}
                        cy={cellY(selectedModule.y) - 1}
                        r={handleR}
                        fill="#C2412D"
                        stroke="var(--bg)"
                        strokeWidth={handleR * 0.12}
                      />
                      <X
                        x={cellX(selectedModule.x) - 1 - handleR * 0.58}
                        y={cellY(selectedModule.y) - 1 - handleR * 0.58}
                        width={handleR * 1.16}
                        height={handleR * 1.16}
                        color="#fff"
                        strokeWidth={2.8}
                      />
                    </g>
                  </g>
                )}
              </RoomSvg>
            </div>

            <div
              className="row between wrap"
              style={{
                gap: 10,
                padding: "12px 14px",
                borderTop: "1px solid var(--line)",
              }}
            >
              <div className="row wrap" style={{ gap: 10 }}>
                <FitPill tone={tone}>{fitText}</FitPill>
                <span className="muted" style={{ fontSize: 13.5 }}>
                  {present.length
                    ? `${plural(present.length, "seat")} · ${inches(fp.widthIn)} × ${inches(fp.depthIn)}`
                    : "Empty room"}
                </span>
              </div>
              <span className="muted" style={{ fontSize: 13 }}>
                {selectedModule
                  ? selectedModule.kind === "ottoman"
                    ? "Drag to move · tap × to remove"
                    : "Drag to move · tap ↻ to turn the back cushions"
                  : "Tap a piece to select it"}
              </span>
            </div>
            <div aria-live="polite" className="visually-hidden">
              {live}
            </div>
          </div>

          {/* ---------- side panel ---------- */}
          <div
            className="stack sticky-col"
            style={{ ["--gap" as string]: "14px", top: 92 }}
          >
            <div className="card card-pad" style={{ display: "grid", gap: 12 }}>
              <div className="row between" style={{ gap: 8 }}>
                <span className="label">Your build</span>
                {match ? (
                  <span className="pill pill-accent row" style={{ gap: 5 }}>
                    <BadgeCheck size={13} />{" "}
                    {match.exact ? "Matches" : "Same pieces as"}{" "}
                    {match.product.shortName}
                  </span>
                ) : present.length ? (
                  <span className="pill pill-soft">Custom build</span>
                ) : null}
              </div>
              <div className="muted" style={{ fontSize: 14.5 }}>
                {present.length ? countsLabel(present) : "No pieces yet"} ·{" "}
                {sel.color}
              </div>
              <div
                className="row wrap"
                style={{ gap: 10, alignItems: "baseline" }}
              >
                <span
                  className="display"
                  style={{ fontSize: 36 }}
                  aria-live="polite"
                >
                  {money(price)}
                </span>
                {compare > price && (
                  <>
                    <s className="muted" style={{ fontSize: 16 }}>
                      {money(compare)}
                    </s>
                    <span className="pill pill-accent">
                      Save {moneyShort(compare - price)}
                    </span>
                  </>
                )}
              </div>
              {match && !match.exact && (
                <div className="muted" style={{ fontSize: 13.5 }}>
                  Bundle price for these pieces, arranged your way.
                </div>
              )}
              {hint && (
                <button
                  className="card row"
                  onClick={() => addAt(hint.kind, firstFree(present, grid))}
                  style={{
                    gap: 10,
                    padding: "10px 12px",
                    background: "var(--bg)",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "var(--ink)",
                    fontSize: 14,
                  }}
                >
                  <Sparkles
                    size={16}
                    color="var(--accent)"
                    style={{ flex: "none" }}
                  />
                  <span>
                    Add 1 {hint.kind} to get the {hint.product.shortName} bundle
                    and{" "}
                    <strong style={{ fontWeight: 600 }}>
                      save {moneyShort(hint.saves)}
                    </strong>
                  </span>
                </button>
              )}
              <button
                className="btn btn-block"
                onClick={addBuild}
                disabled={!canBuy}
                style={{ padding: "16px 22px" }}
              >
                <Lock size={14} />{" "}
                {canBuy
                  ? `Add build to cart — ${money(price)}`
                  : invalidIds.size
                    ? "Move pieces inside the room"
                    : "Add pieces to start"}
              </button>
              <div className="row between wrap" style={{ gap: 8 }}>
                <button
                  className="chip row"
                  style={{ gap: 6 }}
                  onClick={share}
                  disabled={!present.length}
                >
                  <Link2 size={14} /> Share layout
                </button>
                <SaveShare
                  slug={product.slug}
                  color={sel.color}
                  layout="row"
                  params={{ layout: encodeLayout(present) }}
                  title="My Cloud layout"
                />
              </div>
            </div>

            <div className="card card-pad" style={{ display: "grid", gap: 12 }}>
              <span className="label">Your room</span>
              <RoomInputs room={room} onChange={setRoom} compact />
              <span className="muted" style={{ fontSize: 13 }}>
                {grid.cols} × {grid.rows} module grid · boxes fit a {room.door}"
                doorway
              </span>
            </div>

            <div className="card card-pad" style={{ display: "grid", gap: 12 }}>
              <div className="row between">
                <span className="label">Fabric</span>
                <span className="muted" style={{ fontSize: 14 }}>
                  {sel.color}
                </span>
              </div>
              <Swatches value={sel.color} onChange={sel.setColor} size={32} />
            </div>

            <div className="card card-pad" style={{ display: "grid", gap: 10 }}>
              <span className="label">Start from a favorite</span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 8,
                }}
              >
                {COUCHES.map((c) => {
                  const active = match?.exact && match.product.slug === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => loadPreset(c)}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: active
                          ? "2px solid var(--ink)"
                          : "1px solid var(--line)",
                        background: "var(--surface)",
                        color: "var(--ink)",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          height: 54,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <LayoutDiagram
                          modules={c.layout!}
                          color={hex}
                          showDims={false}
                          maxWidth={90}
                          maxHeight={54}
                        />
                      </div>
                      <span style={{ fontSize: 13.5 }}>{c.shortName}</span>
                      <span className="muted" style={{ fontSize: 12.5 }}>
                        {moneyShort(c.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: 40 }}>
        <TrustRow />
      </div>
      <FeatureCards />
      <DeepReviews />
      <QandA />
      <FaqTabs />

      {/* mobile buy bar */}
      {mobile && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 -8px 24px rgba(0,0,0,.08)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 20 }}>
              {money(price)}
            </div>
            <div
              className="muted"
              style={{
                fontSize: 12.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {match ? match.product.shortName : "Custom build"} · {fitText}
            </div>
          </div>
          <button
            className="btn"
            onClick={addBuild}
            disabled={!canBuy}
            style={{ padding: "13px 18px" }}
          >
            Add build
          </button>
        </div>
      )}

      {ghost &&
        createPortal(
          <div
            aria-hidden
            style={{
              position: "fixed",
              left: ghost.cx,
              top: ghost.cy,
              transform: "translate(-50%,-50%) rotate(-4deg)",
              pointerEvents: "none",
              zIndex: 200,
              filter: "drop-shadow(0 10px 16px rgba(0,0,0,.25))",
            }}
          >
            <svg width="52" height="68" viewBox="0 0 33 44">
              <ModuleShape
                m={{ kind: ghost.kind, back: DEFAULT_BACK[ghost.kind] }}
                x={1}
                y={1}
                w={31}
                h={42}
                color={hex}
                tone={ghost.cell && !ghost.cell.valid ? "invalid" : "selected"}
              />
            </svg>
          </div>,
          document.body,
        )}
    </div>
  );
}
