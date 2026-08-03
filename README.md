# NORDHEM

A fictional minimalist Scandinavian fashion label — elevated basics in natural fibres, for people who want their wardrobe settled rather than solved.

- **Tagline:** _Clothes that ask nothing of you._
- **Mission:** We make a small number of pieces very well, and then we make them again.
- **Aesthetic:** warm paper neutrals, muted clay accent, thin serif headings (Cormorant Garamond) over a light geometric sans (Jost), generous whitespace, restrained motion.

## Running locally

```bash
bun install     # or: npm install
bun run dev     # or: npm run dev
```

The app runs at `http://localhost:8080`.

```bash
bun run build   # production build
```

## Tech

React 19 + Vite + Tailwind CSS v4, with **TanStack Router** for file-based routing (this template's router — `react-router-dom` is not used). Product data is plain hardcoded JSON; there is no backend. The cart lives in React context and persists to `localStorage`.

## Folder structure

```
src/
  assets/              hero, lookbook and product imagery (ES6 imports)
    products/
  components/
    Nav.tsx            sticky header: logo, links, cart count
    Footer.tsx         brand links, socials, newsletter
    ProductCard.tsx    grid card with hover secondary image + "Quick view"
    Newsletter.tsx     validated email capture with success state
  data/
    products.json      10 products across 4 categories (name, price, category,
                       image key, sizes, description, details, featured)
    products.ts        loads the JSON, resolves image imports, exposes
                       `products`, `categories`, `getProduct`, `formatPrice`, `lookbook`
  lib/
    cart.tsx           CartProvider + useCart (add / remove / setQty / subtotal,
                       persisted to localStorage)
  routes/              file-based pages (one file per URL)
    __root.tsx         shell: fonts, global meta, CartProvider, Nav, Footer
    index.tsx          / — hero, brand teaser, featured collection, lookbook strip, newsletter
    shop.tsx           /shop — grid with category filter and price sorting
    product.$productId.tsx  /product/:id — gallery, sizes, add to cart, related
    lookbook.tsx       /lookbook — editorial grid
    about.tsx          /about — story, founder quote, values
    contact.tsx        /contact — validated form with success state
    cart.tsx           /cart — line items, quantities, subtotal
  styles.css           the design system: color tokens (oklch), fonts, and
                       reusable utilities (`btn-solid`, `btn-outline`, `field`,
                       `eyebrow`, `link-underline`)
```

## Design system

All colours, fonts and component styles are tokens/utilities in `src/styles.css` — components never hardcode colours. Adding a colour means adding it to `:root` and registering it under `@theme inline`.

## Responsive

Mobile-first, verified at 375px, 768px and 1440px. Navigation collapses to a menu below `md`; product grids run 2 → 3 → 4 columns.
