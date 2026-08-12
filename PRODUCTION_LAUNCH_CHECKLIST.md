# Mousa Glass production launch checklist

## Engineering status

The application has the full-stack foundation required for launch: Manus OAuth authentication, server-side administrator role checks, a typed tRPC API, relational commerce schema, object storage for product and payment images, Arabic RTL storefront routes, catalog and category management, order administration, COD checkout, InstaPay proof upload, and WhatsApp confirmation handoff. The final validation pass completed with `pnpm check`, `pnpm test`, and `pnpm build` passing. The automated suite reports 12 passing tests.

## Business data still required

| Required before publishing | Why it matters | Where to complete it |
|---|---|---|
| Real product names and Arabic descriptions | The current catalog is intentionally empty and contains no fabricated merchandise data | `/admin/products` |
| Supplier-confirmed prices in EGP | Prevents incorrect customer charges or manual corrections | `/admin/products` |
| Actual stock counts | Keeps unavailable products from being ordered | `/admin/products` |
| Product and category images | Replaces empty catalog states and gives customers usable product detail pages | `/admin/products` and `/admin/media` |
| Correct categories and ordering | Makes the catalog easy to browse | `/admin/categories` |
| Shipping fee and delivery coverage | Ensures checkout totals and customer expectations are accurate | `/admin/settings` |
| Final WhatsApp and InstaPay verification | The configured values currently reflect the supplied test/contact numbers; verify the business accounts before publishing | `/admin/settings` |

## Owner and access actions

Sign in with the Manus account that owns this project, then open `/admin`. The owner identity is the only account automatically granted the administrator role. Keep the owner session private. If staff need access, promote only deliberate accounts through the database/admin process and verify that a normal customer account cannot access administrator data.

## Operational acceptance tests

Before accepting paid orders, place one controlled COD order and verify that it appears in the administrator order workspace, can be opened by its order number, and moves through the intended fulfillment statuses. Place one controlled InstaPay order using a real internal transfer only if the business is ready to reconcile it; verify that the proof is stored, that the order enters payment review, and that the WhatsApp message opens with the correct order summary. Delete or cancel any internal test order according to the store's record-retention policy rather than leaving it in sales analytics.

The current automated tests cover these workflows at the API/database boundary. A real browser checkout test remains a launch acceptance task because the production catalog is intentionally empty and the owner has not yet supplied the final merchandise data.

## Publish and domain actions

After the checklist is complete, create a final checkpoint and use the Management UI's **Publish** action. Bind the store's custom domain if one is available, then verify the HTTPS site on a phone and desktop. Confirm that OAuth returns to the published domain, public product links open correctly, WhatsApp opens the intended business number, and private routes remain inaccessible to customer accounts.

## Ongoing low-cost operation

Normal catalog and order work does not require code changes. The application does not depend on a card processor, paid email provider, background worker, or always-running server. Monitor hosting, database, and object-storage allowances as traffic and image volume grow; “near-zero maintenance cost” is achievable for low-to-medium volume, but provider quotas and domain costs still apply.
