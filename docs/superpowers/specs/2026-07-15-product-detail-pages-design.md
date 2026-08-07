# Norie Product Detail Pages Design

## Goal

Rename the Shop catalog, add five responsive product-detail pages, let customers switch product variants and quantity, carry those selections into Customize, and include verified itemized pricing in owner and customer emails.

## Shop Catalog

The Shop remains a unified twelve-card grid. Each card image, title, and `VIEW DETAILS` action links to the appropriate detail page and initial variant.

| Current card | Approved name | Destination |
| --- | --- | --- |
| Essentials set | `ESSENTIALS HAIRSTYLING SET` | `essentials-hairstyling-set.html?variant=pearl-white` or `baby-pink` based on the displayed slide/card state |
| Baby set | `BABY HAIRSTYLING SET` | `baby-hairstyling-set.html?variant=baby-pink` or `pearl-white` based on the displayed slide/card state |
| Pink large comb | `BAMBOO PADDLE BRUSH IN BABY PINK` | `bamboo-paddle-brush.html?variant=baby-pink` |
| White large comb | `BAMBOO PADDLE BRUSH IN PEARL WHITE` | `bamboo-paddle-brush.html?variant=pearl-white` |
| Pink small comb | `FLAT BRUSH IN BABY PINK` | `flat-brush.html?variant=baby-pink` |
| White small comb | `FLAT BRUSH IN PEARL WHITE` | `flat-brush.html?variant=pearl-white` |
| Pink claw clip 1 | `NORIE CLIP IN BABY PINK` | `claw-clip.html?variant=baby-pink` |
| Pink claw clip 2 | `NORIE CLIP IN PINK BOW` | `claw-clip.html?variant=pink-bow` |
| Pink claw clip 3 | `NORIE CLIP IN PINK CHERRY` | `claw-clip.html?variant=pink-cherry` |
| White claw clip 1 | `NORIE CLIP IN FLORIE PEARL` | `claw-clip.html?variant=florie-pearl` |
| White claw clip 2 | `NORIE CLIP IN CREAM WHITE` | `claw-clip.html?variant=cream-white` |
| White claw clip 3 | `NORIE CLIP IN WHITE CHERRY` | `claw-clip.html?variant=white-cherry` |

Set cards link using their initial visible slide. Changing a Shop carousel slide must update its detail link so the selected white or pink set opens the matching detail variant.

## Page Architecture

Create five separate HTML entry pages:

- `bamboo-paddle-brush.html`
- `flat-brush.html`
- `claw-clip.html`
- `essentials-hairstyling-set.html`
- `baby-hairstyling-set.html`

All five pages share:

- `product-detail.css` for layout and states.
- `product-detail.js` for variant selection, image/name updates, quantity, and Customize navigation.
- `product-catalog.js` for the approved products, variants, image paths, names, prices, and descriptions.

Each HTML page declares its product key in a data attribute. The shared controller accepts only variants defined for that product. Missing or invalid query parameters fall back to the page's first approved variant.

## Detail Page Layout

Desktop uses two equal visual sections: a square product image on the left and product information on the right. Mobile and narrow tablet layouts stack the image above the information without horizontal scrolling.

The right section contains, in order:

1. Uppercase variant-aware product name.
2. CAD unit price.
3. `COLOR:` plus the selected variant label.
4. Circular, keyboard-operable variant radio controls.
5. Quantity stepper.
6. A full-width action button.
7. Product description and specifications.

Single-item actions read `CUSTOMIZE THIS PIECE`. Set actions read `CUSTOMIZE THIS SET`. Both use the current light-gray hover treatment and navigate to Customize with validated `product`, `variant`, and `quantity` query parameters.

## Products, Variants, and Prices

| Product | Variants | Unit price |
| --- | --- | --- |
| Bamboo Paddle Brush | Pearl White, Baby Pink | CAD $30 |
| Flat Brush | Pearl White, Baby Pink | CAD $25 |
| Norie Clip | Baby Pink, Pink Bow, Pink Cherry, Florie Pearl, Cream White, White Cherry | CAD $12 |
| Essentials Hairstyling Set | Pearl White, Baby Pink | CAD $38 |
| Baby Hairstyling Set | Pearl White, Baby Pink | CAD $32 |

Selecting a variant updates the square image, uppercase page title, visible `COLOR:` value, selected radio state, image alternative text, and URL query parameter. The quantity stepper accepts integers from 1 through 10. The decrement control is unavailable at 1 and the increment control is unavailable at 10.

The existing square assets map directly to variants:

- Bamboo Paddle Brush: `shop-large-white.png` / `shop-large-pink.png`.
- Flat Brush: `shop-small-white.png` / `shop-small-pink.png`.
- Norie Clip: Baby Pink → `shop-claw-pink-1.png`; Pink Bow → `shop-claw-pink-2.png`; Pink Cherry → `shop-claw-pink-3.png`; Florie Pearl → `shop-claw-white-1.png`; Cream White → `shop-claw-white-2.png`; White Cherry → `shop-claw-white-3.png`.
- Essentials Hairstyling Set: `shop-set-essentials-white.png` / `shop-set-essentials-pink.png`.
- Baby Hairstyling Set: `shop-set-baby-white.png` / `shop-set-baby-pink.png`.

## Product Content

### Norie Clip

Use this approved description:

> Made to elevate your everyday hair routine, this claw clip is crafted from premium custom cellulose acetate for a durable, lightweight feel. Designed to comfortably hold a full head of hair, it provides a secure, all-day grip without pulling or snagging. Perfect for effortless updos, messy buns, French twists, or half-up styles.

Follow it with dynamic Color, `10.5 × 5 cm (4.1" × 2.0")`, and `Custom Cellulose Acetate`.

### Flat Brush

Use this approved description:

> Elevate your everyday hair ritual with our handcrafted acetate comb. Made from premium custom cellulose acetate, it effortlessly glides through the hair to detangle, smooth, and enhance natural shine without pulling or snagging. Lightweight yet durable, its thoughtfully designed shape is comfortable to hold and suitable for all hair types, whether styling, detangling, or refreshing your look throughout the day.

Follow it with dynamic Color, `Custom Cellulose Acetate`, and `14 × 7 cm (5.5" × 2.8")`.

### Bamboo Paddle Brush

Use this approved description:

> Designed to elevate your everyday hair routine, this premium acetate paddle brush effortlessly glides through hair to detangle knots while helping distribute natural oils from root to tip. Crafted from custom cellulose acetate with rounded pins for a comfortable brushing experience, it smooths strands, reduces static, and leaves hair looking healthier, shinier, and beautifully polished. Suitable for all hair types and perfect for daily use.

Follow it with dynamic Color, `Custom Cellulose Acetate`, and `25 × 7 cm (9.8" × 2.8")`.

Features:

- Gently detangles wet or dry hair.
- Helps smooth frizz and reduce static.
- Rounded pins massage the scalp for added comfort.
- Lightweight, durable, and comfortable for everyday styling.
- Suitable for all hair types.

Finish with this note:

> Due to the natural characteristics of cellulose acetate, slight variations in color and pattern may occur, making each brush uniquely yours.

### Sets

- Essentials Hairstyling Set: Bamboo paddle brush + claw clip + one free gift.
- Baby Hairstyling Set: Flat brush + claw clip + one free gift.

The set description and image update between Pearl White and Baby Pink.

## Customize Integration

Detail actions navigate with three parameters:

```text
customize.html?product=<approved-product>&variant=<approved-variant>&quantity=<1-10>
```

Customize validates the parameters against the same catalog model. With valid parameters it displays a `Selected style` summary containing product, specific style, quantity, unit price, and estimated total. Customers continue choosing rhinestone color, custom text, and contact details there; product style is not selected a second time. A link returns to the relevant detail page if the customer wants to change the product or style.

Direct visits without parameters default to Flat Brush / Baby Pink / Quantity 1. Invalid values use this same safe default rather than being submitted.

## Order Data and Email

The request payload adds a product key, variant key, and quantity. The API keeps the authoritative catalog and validates every combination. The API, not the browser, calculates:

```text
estimated total = approved unit price × validated quantity
```

Both the owner order email and customer confirmation email include:

- Complete product name.
- Specific style/color.
- Quantity.
- Unit price.
- Estimated total.
- Existing customer name, email, contact, rhinestone color, custom text, and other confirmed order fields.

Set orders use CAD $38 or CAD $32 as their unit price. No browser-provided price is trusted.

## Accessibility and Responsive Behavior

- Variant choices use native radio inputs with persistent visible labels.
- Each circular swatch has a programmatic name and visible selected state that does not rely on color alone.
- Quantity uses native buttons with descriptive accessible names, correct disabled states, and visible focus indicators.
- Variant changes update the visible text and image alternative text without moving focus.
- Detail pages use semantic headings, main/footer landmarks, and a logical reading order.
- The two-column layout reflows to one column at narrow widths and works at 320 CSS pixels.

## Verification

Test-first implementation covers:

- Twelve approved Shop names and detail links.
- Five deployable detail pages and shared assets.
- Product/variant/image/name mappings.
- Variant switching and invalid-variant fallback.
- Quantity boundaries from 1 to 10.
- Customize query parsing and selected-style summary.
- API product/variant/quantity validation.
- Authoritative unit and total price calculation.
- Owner and customer emails containing style and quantity.
- Responsive and accessible markup contracts.

Run the full Node test suite, deploy through the linked Vercel project, then inspect each production detail page plus Shop and Customize.
