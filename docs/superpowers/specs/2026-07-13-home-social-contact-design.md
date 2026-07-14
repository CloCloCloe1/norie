# Home Social Contact Design

## Goal

Replace the home page newsletter signup interface with temporary Instagram and Rednote account information.

## Content

The section keeps its existing `keep in touch` heading and `#waitlist` anchor. The supporting copy becomes:

> Follow Norie for new samples, custom-order updates, and launch news.

The right-hand card displays two text-only account rows:

- IG: `sampleigacc`
- Rednote: `sampleacc`

The sample accounts are not links because real account URLs do not exist yet.

## Layout

- Preserve the current two-column desktop section and single-column responsive behavior.
- Replace the newsletter form with a bordered social-account card that visually matches the existing site.
- Use semantic term/value markup so platform names and account names remain clearly associated.

## Removal and Compatibility

- Remove the email field, subscription hint, and Subscribe button from the home page.
- Keep the `#waitlist` ID so existing category and footer links continue to reach the section.
- Keep the existing `/api/subscribe` function and dormant browser binding for possible future reuse; no home-page UI invokes it.

## Verification

- Test that the new copy and both sample account names are present.
- Test that no `#subscribeForm`, newsletter email input, or Subscribe button remains on the home page.
- Test that the sample account text is not wrapped in links.
- Run the full automated suite, HTML validation, and production deployment checks.

## Out of Scope

No real social URLs, icons, new API behavior, subscription data deletion, or other page changes are included.
