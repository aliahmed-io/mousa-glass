# Mousa Glass Production-Readiness Audit

**Audit date:** 23 August 2026  
**System assessed:** Mousa Glass — Arabic RTL e-commerce storefront for Hurghada, Egypt  
**Scope:** React 19/Tailwind customer storefront; Express/tRPC backend; Drizzle/MySQL-compatible database; Manus OAuth; managed object storage; admin workspace; current published Manus deployment; operational documentation.  
**Overall decision:** **NOT READY FOR UNRESTRICTED CUSTOMER LAUNCH.** The application is a sound **pre-production commerce foundation** with secure server-side RBAC, a functional admin workflow, responsive Arabic storefront, managed payment-proof protection, and passing automated tests. It has a clearly disclosed non-orderable seed catalog rather than merchant-approved commercial data, lacks several production safeguards and business/legal inputs, and has not been proven end-to-end with real customer data or payments.

> **Assessment convention:** **PASS** means directly verified during this audit. **PARTIAL** means implemented but not fully proven in the required conditions. **UNVERIFIED** means no safe or reliable evidence was available. **NOT APPLICABLE** means the requirement does not apply to the selected manual COD/InstaPay model.

---

## 1. Executive summary

The current application is correctly positioned as an **Arabic-first, RTL, catalog-led local commerce site**. It provides customer routes for the landing page, shop, product detail, cart, checkout, orders, Contact, About, Delivery & Returns, and FAQ. Administrator routes cover dashboard metrics, products, categories, media, orders, payment status, and store settings. The backend uses tRPC contracts, Zod input validation, Manus OAuth sessions, server-side `adminProcedure` enforcement, transactional order creation, atomic stock decrement, and managed object storage.

The core engineering is credible, but the business is not yet sale-ready. A clearly disclosed, non-orderable generated staging catalog now exists to validate product discovery and administration; it is **not** merchant-approved commercial content. The mandatory first launch gate is therefore **merchant-approved catalog content and a controlled real workflow rehearsal**. The remaining technical gate is distributed abuse protection, legal pages, monitoring, and backup/restore evidence.

### Post-audit remediation update

Since the baseline audit, the application has added a generated Arabic staging catalog with source-recorded generated imagery, an order-disable switch, global staging disclosures, and administrator-sourced public contact data. `STAGING_ASSET_PROVENANCE.md` records the generation date, constrained source prompts, asset URLs, replacement history, and limited intended-use boundary for all five staging images and their responsive derivatives; it is not merchant approval or a legal licence opinion. The checkout now sends a client UUID idempotency key; the database stores a request fingerprint and unique user/key pair, replays an identical retry safely, and rejects key reuse with different order details. The server also now applies a tested same-origin mutation guard, explicit trusted-origin CORS/preflight handling, restrictive browser-security headers, reduced parser limits, request/upload throttles, image-signature checks, safe response `X-Request-Id` correlation identifiers, and structured tRPC failure diagnostics containing only the correlation identifier, procedure path, and error classification. Commerce data now has reviewed foreign keys and indexes, a transactionally enforced order/payment transition matrix, and exactly-once cancellation stock restoration. A non-sensitive health endpoint, post-write best-effort owner alerts for orders/proofs, and a GitHub Actions release workflow are now present. The current local `pnpm release:check` command validates the health contract, alert triggers and failure containment, diagnostic logging behavior, workflow formatting, production dependency audit, type checking, **57 regression tests**, the production build, and five assigned staging assets plus five responsive derivatives. The safe GitHub branch has completed three hosted validation runs with frozen install, production audit, check, tests, and build all passing; the latest is [run 32666075640](https://github.com/aliahmed-io/mousa-glass/actions/runs/32666075640) for safe-branch commit `923157eb6fc155383ef646f98130b3def81b5e2c`. These are meaningful **P1 risk reductions**, not approval for unrestricted launch: rate limiting remains per-process on autoscaling infrastructure, and genuine merchant data, policy approval, external monitoring, recovery evidence, and real E2E validation remain mandatory.

| Decision area | Audit result | Launch implication |
|---|---|---|
| Arabic RTL customer storefront | **PASS** | Suitable visual and navigational foundation for Egypt-local commerce. |
| Admin product/category/order operations | **PASS** | Capable of day-to-day catalog and order administration. |
| Authentication and role enforcement | **PASS** | OAuth session plus server-side owner/admin controls were inspected. |
| Catalog readiness | **FAIL — P0** | A non-orderable generated staging catalog exists; real approved products, prices, stock, and images do not. |
| Payment-proof confidentiality | **PASS after remediation** | Storage proxy now requires order owner or administrator for proof files. |
| COD/InstaPay business flow | **PARTIAL — P1** | Code exists, but real end-to-end validation was intentionally not completed. |
| Abuse, fraud, and operational controls | **PARTIAL — P1/P2** | Same-origin guard, headers, local throttles, idempotency, health checks, best-effort owner notifications, CI, and a clean production dependency audit exist; distributed limiting, external error monitoring, and backup evidence remain missing. |
| Mobile, accessibility, and local-build performance | **PASS / PARTIAL** | Strong local Lighthouse accessibility/SEO; published-host performance remains variable. |

---

## 2. Evidence and audit limits

### 2.1 Evidence collected

| Evidence source | Result | Used for |
|---|---|---|
| Published storefront `https://mousaglass-393f3nnk.manus.space/` | Loaded successfully in an interactive browser. Arabic RTL header, public routes, cart state, WhatsApp CTA, and empty catalog state rendered. | Live reachability and customer-facing rendering. |
| Reproducible validation | `pnpm release:check` completed: production dependency audit, `pnpm check`, `pnpm test`, `pnpm build`, and verification of five assigned staging assets plus five responsive derivatives. Latest suite: **11 test files, 57 tests passed**. It includes lifecycle/restock, protected-storage, request-security, correlation-ID and non-PII diagnostic-log safety, historical-product deletion, administrator archive-path, retention-gate, proof-reference-deletion, crawler/structured-data, health-contract, owner-alert, provider-scoping, responsive banner/product media, and reverse-layout-shift regressions. | Build integrity and automated regression coverage. |
| Latest local production build | Deferring the eager Home and Shop modules reduced the shared entry from **712.62 kB / 202.52 kB gzip** to **626.00 kB / 188.95 kB gzip**. Dedicated `Home` and `Shop` chunks are **40.04 kB / 6.03 kB gzip** and **16.46 kB / 3.58 kB gzip** respectively; the shared entry still emits a chunk-size warning. | Verified code-splitting reduction; re-measure the published deployment before treating it as a live Core Web Vitals improvement. |
| Published-deployment Lighthouse | Fresh mobile Home audit after deployment: **63 Performance, 95 Accessibility, 93 Best Practices, 100 SEO**. Measured FCP **3.5 s**, LCP **4.5 s**, TBT **50 ms**, CLS **0.134**, and Speed Index **10.6 s**. The code-split build improved the earlier published performance score of 40 but does not yet meet a strong launch target. | Live performance baseline after route splitting. Primary measured opportunities are 2.16 s initial-server-response savings, 3.78 MiB image-delivery savings, 300 ms unused-JavaScript savings, and 250 ms render-blocking insight. |

After that audit, the Home page was updated to reserve category/product-card space while catalog queries resolve, and all five assigned staging images were replaced with documented 960-pixel WebP delivery derivatives. The Home category banner was also converted from a **3.7 MiB** 2560×1440 PNG payload to a visually reviewed **22 KiB** 960×540 WebP derivative. The five catalog-image delivery files total approximately **280 KiB** (down from approximately **20 MiB** source JPEGs). Local type checks, 48 regression tests, production build, visual rendering, database assignment verification, and the repeatable assigned-asset verifier passed. A new published Lighthouse run is still required before quantifying any real change to LCP, CLS, or total image transfer.

> **Deployment-measurement boundary — 2026-08-23:** Immediately after checkpoint `0f55a418`, cache-busted published Home requests showed the compressed staging-product WebP files but still requested the prior `category-banner_dbe4fbaa_df28b4b8.jpg` URL. This indicates deployment or asset-manifest propagation was not yet complete for the category-banner code change. Do not use a Lighthouse run from that interim state to assess the banner optimization; first verify the `/manus-storage/mousa-glass-category-banner-960_fce01c36.webp` resource in the published graph.

After propagation completed, a cache-busted published Home page confirmed the new category-banner WebP path and all five assigned 960-pixel product WebP paths. A fresh mobile Lighthouse audit then returned **62 Performance, 96 Accessibility, 92 Best Practices, and 100 SEO**, with FCP **3.6 s**, LCP **4.5 s**, TBT **80 ms**, CLS **0.134**, and Speed Index **12.1 s**. The image-delivery estimate fell from **3.78 MiB** to **105 KiB**, which confirms that the media-delivery intervention materially reduced the audit’s image-payload finding. Variance in the overall score and unchanged LCP mean this is not a Core Web Vitals pass: the current audit still identifies a **2.77 s** initial-server-response opportunity, **53 KiB** unused JavaScript, **230 ms** render-blocking insight, one layout shift, console errors, contrast, bfcache, and residual image-delivery findings. These must remain in the launch-gate register until ownership and remediation evidence are clear.

Focused report inspection attributes the measured layout shift to the Home hero moving after the catalog-mode query inserts the staging disclosure. The local follow-up now fails closed for the first paint (`isCatalogStaging !== false`), reserving the disclosure before the query settles; type checking, 48 tests, build, and mobile visual review passed. The remaining bfcache failures are explicitly marked **not actionable** by Lighthouse because the managed response and a managed JavaScript request use `Cache-Control: no-store`. The console errors are CSP blocks for managed analytics scripts at `manus-analytics.com` and `plausible.io`; no application script or customer data is implicated. Published re-audit evidence remains required for the new layout reservation and narrowed contrast rule.

The cache-busted published re-audit after checkpoint `cbe33973` confirms the compact-logo, narrowed contrast, and first-paint staging-banner build is live. It reports **62 Performance, 100 Accessibility, 92 Best Practices, and 100 SEO**; the prior product-category contrast finding is absent and CLS is **0**, so the specific contrast and staging-banner layout-shift remediations are now supported by published evidence. The audit is not a Core Web Vitals pass: FCP is **3.7 s**, LCP is **5.6 s**, TBT is **100 ms**, and Speed Index is **12.2 s**. It retains a **2.45 s** initial-server-response opportunity, **53 KiB** unused JavaScript, **250 ms** render-blocking insight, and **8 KiB** residual image-delivery opportunity. The console and bfcache findings remain CSP/cache-control reports attributable to managed injected scripts and managed `no-store` headers, not application execution defects. Further performance work must distinguish those platform-controlled limits from application-owned changes.

| Lighthouse finding | Evidence and disposition | Status |
| --- | --- | --- |
| Console errors | CSP reports block analytics scripts from `manus-analytics.com` and `plausible.io`; no Mousa Glass application code or customer data is involved. | **Managed platform constraint**; monitor after any platform configuration change. |
| ARIA role | Published Home and Shop reports identified `role="status"` as invalid on the staging `<aside>`. The component now uses valid `aria-live="polite"` and `aria-atomic="true"` attributes; the published post-deployment audit has empty `ariaAllowedRole` and `ariaRoles` findings. | **Verified application fix**. |
| Contrast | The product-category label rule was narrowed and published Home/Shop re-audits report no color-contrast finding. | **Verified application fix**. |
| Back/forward cache | Lighthouse marks the managed response and injected script `Cache-Control: no-store` behavior as not actionable. | **Managed platform constraint**; no application override should be attempted. |
| Initial server response | Published Home and Shop audits still estimate 2.45–2.58 seconds of avoidable response delay. | **Managed hosting / deployment investigation remains open**; no unsupported server-side workaround is assumed. |

The matching published Shop re-audit reports **68 Performance, 100 Accessibility, 92 Best Practices, and 61 SEO**. Its `colorContrast` finding is empty, corroborating the shared scoped product-card selector in both Home and Shop. The intentionally low Shop SEO score results from the staging crawler policy blocking generated catalog indexing; it is expected and must not be “fixed” until merchant-approved catalog data replaces the staged records. Shop remains outside Core Web Vitals targets (FCP **3.3 s**, LCP **4.5 s**, TBT **100 ms**, CLS **0.002**, Speed Index **10.5 s**) and retains a managed **2.58 s** server-response opportunity plus app bundle/image follow-up work.

The published post-deployment ARIA re-audit after checkpoint `8310fe33` returns **63 Performance, 100 Accessibility, 92 Best Practices, and 100 SEO**. Its `ariaAllowedRole` and `ariaRoles` result arrays are both empty, confirming the staging-disclosure live-region correction is active in the deployed Home page. Current measured values remain outside a strong Core Web Vitals target (FCP **3.7 s**, LCP **5.4 s**); this audit closes the specific ARIA finding but does not close the broader performance gate.

The current build adds a visually verified 768px WebP derivative to the Home category-card `srcSet` with responsive `sizes` metadata, preserving the existing 960px source for larger displays. The derivative is **20,402 bytes** and targets the remaining small-screen overfetch observed in the published audit. A cache-busted published mobile Lighthouse audit after checkpoint `8f831ee1` reports **61 Performance, 100 Accessibility, 92 Best Practices, and 100 SEO**; FCP is **3.9 s**, LCP **5.7 s**, TBT **90 ms**, CLS **0**, and Speed Index **14.9 s**. Its `imageDelivery` evidence array is empty, which closes the specific residual small-screen image-delivery finding. The performance score remains volatile and outside a strong Core Web Vitals target because the report still estimates a **3.34 s** initial-server-response saving and **36 KiB** unused JavaScript; this audit does not close the wider performance gate.

> **Latest published remeasurement — checkpoint `8035fc77`:** A cache-busted mobile Home audit stored as `reports/published-home-8035fc77-cwv.json` reports **55 Performance, 100 Accessibility, 92 Best Practices, and 100 SEO**, with FCP **6.4 s**, LCP **8.1 s**, TBT **110 ms**, CLS **0**, and Speed Index **27.6 s**. The run keeps `imageDelivery`, contrast, and ARIA-role evidence empty; it reports approximately **37 KiB** unused JavaScript and a **1.67 s** server-response opportunity. Managed injected-script CSP reports and managed `no-store` bfcache reports persist. This cold-path lab result confirms no accessibility or layout-stability regression but materially reinforces the open published-performance and managed-hosting investigation; it must not be presented as a Core Web Vitals pass or used to weaken CSP, cache, or staging safeguards.

The Shop follow-up adds full-composition 480×600 WebP derivatives for each of the five explicitly documented generated staging products and uses `srcSet`/viewport `sizes` only when a product image matches a known staged URL. Product records, database references, and future merchant media behavior are unchanged: unknown URLs retain their original `src`. All ten staged-media paths validate through the release verifier, a mobile Shop visual check renders the cards, and source-versus-derivative inspection confirms that the two near-black thumbnails reflect the intended noir source artwork rather than failed image delivery. A published post-deployment Shop check and Lighthouse re-audit remain required before crediting transfer reduction or closing the broader performance gate.

Local bundle follow-up found no production use of the root `Toaster` or global `TooltipProvider`; tooltip usage is limited to an un-routed component showcase. Removing those providers from `App` reduced the shared entry from **626.00 kB / 188.95 kB gzip** to **547.63 kB / 163.79 kB gzip** in a full local production build. Focused regressions now assert that `App` and all routed administrator source modules import neither provider nor `sonner`, while the only remaining `sonner` use is in the un-routed showcase. A companion regression locks the 768/960 category-banner source set and breakpoint-aware `sizes` metadata. Type checks, 51 regression tests, build, and mobile Home/Shop visual checks passed. The responsive-banner published audit records **36 KiB** unused JavaScript from the transferred shared entry; it is not a direct before/after attribution because lab conditions vary. A cache-busted published `/admin` visit correctly rendered the Arabic access-denied state for the available authenticated non-admin account. Privileged administrator interaction testing remains an account-authority gate, and no role was changed merely to close that verification item.

The locally validated follow-up raises the Home and Shop product-category labels from 65% to 80% gold opacity over the dark card surface, preserving the noir-and-gold hierarchy while clearing the identified 4.4:1 category-label contrast condition by design. Type checking, all 48 regression tests, the production build, and mobile visual checks passed. A published re-audit is still required before recording this as a live accessibility result.

The same local validation pass replaces the prior **99,657-byte** 1254px JPEG logo with a visually verified **3,134-byte** 128px WebP derivative in the 40–44px public and admin logo placements. This preserves the existing full square composition and eliminates an unnecessary small-placement image transfer. Its effect on the published audit has not yet been measured.

> **Deployment-measurement boundary — 2026-08-23:** The first cache-busted published request after checkpoint `6a5f5e2a` still referenced the prior `pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d_32f06135.jpeg` logo path. Do not treat the compact-logo or scoped-contrast changes as live until a propagated published resource graph confirms the `mousa-logo-128_bf907234.webp` path.
| Published browser timing snapshot | An earlier interactive-browser home navigation observed approximately **2.75 s response start**, **4.45 s DOM content loaded**, and **4.46 s load completion**. The first post-checkpoint visit reported **1.69 s response start**, **2.78 s DOM content loaded**, and **3.55 s load completion** while an older entry was cached. Direct cache-busted HTML inspection later confirmed a newly deployed entry asset (`index-D_Mcvf7A.js`), and a cache-busted interactive-browser visit completed the Arabic home-page render after the expected short route-loading state. Its resource graph separately loaded `Home-DVvHxl9H.js` (**4.8 kB transferred**) and `StoreLayout-B9YoD_N3.js` (**4.4 kB transferred**) beside the shared entry (**128.0 kB transferred**), confirming live route splitting. | Deployment propagation and live code splitting are confirmed. These are still supplemental lab signals, not a Lighthouse run, field Core Web Vitals, or an availability SLA. A fresh published audit is still required before closing the live-performance gate. |
| Current local production Lighthouse | Expanded Home: **85 Performance, 100 Accessibility, 82 Best Practices, 100 SEO**; FCP 3.3 s, LCP 3.3 s, CLS 0.012, TBT 110 ms. | Regression and responsive-page validation. |
| Database inspection | 1 user, 1 store-settings row, **4 generated staging categories, 5 generated staging products, 5 product-image records, and 0 orders, order items, or payment proofs**. `isCatalogStaging` is enabled, so customer order creation is disabled. | Catalog readiness and safe data assessment. |
| Development runtime probes | `GET /healthz` returned HTTP 200 and only `{ status, service, timestamp }`; `GET /api/healthz` is the external-probe alias because the managed edge reserves the direct path. After checkpoint `2a6fa506`, the published alias returned HTTP 200 JSON with the same health contract and an opaque `X-Request-Id`. Staging `robots.txt` disallowed shop/product discovery and `sitemap.xml` omitted staging catalog URLs. | Health contract and staging-safe crawler behavior. |
| Code inspection | Schema, DB helpers, router, tRPC middleware, OAuth, cookie policy, storage proxy, admin pages, public layout, metadata, crawler policy, operations guide, and CI workflow reviewed. | Architecture, security, data, and operations conclusions. |

### 2.2 Limitations

The application was not tested with a real customer, real product data, a real order, an actual InstaPay transfer, or a completed WhatsApp confirmation. The owner requested that the remaining authentication/payment validation be removed from the earlier scope, so this report does not claim that those business workflows are end-to-end proven. No destructive data test, load test, penetration test, external DNS test, or financial reconciliation test was performed.

Command-line probes to the published hostname intermittently timed out while the same public storefront loaded in the interactive browser. This is recorded as a **reliability/observability limitation**, not proof that the website is unavailable. A later bounded `pnpm audit --prod --json` completed after dependency updates with **0 low, 0 moderate, 0 high, and 0 critical** reported vulnerabilities across 469 production dependencies.

---

## 3. Architecture and repository assessment

### 3.1 Confirmed architecture

```text
Arabic React 19 + Tailwind 4 client (Wouter, React Query, client-side cart)
        ↓ tRPC under /api/trpc
Express 5 application (compression, OAuth callback, storage proxy, static serving)
        ↓
Drizzle ORM → MySQL/TiDB-compatible database
        ├─ users, categories, products, productImages
        ├─ orders, orderItems, paymentProofs
        └─ storeSettings
        ↓
Managed object storage (public product imagery; protected InstaPay proof delivery)

External systems: Manus OAuth, managed database/storage/hosting/analytics,
WhatsApp deep links, manual COD and InstaPay confirmation operations.
```

| Checklist point | Status | Evidence and conclusion |
|---|---|---|
| Clear separation of frontend, API, persistence, storage, and auth | **PASS** | `client/`, `server/`, `drizzle/`, and managed storage are separated; tRPC is the typed API boundary. |
| Maintainable route and module organization | **PARTIAL** | Core files are discoverable, but `server/routers.ts` and `server/db.ts` are large central modules and should be split by feature before significant growth. |
| Shared e-commerce vocabulary | **PASS** | Categories, products, images, orders, items, payment proofs, and settings have dedicated schema and procedure names. |
| Vendor lock-in awareness | **PARTIAL** | The app intentionally uses Manus OAuth, hosting, storage, and database platform services. Low maintenance cost is strong; exit/recovery runbook and export process need more proof. |
| Environment/secrets handling | **PASS** | System secrets are injected rather than stored in source. Static scan did not find committed `.env`/key material. The optional `TRUSTED_WEB_ORIGINS` setting accepts only explicit additional browser origins for CORS and mutation checks; its value is not stored in source. |
| CI/CD pipeline | **PASS / PARTIAL** | `.github/workflows/ci.yml` runs frozen install, production dependency audit, type check, tests, and build on push to `main`, `production-readiness-audit-plan`, and the non-default `production-readiness-verified-*` snapshot pattern, plus pull requests. After removing a duplicated pnpm version declaration, [GitHub Actions run 32655491665](https://github.com/aliahmed-io/mousa-glass/actions/runs/32655491665) succeeded at safe-branch commit `1c8cb349d5821821b933aba463ddc192126b6ff6`. A production smoke test and a protected/main-branch integration process remain absent. |

---

## 4. Arabic RTL e-commerce storefront and customer journeys

### 4.1 Customer-facing feature matrix

| Requirement | Status | Verified implementation |
|---|---|---|
| Arabic language and RTL | **PASS** | Document root has `lang="ar" dir="rtl"`; shared public shell and pages use Arabic copy and RTL layout. |
| Responsive header and mobile navigation | **PASS** | Shared layout includes responsive navigation and mobile controls; mobile screenshots were reviewed on the catalog, information pages, and home page. |
| Home / landing page | **PASS** | Extended landing page contains product-oriented value introduction, service journey, FAQ preview, WhatsApp and catalog CTAs. |
| Catalog browsing | **PASS** | `/shop` supports search, active categories, server-side category filtering, featured/newest/price/name sorting, pagination bounds, and URL-retained controls. |
| Product details | **PASS** | `/products/:slug` route and public product lookup exist. |
| Category browsing | **PASS** | Active categories are displayed publicly; admin can organize sort order and visibility. |
| Cart | **PASS** | Client cart route and header cart affordance exist; empty-state handling was live-observed. |
| Checkout | **PARTIAL** | Protected checkout/order API is implemented, but no populated cart plus authenticated real-world checkout was completed during this audit. |
| Customer orders | **PARTIAL** | Authenticated `mine` and `get` procedures enforce ownership; no real customer history exists to validate UX. |
| Customer-service pages | **PASS** | Arabic About, Contact, Delivery & Returns, and FAQ routes exist with public navigation and footer links. |
| WhatsApp handoff | **PASS / PARTIAL** | WhatsApp deep links use editable settings and order numbers; no live business confirmation was completed. |
| No fabricated reviews | **PASS** | No mock testimonials, ratings, or review fixtures were found. |

### 4.2 UX, accessibility, mobile, and localization

| Audit point | Status | Evidence and finding |
|---|---|---|
| Small-screen usability | **PASS** | Mobile visual checks covered landing page, shop/category controls, information pages, and admin category cards. Controls wrap and catalog cards avoid fixed-width overflow. |
| Keyboard and semantic accessibility | **PASS / PARTIAL** | Lighthouse is 100 Accessibility locally after fixes; labels, decorative logo alt handling, contrast, focusable controls, and Arabic accessible names were addressed. A full screen-reader manual audit remains unperformed. |
| Layout stability | **PASS** | Current expanded landing page CLS measured 0.012. Shop empty-state layout was stabilized. |
| Localization and local context | **PASS** | Arabic copy, Hurghada/Red Sea address, Egyptian phone format, EGP settings, and local WhatsApp contact are in the public shell. |
| Content readiness | **FAIL — P0** | A five-product generated staging catalog supports flow validation, but it is explicitly non-orderable and is not real commercial content. Merchant-approved catalog data remains required. |
| Internationalization scalability | **PARTIAL** | RTL and Arabic are first-class; there is no multi-locale framework, translation catalog, or language selector. This is acceptable for an Arabic-only local store. |

### 4.3 SEO and discoverability

| Checklist point | Status | Evidence and remediation |
|---|---|---|
| Arabic title, description, language, viewport | **PASS** | Present in `client/index.html`. |
| Robots policy | **PASS** | Dynamic `robots.txt` disallows private paths and additionally disallows `/shop` and `/products/` while catalog staging is on. Staging product pages also emit `X-Robots-Tag: noindex, nofollow, noarchive`. |
| Crawlable information pages | **PASS** | About, Contact, Delivery & Returns, and FAQ are routable public pages. |
| Canonical URLs | **PARTIAL — P2** | Site canonical and social URL are present for the current Manus domain. Set `PUBLIC_SITE_URL` and update static metadata when a final custom domain is approved. |
| Sitemap | **PASS / PARTIAL** | Dynamic `sitemap.xml` includes approved information pages and omits generated staging catalog URLs. It will add active product URLs only when staging is intentionally disabled. |
| Open Graph / social cards | **PASS / PARTIAL** | Arabic Open Graph and Twitter metadata and a branded share image are present for the current Manus domain; update them when the final domain and approved campaign image are available. |
| Product/category structured data | **PARTIAL — P2** | WebSite JSON-LD exists; conditional Organization and Product JSON-LD are emitted only in non-staging mode, preventing generated catalog data from becoming rich-result content. Breadcrumb and FAQ schema remain absent. |
| SSR/prerendering for product SEO | **PARTIAL — P2** | The app is SPA-based; crawlers may see the shell before dynamic product content. Consider SSR/prerendering after catalog launch if organic product discovery is a target. |

---

## 5. Admin, catalog, and operational workflow audit

| Requirement | Status | Evidence and conclusion |
|---|---|---|
| Admin route protection | **PASS** | Admin procedures use server-side `adminProcedure`, not only client checks. Admin pages redirect/display access restriction UI for non-admin users. |
| Product create/edit/archive | **PASS** | Administrator product procedures validate names, slugs, price, stock, activity, feature state, and category assignment. The dashboard archives products; server deletion is transactionally refused where immutable order history references the product. |
| Category create/edit/delete | **PASS** | Admin category screen supports search, editor validation, unique-slug backend enforcement, visibility, sort order, delete error feedback, desktop table, and mobile cards. |
| Category filtering and sort | **PASS** | Public server-side sort enum and category slug filter are validated; controls retain URL state. |
| Product image management | **PASS / PARTIAL** | Admin-only upload/delete is implemented; type, base64, MIME, and 5 MB decoded-size checks exist. Malware/antivirus scanning is not present. |
| Order operations | **PASS / PARTIAL** | Admin permits only valid next order/payment states; invalid transitions are rejected server-side, eligible cancellations restore stock exactly once, and historical products are archived rather than deleted. Real operating volume and authenticated business E2E remain unproven. |
| Settings management | **PASS** | Store name, WhatsApp, InstaPay handle, and shipping fee are admin-editable and query-backed. |
| Operational documentation | **PASS / PARTIAL** | `PRODUCTION_OPERATIONS.md` documents launch, routine checks, daily processing, and recovery at a practical level. Formal incident, retention, backup, and privacy procedures remain absent. |

---

## 6. API, validation, and backend contracts

### 6.1 Endpoint/procedure inventory

| Area | Public procedures | Authenticated procedures | Admin procedures | Assessment |
|---|---|---|---|---|
| Auth | `auth.me`, `auth.logout` | — | — | **PASS** — session state is server-derived. |
| Store | `store.settings` | — | `admin.storeSettings`, `admin.updateStoreSettings` | **PASS** — public data is limited to safe customer settings. |
| Categories | `categories.list` | — | list/create/update/delete | **PASS** — admin writes are guarded and Zod validated. |
| Products | list/bySlug | — | list/create/update/delete/uploadImage/deleteImage | **PASS** — pagination/sort bounds and payload rules exist. |
| Orders | — | create/mine/get/uploadPaymentProof | list/detail/update/dashboard | **PARTIAL** — ownership, checkout idempotency, and forward order/payment transition policy are enforced; authenticated real-business E2E remains pending. |

### 6.2 Validation and error handling

| Checklist point | Status | Evidence and finding |
|---|---|---|
| Server-side validation | **PASS** | Zod validates all inspected tRPC inputs, including IDs, price/stock limits, page size, searchable strings, status enums, image data type, and shipping/customer fields. |
| Over-posting prevention | **PASS** | Product/category/admin update inputs are typed, bounded schemas rather than raw objects. |
| Query pagination limits | **PASS** | Catalog max is 48; admin order list maximum is 200. |
| Error handling | **PARTIAL** | User-visible tRPC errors and UI loading/error states exist. There is no structured error taxonomy, correlation ID, or external error tracking. |
| API documentation | **PARTIAL** | tRPC contracts are self-describing in code; there is no external OpenAPI/public API documentation. Appropriate for an internal storefront but insufficient for third-party integrations. |
| Rate limiting / bot mitigation | **PARTIAL — P1** | Per-process limits now protect tRPC, checkout, proof upload, and storage requests. Add an edge/distributed control or documented compensating measure before high-traffic autoscaling launch. |
| Idempotency | **PASS after remediation** | Checkout requires a UUID key and persists a request fingerprint plus unique user/key constraint; identical retries safely reuse the existing order outcome. |
| CSRF hardening | **PASS / PARTIAL** | OAuth callback validates a state nonce and non-safe tRPC requests now require the same trusted browser origin. Cookies remain `httpOnly` and HTTPS-secure. Maintain the trusted-origin allowlist if cross-origin deployments are introduced. |

---

## 7. Authentication, authorization, and security assessment

### 7.1 Authentication and RBAC

| Control | Status | Evidence |
|---|---|---|
| OAuth callback requires `code` and `state` | **PASS** | Callback rejects missing parameters. |
| OAuth state nonce verification | **PASS** | Callback compares decoded nonce to one-time browser cookie and rejects mismatch. |
| OAuth state cleanup | **PASS** | State cookie is cleared after validation. |
| Session cookie properties | **PASS / PARTIAL** | `httpOnly`, `path=/`, `secure` when HTTPS, and `SameSite=None` are configured. One-year session duration is operationally convenient but long; provide a sign-out-all/revocation strategy for higher assurance. |
| Authorization enforcement | **PASS** | Protected and admin tRPC procedures enforce authenticated user/role server-side. |
| Owner bootstrap / admin identity | **PARTIAL** | Manus owner is automatically privileged by the configured user-upsert path; secondary admin lifecycle and offboarding procedure should be documented. |
| Brute-force/password risk | **NOT APPLICABLE** | Application delegates interactive authentication to Manus OAuth; it does not manage local passwords. |

### 7.2 File and payment-proof security

| Control | Status | Evidence and finding |
|---|---|---|
| Image input allowlist | **PASS** | PNG/JPEG/WebP data URLs only; decoded image buffer is capped at 5 MB. |
| Product image upload authorization | **PASS** | Product upload/delete is admin-only. |
| Proof upload authorization | **PASS** | User must own the order; proof only permitted for InstaPay and non-cancelled orders. |
| Payment-proof download authorization | **PASS after remediation** | Generic storage proxy was modified during this audit: unauthed request returns 401, unrelated user returns 403, and only order owner/admin can retrieve `payment-proofs/*`. Four targeted tests pass. |
| Public product-image delivery | **PASS** | Public product imagery remains accessible without weakening private payment-proof access. |
| Malware scanning / content moderation | **FAIL — P2** | MIME and size checks are present; no antivirus scanning, image re-encode, or server-side dimension check is implemented. |
| Storage retention/deletion policy | **FAIL — P2** | No evidence of automated removal for deleted images/proofs or retention limits for personal payment evidence. |

### 7.3 HTTP and infrastructure controls

| Control | Status | Evidence and recommended action |
|---|---|---|
| Compression | **PASS** | Express `compression()` is enabled before API/static routes. |
| Request-body limit | **PASS / PARTIAL** | Global JSON parsing is limited to 8 MB, URL-encoded parsing to 1 MB, and image payloads to 5 MB with type and byte-signature checks. Consider a streaming upload design if future media requirements exceed this model. |
| TLS | **PARTIAL** | Published Manus URL uses HTTPS in browser. Custom-domain TLS and HSTS are not yet verifiable. |
| Security headers | **PASS after remediation** | Tested CSP, nosniff, referrer, framing, permissions, COOP, HSTS-on-HTTPS, and Vary headers are emitted. Review CSP whenever third-party assets are added. |
| CORS policy | **PASS / PARTIAL** | The application intentionally exposes no permissive CORS middleware; mutation traffic is same-origin by default with a configurable trusted-origin list. Confirm any future custom-domain or cross-origin architecture before changing this policy. |
| Secrets in source | **PASS** | No committed secrets were found in targeted static scan. |
| Dependency vulnerabilities | **PASS after remediation** | Bounded production audit completed after updating tRPC, Drizzle, storage SDK, Axios, NanoID, Streamdown, Express, and Recharts: **0 known low/moderate/high/critical advisories** across 469 production dependencies. The release workflow includes `pnpm audit --prod --json`, which passed in [GitHub Actions run 32655491665](https://github.com/aliahmed-io/mousa-glass/actions/runs/32655491665). |

---

## 8. Database, inventory, and commerce integrity

### 8.1 Data model

| Requirement | Status | Evidence and conclusion |
|---|---|---|
| Unique user external ID | **PASS** | `users.openId` is unique. |
| Unique catalog slugs | **PASS** | `categories.slug` and `products.slug` have unique indexes. |
| Query indexes | **PASS** | Product category/catalog, order customer/status, item order, image product/sort, proof order, and unique order number indexes exist. |
| Monetary precision | **PASS** | Prices and totals use integer minor units (piastres), avoiding floating-point money errors. |
| Order item price snapshot | **PASS** | Item name, image, unit price, and quantity are copied onto `orderItems`. |
| Order number uniqueness | **PASS** | Unique order-number index exists. |
| Foreign-key enforcement | **PASS after remediation** | Reviewed migration added commerce foreign keys and an order-item index after an orphan scan returned no records. Product/image deletion is transactionally protected from partial cleanup. A formal schema/data recovery drill remains required. |
| Soft delete / audit history | **PARTIAL** | Product visibility now supports safe archival, and products referenced by order history cannot be deleted. There is still no immutable change log for price, stock, settings, or order state. |

### 8.2 Checkout, stock, payment, and order lifecycle

| Control | Status | Evidence and finding |
|---|---|---|
| Active/in-stock product validation | **PASS** | Checkout fetches product by ID and rejects inactive/out-of-stock products before staging items. |
| Server-calculated price and total | **PASS** | Totals are calculated from database product prices and store shipping fee, never trusted from client input. |
| Atomic inventory decrement | **PASS** | Transaction uses conditional `stock >= quantity` SQL decrement; it throws if affected rows are not exactly one. |
| Transaction boundary | **PASS** | Order creation, stock updates, and item creation run under a database transaction. |
| Over-selling resistance | **PASS / PARTIAL** | Conditional decrement is materially correct. It should be load-tested with real concurrent checkout volume before claiming high-confidence capacity. |
| Idempotent order submission | **PASS after remediation** | Client UUID, server fingerprint, unique user/key constraint, and replay-safe transaction handling protect duplicate checkout retries. |
| Order state-machine validation | **PASS after remediation** | Server permits only documented forward transitions, selected cancellation points, and controlled InstaPay review transitions; the Arabic admin UI exposes only valid next actions. Six focused lifecycle tests pass. |
| Cancellation restock | **PASS after remediation** | Eligible pending/confirmed cancellations restore each order item’s stock in the same transaction and set `stockRestoredAt`; the row guard prevents duplicate restoration. |
| Payment proof duplicates | **PARTIAL** | Multiple proof rows can be added. This may be a valid resubmission model, but needs a defined business rule and admin UI explanation. |
| Payment gateway/webhook signature verification | **NOT APPLICABLE** | The selected workflow is manual COD/InstaPay proof review; no online card gateway or external payment webhook exists. |
| Refunds/reconciliation | **NOT APPLICABLE / PARTIAL** | No automated payments mean no automated refunds. Document manual refund/refusal/reconciliation policy before launch. |

---

## 9. Performance, accessibility, and client delivery

| Audit point | Status | Evidence and recommendation |
|---|---|---|
| Route-level code splitting | **PASS** | Lower-frequency commerce/admin/information routes are lazy-loaded; Home and Shop remain eagerly available. |
| Image optimization | **PASS / PARTIAL** | Shared hero uses managed responsive WebP variants with media-specific preload and noncritical image deferral. The five documented generated staging products use source-specific 480/960 WebP `srcSet` sources on both Home featured cards and Shop cards; cache-busted mobile audits for Shop checkpoint `c9ea991d` and Home checkpoint `24c2b326` have empty image-delivery evidence arrays. Future merchant media remains intentionally unmapped until approved assets are supplied. |
| HTTP compression | **PASS** | Enabled in Express. |
| CSS/font loading | **PASS / PARTIAL** | Cairo uses preconnect and asynchronous stylesheet preload. Consider self-hosting/subsetting after brand finalization to remove third-party font variability. |
| Local Lighthouse accessibility | **PASS** | Current landing page reached 100 Accessibility. Previously found contrast/label issues were remediated. |
| SEO score | **PASS / PARTIAL** | Lighthouse SEO was 100. Canonical/social metadata, sitemap, and staging-aware WebSite/Organization/Product JSON-LD are implemented; final-domain configuration, live product discovery, breadcrumbs, and optional SSR/prerendering remain future launch/marketing decisions. |
| Live mobile performance | **PARTIAL — P2** | Cache-busted production tests remain variable. The verified mobile Shop audit for checkpoint `c9ea991d` recorded 63 Performance, FCP 4.0 s, LCP 5.2 s, TBT 80 ms, and CLS 0.002, with a 1.34 s initial-server-response opportunity and 36 KiB unused JavaScript. It confirms responsive media delivery but is not a Core Web Vitals pass. |
| Root-entry bundle experiment | **MEASURED / REVERTED** | A source-map-guided experiment removed the root error boundary's utility and icon imports. Although the raw entry fell from 547.68 kB to 520.15 kB, it emitted a new 30.36 kB raw / 10.06 kB gzip lazy icon chunk required by the Home route, enlarging the first-load dependency graph. The experiment was reverted and a full 59-test release check passed; see `reports/root-error-boundary-bundle-experiment.md`. |
| Published Shop accessibility and responsive media | **PASS for verified scope** | The first post-media audit reported a conflicting `landmark-one-main` finding despite an existing semantic main element. The Shop now exposes source-tested `main#main-content[role="main"]`; a fresh cache-busted mobile audit scored 100 Accessibility with empty contrast, ARIA-role, and image-delivery evidence. A direct published browser check rendered all five staged cards and their intended noir imagery after loading settled. |
| Published Home responsive media | **PASS for verified scope** | The cache-busted mobile Home audit for checkpoint `24c2b326` scored 60 Performance, 100 Accessibility, 92 Best Practices, and 92 SEO. It recorded FCP 4.3 s, LCP 6.0 s, TBT 80 ms, CLS 0, and an empty image-delivery evidence array. Published browser verification rendered the disclosure and all five generated featured products; deployed route code imports the shared five-asset 480/960 mapping. This closes the image-delivery scope only, not the open performance gate: initial server response remained 2.86 s, unused JavaScript 36 KiB, render-blocking insight 150 ms, and managed CSP/no-store findings remain. |
| SSR feasibility | **DEFERRED WITH EVIDENCE** | `reports/ssr-feasibility-assessment.md` maps the public route tree, staged public data dependencies, local-storage cart/auth hazards, and published Home waterfall. Correct SSR would require a separate server-safe public route tree, per-request tRPC prefetch/dehydration, and hydration-safe state changes. Because the audited cold path is server-response constrained and staging is intentionally no-indexed, conversion is not currently an evidence-backed performance improvement. Reconsider only with approved non-staging content and representative response/LCP comparison evidence. |
| Client bundle size | **PARTIAL — P2** | 709 kB minified main chunk warning remains. Analyze dependencies and remove/admin-isolate shared code before major traffic campaigns. |
| Core Web Vitals production monitoring | **FAIL — P2** | No real-user monitoring or alert thresholds were verified. |

---

## 10. Observability, deployment, reliability, and operations

| Checklist point | Status | Evidence and conclusion |
|---|---|---|
| Managed autoscaling deployment | **PASS** | Project is on managed Manus autoscale hosting with checkpoint-based releases. |
| Production build reproducibility | **PASS** | `pnpm build` completed. |
| Static type safety | **PASS** | `pnpm check` completed. |
| Automated test suite | **PASS / PARTIAL** | 62 tests across 11 files pass, including commerce, lifecycle, security, request-correlation and diagnostic-log safety, crawler/SEO, storage proxy, health contract, owner-alert, reverse-layout-shift, responsive staging media, explicit Shop landmark, Express 5-compatible SPA fallback, shared high-risk mutation rate-limit coverage, and safe-branch CI trigger coverage. UI E2E, load, and true production smoke coverage are missing. |
| Runtime logs | **PARTIAL** | Managed dev/production logs exist, minimal owner alerts are available for successful order/proof writes, every response carries a validated or generated opaque `X-Request-Id`, and tRPC failures emit a non-PII structured diagnostic containing only that ID, procedure path, and error classification. A local unknown-procedure probe produced the expected `NOT_FOUND` diagnostic with a generated ID. External error aggregation and uptime escalation remain absent. |
| Health/readiness endpoint | **PASS / PARTIAL** | `GET /healthz` returns HTTP 200 with only stable non-sensitive `{ status, service, timestamp }`; the payload has focused regression coverage. Published-host uptime behavior remains unproven because command-line probes intermittently timed out. |
| Error reporting/alerting | **PARTIAL — P2** | Successful order creation and proof submission call a post-write, fire-and-forget owner alert with only an order reference and admin route. Router-trigger and failed-delivery containment regressions pass. There is still no external error aggregation, independent uptime monitor, failed-alert escalation, or threshold alert. |
| Backup and restore evidence | **FAIL — P1** | No database backup-retention proof, restoration drill, or storage recovery test is documented. |
| Incident runbook | **PARTIAL** | Operational guide gives daily and recovery guidance but lacks severity levels, communication templates, escalation, RTO/RPO, and tested restore steps. |
| Deployment rollback | **PASS / PARTIAL** | Managed checkpoints support rollback. A formal rollback rehearsal and post-deploy verification checklist should be added. |
| Development fallback startup | **PASS** | The historic local `originalPath: "*"` startup error was not present after a managed restart. Both development and production SPA fallbacks use Express 5-compatible `/{*splat}` syntax, guarded by a focused source regression test. |
| Distributed high-risk mutation limiting | **PASS for checkout/proof scope** | Checkout and proof-upload paths use a shared database bucket keyed only by a server-secret HMAC of the forwarded client address, scope, and fixed window. The unique bucket key makes the count cross-instance; bucket cleanup runs at a bounded interval for records older than 24 hours. Storage failure returns 503 before either high-risk mutation executes. Public reads retain their low-cost per-process limiter rather than adding a database operation to every request. |
| Maintenance-cost model | **PASS / PARTIAL** | Managed services minimize infrastructure work; monitoring, policies, data protection, and business operations still require owner effort. |

---

## 11. Privacy, legal, and business-readiness audit

| Requirement | Status | Launch impact |
|---|---|---|
| Privacy policy | **FAIL — P0/P1** | Customer names, phones, addresses, emails, and payment proof are processed; publish Arabic privacy disclosure before broad launch. |
| Terms / sale conditions | **FAIL — P1** | Delivery, cancellation, order acceptance, pricing, and dispute terms need a clear Arabic policy. |
| Returns/exchange policy | **PARTIAL — P1** | Delivery & Returns public page exists; obtain legal/business approval and make it specific to actual product classes and Egyptian obligations. |
| Cookie/analytics disclosure | **FAIL — P2** | Analytics script exists; consent/disclosure approach is not documented. Review applicable local requirements and platform terms. |
| Account deletion/data requests | **FAIL — P2** | No public process or admin tool for access/export/deletion requests was identified. |
| Merchant identity and contact | **PARTIAL** | Public address, phone, and WhatsApp exist. Add formal business/merchant identity, tax/registration details if applicable, and a verified final domain. |
| Inventory, pricing, and delivery promises | **FAIL — P0** | No live products or approved content exists; commercial commitments cannot yet be verified. |
| Payment policy | **PARTIAL** | COD/InstaPay process is defined technically. The admin settings screen requires an approved proof-retention duration before non-staging InstaPay checkout, and admins can remove a proof reference after review. Refund, rejection, fraud, reconciliation, policy approval, and verified physical deletion of managed-storage objects are still unresolved. |

---

## 12. Findings register and remediation plan

### 12.1 Open findings

| ID | Severity | Finding | Risk | Required remediation | Owner |
|---|---|---|---|---|---|
| AUD-01 | **P0** | No merchant-approved live catalog | Generated seed entries are non-orderable and cannot support customer sales | Replace seed content through admin with approved categories, products, EGP prices, stock, Arabic descriptions, compliant images, and QA evidence | Merchant/admin |
| AUD-02 | **Resolved P1** | Duplicate checkout retry risk | Client UUID, database fingerprint, unique user/key constraint, and replay-safe response now exist | Retain regression tests and include in CI | Engineering |
| AUD-03 | **Resolved P1** | High-risk limits could not coordinate across autoscaled instances | Per-process limits protected key routes but checkout/proof abuse could span instances | A tested shared database limiter now coordinates fixed-window checkout and proof-upload limits using secret-hashed client keys, bounded cleanup, and fail-closed storage behavior. Retain public-read per-process limits for cost/latency and review an edge service if traffic materially grows. | Engineering |
| AUD-04 | **Resolved P1** | Lifecycle transition and cancellation-restock risk | Transition matrix, transactional stock restoration, and focused regression tests now exist | Retain tests in CI; validate the full workflow with a real business order before launch | Engineering + operations |
| AUD-05 | **Partial P1** | Data recovery evidence remains incomplete | Foreign keys, indexes, migration safeguards, and archival behavior now protect live consistency; no restore drill has been recorded | Run and document database/schema/storage recovery exercise with RPO/RTO | Engineering + owner |
| AUD-06 | **Resolved P1** | Security header/CORS/CSRF posture incomplete | Browser-integrity and cross-site request risk not fully controlled | Same-origin mutation protection, trusted-origin CORS/preflight, CSP and related security headers are implemented and regression-tested; retain configuration review for any cross-origin expansion. | Engineering |
| AUD-07 | **P1** | Backup/restore evidence absent | Inability to recover commerce data reliably | Document backup retention; perform database and storage restoration drill; record RPO/RTO | Owner + platform |
| AUD-08 | **P1** | Privacy/terms/business policy missing | Legal and customer-trust exposure | Publish approved Arabic privacy, terms, returns, payment-proof retention, and contact/merchant disclosures; verify physical managed-storage object deletion before representing proof erasure as complete | Merchant/legal |
| AUD-09 | **P1** | E2E payment/order validation incomplete | Manual COD/InstaPay operating flow is unproven | Use controlled real product/customer test after catalog approval; validate WhatsApp, proof review, status, cancellation/restock | Merchant + QA |
| AUD-10 | **P2** | Published performance inconsistent / large bundle | Slow first load under some production conditions | Warm-cache audit, inspect RUM, trim shared dependencies, reduce third-party scripts, re-audit with real images | Engineering |
| AUD-11 | **Partial P2** | SEO/live-discovery handoff remains incomplete | Staging catalog is intentionally not discoverable, and final-domain/live catalog changes remain pending | Update final domain, canonical/social URLs and approved product discovery only after merchant catalog approval; consider breadcrumbs and SSR/prerendering if organic product discovery is a priority. | Marketing + engineering |
| AUD-12 | **Partial P2** | Error aggregation and uptime/escalation monitoring absent | Health contract, post-write minimal owner alerts, and a successful hosted CI run exist, but production failures may go undetected or untriaged | Add error tracking, independent uptime monitoring, and alert-delivery/retry escalation verification. | Engineering |
| AUD-13 | **P2** | File malware/retention controls remain partial | Payment-proof data and upload risk | Image signature checks, admin-configured retention gating, and application-reference removal exist; add re-encoding/scanning, approved policy, physical deletion workflow, and documented access review | Engineering + owner |
| AUD-14 | **Resolved P2** | Dependency security posture was unverified | Controlled dependency updates and bounded production audit now report zero known vulnerabilities; `pnpm audit --prod --json` is part of the release workflow and passed in the observed hosted run. | Review newly introduced advisories on every release. | Engineering |
| AUD-15 | **P3** | Central modules and `any` casts | Maintainability and type quality degrade as features grow | Split routers/db by bounded context; replace application `any` casts | Engineering |

### 12.2 Resolved during this audit

| ID | Severity | Resolution evidence |
|---|---|---|
| AUD-R1 | **P1** | Payment-proof download bypass corrected. `/manus-storage/payment-proofs/*` now authorizes order owner/admin; focused unauthenticated/unrelated-user regression tests pass. Public product images remain public. |
| AUD-R2 | **P1** | Checkout idempotency, same-origin mutation guard, explicit trusted-origin CORS/preflight handling, browser security headers, smaller request limits, route throttles, and image-signature checks implemented; early audit evidence recorded 27 automated tests. |
| AUD-R3 | **P1** | The later shared rate-limit hardening adds a tested, database-backed cross-instance control for checkout and payment-proof upload. It stores only scope, window, count, and an HMAC digest—not a raw address or customer input—and fails closed if its storage is unavailable. |

---

## 13. Required launch gates

### Gate A — before any public selling

1. Enter the real product/category catalog and verify Arabic names, prices in EGP, stock, product images, descriptions, visibility, and category ordering.
2. Publish final Arabic privacy policy, terms of sale, delivery/return/exchange policy, payment-proof data-retention policy, and merchant identity/contact information.
3. Configure and verify the final WhatsApp number, InstaPay handle, shipping fee, hours, and local delivery scope in Admin Settings.
4. Connect the final custom domain; add canonical URL, sitemap, social metadata, and merchant/product structured data.
5. Retain and verify the database-backed distributed checkout/proof limiter after every schema deployment. Keep the already implemented state-transition/restock, foreign-key, idempotency, and same-origin/header controls covered by CI; review an edge limiter if public traffic grows materially.
6. Perform a controlled real-world order: catalog → cart → login → checkout → WhatsApp → COD or InstaPay proof → admin review → status change → cancellation/restock test.
7. Establish documented backups, retention, restore test, error tracking/uptime alert, and a minimum incident/rollback procedure.

### Gate B — within the first operating week

1. Monitor actual production performance and errors; re-run Lighthouse on warm cache and real catalog assets.
2. Reconcile every order/payment proof against WhatsApp and payment records daily.
3. Create an order-state and refund/cancellation SOP for the owner/admin team.
4. Retain CI evidence on every repository change: frozen install, type check, tests, build, and dependency audit passed in the safe-branch hosted run; add a production smoke test and a protected/main-branch integration process.
5. Conduct a second security review after rate limiting, headers, CORS/CSRF, and database constraints are implemented.

---

## 14. Final conclusion

Mousa Glass is **well beyond a static prototype**: it has an Arabic RTL e-commerce storefront, meaningful admin operations, validated typed API boundaries, OAuth/RBAC enforcement, transaction-aware stock reduction, manageable catalog controls, storage-backed media, and a newly secured private payment-proof route. It is appropriate for **owner content entry and controlled launch preparation**.

It is **not yet ready for unrestricted customer sales**. The blockers are concrete and addressable: merchant-approved catalog data; legal/business policies; distributed abuse protection; data recovery and external monitoring proof; GitHub-hosted CI evidence; and a controlled live business-flow rehearsal. Once the P0/P1 gates are closed and documented, the application can progress to a managed production launch with substantially lower operational risk.
