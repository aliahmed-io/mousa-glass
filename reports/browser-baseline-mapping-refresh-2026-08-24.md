# Browser Baseline Mapping Refresh

## Reason for the maintenance update

The development server reported that `baseline-browser-mapping` data was more than two months old. This package informs the browser-target data used by the build toolchain through `browserslist`; it does not run in the deployed storefront and does not contain catalog, customer, payment, authorization, or merchant information.

## Applied change and evidence

| Item | Before | After | Verification |
| --- | --- | --- | --- |
| Resolved mapping version | `2.8.12` as a transitive development dependency | `2.11.18` as a direct development dependency, shared with the existing toolchain resolution | Compatible with Node `>=6`; current project runtime is Node 22. |
| Production build warning | Baseline data staleness warning observed in server output | Absent from the refreshed release-gate build output | `pnpm release:check` completed successfully. |
| Release validation | Prior release state | Production audit found zero production dependency vulnerabilities; TypeScript check, 66 tests, production build, and all twelve staging-media checks passed | Shared JavaScript remained effectively unchanged at 547.70 kB raw / 163.83 kB gzip, so no performance claim is made. |

The update intentionally does not change browser feature policy, runtime application code, public styling, administrator authorization, staging disclosure, ordering block, payment configuration, or the database. It removes stale build-support data only. The unrelated pnpm configuration deprecation warning remains outside this narrow dependency refresh and is not treated as a production runtime issue.
