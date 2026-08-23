# Mousa Glass Launch Approval Packet

**Status:** Pending merchant and qualified local legal review. This document is an operational approval record, **not legal advice**.

## Purpose

The application now protects payment-proof access, requires a chosen retention period before accepting non-staging InstaPay orders, and allows an administrator to remove proof references after review. These controls do not decide the store's lawful or commercial policy. Complete and approve the decisions below before turning off staging mode.

## Merchant decisions required

| Decision | Approved value | Approver | Approval date | Evidence / source |
| --- | --- | --- | --- | --- |
| Legal business name and customer-service contact route | Pending | Pending | Pending | Registration/contact evidence |
| Store address and delivery coverage | Pending | Pending | Pending | Delivery policy |
| Categories, products, EGP prices, stock, tax treatment, and imagery | Pending | Pending | Pending | Approved catalog sheet |
| COD acceptance, confirmation, cancellation, and refund process | Pending | Pending | Pending | Operations SOP |
| InstaPay receiving identity and proof-review responsibility | Pending | Pending | Pending | Payment SOP |
| Proof-retention duration in days | Pending | Pending | Pending | Approved privacy/policy decision |
| Who may review proofs and how access is reviewed | Pending | Pending | Pending | Access-control register |
| Proof removal cadence and physical managed-storage deletion method | Pending | Pending | Pending | Tested deletion record |

## Customer-facing policies requiring review

| Policy | Current app posture | Required before unrestricted launch |
| --- | --- | --- |
| Privacy notice | Not published | Arabic disclosure for names, phone, address, email, payment proofs, retention, and data-request contact route. |
| Terms of sale | Not published | Order acceptance, pricing, availability, cancellation, delivery, payment, and dispute terms. |
| Returns/exchange | Draft informational page only | Product-specific and legally reviewed conditions, exclusions, timeframe, and process. |
| Payment-proof notice | Settings control exists; no approved policy | Explain why proof is requested, who can view it, how long it is retained, and how deletion/data requests are handled. |
| Cookie/analytics notice | Not published | Decide and publish the appropriate disclosure/consent approach. |

## Required operational evidence

1. Record the approved proof-retention duration in **Admin → Settings** before enabling non-staging InstaPay checkout.
2. Run and record a database/settings/storage-reference backup-and-restore drill, including recovery owner and target RPO/RTO.
3. Verify whether the managed storage provider supports physical deletion of payment-proof objects, implement the approved process, and retain evidence of a test deletion. Removing a proof reference today prevents retrieval through the app but is **not evidence of physical object deletion**.
4. Run a controlled authenticated COD and InstaPay test using approved catalog data; record customer checkout, WhatsApp handoff, proof review, order transitions, cancellation/restock, and customer communication.
5. Obtain sign-off from the business owner and appropriate qualified adviser before enabling customer orders.

## Managed-platform recovery evidence

Do **not** assume this project or account is affected by any platform-wide service event. The account owner's in-app notice and email are the source of truth. If an official backup notice applies, the owner must create the applicable Task Data Backup before its stated deadline and retain the complete export package unchanged. A source-code download alone is not enough because it omits the managed database, stored files, secrets, and service configuration.

For an affected website with active commerce, record the following before any recovery action:

| Evidence | Required record |
| --- | --- |
| Snapshot schedule | Time of each snapshot and a final current snapshot before the applicable deadline; snapshots are point-in-time and do not include later orders, uploads, or settings changes. |
| Package custody | Destination, checksum or platform confirmation, and confirmation that all complete export packages were retained without renaming or mixing split sets. |
| Recovery owner | Named owner authorized to perform restoration and re-enable any restored third-party connectors. |
| Restore validation | Post-restore check of current domain mapping, admin access, settings, database records, product images, payment-proof authorization, and checkout staging mode. |
| Business continuity | Customer communication and manual order-capture approach for any period in which the managed service is unavailable. |

> Restoration or any destructive recovery action must be performed only after the owner confirms the official eligibility, scope, and current platform instructions. Keep every available complete snapshot because restoration may be a one-time action.

## Staging-to-live search-discovery handoff

Generated seed products are intentionally excluded from search discovery. The server blocks `/shop` and `/products/` in `robots.txt`, omits them from `sitemap.xml`, and sends `X-Robots-Tag: noindex` while **Catalog staging mode** is on. Do not turn this mode off merely to improve search visibility.

After approved products, prices, images, tax/delivery details, policies, and the real authenticated order rehearsal are complete, the administrator should: (1) set the final public domain in `PUBLIC_SITE_URL` through approved environment configuration; (2) replace the generated catalog with merchant-approved records; (3) record the approved retention duration; (4) disable Catalog staging mode; and (5) verify that `robots.txt` permits `/shop` and `/products/`, `sitemap.xml` includes approved product URLs, canonical/OG URLs point to the final domain, and product JSON-LD is present. Submit the verified sitemap only after this check.

## Authorization

> Leave staging mode enabled until every P0/P1 launch gate in `PRODUCTION_READINESS_AUDIT.md` is either verified or explicitly accepted by the authorized business owner with a documented compensating control.

| Role | Name | Signature / recorded approval | Date |
| --- | --- | --- | --- |
| Business owner | Pending | Pending | Pending |
| Operations owner | Pending | Pending | Pending |
| Qualified legal reviewer, where applicable | Pending | Pending | Pending |
