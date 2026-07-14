# Homepage and Shop Set Carousels Design

## Goal

Update the two limited-edition set cards on the homepage and Shop page so that each set uses two supplied 3:4 promotional images, accurate product naming, and an accessible carousel that works by touch, pointer, and keyboard.

## Scope

The change applies to the `Comb and Clip Set` section on `index.html`, the `Sets` section on `shop.html`, a small shared carousel script used by both pages, and four new image assets copied from the supplied Downloads files.

The Customize page and its current individual-product choices remain unchanged. The Shop page's `Build this set` links continue to navigate to `customize.html`.

## Content

Both sections use the sentence `First month limited edition.`

### Set 1

- Kicker: `Set 1`
- Name: `Bamboo Paddle Brush + Claw Clip`
- Description: `A limited-edition bamboo paddle brush and claw clip pairing with one free gift.`
- Sale price: `CAD $38`
- Original price: `CAD $48`
- Images, in order: the supplied white variation, followed by the supplied pink variation.

### Set 2

- Kicker: `Set 2`
- Name: `Flat Brush + Claw Clip`
- Description: `A limited-edition flat brush and claw clip pairing with one free gift.`
- Sale price: `CAD $32`
- Original price: `CAD $40`
- Images, in order: the supplied white variation, followed by the supplied pink variation.

## Asset handling

Copy the four source images into `assets/` with short, URL-safe names:

- `set-bamboo-white.png`
- `set-bamboo-pink.png`
- `set-flat-white.png`
- `set-flat-pink.png`

The supplied images already use a portrait composition. Each carousel viewport displays them at a fixed `3 / 4` aspect ratio with `object-fit: cover` so the card grid remains aligned on both pages.

## Carousel behavior

Use a progressively enhanced horizontal scroll-snap carousel for each product card.

- One image is visible at a time.
- Touchscreen users can swipe horizontally.
- Trackpad and mouse-wheel horizontal scrolling continue to work.
- Previous and next buttons move exactly one image and wrap between the first and second images.
- The carousel does not autoplay.
- A visible position label displays `1 / 2` or `2 / 2` and updates after button navigation or manual scrolling.
- The script is shared by `index.html` and `shop.html` to prevent the two implementations from drifting apart.
- If JavaScript does not load, the images remain horizontally scrollable; only the enhanced arrow controls are unavailable.

## Accessibility

- Each carousel is a labelled region associated with its product name.
- Previous and next controls use native `<button type="button">` elements with explicit accessible names.
- Controls have visible keyboard focus styling and sufficiently large pointer targets.
- Each image has concise alternative text describing the pictured set and colour variation.
- The current position is exposed as readable text without an unnecessarily interruptive assertive live region.
- Motion respects `prefers-reduced-motion`; smooth scrolling is disabled when reduced motion is requested.
- The layout continues to reflow into one card per row at narrow viewport widths.

## Files and responsibilities

- `index.html`: homepage copy, product cards, carousel markup, carousel styles, and shared script reference.
- `shop.html`: Shop page copy, product cards, carousel markup, carousel styles, and shared script reference.
- `norie-carousel.js`: finds each carousel, handles previous/next controls, updates the position label, and synchronizes the position after manual scrolling.
- `assets/set-*.png`: the four supplied promotional images.
- Tests: verify both pages reference the new content and assets, verify accessible carousel markup, and exercise the carousel navigation logic.

## Verification

Before deployment:

1. Run the full automated test suite.
2. Confirm all four assets exist and have valid image dimensions.
3. Verify both pages show the correct names, descriptions, and prices.
4. Verify arrow navigation, wraparound, swipe/scroll behavior, position updates, keyboard focus, and reduced-motion behavior.
5. Check desktop and mobile layouts for a consistent 3:4 image area without horizontal page overflow.
6. Deploy to Vercel production and verify both public pages and all four public asset URLs return successfully.

## Out of scope

- Adding set products to the Customize form.
- Preselecting Customize options from the `Build this set` links.
- Changing existing individual-product cards on the Shop page.
- Autoplay, pagination dots, or more than two slides per set.
