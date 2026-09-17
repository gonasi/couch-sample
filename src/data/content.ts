import { IMG } from "./images";

export const TICKER = [
  "Up to $2,000 Off (30%) — Ends Soon",
  "Cypress Green and Night Sky are Back with Limited Stock!",
  "No sales tax collected at checkout",
  "Free shipping across the lower 48",
];

export const BENEFITS = [
  {
    icon: "paw",
    title: "Pet-Friendly Fabric",
    body: "Handles claws and fur with ease.",
  },
  {
    icon: "shield",
    title: "Resists Daily Wear",
    body: "Built with a 60,000+ double rub rating.",
  },
  {
    icon: "blocks",
    title: "Modular & Secure",
    body: "Hidden connectors prevent sliding and gaps.",
  },
  {
    icon: "leaf",
    title: "Non-Toxic Materials",
    body: "Safe for your home and family.",
  },
] as const;

export const FEATURE_ROWS = [
  {
    title: "No More Stress Over Spills",
    lead: "Life happens... spills, crumbs, paw prints. Everyday use can leave your couch looking worn, stained, and harder to keep clean.",
    body: "Our removable and machine washable covers make cleanup easy and keep your couch looking fresh every day. Even the base covers are removable!",
    image: "washable",
  },
  {
    title: "Tired of uncomfortable couches?",
    lead: "Most couches look good, but don’t feel good. They flatten, shift, and lose comfort.",
    body: "The GH2 Cloud Couch features a plush feather-blend top layered over a supportive foam core, creating deep comfort that stays supportive.",
    image: "cushion",
  },
  {
    title: "Fits Where Other Couches Don’t",
    lead: "Struggling to move your couch through tight doorways, narrow hallways, or awkward spaces?",
    body: "Our modular pieces come in boxes that fit through any home and assemble with ease. Move, rearrange, or expand anytime, your couch adapts to your space.",
    image: "boxes",
  },
  {
    title: "No Sliding. No Gaps.",
    lead: "There’s nothing worse than cushions shifting and gaps forming every time you sit down.",
    body: "The ModuleLock™ System locks each piece in place, keeping your couch tight, stable, and gap-free.",
    image: "connector",
  },
  {
    title: "Hide the Mess Instantly",
    lead: "Tired of clutter taking over your couch and living space?",
    body: "Effortlessly store blankets, pillows, and everyday items inside the ottoman! Everything stays neatly organized, hidden, and within reach.",
    image: "ottoman",
  },
] as const;

export const COMPARISON = {
  columns: ["GH2 Cloud", "RH®", "Other Clouds"],
  rows: [
    { label: "Deep Comfort & Supportive", values: [true, true, false] },
    { label: "Fully Washable Covers", values: [true, false, false] },
    { label: "ModuleLock Connectors", values: [true, false, false] },
    { label: "Pet Friendly Fabric", values: [true, true, false] },
    { label: "Fast & Free Shipping", values: [true, false, true] },
    { label: "Built to Last Structure", values: [true, true, false] },
    { label: "24/7 Customer Support", values: [true, false, false] },
  ],
};

export const PDP_FEATURES = [
  {
    icon: "waves",
    title: "Comfort that holds",
    body: "A feather-blend top layer sits over a foam core, so the seat gives at first touch and still supports you an hour later.",
  },
  {
    icon: "washing",
    title: "Everything washes",
    body: "Seat, back, arm and base covers all unzip and go in the machine. Replace a single cover instead of the whole couch.",
  },
  {
    icon: "blocks",
    title: "Rearranges with you",
    body: "Hidden connectors lock pieces flush. Add an ottoman or corner later and the layout changes in minutes.",
  },
] as const;

export const PDP_FAQ = [
  {
    q: "Will it fit through my door?",
    a: 'It ships in boxes, the largest 34" × 30" × 26", which clears a standard 30" doorway. Assembly happens in the room, so nothing oversized ever has to turn a corner.',
  },
  {
    q: "How do the covers wash?",
    a: "Unzip, machine wash cold on a gentle cycle, tumble dry low. Base covers come off too, which most modular couches do not allow.",
  },
  {
    q: "Can I add pieces later?",
    a: "Yes. Every module uses the same ModuleLock™ connector, so a corner or ottoman bought two years from now attaches to what you already own.",
  },
  {
    q: "What if I don’t like it?",
    a: "Thirty nights to decide. If it is not right we arrange free pickup and refund in full, no restocking fee.",
  },
  {
    q: "Do you offer financing?",
    a: "Yes — split any order into 4 interest-free payments, or choose 12 months at 0% APR for qualifying orders at checkout.",
  },
];

export interface SupportTopic {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    slug: "faq",
    title: "FAQs",
    intro:
      "Everything people ask us before (and after) they bring a Cloud home.",
    sections: [
      ...PDP_FAQ.map((f) => ({ heading: f.q, body: f.a })),
      {
        heading: "Where do you ship?",
        body: "We ship free to all addresses in the contiguous United States. Alaska, Hawaii and Canada ship at a flat rate calculated at checkout.",
      },
      {
        heading: "How long does delivery take?",
        body: "Orders leave our warehouse within 48 hours and typically arrive in 2–5 business days. You will get tracking by email and SMS.",
      },
    ],
  },
  {
    slug: "assembly",
    title: "Assembly Instructions",
    intro: "No tools. One person. About twenty minutes.",
    sections: [
      {
        heading: "1. Unbox in the room",
        body: "Open each box where the couch will live. Every module is vacuum-compressed — give cushions 30 minutes to fully expand.",
      },
      {
        heading: "2. Place the bases",
        body: "Arrange the base units in your chosen layout. Corners go first, then armless seats, then ottomans.",
      },
      {
        heading: "3. Click in the ModuleLock™ connectors",
        body: "Slide each connector into the channel on adjacent bases until you hear a click. Pieces should sit flush with no gap.",
      },
      {
        heading: "4. Add cushions and backs",
        body: "Drop seat cushions onto the bases and stand back cushions against the frame. Fluff and enjoy.",
      },
    ],
  },
  {
    slug: "cleaning",
    title: "Cleaning Guide",
    intro: "Every cover comes off. Here is how to keep it looking new.",
    sections: [
      {
        heading: "Machine washing",
        body: "Unzip covers, turn inside out, close zippers. Wash cold on a gentle cycle with mild detergent. No bleach.",
      },
      {
        heading: "Drying",
        body: "Tumble dry low, or line dry. Put covers back on while very slightly damp for the smoothest fit.",
      },
      {
        heading: "Spot cleaning",
        body: "Blot spills immediately with a clean cloth. Use water and a drop of mild soap, working from the outside in.",
      },
      {
        heading: "Pet hair",
        body: "A rubber glove or lint roller lifts fur quickly. The tight weave keeps hair on the surface rather than in the fabric.",
      },
    ],
  },
  {
    slug: "size-guide",
    title: "Size Guide",
    intro: "Measure twice, lounge forever. Every configuration at a glance.",
    sections: [
      {
        heading: "4 Piece “Pit” Cloud",
        body: '99" W × 88" D × 33" H · seats 4 · ships in 4 boxes',
      },
      {
        heading: "5 Piece Cloud",
        body: '132" W × 88" D × 33" H · seats 5 · ships in 5 boxes',
      },
      {
        heading: "6 Piece “Pit” Cloud",
        body: '132" W × 88" D × 33" H · seats 6 · ships in 6 boxes',
      },
      {
        heading: "6 Piece Corner “Pit” Cloud",
        body: '99" W × 132" D × 33" H · seats 6 · ships in 6 boxes',
      },
      {
        heading: "Seat details",
        body: 'Seat height 18" · seat depth 44" · arm height 24". Largest box 34" × 30" × 26" fits a standard 30" doorway.',
      },
    ],
  },
  {
    slug: "financing",
    title: "Financing",
    intro: "Bring it home now, pay over time.",
    sections: [
      {
        heading: "4 interest-free payments",
        body: "Split any order into four equal payments every two weeks. No interest, no fees when you pay on time.",
      },
      {
        heading: "0% APR for 12 months",
        body: "Orders over $1,500 can qualify for 12 monthly payments at 0% APR, subject to approval. Checking eligibility won’t affect your credit score.",
      },
      {
        heading: "How to apply",
        body: "Choose your financing option at checkout. You will get a decision in seconds.",
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact Us",
    intro: "Real people, around the clock.",
    sections: [
      { heading: "Phone", body: "+1 (833) 442-7632 — 24/7" },
      {
        heading: "Email",
        body: "service@gh2cloud.ca — replies within 4 hours",
      },
      {
        heading: "Live chat",
        body: "Tap the chat bubble on any page, any time.",
      },
    ],
  },
];

export const POLICIES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping Policy",
    body: [
      "We offer free standard shipping to all addresses in the contiguous United States. Orders are processed within 48 hours and arrive in 2–5 business days.",
      "White-glove delivery with in-room assembly and packaging removal is available for $199 at checkout.",
      "You will receive tracking information by email once your order ships. Large orders may arrive in multiple deliveries.",
    ],
  },
  returns: {
    title: "Return and Refund Policy",
    body: [
      "Every Cloud comes with a 30-night home trial. If it isn’t right for you, contact us within 30 days of delivery and we will arrange free pickup.",
      "Refunds are issued to the original payment method within 5–7 business days of pickup. There are no restocking fees.",
      "Accessories and replacement covers can be returned unused within 30 days.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "This is a demo store. No personal information entered on this site is transmitted or stored anywhere other than your own browser.",
      "In a production store this page would describe how customer data is collected, used and protected.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "This website is a product demonstration. No real orders are placed, no payments are processed and no products will be shipped.",
      "Prices, reviews and inventory shown are illustrative only.",
    ],
  },
  warranty: {
    title: "Warranty",
    body: [
      "Frames are covered for 10 years against structural defects. Cushions and connectors are covered for 3 years.",
      "Fabric is covered for 1 year against manufacturing defects. Normal wear, pet damage and stains are not covered — but every cover is replaceable.",
    ],
  },
};

export const SUPPORT_LINKS = [
  { to: "/support/faq", label: "FAQs" },
  { to: "/support/assembly", label: "Assembly Instructions" },
  { to: "/support/cleaning", label: "Cleaning Guide" },
  { to: "/support/size-guide", label: "Size Guide" },
  { to: "/support/financing", label: "Financing" },
  { to: "/support/contact", label: "Contact Us" },
];

/* ---------- interactive widgets ---------- */

export interface HotspotSpot {
  x: number; // % from left
  y: number; // % from top
  title: string;
  body: string;
  /** product id to shop; "couch" means the couch on the current page */
  productId?: string;
}

export interface HotspotScene {
  image: string;
  /** keep the photo's native ratio so the % positions stay put at every width */
  ratio: string;
  alt: string;
  spots: HotspotSpot[];
}

export type HotspotSceneId = "bRoom" | "livingRoom" | "anatomy";

export const HOTSPOT_SCENES: Record<HotspotSceneId, HotspotScene> = {
  bRoom: {
    image: IMG.wideLiving,
    ratio: "19/10",
    alt: "Sunlit open-plan living room with a grey modular sofa",
    spots: [
      {
        x: 51,
        y: 66,
        title: "The Cloud",
        body: "Feather-blend over foam, in any of four washable colors.",
        productId: "couch",
      },
      {
        x: 46,
        y: 85,
        title: "Extra Ottoman",
        body: "Pull up a footrest or push it in for a pit. Hidden storage inside.",
        productId: "ottoman",
      },
      {
        x: 60,
        y: 59,
        title: "Replacement Cover Set",
        body: "Swap colors with the seasons. Every cover unzips and machine washes.",
        productId: "covers",
      },
      {
        x: 38,
        y: 64,
        title: "Feel it first",
        body: "Free booklet of 4\" swatches in every color.",
        productId: "swatches",
      },
    ],
  },
  livingRoom: {
    image: IMG.greyLiving,
    ratio: "3/2",
    alt: "Grey living room with a sofa, loveseat and round coffee table",
    spots: [
      {
        x: 13,
        y: 70,
        title: "The Cloud",
        body: "Rearrange into a sofa, sectional or pit whenever you like.",
        productId: "couch",
      },
      {
        x: 44,
        y: 60,
        title: "Corner Module",
        body: "Clicks onto any Cloud to turn a sofa into a sectional.",
        productId: "corner",
      },
      {
        x: 43,
        y: 76,
        title: "Extra Ottoman",
        body: "Lift-off top with storage for blankets and controllers.",
        productId: "ottoman",
      },
      {
        x: 5,
        y: 52,
        title: "Replacement Cover Set",
        body: "A fresh set of seat, back and base covers.",
        productId: "covers",
      },
    ],
  },
  anatomy: {
    image: IMG.cushion,
    ratio: "3/4",
    alt: "Close-up of a soft cushioned seat with pillows",
    spots: [
      {
        x: 36,
        y: 63,
        title: "Feather-blend topper",
        body: "The soft, sink-in feel everyone talks about.",
      },
      {
        x: 56,
        y: 46,
        title: "Fiber comfort wrap",
        body: "Bounces back after every sit so seats never look slumped.",
      },
      {
        x: 22,
        y: 74,
        title: "High-resilience foam core",
        body: "Support that holds you up an hour later — and a year later.",
      },
      {
        x: 30,
        y: 88,
        title: "Kiln-dried hardwood frame",
        body: "Won’t warp or creak. Backed by a 10-year warranty.",
      },
    ],
  },
};

export interface FinancingTerm {
  id: string;
  label: string;
  months: number;
  apr: number;
  /** bi-weekly pay-in-4 instead of monthly */
  payIn4?: boolean;
}

export const FINANCING_TERMS: FinancingTerm[] = [
  { id: "p4", label: "Pay in 4", months: 2, apr: 0, payIn4: true },
  { id: "6", label: "6 mo", months: 6, apr: 0 },
  { id: "12", label: "12 mo", months: 12, apr: 0 },
  { id: "24", label: "24 mo", months: 24, apr: 7.99 },
  { id: "36", label: "36 mo", months: 36, apr: 9.99 },
];

/** Mock delivery windows (business days) by the first digit of a ZIP code. */
export const ZIP_REGIONS: { name: string; min: number; max: number }[] = [
  { name: "New England", min: 3, max: 5 },
  { name: "Mid-Atlantic", min: 2, max: 4 },
  { name: "Southeast", min: 2, max: 4 },
  { name: "Great Lakes", min: 2, max: 4 },
  { name: "Midwest", min: 3, max: 5 },
  { name: "Plains", min: 3, max: 6 },
  { name: "South Central", min: 2, max: 5 },
  { name: "Mountain West", min: 4, max: 6 },
  { name: "Southwest", min: 3, max: 6 },
  { name: "West Coast", min: 4, max: 7 },
];
