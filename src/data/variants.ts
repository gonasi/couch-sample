// PDP variant registry: names, tester blurbs and page chrome for each design.

export type Variant = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j";
export const VARIANTS: Variant[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
export const isVariant = (s: string | null | undefined): s is Variant =>
  VARIANTS.includes(s as Variant);

/** What a first-time visitor sees, and the fallback for an unrecognised ?v=. */
export const DEFAULT_VARIANT: Variant = "j";

export interface Chrome {
  ticker: boolean;
  header: "solid" | "transparent";
  footer: boolean;
}

export const DEFAULT_CHROME: Chrome = {
  ticker: true,
  header: "solid",
  footer: true,
};

export interface VariantMeta {
  name: string;
  blurb: string;
  group: "core" | "interactive" | "reference";
  chrome: Chrome;
}

export const VARIANT_META: Record<Variant, VariantMeta> = {
  a: {
    name: "Classic Gallery",
    blurb:
      "Design Option A: sticky gallery with hover zoom, compare sizes, room-fit check, accordions.",
    group: "core",
    chrome: DEFAULT_CHROME,
  },
  b: {
    name: "Editorial Scroll",
    blurb:
      "Design Option B: full-bleed hero, story-led scroll, shop-the-room hotspots, fixed buy bar.",
    group: "core",
    chrome: { ticker: false, header: "transparent", footer: true },
  },
  c: {
    name: "Configurator",
    blurb:
      "Step-by-step builder with a live layout diagram, room view, fabric lens and financing.",
    group: "core",
    chrome: DEFAULT_CHROME,
  },
  d: {
    name: "Conversion",
    blurb:
      "Sale countdown, low-stock cues, bundle tiers, ZIP delivery estimate, express pay, sticky add-to-cart.",
    group: "core",
    chrome: DEFAULT_CHROME,
  },
  e: {
    name: "Long-form",
    blurb:
      "Long-form sales page: spill test, cushion hotspots, deep reviews, Q&A, FAQ tabs, guarantee.",
    group: "core",
    chrome: DEFAULT_CHROME,
  },
  f: {
    name: "Room Planner",
    blurb:
      "Drag modules onto your room, rearrange, undo, check the fit and price your own build.",
    group: "interactive",
    chrome: DEFAULT_CHROME,
  },
  g: {
    name: "Style Quiz",
    blurb:
      "Five quick questions pick your size and color, then a results page with the match preselected.",
    group: "interactive",
    chrome: DEFAULT_CHROME,
  },
  h: {
    name: "Immersive Scroll",
    blurb:
      "Scroll-driven story: a 3D-style couch unboxes, recolors and rearranges as you scroll.",
    group: "interactive",
    chrome: { ticker: false, header: "transparent", footer: true },
  },
  i: {
    name: "Mobile App",
    blurb:
      "App-style page: swipe gallery, double-tap to save, tabs and a draggable bottom-sheet buy box.",
    group: "interactive",
    chrome: { ticker: false, header: "solid", footer: false },
  },
  j: {
    name: "Guided Steps",
    blurb:
      "Retail-reference layout: 360 stage with a thumb rail, numbered option steps that restate each choice, fabric family tabs, to-scale proportions and a scan-to-phone handoff.",
    group: "reference",
    chrome: DEFAULT_CHROME,
  },
};

export const VARIANT_NAMES = Object.fromEntries(
  VARIANTS.map((v) => [v, VARIANT_META[v].name]),
) as Record<Variant, string>;
