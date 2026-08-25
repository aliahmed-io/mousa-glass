# Synthetic Staging Fixture Media Provenance

**Status:** Original generated staging assets. These files support QA fixtures only and are not merchant-provided product photography, product specifications, availability claims, or an authorization to sell.

## Creation and handling record

The ten assets below were generated for this project as unbranded glass-accessory illustrations on a dark studio background. Their prompts explicitly excluded logos, readable labels, third-party branding, people, and real merchant packaging. The image-generation output named several PNG-encoded files with a `.jpg` extension. To prevent content-type ambiguity, each source was converted locally to a 960 × 960 WebP derivative before upload through the managed web static-storage workflow. The storefront and seed use only the managed WebP paths listed below.

| Fixture subject | Managed WebP path | Validation |
| --- | --- | --- |
| Pivot hinge | `/manus-storage/mousa-staging-pivot-hinge-960_a720bd2c.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Shower-door seal | `/manus-storage/mousa-staging-shower-seal-960_c44931f4.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Matte-black glass clamp | `/manus-storage/mousa-staging-glass-clamp-960_edf2c9ae.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Champagne floor guide | `/manus-storage/mousa-staging-floor-guide-960_d187b195.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Brass mirror clips | `/manus-storage/mousa-staging-mirror-clip-960_073fce64.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Patch fitting | `/manus-storage/mousa-staging-patch-fitting-960_d0b4966c.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Sliding-door roller | `/manus-storage/mousa-staging-sliding-roller-960_be865525.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Black U-channel | `/manus-storage/mousa-staging-u-channel-960_0b6cfcad.webp` | HTTP 200, `image/webp`, non-empty bytes |
| Brass pull handle | `/manus-storage/mousa-staging-pull-handle-960_b543fb3c.webp` | HTTP 200, `image/webp`, non-empty bytes |
| 90° corner connector | `/manus-storage/mousa-staging-corner-connector-960_3c10ce6c.webp` | HTTP 200, `image/webp`, non-empty bytes |

The release media verifier now checks all ten paths alongside the established staged catalogue media, for a total of 22 verified image assets. The guarded `seed:staging-fixtures` command references these managed paths idempotently and does not alter the store's staging setting or checkout block.

## Restrictions and replacement

Every related product, image, price, SKU, stock figure, and synthetic operational record remains a staging fixture. Before a merchant-approved launch, the owner must replace or archive these assets and all other fixture data with rights-cleared, approved merchant media and complete the handover’s catalog and launch gates. No customer review, rating, testimonial, customer identity, payment proof, or third-party image was created for this workstream.
