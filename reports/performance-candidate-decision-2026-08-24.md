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

## References

[1]: ./published-home-51f7b42b-1787536610.json "Published Home Lighthouse capture"
[2]: ./published-shop-51f7b42b-1787536610.json "Published Shop Lighthouse capture"
[3]: ./shared-entry-reassessment-2026-08-24.md "Shared entry and stylesheet reassessment"
