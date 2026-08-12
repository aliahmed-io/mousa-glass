# Arabic UI Verification Notes

## 2026-08-12

The restored application compiles successfully and the full automated suite passes. The preview capture shows the legacy hero image and top contact bar at both viewport sizes, while the preview capture does not expose the overlay header or hero copy that is implemented in the React tree. This capture behavior is consistent across routed views and shows no corresponding browser-console runtime error.

After isolating the hero stacking context and explicitly raising the copy layer, the preview capture still returns the same image-only viewport for both `/` and `/shop`. This does not match the independently verified route components: the home page includes a visible, high-z-index Arabic hero layer and the storefront layout includes a responsive Arabic menu. The capture output therefore appears to be reusing an earlier root view rather than representing the current route tree. Final source review confirms the intended mobile behavior, and the user-facing preview should be checked after saving the updated version.
