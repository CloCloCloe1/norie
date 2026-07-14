# Coming Soon Images Design

## Goal

Replace the three placeholder cards in the home page's existing “Coming Soon” section with the three supplied photographs.

## Scope

- Copy the supplied image files into the site's `assets` directory.
- Replace `Photo 01`, `Photo 02`, and `Photo 03` with informative images in the same order the user supplied them.
- Preserve the section heading, description, placement, and overall visual style.
- Display each image in a consistent 3:4 portrait frame using CSS `aspect-ratio: 3 / 4` and `object-fit: cover`.
- Keep the existing responsive behavior: three columns where space permits and the current narrow-screen layout at smaller viewports.

## Accessibility

Each photograph will receive concise alternative text describing its distinct product styling. The images are informative content, so their `alt` attributes will not be empty.

## Verification

- Confirm all three asset paths resolve.
- Confirm the three placeholders no longer appear.
- Confirm each card has a 3:4 ratio rule and cover cropping.
- Run the existing automated test suite and HTML validation.

## Out of Scope

No copy, navigation, form, API, product, or other page changes are included.
