// Style quiz (variant G): questions, scoring and plain-language reasons.
import {
  COLORS,
  getProduct,
  type ColorName,
  type Product,
} from "./products";
import { IMG } from "./images";

export type QuizIcon =
  | "home"
  | "sofa"
  | "open"
  | "corner"
  | "one"
  | "few"
  | "many"
  | "film"
  | "armchair"
  | "bed"
  | "wine"
  | "moon"
  | "sparkle"
  | "paw"
  | "baby"
  | "heart";

export interface QuizOption {
  label: string;
  sub: string;
  icon?: QuizIcon;
  image?: string;
}

export interface QuizQuestion {
  title: string;
  subtitle: string;
  short: string[];
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    title: "How big is the space?",
    subtitle: "Think about the wall the couch will sit against.",
    short: ["Small room", "Medium room", "Large room", "Corner"],
    options: [
      { label: "Cozy", sub: "Wall under 12 ft", icon: "home" },
      { label: "Medium", sub: "Wall 12–15 ft", icon: "sofa" },
      { label: "Open plan", sub: "Lots of floor to fill", icon: "open" },
      { label: "A corner", sub: "Two walls to wrap", icon: "corner" },
    ],
  },
  {
    title: "Who’s piling on?",
    subtitle: "On a normal night, not the holidays.",
    short: ["1–2 people", "3–4 people", "5+ people", "Movie nights"],
    options: [
      { label: "Just me or us two", sub: "Room to sprawl", icon: "one" },
      { label: "Three or four", sub: "The whole household", icon: "few" },
      { label: "Five or more", sub: "Everyone gets a seat", icon: "many" },
      {
        label: "Movie-night host",
        sub: "Friends over most weekends",
        icon: "film",
      },
    ],
  },
  {
    title: "What will it mostly be for?",
    subtitle: "Pick the one that sounds most like you.",
    short: ["Everyday sitting", "Lounging", "Hosting", "Sleepovers"],
    options: [
      {
        label: "Everyday sitting",
        sub: "Coffee, laptop, TV",
        icon: "armchair",
      },
      { label: "Lying down", sub: "Naps and full stretch-outs", icon: "bed" },
      { label: "Hosting", sub: "Conversation and drinks", icon: "wine" },
      { label: "Sleepovers", sub: "A guest bed in a pinch", icon: "moon" },
    ],
  },
  {
    title: "Pets or kids at home?",
    subtitle: "Every Cloud cover washes. This just tunes the color.",
    short: ["No pets or kids", "Pets", "Kids", "Pets and kids"],
    options: [
      { label: "Neither", sub: "Grown-ups only", icon: "sparkle" },
      { label: "Pets", sub: "Fur, paws, the occasional claw", icon: "paw" },
      { label: "Kids", sub: "Snacks, markers, forts", icon: "baby" },
      { label: "Both", sub: "Beautiful chaos", icon: "heart" },
    ],
  },
  {
    title: "Which room feels like yours?",
    subtitle: "Go with your gut.",
    short: ["Bright & airy", "Moody", "Warm natural", "Soft minimal"],
    options: [
      {
        label: "Bright & airy",
        sub: "Light walls, lots of sun",
        image: IMG.whiteLiving,
      },
      {
        label: "Moody",
        sub: "Deep tones, low lamps",
        image: IMG.darkSectional,
      },
      {
        label: "Warm natural",
        sub: "Wood, linen, plants",
        image: IMG.beigeSectional,
      },
      {
        label: "Soft minimal",
        sub: "Calm greys, clean lines",
        image: IMG.greyMinimal,
      },
    ],
  },
];

/** Size order used by the score table. */
const SIZES = [
  "4-piece-pit-cloud",
  "5-piece-cloud",
  "6-piece-pit-cloud",
  "6-piece-corner-pit-cloud",
];

/** [question][answer][size] */
const SIZE_SCORES = [
  [
    [3, 1, 0, 0],
    [1, 3, 2, 1],
    [0, 2, 3, 2],
    [0, 1, 1, 4],
  ],
  [
    [3, 2, 0, 0],
    [1, 3, 2, 2],
    [0, 1, 3, 3],
    [0, 1, 3, 2],
  ],
  [
    [1, 3, 1, 2],
    [2, 1, 3, 2],
    [0, 2, 2, 3],
    [1, 1, 3, 2],
  ],
];
const MAX_SIZE_SCORE = 10;

const VIBE_COLOR: ColorName[] = ["White", "Black", "Khaki", "Light Grey"];
const PET_ADJUST: Partial<Record<ColorName, number>>[] = [
  {},
  { White: -1, "Light Grey": 1, Khaki: 1 },
  { "Light Grey": 1, Khaki: 1 },
  { White: -1, "Light Grey": 2, Black: 1 },
];

const COLOR_REASON: Record<ColorName, string> = {
  White: "White keeps a bright room feeling light and open",
  Black: "Black grounds a moody room and hides everyday wear",
  Khaki: "Khaki warms up wood, linen and plants",
  "Light Grey": "Light Grey stays calm and hides fur and crumbs",
};

export interface Recommendation {
  product: Product;
  alt: Product;
  color: ColorName;
  match: number;
  altMatch: number;
  reasons: string[];
}

const matchPct = (score: number) =>
  Math.max(70, Math.min(98, Math.round(62 + (36 * score) / MAX_SIZE_SCORE)));

export function recommend(answers: number[]): Recommendation {
  const scores = SIZES.map((_, s) =>
    SIZE_SCORES.reduce((t, q, qi) => t + q[answers[qi]][s], 0),
  );
  const ranked = SIZES.map((slug, i) => ({
    p: getProduct(slug)!,
    score: scores[i],
  })).sort((a, b) => b.score - a.score || a.p.price - b.p.price);
  const best = ranked[0];
  const alt = ranked[1];

  const vibe = VIBE_COLOR[answers[4]];
  const colorScores = COLORS.map((c) => ({
    name: c.name,
    score: (c.name === vibe ? 3 : 0) + (PET_ADJUST[answers[3]][c.name] ?? 0),
  })).sort(
    (a, b) =>
      b.score - a.score || (a.name === vibe ? -1 : b.name === vibe ? 1 : 0),
  );
  const color = colorScores[0].name;
  const p = best.p;
  const reasons = reasonsFor(answers, p, color);

  return {
    product: p,
    alt: alt.p,
    color,
    match: matchPct(best.score),
    altMatch: Math.min(matchPct(alt.score), matchPct(best.score) - 3),
    reasons,
  };
}

/** Plain-language reasons a couch + color fits the answers. */
export function reasonsFor(answers: number[], p: Product, color: string) {
  const vibe = VIBE_COLOR[answers[4]];
  const width = p.dims!.overall.split(" × ")[0].replace(" W", "");
  const roomReason = [
    `Sized for a smaller wall at ${width} wide`,
    `Right-sized for a medium room at ${width} wide`,
    `Big enough to anchor an open-plan space`,
    p.slug.includes("corner")
      ? `Wraps a corner so you use two walls, not one`
      : `Fits along one wall of a corner nook at ${width} wide`,
  ][answers[0]];
  const peopleReason = [
    `Room for two to sprawl out without touching`,
    `Seats ${p.seats} with nobody stuck on an arm`,
    `Seats ${p.seats}, so everyone gets a real spot`,
    `Pull the ottomans in for pit mode on movie night`,
  ][answers[1]];
  const useReason = [
    `A foam core that still holds you up an hour later`,
    `44" deep seats made for full stretch-outs`,
    `Pull pieces apart into conversation mode when guests arrive`,
    `Push the pieces together for a guest bed`,
  ][answers[2]];
  const homeReason = [
    null,
    `Pet-friendly weave, and every cover unzips and washes`,
    `Every cover, even the base, goes in the washing machine`,
    `Washable covers and a snag-resistant weave for paws and sticky hands`,
  ][answers[3]];
  const c = color as ColorName;
  const colorReason = COLOR_REASON[c]
    ? c === vibe
      ? COLOR_REASON[c]
      : `${COLOR_REASON[c]}, a smart swap for ${vibe} in a busy home`
    : null;
  const stock = COLORS.find((x) => x.name === color)?.stock ?? 99;
  const reasons = [roomReason, peopleReason, useReason, homeReason, colorReason].filter(
    (r): r is string => !!r,
  );
  if (stock <= 6) reasons.push(`Heads up: only ${stock} left in ${color}`);
  return reasons;
}

export const encodeAnswers = (a: number[]) => a.join("");
export function decodeAnswers(raw: string | null | undefined): number[] | null {
  if (!raw || !/^[0-3]{5}$/.test(raw)) return null;
  return raw.split("").map(Number);
}

