# Mousa Glass — Owner Production Handover

**Prepared:** 25 August 2026  
**Current operating state:** **STAGING-ONLY — DO NOT ACCEPT UNRESTRICTED CUSTOMER ORDERS**  
**Audience:** Store owner, authorized administrator, merchant approver, qualified local legal adviser, and operational/hosting contact.

## 1. What is ready and what is not

The website is a functioning Arabic, right-to-left storefront and administration system with catalog browsing, category filtering and sorting, product and media management, order workflows, Cash on Delivery (COD), InstaPay-proof intake, WhatsApp handoff, OAuth, restricted administrator access, security controls, responsive layouts, automated tests, and a deployment release gate. The public catalog and images are **generated staging material** and the server blocks new customer orders while staging is active.[1] [2]

> **Do not publish a real catalog, state that generated staging records are genuine merchandise, turn off staging, or enable unrestricted ordering until every applicable gate in this document has written evidence and a named release decision.**

The checklist below distinguishes work that an owner can perform from decisions that require a merchant, legal adviser, or an external operations provider. It deliberately does not invent prices, delivery rules, legal terms, payment policy, customer-data policy, or administrator identities.

| Area | Current status | What remains |
| --- | --- | --- |
| Storefront and admin foundation | Implemented and tested | Populate with approved business data and complete live operational checks. |
| Catalog and checkout | Generated, disclosed, and order-blocked | Replace with approved commercial data and authorize a real-business end-to-end rehearsal. |
| Administrator authorization | Server-tested | Complete one OAuth-to-administrator browser smoke test with an authorized account. |
| Security and release checks | Implemented | Complete external monitoring, a backup/restore drill, and evidence review. |
| Performance and SEO | Accessibility and responsive-media work verified; staging crawl block is intentional | Establish an approved performance target and resolve or accept delivery-bound latency with supporting evidence. |

## 2. First: assign accountable people and keep one launch packet

Before changing any business setting, create a shared **launch packet** (a controlled folder or document) and name one person for each role below. The release decision must not rest with an unnamed person or with the website itself.

| Role | Must provide or approve | Minimum evidence to save |
| --- | --- | --- |
| Merchant owner | Catalog facts, prices, stock, delivery coverage, payment contacts, tax treatment, and release approval | Dated catalog source, approval record, and final go/no-go sign-off. |
| Authorized administrator | Secure sign-in, catalog entry, daily order review, and controlled workflow rehearsal | User/account confirmation, screenshots or screen recording of required admin checks, and E2E test record. |
| Qualified local legal adviser | Arabic privacy, sale, delivery, return, COD, and InstaPay-proof policy decisions | Written review/approval and final approved Arabic policy text. |
| Operations/hosting owner | Backups, recovery, monitoring, alerts, incident handling, and service-level targets | Backup/restore drill record, monitor configuration, alert-recipient test, and incident contact list. |
| Release authority | Final permission to switch from staging to live commerce | Signed or otherwise auditable go/no-go record with all evidence links. |

Keep the following in the launch packet: source spreadsheets, approved Arabic copy, image-rights records, test order IDs, proof-deletion records, monitor screenshots, backup/restore results, performance reports, release-check output, and the final decision. Do **not** put secrets, passwords, raw customer-payment proofs, or exported customer delivery data in the packet.

## 3. Safe administrator access

1. Open the published site and sign in through **Manus OAuth** with the intended operational account.
2. Visit `/admin`. The project owner account can receive the existing administrator role; another signed-in account can use the managed administrator authorization gate if the owner has deliberately provided the managed passphrase. Do not share, copy into documents, or attempt to recover that passphrase.[3]
3. Confirm the administrator can open `/admin`, `/admin/products`, `/admin/categories`, `/admin/media`, `/admin/orders`, and `/admin/settings`.
4. Log out, then confirm the temporary administrator authorization is removed and the protected routes do not remain available.
5. Save a short smoke-test record: date/time, account identity or internal identifier, routes tested, outcome, and any `X-Request-Id` shown for a failure. Do not alter database roles just to make this test pass.

**Gate closed when:** A deliberately authorized, signed-in account completes the route test and the results are retained. This closes the browser-only authorization verification; it does **not** authorize sales by itself.

## 4. Replace staging merchandise with approved commercial data

The existing categories, products, prices, stock, and images are only for browsing and workflow validation. They must be replaced by merchant-approved records before real orders can be accepted.[1]

### 4.1 Prepare one approved catalog source

Create a spreadsheet or equivalent signed-off source with one row per sellable product and the following fields.

| Required field | What to provide | Acceptance check before entry |
| --- | --- | --- |
| Product identity | Arabic name, optional English/internal SKU, category, and manufacturer/supplier reference | The item is actually supplied by the business and uniquely identifiable. |
| Customer copy | Accurate Arabic description, dimensions/specification, compatibility, material, and any limitations | A customer cannot reasonably mistake the item or its use. |
| Commercial facts | Selling price in EGP, tax treatment, stock quantity, reorder/availability status | Merchant confirms price, tax, and inventory on the same approval date. |
| Delivery and return facts | Service area, fee, timing, eligibility, exclusions, and return handling | Matches the final approved policies in Section 5. |
| Image package | Cover and supplementary images, filenames, captions/alt text, source/creator, licence or written rights confirmation | Images depict the approved product and the merchant can use them commercially. |
| Visibility | Whether the product may appear publicly, be featured, or must remain hidden | Explicit merchant approval. |

### 4.2 Enter and verify the data

1. Keep `isCatalogStaging` active while preparing and reviewing the new data.
2. In `/admin/settings`, review the store name, WhatsApp destination, InstaPay destination, and shipping settings against a business-owned source. The configured values must never be treated as permanent merely because they appear in the interface.[3]
3. In `/admin/categories`, create or edit approved categories, Arabic names, descriptions, visibility, and display order.
4. In `/admin/products`, create each approved product with its category, Arabic copy, price, stock, and publication status. Use archive/hide controls for discontinued items; do not delete products that have historical orders.[2]
5. In `/admin/media`, upload only rights-cleared, approved media. Verify the image is the intended item at desktop and mobile sizes.
6. In `/shop`, check every public product against the approved source: price, stock state, Arabic text, category, cover image, responsive image loading, and product details.
7. Have the merchant sign off on the final shop review. Preserve the dated source and approval.

**Gate closed when:** Every live product has a dated merchant-approved record and rights-cleared image evidence, and the public storefront matches the approved source. Do not treat generated staging imagery as proof of product rights or commercial approval.

## 5. Approve and publish Arabic policies before collecting real customer data

The site needs merchant-approved and qualified local legal review for its customer-facing privacy, sale, delivery, return, COD, InstaPay-proof, and contact policies. This is an approval and drafting activity, not legal advice from the application.[1]

### 5.1 Give the legal adviser a complete decision brief

Provide the adviser with: the intended products and delivery area; payment methods; WhatsApp customer communications; the data collected at checkout; the fact that InstaPay screenshots are restricted to the owning customer and authorized administrators; the proposed proof-retention period; access-review controls; the intended deletion process; and the hosting/storage setup.

Ask for Arabic text and approval covering, at minimum:

| Policy | Decisions that must be explicit |
| --- | --- |
| Privacy | What data is collected, why, who accesses it, where it is stored, retention, customer requests, and contact method. |
| Terms of sale | Product availability, pricing/tax presentation, order acceptance, and limitation handling. |
| Delivery and returns | Area, charge, timing, inspection/return eligibility, exclusions, and complaint process. |
| COD | When an order is confirmed, delivery/payment expectations, cancellation/refusal treatment, and contact route. |
| InstaPay proof | Exact payment destination, proof purpose, human verification, rejection process, retention period, access reviews, deletion process, and dispute contact. |
| Customer contact | Official business contact details, WhatsApp use, and escalation route. |

### 5.2 Configure the proof-retention and deletion procedure

1. The merchant and qualified legal adviser must choose and approve a retention period before non-staging InstaPay orders are accepted.
2. Configure the approved value in the administrator settings only after that approval is recorded.
3. Define who may view proofs, how frequently access is reviewed, who approves deletion, how an application reference is removed, and how the storage provider’s **physical deletion** is verified.
4. Record deletion requests and outcomes by order reference without placing the proof image itself in operational notes.

> Removing a proof reference in the administration interface removes application access. It is **not** evidence that the underlying object has been physically deleted unless the storage provider and the business procedure independently confirm it.[3]

**Gate closed when:** Final Arabic policy pages are published, the merchant and legal adviser have approved them, the payment-proof retention setting has a documented approved value, and the deletion/access-review procedure has been tested and recorded.

## 6. Complete operations, recovery, monitoring, and incident readiness

The application provides `/api/healthz`, `X-Request-Id` response correlation, non-PII failure diagnostics, owner notifications for successful order/proof writes, and CI checks. These are helpful controls, but they do not replace independent monitoring or a recovery drill.[3]

### 6.1 Configure independent monitoring and escalation

1. Create or designate an account owned by the business/operations owner for uptime and error monitoring. Do not use an unowned personal account or an alert destination without the recipient’s authority.
2. Configure an external HTTP monitor against `GET /api/healthz` — **not** `/healthz` — because the managed edge may reserve the latter route.
3. Require HTTP `200` and a non-empty JSON response. Retain the monitor’s URL, interval, failure threshold, and monitored-region configuration.
4. Configure at least two reviewed alert routes (for example, primary operations contact and escalation contact) and document who responds outside business hours.
5. Trigger a controlled alert, verify receipt, record acknowledgement time, and write the rollback/escalation decision path.
6. Choose an external error-aggregation approach or explicitly document the approved operational alternative, data handling, retention, owners, and response process. It must not capture payment proofs or unnecessary customer data.

**Gate closed when:** The business controls the monitoring account, two alert recipients have acknowledged test alerts, escalation ownership is documented, and monitor/error evidence is retained.

### 6.2 Perform a non-destructive backup-and-restore drill

1. Obtain the current platform/database/object-storage backup coverage and retention details from the account owner or provider documentation. Do not assume a code checkpoint is a customer-data backup.
2. Create a dated backup according to the approved operational process.
3. Restore a **non-production copy** of representative catalog records, store settings, an order with line items/status, and storage references. Never overwrite the live database as a test.
4. Verify restored data integrity: relationships, price/stock values, order history, settings, shared-rate-limit indexes, and that stored file references resolve according to the approved recovery plan.
5. Measure and record the recovery point objective (RPO), recovery time objective (RTO), actual start/end times, defects found, remediation, and responsible person.
6. Store the drill report in the launch packet and schedule the next review according to the operations policy.

**Gate closed when:** A dated, non-destructive drill has restored the agreed scope, identified the recovery owner, documented RPO/RTO, and recorded any remediation.[3]

### 6.3 Establish an incident record

For any storefront, order, proof, or health-check incident, retain only: timestamp, affected route/order reference, `X-Request-Id` if present, deployment/checkpoint identifier, non-sensitive log excerpt, decision, owner, and resolution. Do not attach payment proofs, passwords, full delivery addresses, or exported customer lists to incident notes.[3]

## 7. Rehearse the real business workflow before releasing orders

Only after Sections 3–6 are complete and with deliberate authorization, run a controlled rehearsal using the actual business account, real administrator, approved catalog, and an agreed non-production/test customer path where possible. Avoid creating misleading public orders.

### 7.1 COD rehearsal

1. Confirm one approved product has correct stock, price, delivery terms, and public visibility.
2. Create one controlled COD order under the approved test procedure.
3. Confirm it appears in `/admin/orders` with correct line items, delivery information, payment method, and status.
4. Advance it through the authorized lifecycle: `pending` → `confirmed` → `shipped` → `delivered`, recording the accountable person at each handoff.
5. Verify WhatsApp handoff reaches the approved business destination and that the message does not expose more customer data than necessary.
6. Where a cancellation is tested, verify stock restoration occurs exactly once and order history remains intact.

### 7.2 InstaPay-proof rehearsal

1. Create one controlled InstaPay order under the approved procedure.
2. Upload a non-sensitive test proof that is permitted for this exercise; do not upload an unrelated person’s banking information.
3. Confirm only the owning customer and an authorized administrator can view the proof.
4. Verify the administrator checks the actual business payment record before choosing `verified`, and uses the defined rejection path if the evidence is insufficient.
5. Test the approved retention, access-review, reference-removal, and physical-deletion evidence procedure without assuming that UI removal deletes the stored object.
6. Record the test order reference, route checks, payment/status outcomes, owner-alert outcome, and any defects.

**Gate closed when:** Both rehearsals have documented success, owner/admin handoff, privacy review, WhatsApp destination, status transitions, and recovery/cancellation behavior. The rehearsal must not be used to bypass staging or to infer merchant/legal approval.

## 8. Finish the remaining performance and release-quality work

Published accessibility is strong and responsive image-delivery work is verified, but the current published performance gate is still open. Recent cache-busting diagnostics measured variable first-byte response times before body transfer and no longer support speculative client, CSS, server-rendering, or managed-runtime rewrites.[4] [5]

### 8.1 Set an approved performance target

1. The release authority should define target mobile metrics for Home and Shop, including LCP, FCP, CLS, TBT, availability, and a measurement region/device profile.
2. Measure at least several cache-busting published runs over more than one time window; preserve raw reports and summaries under `reports/`.
3. Distinguish application response time, edge/cold-start response time, document delivery, image delivery, and client execution. Do not change CSP, `no-store`, staging crawl blocking, or RTL CSS merely to improve a single lab score.
4. If the same delivery-bound latency remains, raise it with the managed hosting provider or choose an approved hosting architecture after a cost/reliability review. Do not disable core safeguards to improve a Lighthouse metric.
5. Retest Home and Shop after any platform or code change, compare accessibility and CLS, and record acceptance or a continued no-go.

### 8.2 Resolve the administrator client-gate smoke test

The root toast/tooltip provider change is covered by automated tests, but a real signed-in administrator must still visit the relevant routes to verify that no administrator-only dependency needs local restoration. Use the same controlled administrator session from Section 3; do not promote an unrelated account merely to close this check.[1]

**Gate closed when:** The release authority has accepted the published performance evidence against stated targets and a real authorized administrator has completed the post-change route smoke test.

## 9. Final go/no-go review

Run this review only after every applicable gate above is closed. The release authority should complete one dated record rather than relying on verbal confirmation.

| Required confirmation | Evidence link or location | Approver | Pass / fail |
| --- | --- | --- | --- |
| Approved commercial catalog, rights-cleared images, prices, stock, tax, delivery, and contact data |  | Merchant |  |
| Approved Arabic privacy, sale, delivery, return, COD, InstaPay-proof, and contact policies |  | Merchant + qualified local legal adviser |  |
| Approved proof retention, access review, deletion, and physical-deletion evidence procedure |  | Merchant + qualified local legal adviser |  |
| Authorized administrator OAuth/passphrase smoke test and admin-route review |  | Authorized administrator |  |
| COD and InstaPay/WhatsApp business rehearsal |  | Merchant + authorized administrator |  |
| Independent uptime/error monitoring, alert recipient, escalation ownership, and tested alert |  | Operations owner |  |
| Non-destructive database/settings/order/storage-reference restore drill with RPO/RTO |  | Operations owner |  |
| Published performance meets approved target or has a written, accepted mitigation |  | Release authority |  |
| Current `pnpm release:check` output and hosted CI result |  | Technical owner |  |
| Explicit decision to move from staging to live commerce |  | Release authority |  |

If any row is missing, expired, disputed, or fails, record **NO-GO** and keep the store in staging. Once every applicable row passes, the release authority—not an automated task—may approve a deliberately reviewed transition away from staging. Immediately after the decision, repeat the public shop, checkout, administrator, health-monitor, and order-alert checks under the approved live operating procedure.

## 10. Normal operations after a future approved launch

Daily, review pending orders, validate stock before confirming orders, independently verify real InstaPay receipt before marking payment `verified`, update order statuses, and use archive/hide controls instead of deleting products with order history. Review the administrator settings whenever a business contact, payment destination, shipping rule, or delivery policy changes. Run `pnpm release:check` before software deployments; this technical check supports quality but never replaces merchant, legal, monitoring, recovery, or release approval.[3]

## 11. Key project references

The following repository records are the source of truth for technical detail and should be retained with this handover.

| Document | Use it for |
| --- | --- |
| `todo.md` | Authoritative completion history and remaining checklist items. |
| `AUTONOMOUS_COMPLETION_STATUS.md` | Staging boundary, completed safeguards, non-bypassable gates, and evidence summary. |
| `PRODUCTION_OPERATIONS.md` | Administrator access, daily order process, security/data handling, health checks, incident response, and recovery requirements. |
| `PRODUCTION_READINESS_AUDIT.md` | Independent readiness findings and priority risks. |
| `reports/admin-passphrase-authorization.md` | Temporary administrator authorization model and the remaining live OAuth smoke-test boundary. |
| `reports/independent-monitoring-authority-assessment-2026-08-24.md` | Why monitoring must be owned and have an approved alert/escalation path. |
| `reports/performance-candidate-decision-2026-08-24.md` and `reports/published-response-boundary-sample-2026-08-24.csv` | Measured performance constraints and raw response-boundary observations. |
| `reports/ci-runtime-upgrade-sources.md` | Hosted CI evidence for the protected non-default validation snapshot. |

## References

[1]: ./AUTONOMOUS_COMPLETION_STATUS.md "Mousa Glass Autonomous Completion Status"  
[2]: ./todo.md "Project TODO"  
[3]: ./PRODUCTION_OPERATIONS.md "Mousa Glass Production Operations Guide"  
[4]: ./reports/performance-candidate-decision-2026-08-24.md "Performance candidate decision"  
[5]: ./reports/published-response-boundary-sample-2026-08-24.csv "Published and local response-boundary diagnostic sample"
