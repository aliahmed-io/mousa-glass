# tRPC client-import bundle experiment

**Date:** 2026-08-24  
**Scope:** A source-level JavaScript experiment only. The staging catalog, server-side order block, account roles, payment settings, merchant facts, and legal/launch gates were not changed.

## Method

The application entry was temporarily changed from the package-root `@trpc/client` import to the supported `@trpc/client/links/httpBatchLink` subpath. Because the existing unauthorized-response check depended on `TRPCClientError`, the temporary version used a structural `Error` check and retained the established message matching. The focused storefront test passed, then a production source-map build was compared with the current retained build.

| Build state | Shared entry | Source-map result |
| --- | ---: | --- |
| Retained baseline | 547.68 kB raw / 163.82 kB gzip | Current root import and typed error guard. |
| Temporary narrow import | 547.73 kB raw / 163.85 kB gzip | No reduction; the map still included `@trpc/client` index, logger-link, and WebSocket-link modules. |

## Decision

The experiment was reverted. Although the direct transport import was valid, the existing `@trpc/react-query` binding continues to bring the root client dependency graph into the shared entry. The narrow import therefore increased the measured entry slightly and would have replaced a specific typed error guard with a broader structural check without a first-load benefit.

The retained build was validated with `pnpm release:check`: 65 tests across 11 files, the production dependency audit, TypeScript checking, production build, and all twelve documented staged-media integrity checks passed. The restored release build reproduced the 547.68 kB raw / 163.82 kB gzip shared entry.

## Browser smoke checks

The Home and Shop routes rendered successfully in Arabic with the generated-catalog staging disclosure intact. The available authenticated browser session continued to receive the existing Arabic administrator access-denial screen. This confirms the experiment did not weaken the protected-route boundary; it does not substitute for verification with an authorized merchant administrator.

## Remaining boundary

This measurement rules out only the direct `httpBatchLink` import substitution at the application root. The published-performance gate remains open for variable initial server response, approximately 36 KiB of unused JavaScript, and small render-blocking work. It does not establish a Core Web Vitals improvement or change the staging-only launch decision.
