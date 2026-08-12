# Lighthouse audit

## Scope and method

The public storefront was audited on **12 August 2026** with Lighthouse against a locally built, production-mode server. This is the relevant measurement for the deployable site because it includes the optimized bundle, compressed responses, route chunking, responsive hero images, and production asset paths. Development-preview results were used only to discover issues; they are not comparable because Vite serves a development module graph.

| Final mobile route | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | **81** | **100** | 82 | **100** | 2.8 s | 4.1 s | 0.012 |
| `/shop` | **82** | **100** | 82 | **100** | 3.5 s | 3.5 s | 0.004 |
| `/about` | **80** | **100** | 82 | **100** | 3.0 s | 4.3 s | 0 |
| `/delivery&returns` | **81** | **100** | 82 | **100** | 3.0 s | 4.1 s | 0 |
| `/faq` | **81** | **100** | 82 | **100** | 3.0 s | 4.1 s | 0 |

The current desktop reference measurements are **95 Performance / 94 Accessibility / 81 Best Practices / 100 SEO** for the homepage and **98 / 90 / 81 / 100** for the shop. Those desktop captures preceded the final shared accessibility corrections, so the final mobile scores above are the authoritative delivered scorecards.

## Remediations applied

The storefront now has Arabic RTL **About**, **Contact**, **Delivery & Returns**, and **FAQ** pages with linked header and footer navigation. Public pages contain a semantic main landmark, responsive touch-target sizing, and mobile-first layout adjustments.

Performance work includes production HTTP compression, public-route code splitting, responsive WebP hero variants served from managed storage, viewport-specific image preloads, lazy loading for below-the-fold artwork, and the exclusion of JSX source-location instrumentation from production bundles. The primary **Home** and **Shop** routes are loaded with the customer shell to avoid an extra route-chunk delay for their page headings.

Accessibility work corrected the shop search and category-control names, decorative logo alt text, footer contrast, and the Delivery & Returns WhatsApp-button contrast. The About image now has explicit dimensions, a mobile-specific source, and priority loading. The shop loading placeholder now reserves the same space as the empty-catalog state, reducing measured mobile cumulative layout shift from **0.188** to **0.004**.

## Remaining observations

The remaining mobile performance opportunities are mainly render delay from the shared JavaScript application shell and normal network variability during the throttled Lighthouse run. The current 687 kB minified main bundle is shared across the storefront because of its e-commerce providers and component library; infrequently visited public, checkout, order, and administrator pages remain code-split. Further material reductions would require a larger dependency-level refactor rather than a safe final-pass change.

Lighthouse continues to report third-party or framework-level observations such as deprecated APIs, missing source maps for the release bundle, and back/forward-cache restoration. These do not block storefront use. The real product catalog still needs to be supplied and audited after launch data is entered, including accurate product-image alt text and image dimensions.

## Validation commands

```bash
pnpm check
pnpm test
pnpm build
```

All commands passed after the final storefront pass. The automated suite contains **14 passing tests** covering authentication, administrator product access, product mutation, order creation, payment-proof handling, order isolation, and public-route contracts.
