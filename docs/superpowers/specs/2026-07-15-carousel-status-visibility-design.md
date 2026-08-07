# Shop and Homepage Set Card Cleanup

## Problem

The visible `1 / 2` carousel status is absolutely positioned over the bottom of each set image on both Shop and Homepage and obscures product details. Homepage set names and descriptions also no longer match the cleaner Shop presentation.

## Approved Design

- Visually hide the Shop and Homepage carousel status instead of moving it elsewhere in the card.
- Keep the `data-carousel-status` element in the DOM.
- Keep `norie-carousel.js` updating its text so assistive technology still receives the current slide position.
- Rename the Homepage sets to `ESSENTIALS HAIRSTYLING SET` and `BABY HAIRSTYLING SET` so they match Shop.
- Update the Homepage carousel button accessible labels to use the new set names.
- Remove both Homepage set descriptions so each card keeps only the set label, name, price, and action beneath its image.
- Do not change the product images, arrows, card spacing, prices, or actions.

## Verification

- Add failing regression tests proving the Shop and Homepage statuses use a visually hidden pattern.
- Preserve the existing carousel-controller test that verifies status text updates to `1 / 2`.
- Add tests for the two Homepage names, updated accessible labels, and absent descriptions.
- Run the complete test suite and verify production Shop and Homepage markup after deployment.
