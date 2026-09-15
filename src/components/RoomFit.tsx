import { useEffect, useId, useState, type ReactNode } from "react";
import { DoorOpen, RefreshCw } from "lucide-react";
import { COUCHES, colorHex, type Module } from "../data/products";
import {
  CELL_D,
  CELL_W,
  DEFAULT_ROOM,
  fitInRoom,
  footprint,
  inches,
  type Room,
} from "../lib/layout";
import { readStore, writeStore } from "../lib/money";
import { ModuleShape, type ModuleTone } from "./LayoutDiagram";
import { FitPill } from "./Interactive";

const ROOM_KEY = "gh2-room";
const ROOM_EVENT = "gh2-room-change";

/** Room size shared by every room-aware widget (persisted, synced across components). */
export function useRoom() {
  const [room, setRoomState] = useState<Room>(() =>
    readStore(ROOM_KEY, DEFAULT_ROOM),
  );
  useEffect(() => {
    const sync = () => setRoomState(readStore(ROOM_KEY, DEFAULT_ROOM));
    window.addEventListener(ROOM_EVENT, sync);
    return () => window.removeEventListener(ROOM_EVENT, sync);
  }, []);
  const setRoom = (r: Room) => {
    setRoomState(r);
    writeStore(ROOM_KEY, r);
    window.dispatchEvent(new Event(ROOM_EVENT));
  };
  return [room, setRoom] as const;
}

export const WALL = 30; // padding around the room in the SVG, inches

/**
 * Scaled floor plan in inches. The couch sits centered against the back wall
 * unless `origin` (top-left of the layout, inches from the room's inner corner) is given.
 */
export function RoomSvg({
  room,
  modules,
  color,
  origin,
  tones,
  showWalkway = true,
  maxWidth = 520,
  maxHeight,
  children,
  svgRef,
  ...svgProps
}: {
  room: Room;
  modules: (Module & { id?: string })[];
  color: string;
  origin?: { x: number; y: number };
  tones?: (ModuleTone | undefined)[];
  showWalkway?: boolean;
  maxWidth?: number;
  maxHeight?: string;
  children?: ReactNode;
  svgRef?: React.Ref<SVGSVGElement>;
} & Omit<React.SVGProps<SVGSVGElement>, "ref">) {
  const uid = useId().replace(/:/g, "");
  const fp = footprint(modules);
  const ox = origin?.x ?? Math.max(0, (room.w - fp.widthIn) / 2);
  const oy = origin?.y ?? 0;
  const vbW = Math.max(room.w, ox + fp.widthIn) + WALL * 2;
  const vbH = Math.max(room.d, oy + fp.depthIn) + WALL * 2;
  const fit = fitInRoom(fp, room);
  const hex = colorHex(color);
  const couchBottom = oy + fp.depthIn;
  const doorW = room.door;
  const doorX = Math.max(0, room.w - doorW - 12);
  const fontSize = Math.max(5, Math.min(vbW, vbH * 1.3) / 34);
  const label = {
    fontFamily: "var(--mono)",
    fontSize,
    fill: "var(--muted)",
    letterSpacing: ".04em",
  } as const;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vbW} ${vbH}`}
      style={{
        width: "100%",
        maxWidth,
        maxHeight,
        height: "auto",
        display: "block",
        margin: "0 auto",
        overflow: "visible",
      }}
      role="img"
      aria-label={`Floor plan: ${Math.round(room.w / 12)} by ${Math.round(room.d / 12)} foot room`}
      {...svgProps}
    >
      <defs>
        <pattern
          id={`floor${uid}`}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M12 0H0V12"
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.6"
          />
        </pattern>
        <pattern
          id={`hatch${uid}`}
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
            strokeWidth="1.4"
            opacity="0.35"
          />
        </pattern>
      </defs>
      <g transform={`translate(${WALL} ${WALL})`}>
        <rect width={room.w} height={room.d} fill="var(--bg)" />
        <rect width={room.w} height={room.d} fill={`url(#floor${uid})`} />
        {showWalkway && fit.front > 0 && modules.length > 0 && (
          <g>
            <rect
              x={Math.max(0, ox)}
              y={couchBottom}
              width={Math.min(fp.widthIn, room.w)}
              height={Math.max(0, room.d - couchBottom)}
              fill={`url(#hatch${uid})`}
            />
            <text
              {...label}
              x={ox + fp.widthIn / 2}
              y={couchBottom + (room.d - couchBottom) / 2 + fontSize / 3}
              textAnchor="middle"
              fill="var(--accent)"
            >
              {inches(fit.front)} walkway
            </text>
          </g>
        )}
        {modules.map((m, i) => (
          <ModuleShape
            key={m.id ?? i}
            m={m}
            x={ox + (m.x - fp.minX) * CELL_W + 1}
            y={oy + (m.y - fp.minY) * CELL_D + 1}
            w={CELL_W - 2}
            h={CELL_D - 2}
            color={hex}
            tone={tones?.[i] ?? (fit.tone === "no" ? "invalid" : undefined)}
          />
        ))}
        {children}
        {/* walls with a door gap on the front wall */}
        <g
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinecap="square"
          fill="none"
        >
          <path d={`M0 ${room.d} V0 H${room.w} V${room.d} H${doorX + doorW}`} />
          <path d={`M${doorX} ${room.d} H0`} />
        </g>
        <g stroke="var(--muted)" strokeWidth="1" fill="none">
          <line x1={doorX} y1={room.d} x2={doorX} y2={room.d - doorW} />
          <path
            d={`M${doorX} ${room.d - doorW} A${doorW} ${doorW} 0 0 1 ${doorX + doorW} ${room.d}`}
            strokeDasharray="3 3"
          />
        </g>
        <text {...label} x={room.w / 2} y={-fontSize} textAnchor="middle">
          {Math.round((room.w / 12) * 10) / 10} ft
        </text>
        <text
          {...label}
          x={-fontSize}
          y={room.d / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${-fontSize} ${room.d / 2})`}
        >
          {Math.round((room.d / 12) * 10) / 10} ft
        </text>
        {showWalkway && fit.side > 8 && modules.length > 0 && !origin && (
          <>
            <text {...label} x={ox / 2} y={fp.depthIn / 2} textAnchor="middle">
              {inches(fit.side)}
            </text>
            <text
              {...label}
              x={ox + fp.widthIn + fit.side / 2}
              y={fp.depthIn / 2}
              textAnchor="middle"
            >
              {inches(fit.side)}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** Number input in feet that lets you type freely and only commits valid sizes. */
function FeetInput({
  label,
  inches: value,
  onCommit,
  compact,
}: {
  label: string;
  inches: number;
  onCommit: (inches: number) => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(Math.round((value / 12) * 10) / 10);
  const ft = parseFloat(shown);
  const invalid = draft !== null && !(ft >= 6 && ft <= 40);
  return (
    <label
      className="field"
      style={{ margin: 0, flex: 1, minWidth: compact ? 90 : 110 }}
    >
      <span className="muted" style={{ fontSize: 12.5 }}>
        {label}
      </span>
      <div className="row" style={{ gap: 6 }}>
        <input
          className={`input ${invalid ? "invalid" : ""}`}
          type="number"
          inputMode="decimal"
          min={6}
          max={40}
          step={0.5}
          value={shown}
          onChange={(e) => {
            setDraft(e.target.value);
            const next = parseFloat(e.target.value);
            if (next >= 6 && next <= 40) onCommit(next * 12);
          }}
          onBlur={() => setDraft(null)}
          aria-invalid={invalid}
          style={{ padding: "8px 10px", fontSize: 14 }}
        />
        <span className="muted" style={{ fontSize: 13 }}>
          ft
        </span>
      </div>
    </label>
  );
}

export function RoomInputs({
  room,
  onChange,
  compact,
}: {
  room: Room;
  onChange: (r: Room) => void;
  compact?: boolean;
}) {
  const field = (key: "w" | "d", labelText: string) => (
    <FeetInput
      label={labelText}
      inches={room[key]}
      compact={compact}
      onCommit={(v) => onChange({ ...room, [key]: v })}
    />
  );
  return (
    <div className="row wrap" style={{ gap: 10, alignItems: "flex-end" }}>
      {field("w", "Wall width")}
      {field("d", "Room depth")}
      <label className="field" style={{ margin: 0, minWidth: 96 }}>
        <span className="muted row" style={{ fontSize: 12.5, gap: 4 }}>
          <DoorOpen size={13} /> Doorway
        </span>
        <select
          className="input"
          value={room.door}
          onChange={(e) => onChange({ ...room, door: +e.target.value })}
          style={{ padding: "8px 10px", fontSize: 14 }}
        >
          {[24, 28, 30, 32, 36].map((d) => (
            <option key={d} value={d}>
              {d}"
            </option>
          ))}
        </select>
      </label>
      <button
        className="tool-btn"
        onClick={() => onChange({ ...room, w: room.d, d: room.w })}
        title="Swap width and depth"
        aria-label="Rotate room"
        style={{ height: 38 }}
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
}

/** "Will it fit?" — room size inputs, floor plan and a fit verdict with a smaller-size suggestion. */
export function RoomFitChecker({
  modules,
  color,
  compact,
  onSuggest,
  currentSlug,
}: {
  modules: Module[];
  color: string;
  compact?: boolean;
  onSuggest?: (slug: string) => void;
  currentSlug?: string;
}) {
  const [room, setRoom] = useRoom();
  const fp = footprint(modules);
  const fit = fitInRoom(fp, room);
  const suggestion =
    fit.tone !== "great"
      ? [...COUCHES]
          .filter((c) => c.slug !== currentSlug)
          .sort((a, b) => b.price - a.price)
          .find((c) => {
            const t = fitInRoom(footprint(c.layout!), room).tone;
            return fit.tone === "no" ? t !== "no" : t === "great";
          })
      : undefined;

  const plan = (
    <RoomSvg
      room={room}
      modules={modules}
      color={color}
      maxWidth={compact ? 380 : 520}
    />
  );
  const details = (
    <div style={{ display: "grid", gap: 12 }}>
      <RoomInputs room={room} onChange={setRoom} compact={compact} />
      <div className="row wrap" style={{ gap: 8 }}>
        <FitPill tone={fit.tone} />
        <span className="muted" style={{ fontSize: 13.5 }}>
          Couch {inches(fp.widthIn)} × {inches(fp.depthIn)}
          {fit.tone !== "no" && ` · ${inches(fit.front)} in front`}
        </span>
      </div>
      <div className="muted row" style={{ fontSize: 13.5, gap: 6 }}>
        <DoorOpen size={14} />
        {fit.doorOk
          ? `Every box (largest 34 × 30 × 26") fits through a ${room.door}" doorway.`
          : `A ${room.door}" doorway is tight: boxes need 28" or more.`}
      </div>
      {suggestion && onSuggest && (
        <button
          className="btn btn-sm btn-outline"
          style={{ justifySelf: "start" }}
          onClick={() => onSuggest(suggestion.slug)}
        >
          {fit.tone === "no" ? "Try" : "More room with"} the{" "}
          {suggestion.shortName}
        </button>
      )}
    </div>
  );

  if (compact)
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div className="dots-bg" style={{ borderRadius: 12, padding: 12 }}>
          {plan}
        </div>
        {details}
      </div>
    );
  return (
    <div
      className="grid-auto"
      style={{
        ["--min" as string]: "300px",
        ["--gap" as string]: "28px",
        alignItems: "center",
      }}
    >
      <div className="dots-bg" style={{ borderRadius: 14, padding: 16 }}>
        {plan}
      </div>
      {details}
    </div>
  );
}
