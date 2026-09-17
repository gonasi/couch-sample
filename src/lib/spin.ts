import {
  SPIN_BY_PRODUCT,
  SPIN_REV,
  type SpinCombo,
  type SpinConfig,
  type SpinSet,
} from "../data/spin.generated";

/** Vite serves this app under `base: "/couch-sample/"`; BASE_URL already ends in "/". */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/** Must stay byte-identical to the slugifier in scripts/fetch-frames.mjs. */
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * The one definition of a combo key, shared in spirit with the fetch script: axes sorted
 * alphabetically by feature code so ordering never matters. The value it returns IS the
 * on-disk directory name, so nothing downstream ever re-slugifies.
 */
export const comboKey = (cfg: SpinConfig) =>
  Object.keys(cfg)
    .sort()
    .map((k) => `${slugify(k)}-${slugify(cfg[k])}`)
    .join("__");

export const frameUrl = (set: SpinSet, combo: string, size: number, frame: number) =>
  asset(
    `frames/v${SPIN_REV}/${set.skuSlug}/${combo}/${size}/${String(frame).padStart(2, "0")}.webp`,
  );

/** What the stage should actually render. Exhaustive by construction. */
export type SpinSource =
  | { kind: "spin"; set: SpinSet; combo: string; size: number; frames: number[] }
  | { kind: "still"; src: string }
  | { kind: "photo"; src: string; reason: "no-set" | "no-combo" };

export const setForProduct = (productSlug: string) => SPIN_BY_PRODUCT[productSlug];

/*
 * The manifest stores the combo space as a cross product of `axes` minus `excluded`, with
 * `spin` holding only the combos that have more than one frame - expanding 1,118 explicit
 * entries into the bundle cost 212 KB. Expanding it here costs nothing measurable and the
 * fetch script verifies the two forms agree before it writes the file.
 */
const keyCache = new WeakMap<SpinSet, Set<string>>();

function validKeys(set: SpinSet): Set<string> {
  let keys = keyCache.get(set);
  if (keys) return keys;
  const axes = Object.keys(set.axes).sort();
  let combos: SpinConfig[] = [{}];
  for (const a of axes) combos = combos.flatMap((c) => set.axes[a].map((v) => ({ ...c, [a]: v })));
  keys = new Set(combos.map(comboKey));
  for (const k of set.excluded) keys.delete(k);
  keyCache.set(set, keys);
  return keys;
}

/** What exists on disk for one combo key, or undefined if that configuration has no files. */
export function comboFor(set: SpinSet, key: string): SpinCombo | undefined {
  const frames = set.spin[key];
  if (frames) return { size: set.size, frames };
  return validKeys(set).has(key) ? { size: set.size, frames: [1] } : undefined;
}

/**
 * The mirror is total over the valid configuration space (every valid combo has at least
 * frame 1), so there is no substitution chain here: a combo either spins, shows a still,
 * or - for accessories, which have no Cylindo set at all - falls back to a photo.
 * Combos that are invalid at source never reach this function; they are disabled in the UI.
 */
export function resolveSpin(
  productSlug: string,
  cfg: SpinConfig,
  photo: string,
): SpinSource {
  const set = setForProduct(productSlug);
  if (!set) return { kind: "photo", src: photo, reason: "no-set" };

  const combo = comboKey(cfg);
  const entry = comboFor(set, combo);
  if (!entry) return { kind: "photo", src: photo, reason: "no-combo" };

  if (entry.frames.length > 1)
    return { kind: "spin", set, combo, size: entry.size, frames: entry.frames };
  return { kind: "still", src: frameUrl(set, combo, entry.size, entry.frames[0]) };
}

/** Spin source for a product at its own default geometry - for places that show a
 *  DIFFERENT product than the page's (quiz results, planner suggestions), whose
 *  geometry axes may not even match the current selection. */
export function resolveDefaultSpin(
  productSlug: string,
  fabricCode: string,
  photo: string,
): SpinSource {
  const base = defaultConfig(productSlug);
  if (!base) return { kind: "photo", src: photo, reason: "no-set" };
  return resolveSpin(productSlug, { ...base, FABRIC: fabricCode }, photo);
}

/** Frame 1 of a combo - the hero thumbnail. */
export function stillFor(productSlug: string, cfg: SpinConfig): string | null {
  const set = setForProduct(productSlug);
  if (!set) return null;
  const key = comboKey(cfg);
  const entry = comboFor(set, key);
  return entry ? frameUrl(set, key, entry.size, entry.frames[0]) : null;
}

/** Default configuration for a product, straight from what was mirrored. */
export function defaultConfig(productSlug: string): SpinConfig | null {
  const set = setForProduct(productSlug);
  return set ? { ...set.defaults } : null;
}

/* ------------------------------ frame cache ------------------------------ */
/*
 * Module-level, so flipping ?v=a -> ?v=e remounts the viewer without re-downloading.
 * Capped: a 640x400 frame is ~1.02 MB decoded, so 32 frames is ~33 MB. Holding several
 * fabrics at once is what gets a tab killed on iOS Safari. Eviction is cheap - the
 * browser's HTTP cache still holds the ~14 KB compressed bytes, so a re-visit to an
 * evicted frame is a cache hit, not a network round trip.
 */
const MAX_CACHED = 40;
const cache = new Map<string, HTMLImageElement>();
const failed = new Set<string>();

export const isCached = (url: string) => cache.has(url);
export const isFailed = (url: string) => failed.has(url);

export function cached(url: string) {
  const img = cache.get(url);
  if (img) {
    cache.delete(url); // re-insert to make it most-recently-used
    cache.set(url, img);
  }
  return img;
}

/** Load + decode, then cache. Decoding before we ever point the <img> at it is what
 *  removes the one-frame flash on slower devices. */
export function preload(url: string): Promise<HTMLImageElement | null> {
  const hit = cached(url);
  if (hit) return Promise.resolve(hit);
  if (failed.has(url)) return Promise.resolve(null);

  const img = new Image();
  img.src = url;
  return (img.decode ? img.decode() : Promise.resolve())
    .then(() => {
      cache.set(url, img);
      while (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value as string);
      return img;
    })
    .catch(() => {
      failed.add(url);
      return null;
    });
}

/**
 * Cardinals first, then repeatedly halve the largest gap. After 4 images every drag
 * lands within n/8 frames of something already decoded, so the spin is usable long
 * before the set finishes loading.
 */
export function preloadOrder(n: number): number[] {
  if (n <= 1) return [0];
  const order = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4)].filter(
    (v, i, a) => a.indexOf(v) === i && v < n,
  );
  const seen = new Set(order);
  let step = Math.max(1, Math.floor(n / 8));
  while (order.length < n && step >= 1) {
    for (let i = 0; i < n; i += step) {
      if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
    if (step === 1) break;
    step = Math.floor(step / 2);
  }
  for (let i = 0; i < n; i++) if (!seen.has(i)) order.push(i);
  return order;
}
