# Homepage Social Accounts Design

## Goal

Replace the placeholder contact accounts in the Homepage Keep in Touch card with Norie's current account names.

## Design

Keep the existing text-only social card and its definition-list layout. Do not add social links, icons, or new controls. The card will display four rows in this order:

1. IG — `norie_hair`
2. Rednote — `Norie`
3. Douyin — `Norie`
4. WeChat — `NorieToronto`

## Validation

The Homepage integration test will assert all four label/value pairs, confirm the former sample values are absent, and retain the no-link requirement. The complete test suite and deployed production Homepage will be checked before handoff.
