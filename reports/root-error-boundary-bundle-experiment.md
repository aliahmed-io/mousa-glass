# Root error-boundary bundle experiment

**Date:** 2026-08-23  
**Scope:** Initial JavaScript investigation only; no catalog, role, payment, ordering, or staging behavior changed.

## Method

The production entry was rebuilt with source-map inspection to identify application-controlled shared dependencies. The root error boundary was temporarily changed to remove its utility-class helper and two icon imports. The focused storefront regression suite passed during the experiment, after which a production build was compared with the established baseline.

| Build state | Shared entry | Relevant outcome |
| --- | ---: | --- |
| Retained baseline | 547.68 kB raw / 163.82 kB gzip | Existing root entry; lazy UI chunks share its icon utility path. |
| Temporary boundary rewrite | 520.15 kB raw / 155.14 kB gzip plus a 30.36 kB raw / 10.06 kB gzip lazy `createLucideIcon` chunk | The Home route still needed the new shared icon chunk through lazy StoreLayout/UI imports, producing a larger first-load dependency graph. |

## Decision

The temporary rewrite was reverted. The current baseline retains the error boundary's established recovery UI and avoids introducing an extra first-load chunk merely to improve a raw entry-file number. The complete `pnpm release:check` gate passed after the reversion with 59 tests across 11 files, production dependency audit, type check, build, and ten staging-media integrity checks.

## Remaining boundary

The published Home audit still identifies initial server response, unused JavaScript, and render-blocking work as open performance concerns. This experiment rules out only this narrow root-boundary split; it does not demonstrate a Core Web Vitals improvement or close the published-performance gate.
