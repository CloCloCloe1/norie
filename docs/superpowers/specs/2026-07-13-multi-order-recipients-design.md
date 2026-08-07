# Multiple Order Recipients Design

## Goal

Send every custom-order notification to both owner inboxes in one Resend request.

## Configuration

Keep the existing `ORDER_TO_EMAIL` environment-variable name for compatibility. Its value becomes a comma-separated list:

```text
liminxuan118@gmail.com,843395381@qq.com
```

The private addresses stay in Vercel configuration and are not hardcoded into source files.

## Delivery

- Parse the environment value into trimmed, unique email addresses.
- Validate every configured address before attempting delivery.
- Require at least one valid recipient.
- Pass the resulting array to Resend's `to` field in one request.
- Both recipients are visible in the email's To header, as explicitly selected by the owner.
- Preserve the customer email as Reply-To.

## Error Handling

An empty list or any invalid configured address is treated as a server configuration error. The order is not sent with a partial recipient list.

## Verification

- Test that comma-separated recipients become a two-address Resend `to` array.
- Test whitespace trimming and duplicate removal.
- Test that an invalid configured recipient prevents external delivery.
- Update environment-variable documentation.
- Update Vercel Production and Preview configuration, deploy, and submit one labeled live test order.

## Out of Scope

No BCC behavior, separate per-recipient sends, customer-facing email copies, or hardcoded private recipient defaults are included.
