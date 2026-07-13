# Transparent Email Logo Design

## Goal

Remove the white rectangle behind the Norie logo in the customer confirmation email while preserving the supplied black wordmark.

## Design

- Keep the Norie lettering, proportions, framing, and black color unchanged.
- Convert the white background to full transparency.
- Preserve smooth antialiased edges without a visible white halo.
- Keep the existing `assets/norie-logo.png` public path so the email template does not need a URL change.
- Replace only the current email logo asset and redeploy the existing site.

## Acceptance Criteria

- `assets/norie-logo.png` remains a valid PNG with an alpha channel.
- Corner pixels are transparent.
- The black logo remains visible and has plausible non-transparent coverage.
- The production asset URL returns the updated PNG.
- The confirmation email continues referencing the same public logo URL.
- Existing automated tests continue to pass.

## Out of Scope

- Redrawing or restyling the Norie wordmark
- Changing the logo size or email layout
- Changing any customer-confirmation copy
