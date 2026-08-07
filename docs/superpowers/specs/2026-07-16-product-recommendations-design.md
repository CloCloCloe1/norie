# Product Detail “Works Well With” Design

## Goal

Add a second horizontal section below the existing product-detail layout on all five Norie detail pages. The current image-and-copy section remains unchanged. The new section helps visitors move directly to the other four product detail pages.

## Page Structure

Each detail page has two vertical sections:

1. Existing product detail section: product image on the left and product information on the right.
2. New recommendation section: a centered, uppercase `WORKS WELL WITH` heading followed by four product cards.

## Recommendation Rules

- The five detail-page product families are Bamboo Paddle Brush, Flat Brush, Norie Clip, Essentials Hairstyling Set, and Baby Hairstyling Set.
- The current product family is excluded.
- The remaining four families appear in catalog order.
- Each card uses the family’s representative/default variant image, full product-family name, and current unit price.
- The image, product name, and card action all lead to that family’s detail page.
- Recommendation data is generated from the shared `product-catalog.js` catalog so all five pages stay consistent.

## Visual Design

- The section uses the existing Norie cream, white, berry, and rose palette.
- The heading is centered, uppercase, and letter-spaced to match the reference image and current site navigation typography.
- Cards are quiet white panels with square, contain-fit product images and centered product information.
- A subtle border/color change on hover and focus indicates that each card is interactive without introducing a new visual language.
- Desktop uses four equal columns; tablet uses two columns; mobile uses one column.

## Accessibility

- Use semantic `<section>`, `<h2>`, list, and link elements.
- Each linked image has useful alternative text describing the destination product.
- Each card has a clear accessible link name.
- Keyboard focus is visible and does not rely on color alone.
- The grid reflows at 320 CSS pixels without horizontal page scrolling.
- Touch targets are at least 44 CSS pixels high where an explicit action is rendered.

## Implementation Boundary

- Add one recommendation container to each of the five detail-page HTML files.
- Add shared rendering logic to `product-detail.js`.
- Add shared responsive presentation to `product-detail.css`.
- Add automated tests for exclusion, four-card rendering data, links, semantics, and responsive breakpoints.
- Do not change the current product-detail selection, Customize flow, pricing, emails, or Shop layout.

## Success Criteria

- Every detail page shows exactly four other product families.
- The current family never appears in its own recommendation section.
- Every recommendation links to the correct detail page.
- Desktop, tablet, and mobile column counts are 4, 2, and 1 respectively.
- Existing automated tests and the new recommendation tests pass.
