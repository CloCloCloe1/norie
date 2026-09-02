# Home Social Account Links Design

## Goal

Turn the existing home-page social account rows into direct account links without embedding recent posts or loading third-party social widgets.

## Accounts and Destinations

- Instagram — `norie_hair` — `https://www.instagram.com/norie_hair/`
- TikTok — `norie_hair` — `https://www.tiktok.com/@norie_hair`
- Rednote — `itschloe_eee` — `https://xhslink.cn/m/38rRNyaQEbA`
- Douyin — `40950053692` — `https://v.douyin.com/S4fAA1Zxzbs/`
- WeChat — `NorieToronto` — remains text-only because there is no web profile destination.

## Interaction and Presentation

- Preserve the existing `keep in touch` section and its responsive layout.
- Make the full row for Instagram, TikTok, Rednote, and Douyin clickable.
- Display the platform name and searchable account identifier in every row.
- Add a small visual arrow to linked rows so the interaction is apparent.
- Open social destinations in a new browser tab using `target="_blank"` and `rel="noopener noreferrer"`.
- Give every link a clear accessible name and a visible keyboard-focus state.
- Keep the WeChat row visually consistent but non-clickable.

## Mainland China Behavior

- Do not embed platform scripts, feeds, iframes, or live social widgets.
- A failed or blocked Instagram/TikTok destination must not affect the home page or the other links.
- Preserve the displayed account identifiers as a manual-search fallback.
- Use the supplied Rednote and Douyin share URLs because they are intended to route mobile visitors toward the corresponding apps.
- The site cannot guarantee that Instagram or TikTok will be reachable from mainland China.

## Localization

- Keep the existing platform brand names unchanged in both languages.
- Keep account identifiers identical across languages.
- Any new generic accessibility text must be available in English and Chinese.

## Verification

- Confirm the four linked rows use the exact approved destinations.
- Confirm WeChat remains text-only.
- Confirm all linked rows open a new tab and include safe external-link attributes.
- Confirm keyboard focus is visible and the entire row is clickable.
- Confirm no Instagram, TikTok, Rednote, or Douyin embed scripts/iframes are added.
- Run the existing site integration and i18n tests.
- Test the home page at desktop and mobile widths.

## Out of Scope

- Recent-post galleries or automatic social feeds.
- Third-party social widgets.
- QR codes.
- Hosting or domain changes for mainland China availability.
