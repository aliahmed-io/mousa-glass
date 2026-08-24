# Mousa Glass Production Operations Guide

## Purpose and operating model

Mousa Glass is an Arabic RTL React storefront with a typed server API for selling glass hardware and related products. It intentionally uses **manual payment confirmation** rather than a card processor: customers can choose **Cash on Delivery** or **InstaPay**, upload an InstaPay screenshot, and continue the conversation on the store WhatsApp number. This avoids payment-gateway subscription and transaction costs while retaining a traceable order record for the administrator.

| Area | Production implementation | Administrator responsibility |
|---|---|---|
| Authentication | Manus OAuth session flow with server-side role checks and an optional server-confirmed administrator passphrase session | Use the owner role or a signed-in account that has been deliberately given the managed administrator passphrase; keep the passphrase private and rotate it if exposed. |
| Catalog | Products, categories, stock, featured flags, and product-image metadata are stored in the relational database | Keep product copy, live pricing, stock counts, and images current. |
| Orders | Orders, line items, delivery details, payment method, proof metadata, and lifecycle status are stored in the database | Review new orders promptly and update their fulfillment status. |
| Files | Product photos and proof screenshots are stored as object files; the database stores only file references | Remove obsolete images and never use screenshots for any purpose other than verifying the related order. |
| Payments | COD or customer-submitted InstaPay proof, followed by WhatsApp confirmation | Confirm payment manually before marking an InstaPay payment as verified. |

## Initial release checklist

After publishing the application, sign in with the project owner account. The owner identity is granted the **admin** role automatically on first sign-in. Visit `/admin/settings` and set the current WhatsApp number, InstaPay handle, store name, and shipping fee before accepting orders. Then create categories at `/admin/categories`, add products at `/admin/products`, and add alternate product photos at `/admin/media`.

## Current payment contacts and administrator access

The configured customer-confirmation contacts are **WhatsApp: 01020848619** and **InstaPay: 01060223037**. The first number opens the customer’s WhatsApp confirmation handoff after an order is placed, while the second is shown as the current InstaPay payment destination. Review these values in `/admin/settings` whenever the business contact or payment destination changes.

To access administration, publish or preview the site, sign in through Manus OAuth, and then visit `/admin`. The owner account receives the `admin` role automatically after its first sign-in. A different signed-in account can instead enter the managed administrator passphrase at the protected Arabic gate; this creates a user-bound, HTTP-only administrator session for eight hours or until logout without changing that account’s database role. Do not share the passphrase, place it in documentation, or bypass OAuth to use it.

> The public catalog currently contains clearly labelled **generated staging records and imagery** for browsing and workflow validation. Staging mode blocks all customer orders. Do not disable staging or represent these records as merchant-approved merchandise. Replace them through the administrator interface only with supplier-confirmed product details and images.

> Never publish the live catalog with placeholder prices, inaccurate stock, or a test WhatsApp number. The checkout screen derives payment and WhatsApp instructions from the administrator-controlled settings.

| Pre-launch task | Verification outcome |
|---|---|
| Configure store settings | WhatsApp handoff opens the active business number and the InstaPay handle is correct. |
| Replace staging catalog | Each approved product appears in `/shop` with the correct EGP price, stock, cover image, category, and Arabic details. |
| Place a controlled COD order | After explicit authorization to leave staging, the order appears in `/admin/orders` and can be advanced through each fulfillment state. |
| Place a controlled InstaPay order | After explicit authorization to leave staging, a proof image can be uploaded, opens only for its owner or an administrator, and moves the payment to review. |
| Review access | A customer account is unable to open administrator data or mutate catalog/order records. |

## Daily order process

For **Cash on Delivery**, check the delivery address and phone number, contact the customer if needed, and change the order from `pending` to `confirmed`, then `shipped`, and finally `delivered`. For **InstaPay**, review the proof image and the actual incoming payment in the business account; only then update the payment status to `verified` and confirm the order. Use `rejected` if the evidence is insufficient, and communicate that decision to the customer through WhatsApp.

An order is not automatically paid merely because an image was uploaded. The payment proof is evidence for a human review step, not a payment-provider confirmation.

## Security and data-handling controls

All account-scoped procedures use the authenticated user ID. Administrator procedures require either the `admin` role or a valid, signed, unexpired administrator-authorization cookie that is bound to the current OAuth user after a server-side managed-passphrase verification. The client UI mirrors these rules for clarity, but the centralized server-side procedure is the security boundary. Passphrase attempts are database-backed rate-limited, and logout clears the temporary authorization cookie. Object uploads are limited to images, are size-constrained by the application workflow, and product/payment files are kept outside the relational database.

The administrator should use a separate, protected owner account for operational access. Do not share an administrator session or export customer delivery details unnecessarily. Payment screenshots, phone numbers, email addresses, and delivery addresses should be treated as sensitive business records and retained only for the operational period needed to serve the order and resolve any dispute. The configured proof-retention duration must be approved by the merchant and qualified local adviser before non-staging InstaPay orders are accepted.

Private proof access is limited by the application to the customer who owns the order or an administrator. Removing a proof reference in the administrator workspace prevents application access, but it must **not** be represented as confirmed physical object deletion until the storage provider supports and the business records an approved deletion procedure.

## Cost-conscious production strategy

The application does not require a card-payment gateway, email service, paid analytics package, queue worker, or always-running virtual machine. It is designed for a serverless, autoscaling web runtime with a relational database and object storage. At low-to-medium traffic, this removes the most common avoidable recurring costs: card gateway fees, background-worker hosting, and dedicated infrastructure.

| Cost control | How the application applies it |
|---|---|
| Manual payment options | COD and InstaPay proof avoid card processor integration and transaction fees. |
| Serverless request lifecycle | No scheduled jobs, polling workers, or persistent processes are configured. The site stays compatible with low-cost autoscaling hosting. |
| Object storage for files | Image bytes are stored separately from database records, keeping database queries and backups smaller. |
| Typed API | tRPC keeps the storefront and server contract aligned without operating a separate API gateway. |
| Built-in OAuth | Customer and administrator sign-in uses the provided OAuth infrastructure rather than a separate identity subscription. |

The exact hosting and storage allowance depends on the provider and selected plan. Before a launch with significant catalog assets or traffic, monitor the hosting, database, and object-storage dashboards for current usage. The codebase avoids a paid dependency by design, but no platform can guarantee zero cost at unlimited traffic or storage volumes.

## Routine maintenance and release checks

Product and category changes do not require code deployment. Use the administrator interface for normal catalog maintenance. Check the dashboard for pending orders and best-selling products, review product stock before confirming orders, and remove products or hide categories instead of leaving unavailable products visible.

Run `pnpm release:check` before saving a deployment checkpoint or handing over a staging update. It executes the production dependency audit, TypeScript check, complete Vitest suite, production build, and verifier for the five assigned staging-media assets, five documented 480px responsive derivatives, and two measured amber-glassware 720px/800px derivatives. At the current checkpoint, the suite passes **65 tests across 11 files**. It is a technical release check only: it does not authorize real ordering, replace a backup-and-restore drill, or satisfy merchant, legal, authorization, and monitoring approvals.

For a production Home or Shop media check, use a cache-busted mobile Lighthouse run and retain both the raw report and summary under `reports/`. The verified `c9ea991d` Shop audit and `24c2b326` Home audit each recorded 100 Accessibility and an empty `image-delivery` array after the documented 480/960 staging-image mapping was deployed. A later published Shop audit at `9f6faccc` reproduced and then resolved one amber-glassware card overfetch with its documented 720px/800px source candidates, again returning an empty image-delivery array. These checks retain slow first-load findings, so responsive-media verification is not a substitute for the separate live performance, external monitoring, or release-authorization gates.

### Shared high-risk rate limiting

`orders.create` and `orders.uploadPaymentProof` use a shared fixed-window database limiter before the tRPC router executes. Each bucket contains only the operation scope, window start, request count, and an HMAC-SHA-256 digest of the client address using the server cookie secret; neither a raw address nor customer input is persisted. A unique `(scope, keyHash, windowStartMs)` key coordinates autoscaled instances. Buckets older than 24 hours are removed by bounded opportunistic cleanup, and a storage failure returns HTTP 503 before checkout or proof upload can run. Retain the ordinary per-process limiter for public reads to avoid a database round trip on every catalogue request.

After a database restore or schema deployment, confirm `sharedRateLimitBuckets` has its composite unique index and window-start index before enabling any non-staging ordering flow. The migration is non-destructive, but this verification does not substitute for the still-open full restore drill, independent monitoring, merchant/legal approvals, or real-business order rehearsal.

The repository workflow runs the dependency, type, test, and build gates for pushes and pull requests. Its corrected configuration first passed in [GitHub Actions run 32655491665](https://github.com/aliahmed-io/mousa-glass/actions/runs/32655491665), then after evidence synchronizations in [run 32664773989](https://github.com/aliahmed-io/mousa-glass/actions/runs/32664773989) and [run 32666075640](https://github.com/aliahmed-io/mousa-glass/actions/runs/32666075640). The prior safe branch cannot fast-forward from the managed checkpoint history, so snapshot `production-readiness-verified-4211f37` was created without force-pushing or changing the GitHub default branch. The workflow covers that non-default snapshot naming pattern; [run 32669326623](https://github.com/aliahmed-io/mousa-glass/actions/runs/32669326623), [run 32669529857](https://github.com/aliahmed-io/mousa-glass/actions/runs/32669529857), and [run 32670358214](https://github.com/aliahmed-io/mousa-glass/actions/runs/32670358214) all passed. The latest run validated checkpoint `a30bdb16c916b6adc1c14f453d3806419332feb6`; the Node 24-capable action upgrade retains no Node 20 deprecation warning.

`GET /healthz` is the in-process liveness endpoint. Use `GET /api/healthz` for an external or managed-hosting probe: it returns the identical non-sensitive `status`, `service`, and ISO timestamp payload but avoids the managed edge's reserved `/healthz` maintenance response. An August 2026 HTTP/1.1, no-cache HTTP/2, and preview recheck all returned that JSON payload and an opaque request ID after an isolated empty-body capture; future independent monitors should validate both HTTP 200 and a non-empty JSON body. Every server response also includes a generated, opaque `X-Request-Id` header (or a validated caller-supplied identifier) so an operator can correlate a customer-reported failure with deployment logs without exposing customer data. A tRPC failure emits one structured, non-PII diagnostic carrying only that request ID, its procedure path, and its error classification; a local unknown-procedure probe verified this integration with `NOT_FOUND` and a generated correlation ID. Successful order creation and successful payment-proof submission each send a best-effort owner notification with an order reference and admin route; notification delivery does not block the customer response, and it is not a substitute for external error monitoring.

## Monitoring, incident response, and recovery gates

The application currently has development/runtime logs, a non-sensitive health endpoint, safe `X-Request-Id` correlation headers, non-PII structured tRPC failure diagnostics, and best-effort owner alerts for successful order/proof writes. It does **not** yet have independent uptime monitoring, external error aggregation, alert retry/escalation, real-user Core Web Vitals, or a published incident service-level objective. These remain launch requirements rather than completed controls.

| Condition | Immediate action | Evidence to retain |
|---|---|---|
| Health check or storefront alert fails | Confirm the failure from a network outside the application, record the response `X-Request-Id` if available, inspect deployment logs, and roll back only after identifying the affected release. | Timestamp, route, request ID, deployment version, log excerpt, and resolution decision. |
| Owner does not receive an expected order/proof alert | Check the administrator order queue directly; customer checkout must not be retried solely because an alert is absent. | Order number, alert-delivery outcome, and the manual review record. |
| Suspected unauthorized proof access | Stop proof review, preserve the minimum relevant logs, revoke affected staff access, and escalate to the merchant/legal contact. | Affected order references, access-review result, corrective action, and customer communications approved by the merchant/legal contact. |
| Suspected data loss or bad deployment | Preserve the current state, identify the last known-good checkpoint, and verify database impact before any rollback. | Checkpoint identifier, database impact assessment, recovery decision, and post-recovery verification. |

A managed project checkpoint restores application source and deployment state, not a documented database/data recovery exercise. Before unrestricted selling, the owner must obtain platform backup coverage details, create a current backup, rehearse a non-destructive restoration path for database records and storage references, define RPO/RTO, and record results in the launch packet. The platform's account-level data backup/restoration process, if applicable to the account, must be checked against the owner's in-app notice and email; do not infer account eligibility from this guide.

## Order correction, rollback, and escalation

If an order is entered incorrectly, do not delete customer information solely to correct a fulfillment mistake. Update the order status to `cancelled` where appropriate and preserve the history needed for reconciliation. Eligible cancellation automatically restores stock exactly once; do not manually add stock without confirming whether that restoration occurred. If product images are accidentally removed, re-upload them through `/admin/media`. Use the project version history to restore code only after reviewing the effect on database data; restoring application files does not roll back order or catalog records already stored in the database.
