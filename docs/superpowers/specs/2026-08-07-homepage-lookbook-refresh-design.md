# Homepage Lookbook Refresh Design

## Goal

Refresh the Homepage lookbook with the three supplied Norie lifestyle images and temporarily remove the entire Coming Soon section.

## Approved Image Mapping

- Pink collection, first image: `图片_20260727103005_2_1.jpg`
- Pink collection, second image: `图片_20260727103003_1_1.jpg`
- Pink collection, third image: keep the existing pink accessories collage
- White collection, first image: keep the existing white spray image
- White collection, second image: `Codex 图像 2026年8月4日 16_48_23.png`
- White collection, third image: keep the existing white accessories collage

## Asset Handling

Copy the three supplied source files into `assets/` with stable, descriptive English filenames. The Homepage must reference only deployable project assets, never absolute desktop paths. Keep the existing 3:4 lookbook frames and `object-fit: cover`, producing a centered crop that matches the current layout.

## Coming Soon Removal

Remove the complete Coming Soon section from `index.html`, including its heading, description, and three images. Remove CSS rules used only by that section so no dormant layout code remains. Existing image files may remain in the repository because removing unrelated assets is outside this change.

## Accessibility

Give each new image concise alt text that describes the visible styling and product context. Preserve the existing section headings and three-image reading order for both color collections.

## Verification

Update integration tests before production code so they fail against the old Homepage. Tests must verify the exact new image order, the existence of all three deployed assets, continued 3:4 lookbook styling, and the complete absence of Coming Soon markup and CSS. Then run the full test suite, deploy to Vercel production, and fetch the live Homepage to verify the new asset references and the removal of Coming Soon.
