# Generated Staging Asset Provenance

## Scope and status

This record identifies the five **generated staging images** used for Mousa Glass catalog browsing and workflow validation. They are not merchant-supplied product photography, do not establish actual product availability, and must remain paired with the storefront's staging disclosure and order-disabled setting.

> This is a technical provenance record, not a legal opinion, licence determination, merchant approval, or authorization to use any asset in a live commercial catalog. The merchant and qualified local adviser must approve final product imagery, claims, and use rights before staging mode is disabled.

## Generation record

All five images were generated on **2026-08-23** using the project's built-in image-generation service with the default model and default quality. No external image or brand asset was supplied as a source. The first image established the noir-and-gold visual direction; the other four were generated using that first generated image as a style reference.

| Staging product | Source-generated asset URL | Assigned delivery URL | Source record and prompt constraints | Intended visual review criterion |
| --- | --- | --- | --- | --- |
| مزهرية كهرمانية — نموذج تجريبي | `/manus-storage/mousa-glass-staging-amber-vase-2026-08-23_64fec273.jpg` | `/manus-storage/mousa-glass-staging-amber-vase-960_a1759e41.webp` | Original 4:5 studio product image of a single sculptural amber smoked-glass vase; deep black background, dark stone pedestal, warm amber rim light; no logos, labels, text, people, or extra objects. | Centered premium glassware subject with noir-and-gold lighting and no customer-facing text. |
| مرآة بيضاوية دخانية — نموذج تجريبي | `/manus-storage/mousa-glass-staging-smoked-mirror-v2-2026-08-23_d8905769.jpg` | `/manus-storage/mousa-glass-staging-smoked-mirror-960_2bbc7cec.webp` | Original 4:5 studio image of one oval smoked-glass mirror with slim warm-brass edge; generated from the vase image only as a style reference; no room scene, brands, labels, or text. This v2 asset replaced a failed first-generation output. | Controlled smoky reflection and the same black/amber studio direction. |
| حاملات شموع زجاجية — نموذج تجريبي | `/manus-storage/mousa-glass-staging-candleholders-v2-2026-08-23_0ac47a14.jpg` | `/manus-storage/mousa-glass-staging-candleholders-960_c3670fc6.webp` | Original 4:5 studio image of a matched pair of smoked-glass candle holders without lit candles; generated from the vase image only as a style reference; no brands, labels, text, or people. This v2 asset replaced a failed first-generation output. | Legible paired glass forms with no flames or unrelated décor. |
| صينية تقديم دخانية — نموذج تجريبي | `/manus-storage/mousa-glass-staging-serving-tray-v2-2026-08-23_3c786ad2.jpg` | `/manus-storage/mousa-glass-staging-serving-tray-960_a43d0762.webp` | Original 4:5 studio image of one empty rectangular smoked-glass tray with a restrained warm-brass perimeter; generated from the vase image only as a style reference; no food, brands, labels, or text. This v2 asset replaced a failed first-generation output. | Plausible tray geometry and clean product-focused composition. |
| طقم أكواب بحافة كهرمانية — نموذج تجريبي | `/manus-storage/mousa-glass-staging-amber-glassware-v2-2026-08-23_5eb5cd91.jpg` | `/manus-storage/mousa-glass-staging-amber-glassware-960_e4bd2db3.webp` | Original 4:5 studio image of four clear drinking glasses with delicate amber rims; generated from the vase image only as a style reference; no beverages, brands, labels, or text. This v2 asset replaced a failed first-generation output. | Consistent transparent-glass treatment with distinct, undistorted glass forms. |

## Release boundary

The database references only the 960-pixel WebP **Assigned delivery URL** values above. They are deterministic, full-composition delivery derivatives of the source-generated assets, created on 2026-08-23 at quality 74 with metadata stripping; the source-generated assets remain the provenance reference. The administrator must not edit a real product to point to these files, remove the staging disclosure, or disable `isCatalogStaging` on the basis of this record. A merchant-approved product-media spreadsheet or equivalent evidence is still required for the live catalog.

For the public Home featured-card and Shop card layouts only, each documented 960-pixel delivery asset also has a 480×600 WebP source created on 2026-08-23 by deterministic aspect-ratio-preserving resize with no crop or visual-content edit. `client/src/lib/responsiveStagingImages.ts` maps only the five documented staging URLs to these smaller sources through `srcSet`; unrecognized or future merchant-approved URLs preserve their original delivery behavior. The verifier checks all ten delivery endpoints (five assigned 960-pixel references and five responsive 480-pixel derivatives).
