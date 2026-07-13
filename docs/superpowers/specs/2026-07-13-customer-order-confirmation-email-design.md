# Customer Order Confirmation Email Design

## Goal

After a valid custom-order request is submitted, keep the existing owner notification and send the customer a branded English confirmation email containing their request summary and production-time expectation.

The message is an **order request confirmation**, not a payment receipt. It must not imply that payment has been received or that production has begun.

## User Experience

The customer continues to submit the existing custom-order form. A successful owner notification remains the condition for showing the form's success state.

After the owner notification succeeds, the server attempts to send a separate confirmation to the submitted customer email address. If that second email fails, the form still reports success so the customer does not resubmit and create a duplicate owner notification. The server logs the confirmation failure for diagnosis.

If the owner notification fails, the endpoint continues to return an error and the form shows its existing failure state.

## Customer Email Content

- Subject: `We received your Norie custom order request`
- Centered Norie logo using the supplied logo image, with meaningful `Norie` alternative text
- Eyebrow: `IT ALL STARTS HERE`
- Personalized greeting: `Hi {Customer name},`
- Welcome copy: `Welcome to Norie. Thank you for creating something special with us — we’ve received your custom order request.`
- A `Your request summary` section containing:
  - Name
  - Product
  - Base color
  - Rhinestone color
  - Custom text, or `Not entered`
  - Free gift
  - Estimated price using the catalog launch price
- Production guidance: `Once your final details and payment are confirmed, your handmade piece is expected to be ready in approximately 7–10 days.`
- Closing copy: `We’ll be in touch soon to confirm the next steps. Thank you for choosing Norie — we can’t wait to create your piece.`
- Sign-off: `With love, Norie`

The email will also include a complete plain-text version. The design uses the existing Norie cream, blush, and berry palette, inline email-safe styling, a constrained readable width, and a single-column layout that remains readable on narrow screens.

## Logo Asset

Copy the supplied `C:\Users\limin\Desktop\MY\product\Norie.png` into the site's `assets` directory under a stable, descriptive filename. The email references the production site's absolute asset URL so mail clients can retrieve it. The image has useful alternative text, and all essential brand and order information remains available as text if remote images are blocked.

## Server Flow

1. Parse and validate the submitted payload using the existing rules.
2. Build trusted order values from the server-side product catalog.
3. Send the existing owner notification to the configured `ORDER_TO_EMAIL` recipients.
4. If the owner notification succeeds, send a separate customer confirmation to `customerEmail`.
5. Set the customer message's reply-to address to the first configured owner recipient.
6. If the customer message fails, log a concise error and still return `{ "ok": true }`.
7. If the owner notification fails, return the existing 500 response.

The two messages remain separate because their audiences, content, reply behavior, and failure handling are different.

## Security and Data Integrity

- Continue escaping every customer-controlled value before inserting it into HTML.
- Continue deriving product pricing from the server-side catalog; ignore client-supplied prices.
- Do not expose the Resend API key or internal error details to the browser.
- Do not include the private owner-recipient list in the customer email body.
- Use the validated customer email only as the confirmation recipient.

## Resend Constraint

The feature can be implemented and deployed before a custom sending domain is verified, but Resend's testing sender only permits delivery to the Resend account owner's address. Real customer confirmations will be rejected until a user-owned domain is verified and `EMAIL_FROM` is updated. A customer-confirmation failure must therefore remain non-fatal to the accepted order request.

## Accessibility

- Use logical heading levels in the HTML email.
- Use a semantic data table for the request summary, with a caption and row headers.
- Give the logo meaningful alternative text.
- Keep all essential information in live text rather than only in the image.
- Use colors with sufficient text contrast and do not rely on color alone.
- Provide an equivalent plain-text message.

## Testing

Automated tests will verify:

- The owner notification is sent before the customer confirmation.
- The two messages use the correct recipients and reply-to values.
- The customer subject, personalized greeting, logo URL, welcome copy, and 7–10 day statement are present.
- Name, product, base color, rhinestone color, custom text, free gift, and trusted estimated price appear in both HTML and plain text as appropriate.
- Customer-controlled values are escaped in HTML.
- A customer-confirmation failure still returns a successful endpoint response after the owner notification succeeds.
- An owner-notification failure still returns an error and does not claim success.
- The copied logo asset is included in the deployable project.

## Out of Scope

- Payment collection or marking the request as paid
- Creating an order database
- Background queues or automatic email retries
- Changing the existing form fields
- Sending bilingual confirmation content
