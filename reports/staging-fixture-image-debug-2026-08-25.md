# Staging Fixture Image Preview Finding — 2026-08-25

## Observation

The mobile staging product-detail capture for `fixture-pivot-hinge-180` displayed a black image frame rather than the expected product presentation. The locally retained source asset `mousa-staging-pivot-hinge.jpg` is a valid original 1920 × 1920 image and visibly contains a stainless pivot hinge on a dark studio background.

## Interpretation

The black frame is therefore treated as a storefront presentation mismatch rather than as an image-generation failure. The optimized `mousa-staging-pivot-hinge-960.webp` derivative was visually verified as an intact 960 × 960 original image with visible metallic hinge detail. The product API returns that same managed WebP URL, and a direct browser render through `/manus-storage/...` loads the hinge successfully. No catalog claim, product safety setting, checkout guard, or staging disclosure changed during this observation. The next diagnostic step must inspect the product-page image selection and layout path before any presentation change is retained.

## Shop-card resolution — 2026-08-25

The Shop grid was reproduced after a full development-service restart. The preview capture could show dark cards before managed media had painted, even though direct managed WebP requests returned `200`, `image/webp`, non-zero bytes, and visually valid generated hardware imagery. A standard-browser capture also showed that fixture images begin to paint after the catalog settles. The evidence therefore supports a delayed managed-media presentation state, not missing catalog URLs, invalid WebP bytes, or a change to the fixture provenance.

| Concern | Verified finding | Retained correction |
| --- | --- | --- |
| Unexplained dark card frame | The initial grid capture can precede managed-image availability. | Each Shop card now shows an Arabic loading treatment, a restrained noir-and-gold placeholder surface, and `aria-busy` while its image is pending. |
| Image request priority | First-viewport fixture cards need browser priority without forcing all catalog media to load. | The first four cards retain eager/high-priority media loading; later cards remain lazy. |
| Failed media request | A black frame must not silently imply product imagery is available. | The card listens for the browser error event and presents an Arabic image-unavailable state rather than a blank frame. |
| Staging safety boundary | Presentation remediation must not create a route to real ordering or replace disclosed fixtures. | No media record, provenance entry, staging disclosure, checkout rule, payment setting, role, or order setting changed. |

The `ShopCardImage` component makes the pending and failure states explicit, while retaining the original managed source URL, alt text, responsive-source helper, and product-card layout. The associated source regression test checks the priority path, Arabic pending label, busy state, and error handler.

Validation completed successfully after the correction: TypeScript checking, the focused storefront regression suite, and the complete `pnpm release:check` gate all passed. The release gate again verified the 22 documented staging-media responses. A read-only database query confirmed `storeSettings.isCatalogStaging = 1`; server-side checkout therefore remains blocked for customer orders.
