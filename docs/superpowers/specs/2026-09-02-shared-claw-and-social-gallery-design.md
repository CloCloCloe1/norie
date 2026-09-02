# Norie Shared Claw Detail and Social Gallery Design

## Goal

Refine the product and homepage experience so the four fixed decorative claw clips share one visual style selector, while the homepage gains an editorial social gallery, a simple Follow Us line, and a compact newsletter block.

## Approved Visual Direction

The approved preview uses Norie's existing cream, berry, and soft-pink palette. Product choices appear as small circular image swatches instead of large bordered radio cards. The social gallery uses a clean edge-to-edge image mosaic inspired by the supplied reference, followed by understated inline account links and a centered email signup form.

## Shared Decorative Claw Detail

The following four non-customizable products share one detail experience:

- Claw Clip in Pink Bow
- Claw Clip in Cherry Pink
- Claw Clip in Florie White
- Claw Clip in Cherry White

Each Shop card links to `product.html?product=decorative-claw&style=<style-id>`. The selected style controls the large product image, name, description, color, cart product ID, and selected swatch.

The four style choices appear as circular thumbnail swatches made from the real product images. The active circle has a high-contrast outline and check/selected state. Hover and keyboard focus reveal the complete product name. The group uses native radio inputs with visually styled labels so keyboard and screen-reader interaction remain reliable.

Changing the style updates the page without navigating or reloading. The URL is updated to the selected style with `history.replaceState`, allowing the current selection to be copied or shared. Add to cart uses the corresponding fixed catalog ID and never exposes customization controls.

The two customizable products remain separate from this shared selector:

- Norie Claw Clip in Pink
- Norie Claw Clip in White

They continue linking to Customize. The Plumeria three-piece set keeps its own shared Pink/White detail page because it is a set, not one of the four single decorative claw clips.

Unknown style IDs fall back to Pink Bow. Unknown product IDs still show the existing safe unavailable state.

## Homepage Social Gallery

Add a new full-width social gallery section near the bottom of the homepage, above the simplified account links and newsletter form.

The gallery uses a curated mixture of existing Norie social-style assets and current Lookbook images. It does not fetch a live social feed and therefore does not depend on Instagram, TikTok, RedNote, or Douyin scripts that may be blocked in China.

Desktop shows an editorial mosaic of eight images in four columns and two rows. Tablet uses four columns; mobile uses two columns. Images are square, use `object-fit: cover`, lazy-load below the fold, and retain meaningful alternative text.

Each tile has one fixed platform destination. Destinations repeat in this order:

1. Instagram
2. TikTok
3. RedNote
4. Douyin

The second row repeats the same order. This looks distributed while remaining predictable. Each link opens in a new tab and has a visible hover/focus overlay such as `View on Instagram`; its accessible name includes the platform.

## Simplified Follow Us Links

Replace the current bordered account table with one centered, unboxed line inspired by the supplied `Follow us @emijayinc` reference.

The line contains these explicit destinations:

- Instagram `@norie_hair` → `https://www.instagram.com/norie_hair/`
- TikTok `@norie_hair` → `https://www.tiktok.com/@norie_hair`
- RedNote `@itschloe_eee` → `https://xhslink.cn/m/38rRNyaQEbA`
- Douyin `@40950053692` → `https://v.douyin.com/S4fAA1Zxzbs/`

WeChat has no reliable public web destination, so `WeChat NorieToronto` remains visible plain text after the linked accounts. External-link helper text remains available to assistive technology but is not visually shown.

On narrow screens the line wraps naturally into two or more centered rows without borders or table alignment.

## Compact Keep in Touch Section

Restyle the existing newsletter area to match the supplied compact reference:

- centered uppercase `KEEP IN TOUCH` heading;
- one short sentence for samples, custom-order updates, and launches;
- email input and signup button on one line at desktop widths;
- stacked full-width input and button on mobile;
- no oversized serif heading or large decorative card;
- existing `/api/subscribe` submission behavior, validation, accessible status, and bilingual copy remain unchanged.

## Localization and Accessibility

- Product names and account handles remain unchanged in English and Chinese modes.
- Selector labels, gallery overlays, Follow Us lead-in, newsletter helper text, buttons, and status messages are bilingual.
- Circular swatches use native radio semantics, visible focus, and at least 44 by 44 pixel hit areas.
- Gallery links have meaningful accessible names and visible keyboard focus.
- External destinations use `target="_blank"` with `rel="noopener noreferrer"`.
- The visual removal of tables and labels does not remove accessible names.
- Motion is limited to small opacity and outline changes and respects reduced-motion preferences.

## Data and Cart Behavior

The four fixed cart catalog IDs and server-side trusted prices remain unchanged. The shared detail selector maps each style directly to its existing catalog ID:

- `pink-bow`
- `cherry-pink`
- `florie-white`
- `cherry-white`

Changing a swatch does not alter the cart. Only pressing Add to cart creates or increments the selected fixed product line.

## Verification

Automated tests must verify:

- all four Shop cards point to the shared decorative-claw detail route with distinct style parameters;
- selecting a style returns the correct fixed catalog product, name, color, image, and price;
- the shared detail markup uses a native radio group with four circular-style labels and no large rectangular option cards;
- the two Norie claw clips still route to Customize and Plumeria remains separate;
- eight gallery images exist, use tracked assets, and have the fixed platform destination cycle;
- the old bordered social account list is removed;
- all four online social account names and URLs remain present;
- the newsletter retains its original form endpoint and accessible status behavior while using the compact layout;
- the complete existing test suite remains green.

Manual verification must cover desktop and mobile layouts, both languages, keyboard selection, swatch image changes, shared URLs, add-to-cart totals, external social links, and the newsletter form's success and failure states.
