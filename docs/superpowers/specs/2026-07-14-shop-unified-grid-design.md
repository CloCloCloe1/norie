# Shop Unified Product Grid Design

## Goal

Present all Shop products in one continuous catalog instead of separating Single Pieces and Sets. The catalog will contain twelve cards in a four-column desktop grid.

## Approved layout

- Replace the separate `Single Pieces` and `Sets` sections with one `Shop All` product section.
- Use one shared `.shop-grid` containing all twelve cards.
- Order the cards as follows:
  1. Essentials Hairstyling Set
  2. Baby Hairstyling Set
  3. Pink Large Comb
  4. White Large Comb
  5. Pink Small Comb
  6. White Small Comb
  7. Pink Claw Clip 1
  8. Pink Claw Clip 2
  9. Pink Claw Clip 3
  10. White Claw Clip 1
  11. White Claw Clip 2
  12. White Claw Clip 3
- Desktop widths above 900px will show four cards per row.
- Tablet widths from 561px through 900px will retain the existing two-column layout.
- Mobile widths at or below 560px will retain the existing one-column layout.

## Set cards

- Rename `Bamboo Paddle Brush + Claw Clip` to `Essentials Hairstyling Set`.
- Rename `Flat Brush + Claw Clip` to `Baby Hairstyling Set`.
- Keep both existing two-image carousels, arrow controls, prices, descriptions, limited-edition labels, and `Build this set` links.
- Update carousel accessible labels so they use the new product names.
- The set cards remain first because they are the featured launch products.

## Single-piece cards

The ten existing single-piece cards will move into the unified grid without changing their images, names, descriptions, prices, image metadata, or `Customize this piece` links.

## Accessibility and responsive behavior

- Preserve semantic product `<article>` elements and the existing h1 → h2 → h3 heading hierarchy.
- Keep native carousel buttons with visible focus states and descriptive accessible names.
- Keep all informative image alternative text and loading metadata.
- Preserve the current two-column tablet and one-column mobile breakpoints so content reflows without horizontal scrolling.

## Scope

Only `shop.html` structure, Shop carousel labels, responsive grid columns, and focused tests are in scope. Homepage set names, product prices, customization behavior, email behavior, and image assets will not change.

## Verification and release

Automated checks will verify:

- one unified Shop product section and one twelve-card grid;
- the two renamed sets appear first in the approved order;
- desktop CSS uses four columns while tablet/mobile breakpoints remain two/one columns;
- both set carousels and all twelve product links remain present;
- the complete test suite passes.

After local verification, deploy the linked Vercel project to production and confirm the official `/shop` page contains both new set names and the unified twelve-card catalog.
