# Mousa Glass Production Remediation Plan

## Objective

Close all confirmed production-readiness gaps identified in `PRODUCTION_READINESS_AUDIT.md` while preserving the Arabic-first, RTL, low-maintenance e-commerce experience. The site remains **not approved for unrestricted customer launch** until every launch gate in this plan is complete or is explicitly accepted by the business owner with a documented compensating control.

## Delivery Principles

| Principle | Application |
| --- | --- |
| Evidence before closure | A work item is complete only after code, configuration, operational evidence, and relevant automated tests are recorded. |
| Real commercial data only | No product, price, image, stock, review, or payment information will be fabricated. Merchant approval is mandatory. |
| Secure-by-default | Server-side authorization, transaction boundaries, and restrictive storage access remain authoritative. |
| Low-maintenance design | Prefer managed capabilities already available to the application; operational procedures must remain practical for a local Hurghada store. |
| Arabic and RTL first | Every customer-facing and administrative change must retain accessible Arabic copy and RTL responsive behavior. |

## Workstream 0 — Completed Baseline

The audit report and payment-proof access remediation are complete. The storage proxy now permits a proof-file download only for its order owner or an administrator. The corresponding focused tests, project type check, complete Vitest suite, and production build passed before the checkpoint.

## Workstream 1 — Launch Prerequisites and Accurate Commercial Content

| Deliverable | Owner / dependency | Acceptance criteria | Launch priority |
| --- | --- | --- | --- |
| Verified catalog | Merchant must supply approved categories, products, prices, stock, product images, and delivery facts | Records are entered through admin; all storefront pages display only approved information; no temporary data remains | P0 |
| Contact-source reconciliation | Merchant confirms WhatsApp and InstaPay details | Public shell reads approved settings or has a documented single source of truth; contact flow is tested | P1 |
| Legal and transaction pages | Merchant reviews business policy wording | Arabic privacy, terms, delivery, returns, COD, and payment-proof policies are published and linked in the storefront | P1 |

## Workstream 2 — Checkout, API, Session, and Edge Security

| Deliverable | Technical scope | Acceptance criteria | Launch priority |
| --- | --- | --- | --- |
| Rate limits and uploads | Rate-limit sensitive tRPC paths; limit payment-proof MIME type, size, dimensions, and frequency | Automated tests cover rate-limit and rejected-upload paths; admin can diagnose a safe rejection | P1 |
| Browser/edge policy | Set explicit security headers, CORS allow-list, and documented CSRF controls suited to the cookie-authenticated app | Header and origin tests pass; policy is documented without exposing secrets | P1 |
| Checkout idempotency | Accept a client idempotency key and persist/reuse outcome within the checkout transaction | Retried identical request produces one order and one inventory allocation | P1 |
| Session review | Preserve OAuth nonce/state validation and test logout/session expiry behavior | Authenticated journey and failure behavior are verified in a real browser | P1 |

## Workstream 3 — Inventory, Orders, and Data Integrity

| Deliverable | Technical scope | Acceptance criteria | Launch priority |
| --- | --- | --- | --- |
| Order state machine | Enumerate valid statuses/transitions, role permissions, and customer messaging | Invalid transitions are rejected; approval/cancellation behavior is covered by tests | P1 |
| Stock restoration | Restore allocated stock exactly once when an eligible order is cancelled | Transaction tests demonstrate no double-restock or negative stock | P1 |
| Referential integrity | Add foreign keys, indexes, and safe migrations after reviewing current data | Schema and production database match; migration and rollback procedure is tested | P1 |
| Admin auditability | Preserve order event history for material manual actions | Admin can see who/when changed an order status without exposing private proof content publicly | P2 |

## Workstream 4 — Privacy, Retention, Backup, and Manual Operations

| Deliverable | Technical scope | Acceptance criteria | Launch priority |
| --- | --- | --- | --- |
| Proof retention and deletion | State retention period and controlled deletion workflow for payment proof screenshots | Published privacy disclosure, staff runbook, and validated permission model agree | P1 |
| Restore drill | Back up and restore database records, configuration, and storage references in a controlled test | Recovery time, evidence, owners, and exceptions are recorded | P1 |
| Manual-payment runbook | Clarify COD/InstaPay verification, WhatsApp handoff, reconciliation, escalation, and contact changes | Staff can follow the documented daily workflow; an owner signs off | P1 |

## Workstream 5 — SEO, Performance, Observability, and Delivery

| Deliverable | Technical scope | Acceptance criteria | Launch priority |
| --- | --- | --- | --- |
| Discoverability | Canonical URL, sitemap, robots, Open Graph/Twitter data, and JSON-LD for organization/product pages | Source and deployed output validate; crawler-relevant pages are indexable by policy | P2 |
| Deployed performance | Measure production home, shop, product, cart, and checkout experiences on mobile and desktop | Results are recorded; regressions have an owner; accessible RTL experience is retained | P2 |
| Monitoring | Add error capture, health signals, deployment checks, and actionable order/payment alerts | A controlled fault produces a non-secret alert and a documented response | P1 |
| Supply-chain review | Complete the stalled dependency vulnerability review and set a CI gate for type checks, tests, build, and audit policy | Clean or risk-accepted dependency report, passing CI workflow, and release checklist | P1 |

## Workstream 6 — Test, Launch Review, and Authorization

| Deliverable | Technical scope | Acceptance criteria | Launch priority |
| --- | --- | --- | --- |
| Expanded automated suite | Cover authorization, abusive input, idempotency, transitions, restock, migrations, and private storage | New negative and regression tests pass in CI | P1 |
| Real authenticated E2E | After genuine catalog setup, execute COD and InstaPay customer-to-admin workflows using a controlled business test | Actual browser evidence confirms cart, checkout, proof handling, WhatsApp handoff, admin review, and status update | P0 |
| Final go/no-go | Re-audit deployed version and review all P0/P1 evidence | The launch register lists every gate as pass, accepted exception, or blocker; unrestricted ordering is enabled only after approval | P0 |

## Sequence and Dependencies

1. Commit the audit remediation and preserve it as the security baseline.
2. Obtain verified merchant data and approve legal/policy facts; these are business dependencies and cannot be fabricated.
3. Implement and test API/checkout hardening, then order/inventory integrity changes with database migrations.
4. Publish policies, set retention controls, and run the backup/restore and manual-payment drills.
5. Complete SEO/performance/monitoring/CI work on the hardened implementation.
6. Load approved catalog data, perform authenticated real-business E2E testing, and execute the final launch review.

## Launch Gate

> **Do not enable unrestricted customer orders** until all P0 and P1 items are verified, no unaccepted critical/high-risk finding remains, genuine catalog data is live, the staff runbook has an owner, and the final authenticated end-to-end journey succeeds on the deployed application.

