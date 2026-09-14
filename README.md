# GH2 Cloud Couch: demo store

A clickable demo e-commerce store built from the Claude Design redesign ("Website redesign with font pairings"). It has **4 product page (PDP) variations** for product testing.

Everything is mocked: cart, discount codes, checkout, order confirmation, reviews, chat, and newsletter all run in the browser. No backend, no real payments.

**Live:** https://gonasi.github.io/couch-sample/

## PDP variations

|     | Variant          | What it tests                                                                                       | Link                                                                      |
| --- | ---------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| A   | Classic Gallery  | Faithful port of _PDP Option A_: sticky gallery, config cards, accordions                           | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=a) |
| B   | Editorial Scroll | Faithful port of _PDP Option B_: full-bleed hero, long-form story, fixed buy bar                    | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=b) |
| C   | Configurator     | Step-by-step builder (layout → fabric → add-ons → review) with a live top-down diagram              | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=c) |
| D   | Conversion       | Sale countdown, low-stock cues, bundle tiers, express pay, reviews high on the page, sticky ATC bar | [open](https://gonasi.github.io/couch-sample/#/product/5-piece-cloud?v=d) |

Add `?v=a|b|c|d` to any couch URL to pick a variant. The **Demo controls** pill (bottom-right) also switches the variant and the theme (Editorial / Modern / Garden, from the design canvas). The last choice is remembered.

## Things to try

- Home → product card swatches → Add to Cart (cart drawer)
- Cart: change quantity, remove items, discount codes `WELCOME100` (−$100) and `CLOUD30`
- Checkout: use **Autofill demo details**, pick a delivery option and a payment option, place the order, and you'll see the order confirmation
- Header search, Support pages (FAQ, Size Guide with diagrams, Contact form), footer Live Chat, newsletter

State (cart, theme, variant, last order) is stored in `localStorage`. Clear site data to reset.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/couch-sample/
npm run build    # outputs dist/
```

Stack: Vite + React 18 + TypeScript, React Router (HashRouter for GitHub Pages), lucide-react icons, plain CSS driven by the design's theme tokens.

- `src/pdp/`: the four PDP variants
- `src/data/`: products, reviews, content, image URLs
- `src/theme/themes.ts`: themes ported from the design canvas
- `design-reference/`: the original Claude Design files

## Deploy

```bash
npm run deploy   # builds and force-pushes dist/ to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch. It usually goes live about a minute after deploying.

Photos are free Unsplash stock images standing in for GH2 product photography. Swap them in `src/data/images.ts`.
