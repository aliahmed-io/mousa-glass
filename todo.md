# Project TODO

- [x] Define the low-maintenance production architecture, data model, and operational assumptions.
- [x] Add product, category, product image, order, order item, payment proof, and store settings tables.
- [x] Generate and apply database migrations for the e-commerce schema.
- [x] Implement role-protected tRPC procedures for catalog, product CRUD, order workflow, dashboard metrics, and customer order history.
- [x] Add secure object-storage flows for product images and InstaPay payment proof screenshots.
- [x] Build the responsive public storefront with catalog, product detail pages, persistent cart, and account entry points.
- [x] Build checkout for Cash on Delivery and InstaPay proof submission with WhatsApp confirmation handoff.
- [x] Build authenticated customer order history and order status tracking.
- [x] Build an admin dashboard with totals, revenue, pending orders, top products, and recent orders.
- [x] Build administrator product, category, inventory, image, payment proof, and order-status management interfaces.
- [x] Add Vitest coverage for authentication behavior, product administration, and the order-payment flow.
- [x] Add administrator controls to review, upload additional, and delete existing product images.
- [x] Add administrator category editing controls for names, slugs, descriptions, visibility, and ordering.
- [x] Expand Vitest coverage for protected access, product updates, and rejected payment-proof scenarios.
- [x] Run and verify the expanded product, permission, and rejected payment-proof tests.
- [x] Run automated checks, test the critical responsive paths, and resolve identified issues.
- [x] Document production operation, security controls, and cost-conscious deployment choices.
