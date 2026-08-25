# Published performance reassessment — 25 August 2026

## Scope and method

This evidence-only reassessment tests the public deployment after checkpoint `cb75f6b8`. Lighthouse 13.4.1 was run once against cache-busted Home and Shop URLs using headless Chromium. It is a diagnostic sample, not a Core Web Vitals field-data substitute. The test did not alter the Arabic RTL storefront, generated staging fixtures, administrator authorization, payment settings, checkout block, or ordering controls.

## Measured result

| Metric | Home | Shop |
| --- | ---: | ---: |
| Lighthouse performance score | 67 | 73 |
| First Contentful Paint | 3,344 ms | 3,026 ms |
| Largest Contentful Paint | 4,779 ms | 4,227 ms |
| Total Blocking Time | 99 ms | 137 ms |
| Cumulative Layout Shift | 0.000 | 0.0024 |
| Initial document response | 1,854 ms | 673 ms |
| Shared-entry unused JavaScript | 37,232 bytes | 36,395 bytes |

The fresh findings reproduce the same narrow opportunity set already documented: a framework-dominated shared entry, the single shared stylesheet, and variable initial document latency. The two routes have no duplicate-JavaScript or legacy-JavaScript finding in this sample. The stylesheet insight reports one 21 KiB resource and a 300 ms per-request blocking row, while Lighthouse presents estimated route-level savings of 100 ms for Home and 80 ms for Shop.

| Candidate | Fresh diagnostic evidence | Decision |
| --- | --- | --- |
| Remove shared-entry code | The same `index-D0R8Uv1J.js` resource is 103 KiB transferred, with approximately 35–36% marked unused. Earlier source-map and import experiments found the graph framework-dominated rather than a low-risk application-only payload. | **No change retained.** Removing cart state, shared navigation, staging disclosure, or settings would degrade required behavior or safety clarity without evidence of a net gain. |
| Defer or split the shared stylesheet | The only render-blocking candidate is the 21 KiB shared stylesheet. | **No change retained.** Deferral or duplicated critical CSS remains likely to risk Arabic RTL first paint, focus visibility, contrast, and layout stability; this sample does not demonstrate LCP benefit large enough to justify that risk. |
| Rewrite response or rendering path | The root document remains the slowest dependency, with substantially different Home and Shop response times in the same run. | **No change retained.** This is consistent with an intermittent managed delivery/cold-path constraint. Server rendering would add hydration and request work to that path, and the sample cannot establish an application-level root cause. |

> The public-performance launch gates remain open. This report records a measured non-change rather than claiming that production performance meets a launch target.

## Boundaries retained

The Shop media-presentation correction remains in place, but its staging-only metadata, managed provenance, and server-side order block are unchanged. Read-only database verification at checkpoint `cb75f6b8` confirmed `storeSettings.isCatalogStaging = 1`; customer checkout remains blocked. No merchant facts, legal content, payment destination, account role, or external monitoring authority was created or changed.

## Post-policy-route recheck — checkpoint `a6a53fd3`

A second Lighthouse 13.4.1 cache-busted sample was captured after the Arabic `/policy-status` route was deployed. This route is registered as a public-route chunk, and the fresh inspection does not show a separate policy-route resource in either Home or Shop. The same 103,192-byte shared entry is the only unused-JavaScript row in both routes.

| Metric | Home baseline | Home recheck | Shop baseline | Shop recheck |
| --- | ---: | ---: | ---: | ---: |
| Performance score | 67 | 63 | 73 | 67 |
| FCP | 3,344 ms | 3,645 ms | 3,026 ms | 3,331 ms |
| LCP | 4,779 ms | 5,338 ms | 4,227 ms | 4,534 ms |
| TBT | 99 ms | 132 ms | 137 ms | 174 ms |
| CLS | 0.000 | 0.000 | 0.0024 | 0.0024 |
| Initial document response | 1,854 ms | 1,109 ms | 673 ms | 690 ms |
| Unused shared-entry JavaScript | 37,232 bytes | 37,259 bytes | 36,395 bytes | 36,462 bytes |

The one-run recheck is diagnostic evidence, not a statistically valid regression claim. It preserves the existing pattern: response time varies materially between samples, while the framework-dominated shared entry remains effectively unchanged (a 27-byte Home and 67-byte Shop difference). The new sample contains no render-blocking-resource item and no isolated application asset that can be removed without sacrificing a required public route, shared Arabic RTL styling, staging disclosure, cart/navigation behavior, or accessibility.

> **Decision:** retain no performance-source change. The external performance acceptance and the two published-performance checklist items remain open. The page addition is not treated as proof of a release regression, and no speculative bundle, stylesheet, or rendering rewrite is justified by this sample.

## References

[1]: ./performance-candidate-decision-2026-08-24.md "Prior measured performance candidate decision"
[2]: ../todo.md "Open performance and launch-gate checklist"
