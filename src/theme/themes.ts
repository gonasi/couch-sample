// Ported verbatim from the THEMES object in design-reference/Cloud Couch Site.dc.html
export type ThemeName = "editorial" | "modern" | "garden";

export const THEMES: Record<ThemeName, Record<string, string>> = {
  editorial: {
    bg: "#F7F2EA",
    surface: "#FFFDF9",
    ink: "#241C16",
    muted: "#6E6157",
    accent: "#B4563A",
    accentInk: "#FFF8F4",
    line: "#E4DACB",
    soft: "#EFE7DA",
    display: "'Playfair Display',Georgia,serif",
    body: "'Karla',system-ui,sans-serif",
    radius: "18px",
    dtrack: "0em",
    dweight: "600",
  },
  modern: {
    bg: "#EDEFF3",
    surface: "#FFFFFF",
    ink: "#14171D",
    muted: "#5B6472",
    accent: "#4B5BD6",
    accentInk: "#F3F5FF",
    line: "#DBDFE8",
    soft: "#E3E7EE",
    display: "'Syne',system-ui,sans-serif",
    body: "'DM Sans',system-ui,sans-serif",
    radius: "6px",
    dtrack: "-0.02em",
    dweight: "800",
  },
  garden: {
    bg: "#F2F2EB",
    surface: "#FBFBF6",
    ink: "#1E2419",
    muted: "#5F6A57",
    accent: "#5C7A46",
    accentInk: "#F7FBF3",
    line: "#DCDFD1",
    soft: "#E8E9DE",
    display: "'Instrument Serif',Georgia,serif",
    body: "'Work Sans',system-ui,sans-serif",
    radius: "28px",
    dtrack: "0em",
    dweight: "400",
  },
};

export const THEME_LABELS: Record<ThemeName, string> = {
  editorial: "Editorial",
  modern: "Modern",
  garden: "Garden",
};

export function applyTheme(name: ThemeName) {
  const t = THEMES[name] || THEMES.editorial;
  const r = document.documentElement.style;
  Object.keys(t).forEach((k) => r.setProperty("--" + k, t[k]));
}
