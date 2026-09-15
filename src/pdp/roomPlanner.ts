// Pure state for the Room Planner (variant F): modules on a 33" × 44" grid with undo/redo.
import type { Module, ModuleKind } from "../data/products";
import { footprint, rotateBack, type Dir } from "../lib/layout";

export interface PlacedModule extends Module {
  id: string;
}

export interface PlannerState {
  past: PlacedModule[][];
  present: PlacedModule[];
  future: PlacedModule[][];
  selected: string | null;
}

export type PlannerAction =
  | { type: "add"; module: PlacedModule }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "rotate"; id: string }
  | { type: "duplicate"; id: string; newId: string; x: number; y: number }
  | { type: "remove"; id: string }
  | { type: "load"; modules: PlacedModule[] }
  | { type: "clear" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select"; id: string | null };

const HISTORY = 50;

let seq = 0;
/** Generate ids outside the reducer (StrictMode runs reducers twice). */
export const newId = () =>
  `m${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const withIds = (mods: Module[]): PlacedModule[] =>
  mods.map((m) => ({ ...m, back: [...m.back], id: newId() }));

export const DEFAULT_BACK: Record<ModuleKind, Dir[]> = {
  corner: ["n", "w"],
  seat: ["n"],
  ottoman: [],
};

function commit(
  state: PlannerState,
  present: PlacedModule[],
  selected: string | null = state.selected,
): PlannerState {
  return {
    past: [...state.past, state.present].slice(-HISTORY),
    present,
    future: [],
    selected,
  };
}

export function plannerReducer(
  state: PlannerState,
  action: PlannerAction,
): PlannerState {
  const { present } = state;
  switch (action.type) {
    case "add":
      return commit(state, [...present, action.module], action.module.id);
    case "move": {
      const m = present.find((p) => p.id === action.id);
      if (!m || (m.x === action.x && m.y === action.y)) return state;
      return commit(
        state,
        present.map((p) =>
          p.id === action.id ? { ...p, x: action.x, y: action.y } : p,
        ),
      );
    }
    case "rotate": {
      const m = present.find((p) => p.id === action.id);
      if (!m || m.kind === "ottoman") return state;
      return commit(
        state,
        present.map((p) =>
          p.id === action.id ? { ...p, back: rotateBack(p.back) } : p,
        ),
      );
    }
    case "duplicate": {
      const m = present.find((p) => p.id === action.id);
      if (!m) return state;
      return commit(
        state,
        [
          ...present,
          {
            ...m,
            back: [...m.back],
            id: action.newId,
            x: action.x,
            y: action.y,
          },
        ],
        action.newId,
      );
    }
    case "remove":
      return commit(
        state,
        present.filter((p) => p.id !== action.id),
        null,
      );
    case "load":
      return commit(state, action.modules, null);
    case "clear":
      return present.length ? commit(state, [], null) : state;
    case "undo": {
      if (!state.past.length) return state;
      const prev = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [present, ...state.future],
        selected: prev.some((p) => p.id === state.selected)
          ? state.selected
          : null,
      };
    }
    case "redo": {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, present],
        present: next,
        future: rest,
        selected: next.some((p) => p.id === state.selected)
          ? state.selected
          : null,
      };
    }
    case "select":
      return state.selected === action.id
        ? state
        : { ...state, selected: action.id };
  }
}

export const initPlanner = (modules: PlacedModule[]): PlannerState => ({
  past: [],
  present: modules,
  future: [],
  selected: null,
});

export interface Grid {
  cols: number;
  rows: number;
}

export const gridFor = (room: { w: number; d: number }): Grid => ({
  cols: Math.max(1, Math.min(10, Math.floor(room.w / 33))),
  rows: Math.max(1, Math.min(8, Math.floor(room.d / 44))),
});

export const inGrid = (g: Grid, x: number, y: number) =>
  x >= 0 && y >= 0 && x < g.cols && y < g.rows;

export function canPlace(
  mods: PlacedModule[],
  g: Grid,
  id: string | null,
  x: number,
  y: number,
) {
  return (
    inGrid(g, x, y) && !mods.some((m) => m.id !== id && m.x === x && m.y === y)
  );
}

/** First free cell, scanning from the back wall. */
export function firstFree(mods: PlacedModule[], g: Grid) {
  for (let y = 0; y < g.rows; y++)
    for (let x = 0; x < g.cols; x++)
      if (canPlace(mods, g, null, x, y)) return { x, y };
  return null;
}

/** A free cell next to (x, y): right, below, left, above — else anywhere. */
export function freeNear(mods: PlacedModule[], g: Grid, x: number, y: number) {
  const around = [
    [x + 1, y],
    [x, y + 1],
    [x - 1, y],
    [x, y - 1],
  ];
  const hit = around.find(([cx, cy]) => canPlace(mods, g, null, cx, cy));
  return hit ? { x: hit[0], y: hit[1] } : firstFree(mods, g);
}

/** Center a preset layout against the back wall of the grid. */
export function placePreset(mods: Module[], g: Grid): PlacedModule[] {
  const fp = footprint(mods);
  const dx = Math.max(0, Math.floor((g.cols - fp.cols) / 2)) - fp.minX;
  return withIds(mods).map((m) => ({ ...m, x: m.x + dx, y: m.y - fp.minY }));
}
