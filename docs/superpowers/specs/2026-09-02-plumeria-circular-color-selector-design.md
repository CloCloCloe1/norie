# Plumeria Circular Color Selector Design

## Goal

Replace the Plumeria detail page's rectangular White/Pink controls with the same circular, image-based selector already used by the shared decorative claw detail page.

## Interaction

- Show two native radio choices: Plumeria White and Plumeria Pink.
- Each choice uses the corresponding real Plumeria product image inside a 64px circular swatch.
- Use the existing selected and keyboard-focus treatments from `.style-swatch` so the controls match the other fixed claw clips exactly.
- Selecting a swatch updates the main image, product color, accessible selection message, and `color` query parameter.
- A direct White or Pink Shop link preselects the matching swatch. An unknown color continues to fall back to White.

## Preserved Behavior

- Product: one large clip and two small clips per set.
- Sale price: CAD $10; original price: CAD $12.
- No customization fields.
- Both Shop cards continue to share the Plumeria detail page.
- Cart item validation and ordering behavior remain unchanged.

## Verification

- Add a regression test that requires two circular image radio choices for Plumeria and rejects the old rectangular control markup.
- Verify both direct color URLs and color switching.
- Run the complete test suite and manually check the production-like page in a browser before release.
