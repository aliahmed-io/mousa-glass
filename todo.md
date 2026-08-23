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
- [x] Audit the legacy site’s Arabic copy, right-to-left layout, fonts, images, colors, and component patterns.
- [x] Restore the public home and storefront interface to the legacy Arabic visual design.
- [x] Translate catalog, product, cart, checkout, order history, and payment-confirmation interfaces into Arabic with right-to-left behavior.
- [x] Restyle the administrator pages using the restored Arabic local design system.
- [x] Verify responsive Arabic layouts, legacy asset usage, automated tests, and type safety after the visual restoration.
- [x] Fix the restored Arabic storefront mobile hero presentation and verify home/shop behavior after the correction.
- [x] Directly review the Arabic ProductDetail, Checkout, Orders, DashboardLayout, and AdminDashboard implementations for copy, direction, and styling consistency.
- [x] Review the authenticated Arabic order/payment and administrator dashboard/products/settings views before release.
- [x] Verify and document whether any legacy product records or images are genuinely merchant-approved; keep the catalog empty until then.
- [x] Defer live catalog population until verified product records and associated images are provided; no placeholder merchandise has been added.
- [x] Configure verified WhatsApp and InstaPay payment details in store settings.
- [x] Exercise controlled COD and InstaPay checkout flows and verify the WhatsApp confirmation destination and message.
- [x] Document the owner sign-in process and secure administrator page access.
- [x] Capture and review the repaired Arabic home page at both desktop and mobile viewport sizes.
- [x] Configure WhatsApp and InstaPay using the two phone numbers supplied in the contact image.
- [x] Keep catalog presentation ready for verified products without adding placeholder merchandise.
- [x] Close the controlled preview checkout test as superseded by the updated storefront-only scope; no customer order, payment proof, or test merchandise remains.
- [x] Close the isolated checkout-test product task as superseded by the updated storefront-only scope; the temporary QA product was removed.
- [x] Remove all temporary product, order, and payment-proof data after browser-level verification.
- [x] Install and run Lighthouse against the Arabic home page and relevant customer paths.
- [x] Apply high-confidence Lighthouse performance, accessibility, and SEO remediations.
- [x] Re-run validation and document every remaining production-launch dependency or gap.

- [x] Upgrade admin analytics with richer operational summaries, inventory alerts, payment-review visibility, and clearer empty/loading/error states.
- [x] Make admin order detail views deep-linkable and reliable, including order items, customer details, payment proof, status updates, and refresh behavior.
- [x] Improve product creation and editing with stronger validation, image handling, stock controls, category assignment, and clearer feedback.
- [x] Improve category, media, and store-settings workflows for efficient daily administration.
- [x] Add and run targeted tests for admin permissions, filtered orders, order detail data, and product mutations.
- [x] Verify all upgraded admin routes at desktop and mobile sizes and save a new project checkpoint.

بحاجة إلى إضافة المنتجات الحقيقية لاحقاً من بيانات المتجر المعتمدة.

- [x] Upgrade admin analytics with richer operational summaries, inventory alerts, payment-review visibility, and clearer empty/loading/error states.
- [x] Make admin order detail views deep-linkable and reliable, including order items, customer details, payment proof, status updates, and refresh behavior.
- [x] Improve product creation and editing with stronger validation, image handling, stock controls, category assignment, and clearer feedback.
- [x] Improve category, media, and store-settings workflows for efficient daily administration.
- [x] Add and run targeted tests for admin permissions, filtered orders, order detail data, and product mutations.
- [x] Verify all upgraded admin routes at desktop and mobile sizes and save a new project checkpoint.
- [x] Prevent horizontal clipping in shared admin shell on narrow screens.
- [x] Run Lighthouse on public home, shop, product, cart, and checkout paths and record the findings.
- [x] Apply only verified Lighthouse remediations and re-run validation.
- [x] Split public and administrator pages into route-level chunks to reduce the initial JavaScript payload.
- [x] Enable HTTP compression for built assets and JSON responses in production.
- [x] Add an explicit loading state to the admin overview so pending analytics are not shown as zero.
- [x] Add initial-load and save-error handling to the admin store-settings workflow.
- [x] Run Lighthouse against a public product-detail path and record the result.
- [x] Save a fresh checkpoint after the final verified changes.

- [x] Remove the temporary QA product created for the interrupted browser checkout test.
- [x] Add Arabic public About, Contact, Delivery & Returns, and FAQ storefront pages.
- [x] Extend public navigation and footer links for the new customer-information pages.
- [x] Add an accessible main landmark to public storefront pages.
- [x] Improve mobile navigation, spacing, touch targets, and page layout across the customer storefront.
- [x] Address the supplied shop Lighthouse findings, including render-blocking resources, unused JavaScript, crawler files, and production asset delivery.
- [x] Run Lighthouse on About, Delivery & Returns, and FAQ at the mobile viewport and update the final audit record with those results.
- [x] Correct the confirmed About hero-image loading and dimensions, then resolve the Delivery & Returns contrast finding.
- [x] Replace the shared hero visual with a responsive optimized asset to reduce mobile LCP without changing the storefront art direction.
- [x] Exclude development-only JSX location instrumentation from production bundles to reduce initial JavaScript delivery.

> Browser checkout validation items 36–37 were intentionally superseded when the scope changed to complete the public storefront; no temporary order or payment-proof record was created.

- [x] Add customer-facing catalog filtering by product category.
- [x] Add customer-facing product sorting with Arabic labels and retained filter state.
- [x] Improve administrator category creation and editing for reliable daily category management.
- [x] Validate category filtering, sorting, and administrator category management with automated tests.
- [x] Verify the updated catalog controls at mobile and desktop breakpoints.
- [x] Run and document a Lighthouse audit against the deployed production storefront.
- [x] Verify the updated catalog filtering and sorting controls at a desktop breakpoint.

- [x] Expand the Arabic landing page with richer conversion-oriented storefront sections and calls to action.
- [x] Preserve mobile responsiveness, accessibility, and lightweight image loading in the expanded landing-page sections.
- [x] Validate the expanded landing page with type checks, automated tests, and mobile/desktop visual review.
- [x] Resolve the landing-page Lighthouse accessibility finding and confirm the expanded page remains performance-conscious.

- [x] Inventory the architecture, repository structure, dependencies, routes, and deployment configuration for the production-readiness audit.
- [x] Audit customer storefront, e-commerce flows, responsive behavior, accessibility, and functional UI coverage.
- [x] Audit backend APIs, OAuth, RBAC, database, storage, and security controls against the supplied checklist.
- [x] Validate tests, production deployment behavior, observability, performance, and documented operational gaps.
- [x] Write a point-by-point production-readiness report with verified status, evidence, risk classification, and remediation priorities.
- [x] Restrict payment-proof file downloads to the owning customer or an administrator and validate the access control.
