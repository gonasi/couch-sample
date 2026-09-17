#!/usr/bin/env node
/**
 * Mirror Cylindo spin frames into public/frames, then emit src/data/spin.generated.ts
 * by SCANNING what actually landed on disk.
 *
 * The scan-don't-echo rule is the whole point: the app can never offer a configuration
 * whose frames aren't really there.
 *
 *   node scripts/fetch-frames.mjs --dry-run
 *   node scripts/fetch-frames.mjs --tier=1
 *   node scripts/fetch-frames.mjs --verify
 *
 * Zero dependencies. Node 18+ (native fetch).
 */
import { readFile, writeFile, mkdir, rename, stat, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "scripts/frames.manifest.json");
const CACHE = path.join(ROOT, "scripts/.frames-cache.json");
const OUT_TS = path.join(ROOT, "src/data/spin.generated.ts");

/* ------------------------------- cli ------------------------------- */
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : d;
};
const DRY = flag("dry-run");
const FORCE = flag("force");
const VERIFY = flag("verify");
const PRUNE = flag("prune");
const CONCURRENCY = Number(opt("concurrency", 6));
const ONLY_TIER = opt("tier") ? Number(opt("tier")) : null;
const ONLY_SKU = opt("only", null);

/* ------------------------------ helpers ------------------------------ */
const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const pad = (n) => String(n).padStart(2, "0");
const mb = (b) => (b / 1048576).toFixed(1) + " MB";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Combo key == the on-disk directory name. Axes sorted alphabetically by feature code
 *  so manifest ordering is irrelevant. The app concatenates this string verbatim and
 *  never re-slugifies, which removes the whole class of script/app naming drift. */
const comboKey = (cfg) =>
  Object.keys(cfg).sort().map((k) => `${slug(k)}-${slug(cfg[k])}`).join("__");

/** Worker pool over a flat job list. */
async function pool(items, n, worker) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await worker(items[k], k);
      }
    }),
  );
  return out;
}

/** Decode WebP dimensions from the container. Guards against a 200 that isn't our image. */
function webpSize(buf) {
  if (buf.length < 30) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8X") return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
  if (fourcc === "VP8 ") {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === "VP8L") {
    if (buf[20] !== 0x2f) return null;
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

const problems = [];
const note = (kind, msg) => { problems.push({ kind, msg }); };

/* ------------------------------ network ------------------------------ */
const M = JSON.parse(await readFile(MANIFEST, "utf8"));

const frameUrl = (sku, cfg, frame, size) =>
  `${M.endpoint}/${encodeURIComponent(sku)}/frames/${frame}/?` +
  Object.keys(cfg).sort()
    .map((k) => `feature=${encodeURIComponent(k)}:${encodeURIComponent(cfg[k])}`)
    .join("&") +
  `&size=${size}&encoding=${M.encoding}` +
  (M.removeEnvironmentShadow ? "&removeEnvironmentShadow=true" : "");

async function get(url, { retries = 4 } = {}) {
  for (let a = 0; a <= retries; a++) {
    try {
      const res = await fetch(url);
      // A 404 means an invalid feature combination, not a transient fault. Never retry it.
      if (res.status === 404) return { status: 404, buf: null };
      if (res.ok) return { status: 200, buf: Buffer.from(await res.arrayBuffer()) };
      if (res.status < 500 && res.status !== 429) return { status: res.status, buf: null };
    } catch (e) {
      if (a === retries) return { status: 0, buf: null, err: String(e) };
    }
    await sleep(500 * 2 ** a + Math.random() * 200);
  }
  return { status: 0, buf: null };
}

/* --------------------------- expand the space --------------------------- */
const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, "utf8")) : { configs: {}, valid: {} };

const products = M.products.filter((p) => !ONLY_SKU || slug(p.sku) === ONLY_SKU);

for (const p of products) {
  if (!cache.configs[p.sku]) {
    const res = await fetch(`${M.endpoint}/${encodeURIComponent(p.sku)}/configuration`);
    if (!res.ok) throw new Error(`configuration ${p.sku} -> ${res.status}`);
    cache.configs[p.sku] = await res.json();
  }
  const cfg = cache.configs[p.sku];

  // Slug collisions inside one axis would silently mirror the wrong option. Hard-fail.
  for (const f of cfg.features) {
    const seen = new Map();
    for (const o of f.options) {
      const s = slug(o.code);
      if (seen.has(s)) throw new Error(`slug collision in ${p.sku}.${f.code}: "${seen.get(s)}" and "${o.code}" both -> "${s}"`);
      seen.set(s, o.code);
    }
  }
  p.cfg = cfg;
  p.axes = Object.fromEntries(cfg.features.map((f) => [f.code, f.options.map((o) => o.code)]));
  p.geoAxes = cfg.features.filter((f) => f.code !== "FABRIC").map((f) => f.code);
  p.fabrics = cfg.features.find((f) => f.code === "FABRIC").options.map((o) => o.code);
  p.defaults = Object.fromEntries(
    cfg.features.map((f) => [f.code, (f.options.find((o) => o.isDefault) ?? f.options[0]).code]),
  );
}

const crossProduct = (axes, keys) =>
  keys.reduce((acc, k) => acc.flatMap((c) => axes[k].map((v) => ({ ...c, [k]: v }))), [{}]);

/* ---------------- validate: the endpoint advertises combos that 404 ---------------- */
async function validateGeometry(p) {
  const geoms = crossProduct(p.axes, p.geoAxes);
  const anchor = p.fabrics[0];
  const todo = geoms.filter((g) => cache.valid[`${p.sku}|${comboKey(g)}`] === undefined);
  if (todo.length) {
    process.stderr.write(`  probing ${todo.length} geometry combos for ${p.sku}\n`);
    await pool(todo, 8, async (g) => {
      const r = await get(frameUrl(p.sku, { ...g, FABRIC: anchor }, 1, 200));
      cache.valid[`${p.sku}|${comboKey(g)}`] = r.status === 200;
      if (r.status !== 200 && r.status !== 404) note("probe", `${p.sku} ${comboKey(g)} -> HTTP ${r.status}`);
    });
  }
  const ok = geoms.filter((g) => cache.valid[`${p.sku}|${comboKey(g)}`]);
  for (const g of geoms) {
    if (!cache.valid[`${p.sku}|${comboKey(g)}`]) note("invalid-combo", `${p.sku} ${comboKey(g)} (404 at source)`);
  }
  return ok;
}

for (const p of products) p.validGeoms = await validateGeometry(p);
await writeFile(CACHE, JSON.stringify(cache));

/* ------------------------------ build jobs ------------------------------ */
const ALL_FRAMES = Array.from({ length: M.frameCount }, (_, i) => i + 1);
// combo key -> { sku, productSlug, cfg, size, frames:Set<number> }
const wanted = new Map();

for (const tier of M.tiers) {
  if (ONLY_TIER && tier.id !== ONLY_TIER) continue;
  const size = tier.size ?? M.size;
  const frames = tier.frames === "*" ? ALL_FRAMES : tier.frames;

  for (const p of products) {
    if (tier.skus !== "*" && !tier.skus.includes(p.sku)) continue;
    const geoms = tier.geometry === "default"
      ? [Object.fromEntries(p.geoAxes.map((k) => [k, p.defaults[k]]))]
      : p.validGeoms;
    const fabrics = tier.fabrics === "*" ? p.fabrics
      : tier.fabrics === "anchors" ? M.anchorFabrics.filter((f) => p.fabrics.includes(f))
      : tier.fabrics;

    for (const g of geoms) {
      if (!cache.valid[`${p.sku}|${comboKey(g)}`]) continue;
      for (const fab of fabrics) {
        const cfg = { ...g, FABRIC: fab };
        const key = `${slug(p.sku)}/${comboKey(cfg)}`;
        let e = wanted.get(key);
        if (!e) wanted.set(key, (e = { sku: p.sku, productSlug: p.productSlug, cfg, size, frames: new Set() }));
        for (const f of frames) e.frames.add(f);
      }
    }
  }
}

const outDir = (e) => path.join(ROOT, "public/frames", `v${M.rev}`, slug(e.sku), comboKey(e.cfg), String(e.size));
const jobs = [];
for (const e of wanted.values())
  for (const f of [...e.frames].sort((a, b) => a - b))
    jobs.push({ e, frame: f, file: path.join(outDir(e), `${pad(f)}.webp`) });

/* ------------------------------ dry run ------------------------------ */
// Fitted to measured samples (12.3k@480, 14.3k@640, 17.7k@720, 34.4k@1024); frame 1 is
// the heaviest angle, so stills cost ~1.7x the mixed-angle average.
const estBytes = (size, frame) => 14300 * (size / 640) ** 1.55 * (frame === 1 ? 1.7 : 1);

if (DRY) {
  const spin = [...wanted.values()].filter((e) => e.frames.size > 1);
  const still = [...wanted.values()].filter((e) => e.frames.size === 1);
  const total = jobs.reduce((s, j) => s + estBytes(j.e.size, j.frame), 0);
  const onDisk = jobs.filter((j) => existsSync(j.file)).length;
  console.log(`\n  combos      ${wanted.size}  (${spin.length} spin, ${still.length} still-only)`);
  console.log(`  files       ${jobs.length}  (${onDisk} already on disk, ${jobs.length - onDisk} to fetch)`);
  console.log(`  projected   ~${mb(total)} at size=${M.size}`);
  console.log(`  est. time   ~${Math.round((jobs.length - onDisk) * 0.57 / CONCURRENCY / 60)} min at concurrency ${CONCURRENCY}\n`);
  for (const p of products) {
    const mine = [...wanted.values()].filter((e) => e.sku === p.sku);
    const f = mine.reduce((s, e) => s + e.frames.size, 0);
    console.log(`  ${p.sku.padEnd(16)} ${String(mine.length).padStart(4)} combos  ${String(f).padStart(5)} files  ~${mb(mine.reduce((s, e) => s + [...e.frames].reduce((t, fr) => t + estBytes(e.size, fr), 0), 0))}`);
  }
  if (problems.length) console.log(`\n  ${problems.length} problems (${[...new Set(problems.map((p) => p.kind))].join(", ")}) - run without --dry-run to see them all`);
  console.log();
  process.exit(0);
}

/* ------------------------------ fetch ------------------------------ */
let written = 0, skipped = 0, failed = 0, bytes = 0;

if (!VERIFY) {
  const expect = (size) => ({ w: size, h: Math.round(size * 0.625) });
  process.stderr.write(`fetching ${jobs.length} frames at concurrency ${CONCURRENCY}\n`);
  await pool(jobs, CONCURRENCY, async (j, i) => {
    if (!FORCE) {
      try { if ((await stat(j.file)).size > 0) { skipped++; return; } } catch { /* absent */ }
    }
    await sleep(Math.random() * 120);
    const r = await get(frameUrl(j.e.sku, j.e.cfg, j.frame, j.e.size));
    if (r.status !== 200 || !r.buf) {
      failed++; note("fetch", `${j.e.sku} ${comboKey(j.e.cfg)} frame ${j.frame} -> HTTP ${r.status}`); return;
    }
    const dim = webpSize(r.buf);
    const want = expect(j.e.size);
    if (!dim || dim.w !== want.w || dim.h !== want.h) {
      failed++; note("dimensions", `${j.file.replace(ROOT + "/", "")} got ${dim ? `${dim.w}x${dim.h}` : "non-webp"} want ${want.w}x${want.h}`); return;
    }
    await mkdir(path.dirname(j.file), { recursive: true });
    // .part then rename, so an interrupted run never leaves a truncated file that resume skips.
    await writeFile(j.file + ".part", r.buf);
    await rename(j.file + ".part", j.file);
    written++; bytes += r.buf.length;
    if (written % 100 === 0) process.stderr.write(`  ${written} written, ${skipped} skipped, ${failed} failed\n`);
  });

  /* fabric swatch closeups */
  const fabs = [...new Set(products.flatMap((p) => p.fabrics))];
  await mkdir(path.join(ROOT, M.fabricSwatch.out), { recursive: true });
  await pool(fabs, 4, async (code) => {
    const s = slug(code).replace(/^ciello-/, "");
    const dest = path.join(ROOT, M.fabricSwatch.out, `${s}.jpg`);
    if (!FORCE && existsSync(dest)) return;
    const res = await fetch(`${M.fabricSwatch.base}${s}${M.fabricSwatch.query}`, { redirect: "follow" });
    if (!res.ok) { note("swatch", `${code} -> HTTP ${res.status} (viewer falls back to hex)`); return; }
    const b = Buffer.from(await res.arrayBuffer());
    if (b.length < 1000) { note("swatch", `${code} -> ${b.length} bytes, ignored`); return; }
    await writeFile(dest, b);
  });
}

/* ------------------- scan disk -> src/data/spin.generated.ts ------------------- */
const framesRoot = path.join(ROOT, "public/frames", `v${M.rev}`);
const scanned = new Map(); // skuSlug -> Map<comboKey, {size, frames:number[]}>

if (existsSync(framesRoot)) {
  for (const skuSlug of await readdir(framesRoot)) {
    const combos = new Map();
    for (const combo of await readdir(path.join(framesRoot, skuSlug))) {
      for (const size of await readdir(path.join(framesRoot, skuSlug, combo))) {
        const files = (await readdir(path.join(framesRoot, skuSlug, combo, size))).filter((f) => f.endsWith(".webp"));
        if (!files.length) continue;
        combos.set(combo, { size: Number(size), frames: files.map((f) => Number(f.slice(0, 2))).sort((a, b) => a - b) });
      }
    }
    if (combos.size) scanned.set(skuSlug, combos);
  }
}

if (VERIFY) {
  let bad = 0;
  for (const [skuSlug, combos] of scanned)
    for (const [combo, v] of combos)
      for (const f of v.frames) {
        const p = path.join(framesRoot, skuSlug, combo, String(v.size), `${pad(f)}.webp`);
        const buf = await readFile(p);
        const d = webpSize(buf);
        if (!d || d.w !== v.size) { console.log(`  BAD ${p.replace(ROOT + "/", "")}`); bad++; }
      }
  console.log(`\n  verified ${[...scanned.values()].reduce((s, c) => s + [...c.values()].reduce((t, v) => t + v.frames.length, 0), 0)} files, ${bad} bad\n`);
  process.exit(bad ? 1 : 0);
}

if (PRUNE) {
  for (const [skuSlug, combos] of scanned)
    for (const combo of combos.keys())
      if (!wanted.has(`${skuSlug}/${combo}`)) {
        await rm(path.join(framesRoot, skuSlug, combo), { recursive: true });
        console.log(`  pruned ${skuSlug}/${combo}`);
      }
}

const bySku = new Map(products.map((p) => [slug(p.sku), p]));
const sets = [...scanned.entries()].filter(([s]) => bySku.has(s)).map(([skuSlug, combos]) => {
  const p = bySku.get(skuSlug);
  const present = [...combos.keys()];
  // Only advertise an option if some mirrored combo actually uses it.
  const axes = {};
  for (const [axis, opts] of Object.entries(p.axes)) {
    const used = opts.filter((o) => present.some((k) => k.split("__").includes(`${slug(axis)}-${slug(o)}`)));
    if (used.length) axes[axis] = used;
  }

  /*
   * The combo space is a cross product of `axes` with a handful of holes, and all but ~100
   * combos are a single still at one shared size. Writing 1,118 explicit entries cost 212 KB
   * of bundle, so emit the rectangle + exceptions instead and let the app expand it. The
   * reconstruction is checked against the scan below - if it ever diverges we fail loudly
   * rather than shipping a manifest that lies about what is on disk.
   */
  const sizes = [...new Set([...combos.values()].map((v) => v.size))];
  if (sizes.length > 1) throw new Error(`${p.sku}: mixed sizes ${sizes} - compact form assumes one`);
  const size = sizes[0];

  const spin = {};
  for (const [k, v] of combos) if (v.frames.length > 1) spin[k] = v.frames;

  const axisKeys = Object.keys(axes).sort();
  const full = axisKeys.reduce((acc, k) => acc.flatMap((c) => axes[k].map((v) => ({ ...c, [k]: v }))), [{}]).map(comboKey);
  const excluded = full.filter((k) => !combos.has(k));

  // lossless check: rebuild from (axes, excluded, spin) and compare to the scan
  const rebuilt = new Map(full.filter((k) => !excluded.includes(k))
    .map((k) => [k, { size, frames: spin[k] ?? [1] }]));
  const same = rebuilt.size === combos.size &&
    [...combos].every(([k, v]) => {
      const r = rebuilt.get(k);
      return r && r.size === v.size && r.frames.join() === v.frames.join();
    });
  if (!same) throw new Error(`${p.sku}: compact manifest does not round-trip; widen the representation`);

  const defaultCombo = comboKey(p.defaults);
  return {
    sku: p.sku, skuSlug, productSlug: p.productSlug, axes,
    optionCodes: Object.fromEntries(Object.entries(p.axes).map(([a, o]) => [a, o])),
    labels: Object.fromEntries(p.cfg.features.map((f) => [f.code, Object.fromEntries(f.options.map((o) => [o.code, o.name]))])),
    defaultCombo: combos.has(defaultCombo) ? defaultCombo : present[0],
    defaults: p.defaults,
    size, spin, excluded,
  };
});

const ts = `// GENERATED by scripts/fetch-frames.mjs - do not edit.
// Produced by scanning public/frames/v${M.rev}, so every combo listed here really exists on disk.
// Stored as (axes x axes) minus \`excluded\`, with \`spin\` holding the combos that have more
// than one frame. The script verifies this round-trips against the scan before writing.
export const SPIN_REV = ${M.rev};
export const SPIN_ASPECT = 1.6; // frames are size x round(size * 0.625)

export type SpinAxis = string;
export type SpinConfig = Record<SpinAxis, string>;

export interface SpinCombo {
  /** rendered width in px; height is width * 0.625 */
  size: number;
  /** Cylindo frame numbers present on disk, ascending. length 1 == still only. */
  frames: number[];
}

export interface SpinSet {
  sku: string;
  skuSlug: string;
  /** joins to Product.slug */
  productSlug: string;
  /** option codes that at least one mirrored combo actually uses */
  axes: Record<SpinAxis, string[]>;
  /** every option the source offers, mirrored or not - used to mark unavailable ones */
  optionCodes: Record<SpinAxis, string[]>;
  /** option code -> human label, from Cylindo */
  labels: Record<SpinAxis, Record<string, string>>;
  defaults: SpinConfig;
  defaultCombo: string;
  /** shared render width for every combo in this set */
  size: number;
  /** combo key -> frame numbers, for combos with a full spin */
  spin: Record<string, number[]>;
  /** combo keys inside the cross product that have no files (invalid at source) */
  excluded: string[];
}

export const SPIN_SETS: SpinSet[] = ${JSON.stringify(sets, null, 2)};

export const SPIN_BY_PRODUCT: Record<string, SpinSet | undefined> =
  Object.fromEntries(SPIN_SETS.map((s) => [s.productSlug, s]));
`;
await writeFile(OUT_TS, ts);

/* ------------------------------ report ------------------------------ */
const files = [...scanned.values()].reduce((s, c) => s + [...c.values()].reduce((t, v) => t + v.frames.length, 0), 0);
console.log(`\n  written ${written}  skipped ${skipped}  failed ${failed}  (+${mb(bytes)} this run)`);
console.log(`  on disk ${files} files across ${[...scanned.values()].reduce((s, c) => s + c.size, 0)} combos`);
console.log(`  wrote   src/data/spin.generated.ts (${sets.length} sets)\n`);
if (problems.length) {
  const byKind = problems.reduce((m, p) => ((m[p.kind] ??= []).push(p.msg), m), {});
  for (const [k, list] of Object.entries(byKind)) {
    console.log(`  ${k} (${list.length}):`);
    for (const m of list.slice(0, 6)) console.log(`    - ${m}`);
    if (list.length > 6) console.log(`    ... ${list.length - 6} more`);
  }
  console.log();
}
process.exit(failed ? 1 : 0);
