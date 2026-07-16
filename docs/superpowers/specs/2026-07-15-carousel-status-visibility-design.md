# Shop Carousel Status Visibility Fix

## Problem

The visible `1 / 2` carousel status is absolutely positioned over the bottom of each square set image and obscures product details.

## Approved Design

- Visually hide the Shop carousel status instead of moving it elsewhere in the card.
- Keep the `data-carousel-status` element in the DOM.
- Keep `norie-carousel.js` updating its text so assistive technology still receives the current slide position.
- Do not change the product images, arrows, card spacing, names, prices, or Customize actions.
- Apply the fix only to `shop.html`; Homepage carousel status styling remains unchanged.

## Verification

- Add a failing regression test proving the Shop status uses a visually hidden pattern.
- Preserve the existing carousel-controller test that verifies status text updates to `1 / 2`.
- Run the complete test suite and verify production Shop markup after deployment.
