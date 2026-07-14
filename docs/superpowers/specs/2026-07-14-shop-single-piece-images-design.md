# Shop Single Pieces Image Update Design

## Goal

Update the Shop page's Single Pieces section so every supplied product image is represented by its own square product card. The section will grow from six cards to ten cards while retaining the existing Norie visual system and customization flow.

## Approved approach

Use ten independent product cards rather than carousels or color filters. This makes every claw clip variation immediately visible and gives every supplied image a direct customization entry point.

## Product mapping and order

The grid will contain these products in this order:

1. Pink Large Comb — `bamboo paddle brush pink.png`
2. White Large Comb — `bamboo paddle brush white.png`
3. Pink Small Comb — `粉色小梳子.png`
4. White Small Comb — `白色小梳子.png`
5. Pink Claw Clip 1 — `Claw clip 1 pink.png`
6. Pink Claw Clip 2 — `clawclip 2 pink.png`
7. Pink Claw Clip 3 — `claw clip 3 pink.png`
8. White Claw Clip 1 — `clawclip white 1.png`
9. White Claw Clip 2 — `clawclip white 2.png`
10. White Claw Clip 3 — `clawclip white 3.png`

The source images will be copied into `assets/` with URL-safe, descriptive filenames. Source files in Downloads will not be modified.

## Card presentation

- Every product image viewport will use a 1:1 aspect ratio.
- Images will use contain-style fitting so the full product remains visible and is not cropped.
- The existing three-column desktop grid and responsive mobile layout will remain.
- The four comb card names, descriptions, prices, and customization links will remain unchanged.
- The six claw clip cards will use the temporary names `Pink Claw Clip 1–3` and `White Claw Clip 1–3`.
- All six claw clip cards will temporarily reuse the existing claw clip price: CAD $12, original price CAD $16.
- Pink claw clip cards will reuse the existing pink claw clip description. White claw clip cards will reuse the existing white claw clip description.
- Every card will retain its own `Customize this piece` link to `customize.html`.

## Accessibility and performance

- Each image will have product-specific alternative text that distinguishes its color and design.
- Images will include intrinsic square dimensions to reduce layout shift.
- Product images will use lazy loading and asynchronous decoding.
- Existing semantic article, heading, and link structure will be preserved.

## Scope

Only the Shop page Single Pieces section and its product assets are in scope. The Homepage, Sets section, product pricing logic, customization form behavior, and checkout/email behavior will not change.

## Verification

Automated checks will verify:

- all ten product cards and the approved names are present;
- every new asset path resolves to a tracked file;
- the ten product images use a 1:1 presentation without crop;
- all cards retain their customization links;
- the existing site test suite still passes.

The rendered Shop page will also be checked at desktop and mobile widths if the local browser runtime is available.
