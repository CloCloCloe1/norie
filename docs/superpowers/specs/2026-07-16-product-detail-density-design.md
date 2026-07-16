# Product Detail Right-Panel Density Design

## Goal

Make the right-hand information panel on all five product detail pages more compact. Long product names should remain on one line on desktop while mobile layouts continue to reflow without horizontal overflow.

## Approved Changes

- Keep the existing two-column desktop and stacked mobile page structure.
- Reduce the desktop product-name font size, letter spacing, and line height.
- Keep the product name on one line above the existing mobile breakpoint.
- Allow the product name to wrap normally at `760px` and below.
- Reduce right-panel padding, price spacing, fieldset vertical padding, quantity spacing, and product-description spacing.
- Slightly reduce body line height inside the right panel without changing product copy.
- Apply the change through `product-detail.css` so all five detail pages update together.

## Accessibility and Responsive Behavior

- Do not truncate product names or use ellipses.
- At widths where a single line cannot fit comfortably, switch to normal wrapping.
- Preserve visible focus indicators, 44px controls, readable text contrast, and the current semantic headings.
- Verify no horizontal page overflow at the mobile breakpoint.

## Success Criteria

- All five detail pages use the same compact right-panel rules.
- The longest product name fits on one line on desktop.
- Product names wrap normally on mobile.
- Existing detail-page interactions and `WORKS WELL WITH` remain unchanged.
- Full automated tests pass and Production is redeployed.
