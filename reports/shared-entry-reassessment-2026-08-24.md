# Shared-entry reassessment — 2026-08-24

## Scope

This review re-examined the current production client graph after the earlier root-error-boundary and narrow tRPC-import experiments were both retained/reverted on measured grounds. It did not change application code, administrator authorization, account roles, catalog staging, payment configuration, generated staging media, or the server-side real-order block.

## Evidence

A fresh source-map-enabled production build produced the following current output.

| Artifact | Current value | Interpretation |
| --- | ---: | --- |
| Shared entry | 547.74 kB raw / 163.86 kB gzip | Essentially unchanged from the established 547.68 kB raw / 163.82 kB gzip retained baseline; the small difference is build variation and is not treated as an improvement or regression. |
| Shared public shell | 24.57 kB raw / 4.96 kB gzip | `StoreLayout` remains route-shared, as intended for the consistent Arabic navigation, disclosure, footer, cart, and authenticated navigation state. |
| Home route | 43.17 kB raw / 6.48 kB gzip | The landing page remains route-lazy-loaded. |
| Shop route | 16.60 kB raw / 3.67 kB gzip | The catalog page remains route-lazy-loaded. |

Source-map source-content attribution is directional rather than an emitted-byte accounting method. It nevertheless confirms the same dependency boundary: React, tRPC, TanStack Query, routing, serialization, and UI utility dependencies dominate the shared entry, while all application-owned source represented there totals roughly 14 kB of unminified source content. The existing direct tRPC subpath experiment already established that the `@trpc/react-query` binding retains the relevant root-client graph.

> The current evidence does not support a safe, measurable application-owned shared-entry reduction. Removing the public shell’s cart, authenticated navigation, staging disclosure, or settings data would trade away visible storefront behavior or safety clarity for an unproven bundle gain.

## Decision

No speculative source rewrite was retained. The remaining performance work stays open for a fresh **published** measurement that distinguishes application-controlled unused JavaScript from framework/runtime weight and that separately captures managed cold-server response behavior. The prior successful responsive-image work remains intact; this reassessment neither closes the published performance gate nor changes the staging-only launch decision.
