# Shop Product Card Redesign

## Goal

Restyle the unified twelve-product Shop catalog to match the supplied clean product-card reference while preserving product order, responsive columns, prices, and the Customize flow.

## Catalog and Images

- Preserve the existing order and the desktop/tablet/mobile 4/2/1 grid.
- Give every product image viewport a square 1:1 aspect ratio.
- Essentials Hairstyling Set carousel order: `esssential white.png`, then `essential pink.png`.
- Baby Hairstyling Set carousel order: `baby pink.png`, then `baby white.png`.
- Copy the sources into consistently named deployable files under `assets/`.
- Preserve mouse, touch, and keyboard carousel behavior.
- Reduce carousel arrow controls from about 56px to 28px, retaining accessible labels and visible focus.
- Do not animate or scale product images on hover.

## Card Presentation

- Use a clean white card presentation without the current outer border.
- Remove all category eyebrows, including `SET 1` and `SET 2`.
- Remove every product-description sentence.
- Display all product names in uppercase, centered, and in a smaller sans-serif size.
- Center the price row and retain both sale price and crossed-out original price.
- Keep spacing aligned when names wrap.

## Actions

- Replace text-link styling with a full-width, square-cornered bordered action.
- Set labels to `BUILD THIS SET` for sets and `CUSTOMIZE THIS PIECE` for individual products.
- Keep every action linked to `customize.html`.
- Use white by default, light gray on hover, and a clear keyboard focus state.

## Responsive and Accessibility Requirements

- Avoid horizontal page overflow at 320px.
- Use informative alt text for the four replacement images.
- Keep carousel status available through the existing controller.
- Preserve logical headings, native buttons and links, WCAG 2.2 AA contrast, and reduced-motion behavior.
- The 28px arrow target stays above the WCAG 2.2 AA 24px minimum.

## Verification

- Add or update automated tests first and observe the expected failure before implementation.
- Test the new asset mappings and square metadata.
- Test uppercase headings, removed descriptions and eyebrows, centered prices, bordered actions, 28px controls, and Customize destinations.
- Run the complete Node test suite and verify the production deployment serves the new assets and Shop markup.

## Out of Scope

- Homepage imagery or card styling.
- Product price or ordering changes.
- New product-detail, cart, or checkout behavior.
- Carousels for individual products.
