# Norie Shopify migration design

## Goal

Move the current Norie catalogue to Shopify while keeping the Norie visual identity and using Shopify for products, checkout, payments, orders, tax, and shipping.

## Delivery order

1. Create the products and collections.
2. Add product-page personalization.
3. Restyle the Horizon home page to match Norie.
4. Configure shipping, taxes, and Shopify Payments.
5. Test checkout and orders.
6. Connect the existing domain only after testing succeeds.

## Initial catalogue

- Essentials Hairstyling Set: CAD $38, compare-at price CAD $48
- Baby Hairstyling Set: CAD $32, compare-at price CAD $40
- Large Comb: CAD $30, compare-at price CAD $38, pink and white
- Small Comb: CAD $25, compare-at price CAD $32, pink and white
- Six claw clip designs: CAD $12 each, compare-at price CAD $16

## Personalization

Personalization appears on the product page, not the collection grid. The first version uses theme fields instead of a paid app.

- Name is required for customizable products.
- Name accepts only English letters A-Z.
- Name length is 1 to 8 letters.
- Uppercase and lowercase are both accepted and preserved.
- The customer selects the applicable font and stone colour.
- Sets also expose their applicable item and gift choices.
- Choices are saved as Shopify line-item properties so they remain visible in the cart and order.

## Storefront

Use the free Horizon theme. Keep the existing store password and Vercel site during migration. Replace the default imagery, copy, colours, logo, product grid, and footer with Norie assets after the catalogue works.

## Acceptance criteria

- Every current product can be purchased through Shopify.
- Required personalization cannot be omitted or exceed eight English letters.
- Personalization is visible in the cart and Shopify order.
- Prices and compare-at prices match the current site.
- A test order succeeds before the domain is switched.
