# Mousa Glass Production Operations Guide

## Purpose and operating model

Mousa Glass is a server-rendered API and responsive web application for selling glass hardware and related products. It intentionally uses **manual payment confirmation** rather than a card processor: customers can choose **Cash on Delivery** or **InstaPay**, upload an InstaPay screenshot, and continue the conversation on the store WhatsApp number. This avoids payment-gateway subscription and transaction costs while retaining a traceable order record for the administrator.

| Area | Production implementation | Administrator responsibility |
|---|---|---|
| Authentication | Manus OAuth session flow with server-side role checks | Use the owner account for store administration; promote any additional staff accounts deliberately. |
| Catalog | Products, categories, stock, featured flags, and product-image metadata are stored in the relational database | Keep product copy, live pricing, stock counts, and images current. |
| Orders | Orders, line items, delivery details, payment method, proof metadata, and lifecycle status are stored in the database | Review new orders promptly and update their fulfillment status. |
| Files | Product photos and proof screenshots are stored as object files; the database stores only file references | Remove obsolete images and never use screenshots for any purpose other than verifying the related order. |
| Payments | COD or customer-submitted InstaPay proof, followed by WhatsApp confirmation | Confirm payment manually before marking an InstaPay payment as verified. |

## Initial release checklist

After publishing the application, sign in with the project owner account. The owner identity is granted the **admin** role automatically on first sign-in. Visit `/admin/settings` and set the current WhatsApp number, InstaPay handle, store name, and shipping fee before accepting orders. Then create categories at `/admin/categories`, add products at `/admin/products`, and add alternate product photos at `/admin/media`.

> Never publish the live catalog with placeholder prices, inaccurate stock, or a test WhatsApp number. The checkout screen derives payment and WhatsApp instructions from the administrator-controlled settings.

| Pre-launch task | Verification outcome |
|---|---|
| Configure store settings | WhatsApp handoff opens the active business number and the InstaPay handle is correct. |
| Create a product and image | The product appears in `/shop` with the correct price, stock, cover image, and details. |
| Place a test COD order | The order appears in `/admin/orders` and can be advanced through each fulfillment state. |
| Place a test InstaPay order | A proof image can be uploaded, opens only for an administrator, and moves the payment to review. |
| Review access | A customer account is unable to open administrator data or mutate catalog/order records. |

## Daily order process

For **Cash on Delivery**, check the delivery address and phone number, contact the customer if needed, and change the order from `pending` to `confirmed`, then `shipped`, and finally `delivered`. For **InstaPay**, review the proof image and the actual incoming payment in the business account; only then update the payment status to `verified` and confirm the order. Use `rejected` if the evidence is insufficient, and communicate that decision to the customer through WhatsApp.

An order is not automatically paid merely because an image was uploaded. The payment proof is evidence for a human review step, not a payment-provider confirmation.

## Security and data-handling controls

All account-scoped procedures use the authenticated user ID, and administrator procedures additionally require the `admin` role. The client UI mirrors these rules for clarity, but the server-side checks are the security boundary. Object uploads are limited to images, are size-constrained by the application workflow, and product/payment files are kept outside the relational database.

The administrator should use a separate, protected owner account for operational access. Do not share an administrator session or export customer delivery details unnecessarily. Payment screenshots, phone numbers, email addresses, and delivery addresses should be treated as sensitive business records and retained only for the operational period needed to serve the order and resolve any dispute.

## Cost-conscious production strategy

The application does not require a card-payment gateway, email service, paid analytics package, queue worker, or always-running virtual machine. It is designed for a serverless, autoscaling web runtime with a relational database and object storage. At low-to-medium traffic, this removes the most common avoidable recurring costs: card gateway fees, background-worker hosting, and dedicated infrastructure.

| Cost control | How the application applies it |
|---|---|
| Manual payment options | COD and InstaPay proof avoid card processor integration and transaction fees. |
| Serverless request lifecycle | No scheduled jobs, polling workers, or persistent processes are required. |
| Object storage for files | Image bytes are stored separately from database records, keeping database queries and backups smaller. |
| Typed API | tRPC keeps the storefront and server contract aligned without operating a separate API gateway. |
| Built-in OAuth | Customer and administrator sign-in uses the provided OAuth infrastructure rather than a separate identity subscription. |

The exact hosting and storage allowance depends on the provider and selected plan. Before a launch with significant catalog assets or traffic, monitor the hosting, database, and object-storage dashboards for current usage. The codebase avoids a paid dependency by design, but no platform can guarantee zero cost at unlimited traffic or storage volumes.

## Routine maintenance

Product and category changes do not require code deployment. Use the administrator interface for normal catalog maintenance. Check the dashboard for pending orders and best-selling products, review product stock before confirming orders, and remove products or hide categories instead of leaving unavailable products visible.

The core automated validation command is `pnpm test`; static type validation is `pnpm check`. Both should be run before any future application change is published. The current suite covers session logout behavior, administrator-only product and analytics access, product mutation, authenticated InstaPay checkout, proof storage, and proof rejection for unrelated orders.

## Recovery and escalation

If an order is entered incorrectly, do not delete customer information solely to correct a fulfillment mistake. Update the order status to `cancelled` where appropriate and preserve the history needed for reconciliation. If product images are accidentally removed, re-upload them through `/admin/media`. Use the project version history to restore code only after reviewing the effect on database data; restoring application files does not roll back order or catalog records already stored in the database.
