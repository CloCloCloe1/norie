# Norie Chinese Copy and Product Layout Design

## Goal

Refine the bilingual storefront so Chinese copy feels clean and intentional while product terminology remains consistently English. Remove the temporary Coming Soon content and correct the Shop and Customize layouts shown in the supplied screenshot.

## Homepage

- Change the Chinese translation of `Custom Hair Pieces` from `把名字戴在头发上` to `属于你的闪闪发光`.
- Remove the entire Coming Soon section from the HTML. This removes its heading, the sentence `New sample photos for launch extras, packaging details, and limited gift add-ons.`, and all three temporary images in both language modes.
- Preserve the current Hero image, Lookbooks gallery, editorial sections, bilingual switcher, Keep in touch copy, and footer contacts.

## Shop

All product names stay in English in both language modes. This includes set names, Bamboo Paddle Brush and Flat Brush color variants, and all Claw Clip names. Prices, badges, calls to action, and descriptive copy continue to translate where translations already exist.

Product-card typography is adjusted so English names use a controlled size and line height and cards read cleanly in the four-column desktop layout. The layout remains two columns on tablet and one column on mobile, without horizontal overflow or clipped text.

## Customize

- Change the Chinese translation of `Customize your set` to `属于你的闪闪发光`.
- Keep the Chinese heading on one line at desktop and tablet widths. At narrow mobile widths, wrapping is allowed rather than causing horizontal overflow.
- Keep `选好款式与颜色，加上花体水钻名字，再收下一份随机小礼物。` on one line where the available width allows it, with natural mobile wrapping as the accessible fallback.
- Rename visible product choices to `Flat Brush`, `Bamboo Paddle Brush`, and `Claw Clip` in English for both locales.
- Keep the main base-color choices `Pink` and `White` in English for both locales.
- Keep the main rhinestone choices `Pink stones` and `White stones` in English for both locales.
- Translate only the supporting small text in Chinese mode:
  - `Mini oval brush` → `迷你椭圆梳`
  - `Square paddle comb` → `竹制气垫梳`
  - `Glossy acetate clip` → `亮面醋酸抓夹`
  - `Soft blush acetate` → `柔雾粉醋酸材质`
  - `Pearl white acetate` → `珍珠白醋酸材质`
  - `Soft pink sparkle` → `柔粉闪光`
  - `Clear pearl shine` → `通透珍珠光`

Submitted order values remain stable and are not translated.

## Verification

Automated tests cover the removed section, approved Chinese headline, English-only product names, translated option helper text, and existing bilingual behavior. Browser checks cover desktop Shop card typography and desktop/mobile Customize line behavior, with no horizontal overflow. The complete test suite must pass before production deployment, and the live site must be checked after deployment.
