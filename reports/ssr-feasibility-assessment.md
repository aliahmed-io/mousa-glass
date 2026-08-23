# Server-rendering feasibility assessment

## Purpose and evidence basis

This assessment evaluates server-side rendering (SSR) as a response to the current cache-busted published Home performance evidence. It does **not** authorize a production ordering change, modify the staging catalog, or represent a launch decision.

The published mobile Home report for checkpoint `24c2b326` records a 6.0 s LCP, 4.3 s FCP, 0 CLS, a 2.755 s initial-server-response opportunity, and a 36 KiB unused-JavaScript opportunity. Its network chain shows the HTML response completing at approximately 11.3 s, the shared client entry at approximately 14.1 s, the Home route at approximately 15.9 s, and the batched public tRPC request at approximately 18.5 s. The LCP element is the eager, document-discoverable hero image; the dominant observed constraint is therefore server and client-render timing rather than a missing image-discovery hint.

## Current public rendering scope

| Area | Current behavior | SSR implication |
|---|---|---|
| Public routes | Home, Shop, product detail, About, Contact, delivery/returns, FAQ, Cart, Checkout, and Orders are client-lazy routes. | `renderToString` cannot resolve the present `React.lazy` tree; it would emit the loading fallback unless a separate server-safe public route registry or static server imports are introduced. |
| Shared layout data | The public shell reads authentication, store settings, categories, and catalog data through tRPC hooks. | A server entry must prefetch and dehydrate the exact public query keys using an in-process tRPC caller. |
| Cart state | `CartProvider` reads local storage in its state initializer. | It must use an effect-swap pattern so the first client render matches the server-rendered empty cart. |
| Authentication state | `useAuth` writes to local storage while deriving render state. | The write must move to an effect; public SSR must not issue an authentication redirect or expose user-specific cache data. |
| Staging SEO policy | Generated staging catalog uses deliberate no-index/crawl protection. | SSR would not remove, weaken, or bypass this policy. |
| Administrators and orders | These are authenticated and/or customer-specific routes. | They should remain client-rendered and no-indexed unless separately designed and tested with per-user server data. |

## Decision

**Defer SSR at this time.** It is not an evidence-backed remedy for the measured cold-path limitation under the present autoscaled hosting behavior. Correct SSR would need per-request public data prefetching and `Cache-Control: no-cache` HTML because authentication-aware layout state is present. That adds database and rendering work directly to the slow server-response path identified by the audit. It also requires a substantial routing, hydration, storage-state, authentication-state, metadata, static-serving, failure-fallback, and test conversion.

The expected benefits—crawler-visible first paint and reduced client skeleton time—are valuable after approved public catalog data is available. They are currently constrained by intentional staging no-index policy, while the largest measured opportunities remain server response and client hydration. A conversion should be reconsidered only when a non-staging launch has approved commercial content, a representative production traffic profile, and a repeated comparison showing that server prefetch improves rather than regresses p75/p95 response and LCP measurements.

## Preserved work items

The existing performance gate remains open. Safe completed work includes route splitting, responsive staging images, reserved loading footprints, CSS/image delivery improvements, and scoped dependency analysis. The remaining gate is to remeasure deployed Core Web Vitals and reduce the Home/Shop cold-path gap without weakening accessibility, RTL presentation, staging disclosure, CSP, no-store policy, or non-orderable staging controls.
