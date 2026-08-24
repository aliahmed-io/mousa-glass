# Performance candidate decision — 24 August 2026

## Scope

This note records a narrowly bounded re-check of the **remaining published performance gate**. It does not change the Arabic RTL storefront, administrator access, authentication, catalog staging, merchant data, payment settings, checkout block, or order controls.

## Evidence reviewed

The cache-busted published Lighthouse captures identify one unused-JavaScript resource on each public route: the shared `index-DK3jsXCv.js` entry. The audited Home sample attributes 37,078 bytes of unused code within a 102,854-byte transferred resource; the Shop sample attributes 36,536 bytes within a 103,049-byte resource. Both samples also attribute the highest response time to the HTML document itself: about 2,346 ms for Home and 1,893 ms for Shop. These are the directly recorded diagnostics in the raw published reports.[1] [2]

| Candidate | Measured evidence | Decision |
| --- | --- | --- |
| Remove application-owned code from the shared entry | The prior source-map reassessment found only roughly 14 kB of unminified application source in a framework-dominated shared graph. Existing direct tRPC import and root error-boundary split experiments did not reduce first-load bytes. | **No change retained.** Removing cart state, authenticated navigation, staged-catalog disclosure, or shared settings would trade required behavior or safety clarity for an unproven gain. |
| Defer the shared stylesheet or duplicate critical CSS | The published audits identify the stylesheet as render-blocking, but the prior review found no LCP saving and documented material RTL first-paint, focus, contrast, and layout-stability risks. | **No change retained.** A critical-CSS split needs new published evidence and a dedicated visual/accessibility regression plan before it could be considered. |
| Optimize initial document response | The slowest recorded resource in both samples is the HTML document, not a static asset. | **No application rewrite retained.** The current evidence remains consistent with variable managed cold-path response; server rendering was previously deferred because it would add hydration and request work to this path. |

> The remaining public-performance checklist item stays open. This is a measured non-change, not a claim that the Home or Shop routes meet a launch target.

## Safe boundary preserved

The protected snapshot at `bd9a0895` was validated by GitHub Actions run [`32681957371`](https://github.com/aliahmed-io/mousa-glass/actions/runs/32681957371). It completed frozen installation, production dependency audit, type checking, all 66 tests, and the production build. The GitHub default branch was not changed. This validation covers the evidence-only CI record, not a performance improvement.

## Built-document attribution

A follow-up inspection found that the local production `index.html` is 370,256 bytes raw and 105,894 bytes gzip-compressed. Its single large inline script is 259,423 characters and is injected by the template-managed `vite-plugin-manus-runtime` plugin, not by storefront source. The plugin is part of the managed project template and has no documented production-disable option in its installed interface; it provides runtime/editor functionality through an inline `manus-runtime` script.[4] [5]

| Finding | Technical implication | Safe decision |
| --- | --- | --- |
| Large HTML payload contains a template-managed inline runtime | It plausibly contributes to document-transfer and parse cost, distinct from the application’s 36.5–37.1 KiB unused shared JavaScript finding. | Keep the runtime intact. Removing or conditionally suppressing an undocumented management/runtime component would be a speculative platform-behavior change. |
| Debug collector is already development-only | The project’s own debug collector returns the source document unchanged in production. | No change required. |

This attribution narrows the next performance investigation: a platform-supported method to reduce or externalize the managed runtime would be needed before treating the large document payload as application-remediable. It does **not** justify weakening management capabilities, CSP, or production safety controls.

## References

[1]: ./published-home-51f7b42b-1787536610.json "Published Home Lighthouse capture"
[2]: ./published-shop-51f7b42b-1787536610.json "Published Shop Lighthouse capture"
[3]: ./shared-entry-reassessment-2026-08-24.md "Shared entry and stylesheet reassessment"
[4]: ../vite.config.ts "Managed runtime and development-only debug collector configuration"
[5]: ../node_modules/.pnpm/vite-plugin-manus-runtime@0.0.59/node_modules/vite-plugin-manus-runtime/dist/index.js "Installed managed runtime plugin implementation"
