# Order Contact Section Design

## Goal

Move customer contact fields out of the custom-text panel and place them in a dedicated section immediately after the estimated-price section.

## Layout

- The custom-text panel keeps only the custom text input and script preview.
- The estimated-price section ends after the dynamic total price, such as `CAD $25`.
- A new contact-details section follows the price section.
- On desktop, the three contact fields appear in one row with equal widths.
- On narrow screens, the fields stack vertically without horizontal scrolling.
- A full-width `Request custom order` submit button appears below the field row.

## Fields

All three fields are required and retain visible labels:

| Label | Placeholder | Input behavior |
| --- | --- | --- |
| Your name | `Name` | Text, maximum 100 characters, name autocomplete |
| Email address | `you@email.com` | Email, maximum 254 characters, email autocomplete |
| Contact | `wechat_id` | Text, maximum 100 characters |

Placeholder text is gray and italic. The visible label is not replaced by the placeholder.

## Submission

The browser sends the contact value as `customerContact` with the existing order payload. Client-side validation focuses the first missing or invalid field and provides a specific inline status message.

The API validates `customerContact` as required, limits it to 100 characters, and adds `Contact` to both the HTML and plain-text order emails. Existing fields remain unchanged: customer name, email, product, original price, launch price, base color, rhinestone color, custom text, free gift, and page URL.

## Verification

- Test that the contact section follows the estimated-price section.
- Test that the three required inputs and exact placeholders are present.
- Test that the submit button is in the new section.
- Test that `customerContact` reaches the API and email body.
- Run the full automated suite, HTML validation, production deployment, and a live API test.

## Out of Scope

No changes to product selection, pricing, colors, rhinestone choices, custom-text behavior, newsletter behavior, or other pages.
