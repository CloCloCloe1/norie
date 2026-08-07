# Norie Fulfillment, Email, and Order Tracking Design

## Goal

Extend the Customize order request into a fulfillment-aware order workflow. Customers choose delivery or pickup, receive a price and confirmation that match that choice, and each valid order is recorded in a private Google Sheet for ongoing tracking.

## Approved assumptions

- Delivery is a flat CAD $5 per order, regardless of item quantity.
- Pickup is free and displayed as `North York / Finch`.
- Fulfillment choice is required.
- Delivery requires street address, city, province, and postal code. Unit/apartment is optional.
- Pickup hides and disables delivery-address fields.
- Production time is 14 calendar days from submission.
- Both emails use the same 14-day timeline so customer and owner information cannot conflict.
- The exact ready-by date appears in the owner email and tracking sheet. The customer email says approximately 14 days after order and payment confirmation.
- The existing configured owner recipients remain authoritative; production must include `liminxuan118@gmail.com`.

## Customer experience

The Contact details section gains a Fulfillment fieldset after the existing contact inputs. It uses two native radio controls:

- `Delivery — CAD $5`
- `Pickup — North York / Finch (Free)`

Choosing Delivery reveals a Delivery address fieldset with:

- Street address
- Unit / apartment (optional)
- City
- Province
- Postal code

The Estimated price section displays:

- Item subtotal
- Delivery fee (`CAD $5` or `CAD $0`)
- Estimated total

Changing fulfillment updates the displayed price immediately. Native labels, required state, keyboard focus, inline error text, and a polite price update ensure the interaction remains accessible. Hidden address fields are disabled so pickup submissions never send stale addresses.

## Server validation and pricing

The browser sends canonical product, variant, quantity, customization, customer data, fulfillment method, and structured address. It never sends a trusted total.

The server:

1. Validates the catalog selection and customer fields.
2. Accepts only `delivery` or `pickup`.
3. Requires and length-limits structured address fields only for delivery.
4. Recomputes the catalog subtotal.
5. Adds a CAD $5 delivery fee only for delivery.
6. Generates an order ID, submission timestamp, and ready-by date 14 days later.

## Email differences

### Customer confirmation

The existing branded confirmation remains customer-focused and includes:

- Customer name
- Order ID
- Product, style/color, quantity, rhinestone color, and custom text
- Fulfillment method
- Delivery address or pickup location
- Unit price, item subtotal, delivery fee, and estimated total
- A consistent approximately 14-day production message

It excludes internal workflow fields and owner-only operational notes.

### Owner notification

The owner email is operational and includes:

- All customer contact details
- Full fulfillment address or pickup location
- All product and customization details
- Full price breakdown
- Submission timestamp
- Exact ready-by date
- Default status `New`
- Source page URL

The customer email uses the customer address as its destination. The owner email uses `ORDER_TO_EMAIL`; production configuration must contain `liminxuan118@gmail.com`.

## Google Sheet tracker

Create a private native Google Sheet named `Norie Order Tracker` with one `Orders` tab. The header row is frozen and filtered. Columns are:

1. Order ID
2. Submitted At
3. Status
4. Ready By
5. Customer Name
6. Customer Email
7. Contact
8. Fulfillment
9. Street Address
10. Unit / Apartment
11. City
12. Province
13. Postal Code
14. Pickup Location
15. Product
16. Style / Color
17. Quantity
18. Rhinestone Color
19. Custom Text
20. Unit Price (CAD)
21. Item Subtotal (CAD)
22. Delivery Fee (CAD)
23. Total (CAD)
24. Source URL

Status defaults to `New`. A dropdown offers `New`, `Confirmed`, `Paid`, `In Production`, `Ready`, `Completed`, and `Cancelled`. Date and currency columns use native formats. Customer/address columns remain plain text.

The deployed API authenticates with a dedicated Google service account. Required Vercel variables are:

- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_NAME` (defaults to `Orders`)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

The sheet is private and shared only with the store owner and the service-account email.

## Reliability and privacy

- A browser-generated request ID becomes the order ID and remains stable across retries.
- Before appending, the API checks the Order ID column. A retry returns the existing record instead of adding a duplicate.
- Sheet persistence and the owner email are required for a successful response.
- Resend idempotency keys are derived from the order ID to prevent duplicate owner/customer emails on retries.
- Customer confirmation remains best-effort after the owner notification, matching the current behavior.
- API errors never expose credentials, sheet identifiers, or raw Google responses.
- No customer PII is written to the public Norie repository.

## Testing and acceptance

- Fulfillment controls are accessible and responsive down to 320 CSS pixels.
- Address is required for delivery and ignored for pickup.
- Price shows subtotal + CAD $5 only for delivery.
- Server rejects client-side price manipulation.
- Owner and customer email snapshots contain their intended, different fields.
- Ready-by is exactly 14 calendar days after submission.
- Retrying the same order ID does not create a second sheet row or second email.
- A new order appends one correctly formatted row to the private Google Sheet.
- Existing catalog selection, customization, email validation, and all current tests remain functional.
