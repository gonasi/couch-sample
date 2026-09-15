import { COUCHES, type Module, type ModuleKind, type Product } from "../data/products";

/** One grid cell is a 33" wide × 44" deep module (matches published dimensions). */
export const CELL_W = 33;
export const CELL_D = 44;

export type Dir = "n" | "e" | "s" | "w";

export interface Footprint {
  minX: number;
  minY: number;
  cols: number;
  rows: number;
  widthIn: number;
  depthIn: number;
}

export function footprint(mods: Pick<Module, "x" | "y">[]): Footprint {
  if (!mods.length)
    return { minX: 0, minY: 0, cols: 0, rows: 0, widthIn: 0, depthIn: 0 };
  const xs = mods.map((m) => m.x);
  const ys = mods.map((m) => m.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const cols = Math.max(...xs) - minX + 1;
  const rows = Math.max(...ys) - minY + 1;
  return { minX, minY, cols, rows, widthIn: cols * CELL_W, depthIn: rows * CELL_D };
}

export function normalize<T extends Module>(mods: T[]): T[] {
  const { minX, minY } = footprint(mods);
  return mods.map((m) => ({ ...m, x: m.x - minX, y: m.y - minY }));
}

export type Counts = Record<ModuleKind, number>;

export function pieceCounts(mods: Pick<Module, "kind">[]): Counts {
  const c: Counts = { corner: 0, seat: 0, ottoman: 0 };
  mods.forEach((m) => c[m.kind]++);
  return c;
}

const ROT: Record<Dir, Dir> = { n: "e", e: "s", s: "w", w: "n" };
export const rotateBack = (back: Dir[]) => back.map((d) => ROT[d]);

const sameCounts = (a: Counts, b: Counts) =>
  a.corner === b.corner && a.seat === b.seat && a.ottoman === b.ottoman;

const MIRROR_X: Record<Dir, Dir> = { n: "n", s: "s", e: "w", w: "e" };
const MIRROR_Y: Record<Dir, Dir> = { n: "s", s: "n", e: "e", w: "w" };

const signature = (mods: Module[]) =>
  normalize(mods)
    .map((m) => `${m.kind}${m.x},${m.y}:${[...m.back].sort().join("")}`)
    .sort()
    .join("|");

function variantsOf(mods: Module[]) {
  const { cols, rows } = footprint(mods);
  const n = normalize(mods);
  const mx = (m: Module): Module => ({
    ...m,
    x: cols - 1 - m.x,
    back: m.back.map((d) => MIRROR_X[d]),
  });
  const my = (m: Module): Module => ({
    ...m,
    y: rows - 1 - m.y,
    back: m.back.map((d) => MIRROR_Y[d]),
  });
  return [n, n.map(mx), n.map(my), n.map((m) => my(mx(m)))];
}

/** A preset couch with the same pieces; `exact` when the arrangement matches too. */
export function matchPreset(
  mods: Module[],
): { product: Product; exact: boolean } | null {
  if (!mods.length) return null;
  const counts = pieceCounts(mods);
  const sigs = new Set(variantsOf(mods).map(signature));
  let loose: Product | null = null;
  for (const p of COUCHES) {
    if (!sameCounts(pieceCounts(p.layout!), counts)) continue;
    if (sigs.has(signature(p.layout!))) return { product: p, exact: true };
    loose = loose ?? p;
  }
  return loose ? { product: loose, exact: false } : null;
}

/** Preset with the closest piece counts (used for images / links of custom builds). */
export function nearestPreset(mods: Module[]): Product {
  const c = pieceCounts(mods);
  const dist = (p: Product) => {
    const pc = pieceCounts(p.layout!);
    return (
      Math.abs(pc.corner - c.corner) +
      Math.abs(pc.seat - c.seat) +
      Math.abs(pc.ottoman - c.ottoman)
    );
  };
  return [...COUCHES].sort((a, b) => dist(a) - dist(b))[0];
}

export const MODULE_PRICING: Record<ModuleKind, { price: number; compare: number; label: string }> = {
  corner: { price: 650, compare: 925, label: "Corner" },
  seat: { price: 575, compare: 820, label: "Seat" },
  ottoman: { price: 495, compare: 705, label: "Ottoman" },
};

export function priceFor(mods: Pick<Module, "kind">[]) {
  return mods.reduce(
    (t, m) => ({
      price: t.price + MODULE_PRICING[m.kind].price,
      compare: t.compare + MODULE_PRICING[m.kind].compare,
    }),
    { price: 0, compare: 0 },
  );
}

/** If adding one piece reaches a cheaper preset bundle, describe it. */
export function oneAwayHint(mods: Module[]) {
  if (!mods.length) return null;
  const c = pieceCounts(mods);
  for (const p of COUCHES) {
    const pc = pieceCounts(p.layout!);
    const diff = (Object.keys(pc) as ModuleKind[]).filter((k) => pc[k] !== c[k]);
    if (diff.length !== 1) continue;
    const k = diff[0];
    if (pc[k] - c[k] !== 1) continue;
    const custom = priceFor([...mods, { kind: k }]).price;
    if (custom > p.price) return { kind: k, product: p, saves: custom - p.price };
  }
  return null;
}

export interface Room {
  w: number; // inches
  d: number; // inches
  door: number; // inches
}

export const DEFAULT_ROOM: Room = { w: 168, d: 144, door: 30 };

export type FitTone = "great" | "tight" | "no";

export function fitInRoom(fp: Pick<Footprint, "widthIn" | "depthIn">, room: Room) {
  const side = (room.w - fp.widthIn) / 2;
  const front = room.d - fp.depthIn;
  const tone: FitTone =
    side < 0 || front < 0 ? "no" : front >= 36 ? "great" : front >= 18 ? "tight" : "no";
  return { side, front, tone, doorOk: room.door >= 28 };
}

export const FIT_COPY: Record<FitTone, string> = {
  great: "Fits with a comfortable walkway",
  tight: "Fits, but the walkway is tight",
  no: "Won't fit this room",
};

const KIND_CODE: Record<ModuleKind, string> = { corner: "c", seat: "s", ottoman: "o" };
const CODE_KIND: Record<string, ModuleKind> = { c: "corner", s: "seat", o: "ottoman" };

export const encodeLayout = (mods: Module[]) =>
  mods.map((m) => `${KIND_CODE[m.kind]}${m.x}${m.y}${m.back.join("")}`).join("_");

export function decodeLayout(raw: string | null | undefined): Module[] | null {
  if (!raw) return null;
  const out: Module[] = [];
  for (const part of raw.split("_")) {
    const hit = /^([cso])(\d)(\d)([nesw]{0,4})$/.exec(part);
    if (!hit) return null;
    out.push({
      kind: CODE_KIND[hit[1]],
      x: +hit[2],
      y: +hit[3],
      back: [...new Set(hit[4].split("").filter(Boolean))] as Dir[],
    });
  }
  return out.length ? out : null;
}

export const inches = (n: number) => `${Math.round(n)}"`;
export const feetInches = (n: number) => {
  const ft = Math.floor(n / 12);
  const inch = Math.round(n - ft * 12);
  return inch ? `${ft}' ${inch}"` : `${ft}'`;
};
