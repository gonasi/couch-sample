# GH2 Cloud Couch: demo store

A clickable demo e-commerce store built from the Claude Design redesign ("Website redesign with font pairings"). It has **9 product page (PDP) variations** for product testing: five core layouts and four interactive concepts.

Everything is mocked: cart, discount codes, checkout, order confirmation, reviews, chat, and newsletter all run in the browser. No backend, no real payments.

**Live:** https://gonasi.github.io/couch-sample/

## PDP variations

### Core layouts

|     | Variant          | What it tests                                                                                                                      | Link                                                                      |
| --- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| A   | Classic Gallery  | Port of _PDP Option A_: sticky gallery with hover zoom, compare-sizes modal, "Will it fit?" room check, accordions                | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=a) |
| B   | Editorial Scroll | Port of _PDP Option B_: full-bleed hero, story-led scroll, shop-the-room hotspots, fabric magnifier, room check, fixed buy bar     | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=b) |
| C   | Configurator     | Step-by-step builder (layout → fabric → add-ons → review) with a live diagram, a "Room" view, fabric lens and financing calculator | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=c) |
| D   | Conversion       | Sale countdown, low-stock cues, bundle tiers, financing plans, ZIP delivery estimate, express pay, sticky ATC bar                  | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=d) |
| E   | Long-form        | Sales page: deep reviews, Q&A, FAQ tabs, press, a wipe-the-spill demo, cushion-layer hotspots, financing plans, guarantee          | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=e) |

### Interactive concepts

|     | Variant          | What it tests                                                                                                                                  | Link                                                                      |
| --- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| F   | Room Planner     | Drag corners, seats and ottomans onto a to-scale floor plan; rotate, undo/redo, keyboard shortcuts, fit check, live bundle pricing, share link | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=f) |
| G   | Style Quiz       | Five questions recommend a size and color with a match score and reasons; results are shareable (`&q=`)                                       | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=g) |
| H   | Immersive Scroll | Scroll-driven story: an isometric couch arrives in boxes, clicks together, recolors, morphs between sizes and explodes into cushion layers    | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=h) |
| I   | Mobile App       | App-style page: swipe gallery, double-tap to save, pinch-zoom viewer, sticky tabs, draggable bottom-sheet buy box                              | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=i) |

Add `?v=a` … `?v=i` to any couch URL to pick a variant, and `&color=Khaki` (or White, Black, Light Grey) to preselect a color. The **Demo controls** pill (bottom-right) also switches the variant and the theme (Editorial / Modern / Garden, from the design canvas). The last choice is remembered.

## Things to try

- Home → product card swatches → Add to Cart (cart drawer)
- Cart: change quantity, remove items, discount codes `WELCOME100` (−$100) and `CLOUD30`
- Checkout: use **Autofill demo details**, pick a delivery option and a payment option, place the order, and you'll see the order confirmation
- Header search, Support pages (FAQ, Size Guide with diagrams, Contact form), footer Live Chat, newsletter
- Photo viewer (A, E, review photos, I): double-click or double-tap to zoom, scroll or pinch to zoom, drag to pan
- Room fit (A, B, C, F): enter your wall width, room depth and doorway to see the couch drawn to scale
- Room Planner (F): drag pieces in from the palette, tap one then press R to rotate, arrows to move, ⌘Z to undo; add a custom build to the cart
- Style Quiz (G): press 1–4 to answer, tap an answer chip on the results to change it
- Mobile App (I): best at phone width; drag the bottom sheet up, double-tap a photo to save it

State (cart, theme, variant, color, room size, planner layout, wishlist, last order) is stored in `localStorage`. Clear site data to reset.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/couch-sample/
npm run build    # outputs dist/
```

Stack: Vite + React 18 + TypeScript, React Router (HashRouter for GitHub Pages), lucide-react icons, plain CSS driven by the design's theme tokens.

- `src/pdp/`: the nine PDP variants (`roomPlanner.ts` holds the planner's undo/redo reducer)
- `src/components/Interactive.tsx`, `Magnify.tsx`, `RoomFit.tsx`, `BottomSheet.tsx`, `IsoCouch.tsx`: reusable interactive widgets
- `src/data/variants.ts`: variant names, tester blurbs and page chrome
- `src/data/`: products, reviews, content, image URLs
- `src/theme/themes.ts`: themes ported from the design canvas
- `design-reference/`: the original Claude Design files

## Deploy

```bash
npm run deploy   # builds and force-pushes dist/ to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch. It usually goes live about a minute after deploying.

Photos are free Unsplash stock images standing in for GH2 product photography. Swap them in `src/data/images.ts`.
