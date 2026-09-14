import { IMG } from "./images";

export type ColorName = "White" | "Black" | "Light Grey" | "Khaki";

export const COLORS: { name: ColorName; hex: string; stock: number }[] = [
  { name: "White", hex: "#FAFAF8", stock: 14 },
  { name: "Black", hex: "#22221F", stock: 6 },
  { name: "Light Grey", hex: "#C9C7C1", stock: 11 },
  { name: "Khaki", hex: "#B6A27C", stock: 4 },
];

export const colorHex = (name: string) =>
  COLORS.find((c) => c.name === name)?.hex ?? "#FAFAF8";

export type ModuleKind = "corner" | "seat" | "ottoman";
export interface Module {
  x: number;
  y: number;
  kind: ModuleKind;
  /** which sides carry a back cushion */
  back: ("n" | "s" | "e" | "w")[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  kind: "couch" | "accessory";
  price: number;
  compare: number;
  seats?: number;
  pieces?: number;
  blurb: string;
  description: string;
  dims?: { overall: string; seat: string; boxes: string; doorway: string };
  layout?: Module[];
  colorImages?: Record<ColorName, string>;
  images: string[];
  bestSeller?: boolean;
}

export const COUCHES: Product[] = [
  {
    id: "pit4",
    slug: "4-piece-pit-cloud",
    name: "4 Piece “Pit” Cloud",
    shortName: "4 Piece “Pit”",
    kind: "couch",
    price: 2550,
    compare: 3550,
    seats: 4,
    pieces: 4,
    blurb: "Two corners, a seat and an ottoman — the compact pit.",
    description:
      "A four-piece modular pit with a feather-blend top over a high-resilience foam core. Push the ottoman in for a lounger, pull it out for a sofa. Every cover unzips and machine washes.",
    dims: {
      overall: '99" W × 88" D × 33" H',
      seat: 'Seat height 18" · seat depth 44"',
      boxes: 'Ships in 4 boxes, largest 34" × 30" × 26"',
      doorway: 'Fits through a standard 30" doorway',
    },
    layout: [
      { x: 0, y: 0, kind: "corner", back: ["n", "w"] },
      { x: 1, y: 0, kind: "seat", back: ["n"] },
      { x: 2, y: 0, kind: "corner", back: ["n", "e"] },
      { x: 1, y: 1, kind: "ottoman", back: [] },
    ],
    colorImages: {
      White: IMG.whiteLiving,
      Black: IMG.blackSofa,
      "Light Grey": IMG.greySectional,
      Khaki: IMG.beigeSofa,
    },
    images: [
      IMG.greySectional,
      IMG.sunnyLiving,
      IMG.fabricMacro,
      IMG.cushion,
      IMG.coffeeTable,
    ],
  },
  {
    id: "cloud5",
    slug: "5-piece-cloud",
    name: "5 Piece Cloud",
    shortName: "5 Piece",
    kind: "couch",
    price: 2925,
    compare: 4125,
    seats: 5,
    pieces: 5,
    bestSeller: true,
    blurb: "The everyday sectional with a chaise-style ottoman.",
    description:
      "A five-piece modular sectional with a feather-blend top over a high-resilience foam core. Every cover unzips and machine washes, and hidden connectors keep the pieces flush no matter how often you rearrange.",
    dims: {
      overall: '132" W × 88" D × 33" H',
      seat: 'Seat height 18" · seat depth 44"',
      boxes: 'Ships in 5 boxes, largest 34" × 30" × 26"',
      doorway: 'Fits through a standard 30" doorway',
    },
    layout: [
      { x: 0, y: 0, kind: "corner", back: ["n", "w"] },
      { x: 1, y: 0, kind: "seat", back: ["n"] },
      { x: 2, y: 0, kind: "seat", back: ["n"] },
      { x: 3, y: 0, kind: "corner", back: ["n", "e"] },
      { x: 3, y: 1, kind: "ottoman", back: [] },
    ],
    colorImages: {
      White: IMG.whiteSofaLiving,
      Black: IMG.darkSectional,
      "Light Grey": IMG.greyMinimal,
      Khaki: IMG.beigeSectional,
    },
    images: [
      IMG.greyMinimal,
      IMG.whiteLiving,
      IMG.fabricMacro,
      IMG.pillowsBench,
      IMG.cushion,
    ],
  },
  {
    id: "pit6",
    slug: "6-piece-pit-cloud",
    name: "6 Piece “Pit” Cloud",
    shortName: "6 Piece “Pit”",
    kind: "couch",
    price: 3295,
    compare: 4645,
    seats: 6,
    pieces: 6,
    blurb: "Full pit. The configuration everyone upgrades to.",
    description:
      "Sink into oversized seats designed for true lounging. Two corners, two seats and two ottomans make a full pit for movie nights, slow Sundays and full-body relaxation. All covers are removable and washable.",
    dims: {
      overall: '132" W × 88" D × 33" H',
      seat: 'Seat height 18" · seat depth 44"',
      boxes: 'Ships in 6 boxes, largest 34" × 30" × 26"',
      doorway: 'Fits through a standard 30" doorway',
    },
    layout: [
      { x: 0, y: 0, kind: "corner", back: ["n", "w"] },
      { x: 1, y: 0, kind: "seat", back: ["n"] },
      { x: 2, y: 0, kind: "seat", back: ["n"] },
      { x: 3, y: 0, kind: "corner", back: ["n", "e"] },
      { x: 1, y: 1, kind: "ottoman", back: [] },
      { x: 2, y: 1, kind: "ottoman", back: [] },
    ],
    colorImages: {
      White: IMG.whiteGreySofa,
      Black: IMG.darkSectional,
      "Light Grey": IMG.greyLiving,
      Khaki: IMG.beigeSectional,
    },
    images: [
      IMG.greyLiving,
      IMG.darkSectional,
      IMG.cushion,
      IMG.fabricMacro,
      IMG.coffeeTable,
    ],
  },
  {
    id: "corner6",
    slug: "6-piece-corner-pit-cloud",
    name: "6 Piece Corner “Pit” Cloud",
    shortName: "6 Piece Corner",
    kind: "couch",
    price: 3395,
    compare: 4795,
    seats: 6,
    pieces: 6,
    blurb: "An L-shaped corner pit that wraps the room.",
    description:
      "A six-piece corner configuration that wraps two walls, with an ottoman tucked into the corner for a deep lounging pit. Feather-blend over foam, ModuleLock™ connectors, washable everything.",
    dims: {
      overall: '99" W × 132" D × 33" H',
      seat: 'Seat height 18" · seat depth 44"',
      boxes: 'Ships in 6 boxes, largest 34" × 30" × 26"',
      doorway: 'Fits through a standard 30" doorway',
    },
    layout: [
      { x: 0, y: 0, kind: "corner", back: ["n", "w"] },
      { x: 1, y: 0, kind: "seat", back: ["n"] },
      { x: 2, y: 0, kind: "seat", back: ["n"] },
      { x: 0, y: 1, kind: "seat", back: ["w"] },
      { x: 0, y: 2, kind: "seat", back: ["w"] },
      { x: 1, y: 1, kind: "ottoman", back: [] },
    ],
    colorImages: {
      White: IMG.whiteSofaRoom,
      Black: IMG.blackSofa,
      "Light Grey": IMG.greyLivingSofa,
      Khaki: IMG.beigeSofa,
    },
    images: [
      IMG.whiteSofaRoom,
      IMG.wideLiving,
      IMG.whiteGreySofa,
      IMG.fabricMacro,
      IMG.pillowsBench,
    ],
  },
];

export const ACCESSORIES: Product[] = [
  {
    id: "ottoman",
    slug: "extra-ottoman",
    name: "Extra Ottoman",
    shortName: "Ottoman",
    kind: "accessory",
    price: 495,
    compare: 495,
    blurb: "Storage ottoman that locks onto any Cloud.",
    description:
      "A storage ottoman with a lift-off cushion top and the same ModuleLock™ connectors as every Cloud module. Stash blankets, pillows and controllers out of sight.",
    images: [IMG.coffeeTable, IMG.pillowsBench],
  },
  {
    id: "covers",
    slug: "replacement-cover-set",
    name: "Replacement Cover Set",
    shortName: "Cover Set",
    kind: "accessory",
    price: 390,
    compare: 390,
    blurb: "A fresh set of seat, back and base covers.",
    description:
      "Swap colors with the seasons or refresh a well-loved couch. Includes seat, back, arm and base covers for one module. Machine washable.",
    images: [IMG.fabricMacro, IMG.cushion],
  },
  {
    id: "corner",
    slug: "corner-module",
    name: "Corner Module",
    shortName: "Corner",
    kind: "accessory",
    price: 650,
    compare: 650,
    blurb: "Turn any sofa into a sectional.",
    description:
      "A single corner module with two back cushions. Clicks onto the end of any Cloud configuration to add a seat and change the shape.",
    images: [IMG.beigeSofa, IMG.greyMinimal],
  },
  {
    id: "swatches",
    slug: "fabric-swatch-booklet",
    name: "Fabric Swatch Booklet",
    shortName: "Swatches",
    kind: "accessory",
    price: 0,
    compare: 0,
    blurb: "Feel all four colors at home, free.",
    description:
      'A free booklet with 4" samples of every Cloud color in our performance fabric. Ships in 1–2 business days.',
    images: [IMG.pillowsBench, IMG.fabricMacro],
  },
];

export const ALL_PRODUCTS = [...COUCHES, ...ACCESSORIES];

export const getProduct = (slug: string | undefined) =>
  ALL_PRODUCTS.find((p) => p.slug === slug);
export const getById = (id: string) => ALL_PRODUCTS.find((p) => p.id === id)!;

export const DEFAULT_PRODUCT = "5-piece-cloud";

export function galleryFor(product: Product, color: string) {
  const hero = product.colorImages?.[color as ColorName] ?? product.images[0];
  const rest = product.images.filter((img) => img !== hero);
  return [hero, ...rest].slice(0, 5);
}

export const splitPay = (price: number) => price / 4;
