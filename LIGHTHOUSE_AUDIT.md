# Lighthouse audit

## Scope and method

The key public routes were audited on 12 August 2026 using Lighthouse against the managed development preview and the locally built production server. The development-server results are useful for finding missing metadata and accessibility issues, but they intentionally overstate JavaScript and compression problems because Vite serves a development module graph. The production-style result is the relevant baseline for the deployable application.

| Route / build | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| `/` — development preview | 53 | 87 | 82 | 100 |
| `/shop` — development preview | 48 | 90 | 82 | 66 |
| `/cart` — development preview | 52 | 94 | 82 | 66 |
| `/checkout` — development preview | 46 | 94 | 82 | 66 |
| `/` — production-style build with compression | 73 | 94 | 82 | 100 |
| `/products/preview-product` — public route, no live product row | 60 | 94 | 82 | 100 |

## Remediations applied

The document viewport no longer prevents user zooming on mobile. A valid `robots.txt` now allows public pages while excluding administrator, cart, checkout, and customer-order routes from indexing. The homepage hero is preloaded and marked as the high-priority eager image because it is the largest above-the-fold visual. Below-the-fold category, product, and about imagery is lazy-loaded. Public, checkout, customer-order, and administrator routes are split into lazy-loaded chunks so the initial storefront download is smaller. Express production responses now use gzip/Brotli-compatible HTTP compression through the standard `compression` middleware.

## Remaining observations

The final production-style homepage run reached **73 Performance, 94 Accessibility, 82 Best Practices, and 100 SEO**. The remaining performance opportunities are primarily image delivery and unused shared JavaScript. The hero and legacy artwork are intentionally retained for brand fidelity; image delivery can be improved further later by supplying smaller, explicitly sized catalog assets and modern variants for the final product catalog.

The remaining accessibility findings are low-level contrast and redundant-alt warnings inherited from decorative luxury-noir treatments and repeated nearby text. Decorative images use empty alt text where appropriate, and product images use their product names. Before launch, the real catalog should be reviewed with actual image dimensions and confirmed product names so alt text describes the merchandise rather than generic imagery.

A product-detail route was also audited at `/products/preview-product`. The database contained no product row, so this measured the route's public empty/not-found behavior without creating fake merchandise; re-run it after the first real product is entered. The cart and checkout routes are deliberately excluded from indexing, so Lighthouse reports them as not crawlable. That is expected and correct for customer-specific operational pages. The development preview also reports unminified JavaScript and missing compression; those findings are not representative of the production build after bundling and HTTP compression.

## Validation commands

```bash
pnpm check
pnpm test
pnpm build
```

All three commands passed after the final remediation pass. The automated suite contains 12 passing tests across authentication, administrator product access, product mutation, order creation, payment proof handling, and order isolation.
