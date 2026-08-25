# Administrator Passphrase Authorization

## Scope

The application now supports a **server-confirmed temporary administrator authorization** for a signed-in account that supplies the configured administrator passphrase. This path is intended to give the project operator a controlled way to open the administrator workspace without changing that account’s database role. It does not alter catalog staging, merchant data, order authorization, payment settings, or the existing owner-role behavior.

| Access path | Scope | Duration | Server decision |
|---|---|---:|---|
| Database `admin` role | Existing administrator procedures | Normal signed-in session | Role check passes directly. |
| Signed-in account plus valid managed passphrase | Same administrator procedures | Eight hours, or until logout | A signed, user-bound, HTTP-only authorization cookie passes the centralized administrator procedure. |
| Signed-in account without valid passphrase | No administrator procedures | None | Centralized procedure returns `FORBIDDEN`. |
| Unsigned-in visitor | No administrator procedures | None | Protected endpoint returns `UNAUTHORIZED`; the UI directs the visitor to OAuth sign-in. |

## Security boundary

The passphrase is stored only as the managed `ADMIN_ACCESS_PASSPHRASE` secret and is not present in source control, browser bundles, UI copy, diagnostic messages, or documentation. Verification uses a timing-safe comparison on the server. A successful authorization creates an eight-hour authorization token bound to the signed-in user ID and signed with the server cookie secret. The browser receives it only in an `HttpOnly`, `Secure`, `SameSite=None`, path-scoped cookie; the token is unusable for a different user identity and is rejected if tampered with or expired.

The centralized `adminProcedure` is the security boundary for all administrator data and mutations. The Arabic client gate improves usability but cannot grant access by itself. Logout clears both the OAuth session cookie and the temporary administrator-authorization cookie. Passphrase attempts are covered by the database-backed shared high-risk limiter at eight attempts per fifteen-minute window; a limiter storage failure fails closed.

> Treat the administrator passphrase as a high-privilege operational credential. Do not publish it in staff guidance, screenshots, tickets, browser autofill exports, or client-side configuration. Rotate the managed secret immediately if disclosure is suspected.

## Verification record

Automated verification passed on the current working tree: focused endpoint and client-gate tests, the full **76-test** suite, production dependency audit, TypeScript check, production build, and twenty-two staged-media integrity checks. The passphrase tests cover a valid signed-in authorization, a signed user-bound cookie, expiry metadata, rejection without cookie minting, and logout cleanup.

An interactive signed-in browser smoke test could not be completed because the browser was deliberately left at the external OAuth account-selection page and the user explicitly declined browser takeover. The repository therefore retains a separate open checklist item for live OAuth-to-passphrase confirmation. This limitation does not weaken the server-side tests or imply that an unauthenticated browser can use the passphrase.

### Non-invasive published-route recheck — 25 August 2026

The published `/admin` route was opened without clicking a sign-in control, entering a passphrase, selecting an account, or changing browser state. It displayed the expected Arabic gate: **"يتطلب الوصول إلى الإدارة اعتماداً"** and **"سجّل الدخول أولاً، ثم أدخل رمز الإدارة لفتح مساحة الإدارة."** This confirms that no already-authenticated administrative session was available in the connected browser at the time of the check. The live end-to-end smoke test remains open because it inherently requires OAuth account selection, which the user has explicitly declined.

### Deployed administrator-chunk diagnosis — 25 August 2026

A stateless text extractor once reported a failed dynamic import for `AdminDashboard-TmBGpQDm.js`. This was investigated before any source change was considered. The exact published asset returned `HTTP 200`, JavaScript content, non-zero bytes, and the current deployed entry bundle imported that same hash. An isolated headless-browser render of a cache-busted public `/admin` URL completed normally and displayed the expected Arabic unauthenticated gate, with no dynamic-import error.

| Check | Observed result | Decision |
| --- | --- | --- |
| Exact published dashboard chunk | `200`, JavaScript, 51,533 bytes | Current asset is available. |
| Current entry-bundle import | References `AdminDashboard-TmBGpQDm.js` | Asset hash matches the deployed entry. |
| Isolated browser render | Renders the unauthenticated Arabic administrator gate | No public route-loading correction is justified. |
| Connected authenticated-browser inspection | Browser-extension request timed out; no credential or account action was attempted | The signed-in OAuth-to-passphrase smoke test remains open. |

The prior extractor-only error is therefore recorded as non-reproducible in a normal browser render, not as evidence of a production route failure. No authentication, role, passphrase, administrative data, catalog, staging, or checkout setting changed during this diagnosis.
