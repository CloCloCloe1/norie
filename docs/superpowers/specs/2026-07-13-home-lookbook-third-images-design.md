# Homepage Lookbook Third Images Design

## Goal

Replace only the third image in each of the homepage pink and white lookbook strips with the supplied 3:4 accessory collection images.

## Changes

- Copy `C:\Users\limin\Downloads\未命名的设计 (17).png` to `assets/pink-lookbook-accessories.png`.
- Use it as the third image under `Pink pieces for everyday shine`.
- Alt text: `A curated collection of pink combs, claw clips, scrunchies, and hair accessories`.
- Copy `C:\Users\limin\Downloads\未命名的设计 (16).png` to `assets/white-lookbook-accessories.png`.
- Use it as the third image under `White pieces for clean routines`.
- Alt text: `A curated collection of pearl white combs, claw clips, scrunchies, and hair accessories`.

## Layout

Both supplied images are already 3:4. Keep the existing `.lookbook-photo` styling with `aspect-ratio: 3 / 4`, full-width rendering, and `object-fit: cover`. Do not crop or modify the source files before use.

## Acceptance Criteria

- Each lookbook section retains exactly three images.
- Only the third image source changes in each section.
- Both new assets are deployed and return successfully.
- Both third images use meaningful English alternative text.
- The first two images, section copy, buttons, and all other homepage sections remain unchanged.
- Existing automated tests remain green.

## Out of Scope

- Reordering the lookbook images
- Editing the supplied images
- Changing the lookbook layout, spacing, or copy
