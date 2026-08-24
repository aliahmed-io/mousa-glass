# Published Performance Reassessment — 2026-08-24

## Scope and method

This record compares one fresh, cache-busted Lighthouse 12.8.2 audit of the published public Home route and one of the published Shop route with the most relevant prior published records. The raw observations are retained in the repository as JSON: Home [1] and Shop [2]. The audit ran against the intentionally disclosed, non-orderable staging storefront; it did not alter catalog staging, user roles, passphrase access, payments, or ordering controls.

> A single Lighthouse run is a controlled diagnostic sample, not a claim of stable field performance. The measurements below therefore identify persistent opportunities and response-time variability rather than a regression caused by the recent documentation and build-tooling maintenance work.

| Route | Audit | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Root document | Unused JavaScript |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: | --- | --- |
| Home | Prior published baseline [3] | 63 | 100 | 92 | 100 | 3.6 s | 5.4 s | 90 ms | 0 | 1,360 ms | 36 KiB |
| Home | Fresh cache-busted run [1] | 61 | 100 | 93 | 100 | 3.8 s | 5.7 s | 140 ms | 0 | 2,350 ms | 36 KiB |
| Shop | Prior published baseline [4] | 62 | 100 | 92 | 61 | 3.6 s | 5.8 s | 60 ms | .002 | 1,610 ms | 36 KiB |
| Shop | Fresh cache-busted run [2] | 65 | 100 | 93 | 61 | 3.7 s | 4.9 s | 70 ms | .002 | 1,890 ms | 36 KiB |

## Findings

The fresh Home and Shop runs preserve full accessibility. The previously verified responsive image sources remain free of an image-delivery opportunity, and the staging disclosure continues to avoid a material layout shift on Home. The browser-baseline mapping refresh and supported pnpm configuration migration did not introduce a measurable client-bundle or visual regression.

The two fresh samples again identify the same application-adjacent limits: **36 KiB estimated unused JavaScript** and variable initial server response. Home’s root-document observation increased from 1,360 ms to 2,350 ms; Shop increased from 1,610 ms to 1,890 ms. Because the values moved independently of a runtime-code change and the two routes differ, this sample supports the existing conclusion that managed cold-path/server variability is the principal bottleneck rather than an unverified client rewrite.

The current render-blocking insight remains about 100 ms for the stylesheet. It is intentionally retained because the prior assessment found that deferring the small production stylesheet would trade a limited FCP-only opportunity for a risk of unstyled or unstable Arabic RTL first paint. The documented root tRPC, error-boundary, stylesheet, and public administrator-query investigations likewise found no safe first-load reduction to retain.

## Decision

No performance code change is made from these two diagnostic samples. The final published Core Web Vitals and server-response launch gate remains open pending a merchant-authorized launch configuration and repeated production monitoring; no claims of performance improvement are made from this reassessment.

## References

[1]: ./published-home-51f7b42b-1787536610.json "Fresh published Home Lighthouse audit"
[2]: ./published-shop-51f7b42b-1787536610.json "Fresh published Shop Lighthouse audit"
[3]: ./published-home-6ab6529c-current.summary.json "Prior published Home audit summary"
[4]: ./published-shop-9f6faccc-responsive-800.summary.json "Prior published Shop audit summary"
