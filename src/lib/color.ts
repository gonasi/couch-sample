const parse = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

/** Lighten (amt > 0) or darken (amt < 0) a hex color. Returns rgb(). */
export function shade(hex: string, amt: number) {
  const [r, g, b] = parse(hex).map((v) => clamp255(v + amt));
  return `rgb(${r},${g},${b})`;
}

/** Linear mix between two hex colors, t = 0 → a, t = 1 → b. Returns hex. */
export function mixHex(a: string, b: string, t: number) {
  const pa = parse(a);
  const pb = parse(b);
  const out = pa.map((v, i) => clamp255(v + (pb[i] - v) * t));
  return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Relative luminance below ~0.3 counts as dark (Black fabric). */
export function isDark(hex: string) {
  const [r, g, b] = parse(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.3;
}
