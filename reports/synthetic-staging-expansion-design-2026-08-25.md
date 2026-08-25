# Synthetic Staging Expansion Design

**Status:** Approved for staging-only implementation. This document defines a fictional QA dataset for technical validation. It does **not** authorize a production catalog, a payment destination, legal terms, customer communications, account promotion, or customer ordering.

## Purpose and non-negotiable boundary

The current database contains four active categories, five active products, five product images, and no orders, order items, or payment proofs. That is enough for basic browsing but insufficient to exercise catalog pagination, operational states, inventory pressure, and administrator reporting. The expansion will create internally consistent **fictional records** for development and QA only. `storeSettings.isCatalogStaging` must remain `true`, and the server-side checkout rejection must remain unchanged.

> Every generated product, price, inventory quantity, order, image, and campaign is a **staging fixture**. It must remain visibly disclosed as such in administrator surfaces and must never be represented as a merchant-approved fact.

## Dataset contract

| Area | Target fixture coverage | Safety boundary |
| --- | --- | --- |
| Catalog | 24 staging-fixture products: 22 active and 2 inactive/unpublished, across 6 active Arabic categories | Prices are fictional EGP test values; no real product or offer is claimed. |
| Inventory | In-stock, low-stock, and out-of-stock records | Stock exists only to exercise cart and administration behaviour. |
| Merchandising | Featured products and compare-at pricing for visibly discounted fixtures | No live promotion or coupon redemption is enabled. |
| Variants | Product-scoped test variants with fictional SKU codes and per-variant stock | Variant selection must flow consistently into cart and test order snapshots before being displayed as a capability. |
| Orders | Clearly labelled synthetic operational records across supported lifecycle/payment states | No actual customer, payment, contact, or proof data is created. Customer identity fields use non-contact test labels only. |
| Images | Original generated images owned for this staging fixture set, connected through existing object storage and media metadata | No third-party hotlinks, copyrighted product photography, merchant claims, or inaccurate branded packaging. |
| Dashboard | Derived aggregate metrics from synthetic order fixtures and catalog status | Presentation must label data as staging/test data so it cannot be mistaken for live commerce. |
| Reviews | None | Fabricated customer reviews, ratings, testimonials, or social proof are prohibited and will not be created. |
| Users and roles | No seeded OAuth users and no role promotions | OAuth identities are real-account records. Administrator access remains role-based or time-bounded passphrase authorization. |

## Sequenced implementation

| Step | Technical action | Acceptance evidence |
| --- | --- | --- |
| 1 | Extend the schema only where needed for SKU, compare-at price, product variants, and safe fixture labelling. | Reviewed migration, type check, and no migration that alters role or staging settings. |
| 2 | Add deterministic, idempotent fixture definitions with Arabic primary copy, English reference copy, known test states, and stable slugs/SKUs. | Fixture validator confirms unique slugs/SKUs, valid category references, non-negative stock, and valid price relations. |
| 3 | Generate a small reusable set of original product images, upload them through the managed static/media workflow, and record prompt/provenance. | Every media row resolves to an accepted generated image and carries Arabic alt text. |
| 4 | Wire variants and compare-at prices through product APIs, catalog cards, product detail, cart keys, stock checks, and order snapshots. | Automated tests prove a variant cannot exceed its own stock and two variants of one product do not merge in the cart. |
| 5 | Create server-controlled synthetic orders only when their status transitions, inventory accounting, and administrator labelling can be tested without a real checkout. | Dashboard and order tests use only `عميل تجريبي` labels, no emails, phones, addresses, proof files, or payment destinations. |
| 6 | Re-run release checks and explicitly verify checkout remains blocked while staging is enabled. | Test assertion and staged public UI both preserve the no-order boundary. |

## Explicitly deferred or excluded

This workstream does not create real customer accounts, role assignments, reviews, payment proofs, payment destinations, delivery prices, legal pages, or retention periods. It does not switch off staging, create a coupon that a customer can redeem, enable a purchase, or bypass the existing OAuth/passphrase boundary. The remaining business, legal, monitoring, backup/recovery, operational, and final-release requirements remain listed in [`../todo.md`](../todo.md) and the owner-facing handover in [`../OWNER_PRODUCTION_HANDOVER.md`](../OWNER_PRODUCTION_HANDOVER.md).

## Verified implemented state

The final guarded seed and read-only database checks confirm **24 synthetic fixture products** (22 active and 2 inactive), **6 active fixture categories**, **8 synthetic variants**, **5 synthetic orders**, and **19 managed fixture-image rows**. `storeSettings.isCatalogStaging` remains `1`. These records exist solely to exercise catalogue, inventory, variant, reporting, and order-lifecycle interfaces while server-side checkout continues to reject customer orders in staging.

## Data-replacement exit path

When approved merchant information becomes available, it must replace fixtures through the administration workflow or a reviewed import. Before changing `isCatalogStaging`, the owner must remove or archive every synthetic order and fixture, validate all product/media/business-policy values, complete the retained launch evidence, and make an explicit go/no-go decision. The fixture dataset is a test asset, not a shortcut around those controls.
