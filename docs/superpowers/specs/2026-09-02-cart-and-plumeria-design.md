# Cart and Plumeria Product Design

## Goal

Add an email-checkout shopping cart for every Shop product and introduce a non-customizable Plumeria three-piece clip set with Pink and White variants.

The checkout does not collect online payment. A successfully submitted order is labelled `Order confirmed · Payment pending` / `订单已确认 · 待付款` and is emailed to the store owner and customer.

## Scope

The feature covers:

- the existing Shop catalog;
- the existing customization workflow;
- a new persistent cart page;
- a server-validated cart-order endpoint;
- owner and customer order emails;
- the bilingual interface and accessibility behavior required by these changes.

Payment processing, customer accounts, inventory reservation, shipping calculation, tax calculation, discount codes, and an order-management database are out of scope.

## Product Model

### Plumeria Clip Set

Plumeria is one non-customizable product with two color variants:

- `Plumeria White`
- `Plumeria Pink`

Each purchased set contains one large Plumeria claw clip and two small Plumeria claw clips. The launch price is `CAD $10`; the compare-at price is `CAD $12`.

The two approved product images are:

- `assets/gift-flower-white.jpg`
- `assets/gift-flower-pink.jpg`

The Shop presents Plumeria as one product card with a two-image carousel. The card explains the three-piece contents, displays both prices, provides a Pink/White variant selector, and adds the selected variant directly to the cart. Plumeria never enters the Customize page and never receives custom text or rhinestones.

### Existing Customizable Products

All existing Shop products remain customizable. Their Shop actions open the Customize page with the selected product encoded in the URL so the correct product is already selected.

The two existing sets apply the same custom text to both the brush and claw clip in the set.

All customizable products use a fixed contrasting rhinestone rule:

- Pink base product → White stones
- White base product → Pink stones

The customer no longer selects rhinestone color independently. The Customize page displays the automatically selected rhinestone color as a read-only consequence of the base color.

Custom text remains optional and is limited to eight characters. A configured product is added to the cart only after the customer completes the Customize flow.

## Shop Experience

The Shop continues to use one unified responsive product grid.

- Plumeria is a single card, not two duplicated color cards.
- The Plumeria carousel follows the existing set-carousel interaction and accessibility pattern.
- Plumeria exposes Pink and White variant controls beside its add-to-cart action.
- A successful addition updates the header cart count and announces the result without moving focus.
- Existing customizable products retain a customization-oriented action instead of being added without configuration.
- Product links pass a stable product identifier to `customize.html`.

## Customize Experience

The Customize page becomes a product configuration step rather than the final order-submission step.

- A Shop link preselects the matching product.
- The customer chooses Pink or White.
- The interface derives and displays the required contrasting rhinestone color.
- The customer enters up to eight characters of custom text.
- Set products make clear that the same text will be applied to the brush and claw clip.
- The existing customer name, email, and contact fields move out of Customize and into Checkout.
- The primary action becomes `Add to cart` / `加入购物车`.
- Adding a configured product does not send an email.

Configurations with different product, base color, derived stone color, or custom text are separate cart lines. Identical configurations may be merged and their quantity increased.

## Header Cart Entry

The current shopping-bag control becomes a link to `cart.html` on every public page.

- It includes a visible item-count badge when the cart is non-empty.
- The count represents total unit quantity, not the number of distinct lines.
- The accessible name includes the current item count.
- The count stays synchronized after additions, quantity changes, removals, checkout, refresh, and language changes.

## Cart Page

Create `cart.html` as a responsive, bilingual page using the existing Norie header, typography, colors, and footer.

Each cart line displays:

- product name;
- selected variant/base color;
- custom text when present;
- derived rhinestone color for customizable products;
- unit launch price;
- quantity controls;
- line subtotal;
- a remove action.

The cart also displays the order total and a link back to Shop. Quantity may be adjusted from 1 to 20 units per cart line. A decrement from one does not silently remove the line; removal uses the explicit remove action.

An empty cart presents a clear message and Shop link. Invalid, unknown, or malformed persisted cart lines are discarded safely instead of breaking the page.

## Cart Persistence and Client Module

A shared client-side cart module owns all cart behavior. It has one clear responsibility: validate, read, update, and persist cart lines in `localStorage`, then notify pages when cart state changes.

Cart lines store stable product and variant/configuration identifiers, quantities, and customer-authored custom text. Display labels and prices are derived from a shared client catalog rather than copied from arbitrary DOM or user input.

The module:

- tolerates missing, malformed, and unavailable browser storage;
- caps quantity at 20 per line;
- caps the total number of distinct cart lines;
- creates deterministic line keys from the selected configuration;
- emits a cart-change event after every successful mutation;
- never stores customer contact details.

The server maintains its own authoritative catalog and independently recalculates prices.

## Checkout

Checkout is part of `cart.html`. It collects:

- customer name;
- customer email;
- contact information such as phone number or WeChat ID.

All fields are required and have persistent visible labels, accessible hints where needed, inline validation messages, and appropriate autocomplete/input types.

Submission sends the cart identifiers, configurations, quantities, customer information, page URL, and a client-generated order-attempt identifier to a dedicated server endpoint. The client does not send authoritative prices.

While submitting, the form prevents duplicate activation and exposes a polite pending state. On success:

- show `Order confirmed · Payment pending` / `订单已确认 · 待付款`;
- show an order summary/reference;
- clear the cart;
- update the header count to zero.

On validation, network, or email failure, keep the cart and customer-entered fields so the customer can correct or retry.

## Server Validation and Order Endpoint

Create a dedicated cart-order endpoint rather than overloading the existing single custom-order endpoint.

The endpoint:

- accepts POST only;
- uses the existing bounded JSON reader;
- validates customer name, email, and contact lengths/formats;
- validates a non-empty bounded line array;
- validates every product identifier, variant/configuration, custom-text length, and quantity;
- rejects customization fields on Plumeria;
- derives White stones for Pink customizable products and Pink stones for White customizable products;
- rejects any incompatible or unknown product configuration;
- ignores client-supplied prices and calculates unit prices, subtotals, and total from the server catalog;
- caps quantities and total distinct lines;
- validates the order-attempt identifier and uses it as the email provider idempotency key;
- returns safe JSON errors without exposing configuration or provider details.

The store-owner destination is read from the existing server-only `ORDER_TO_EMAIL` environment variable and configured to the owner-provided address in the deployment environment. The private email address is not committed to the repository or exposed in public browser files.

## Email Content

After validation, the endpoint sends a detailed owner email containing:

- order reference and `Order confirmed · Payment pending` status;
- customer name, email, and contact;
- every cart line with product, color/variant, custom text, derived stones, unit price, quantity, and subtotal;
- trusted order total;
- submission page URL.

It then attempts a customer confirmation email containing the same customer-facing product summary, trusted total, status, and next-step wording explaining that Norie will contact the customer about payment.

The owner email is the required operation. If the owner email fails, checkout fails and the cart remains. If the owner email succeeds but the customer confirmation fails, checkout still succeeds and the server records the secondary failure without exposing it to the customer.

## Localization

English and Chinese translations cover:

- cart navigation and item-count labels;
- Plumeria contents, variant controls, and add-to-cart feedback;
- customization/cart actions and the derived-stone explanation;
- empty-cart, quantity, remove, totals, checkout fields, validation, pending, success, and failure messages;
- the confirmed/pending-payment status.

Established English product names, prices, custom text, and user-entered contact information are never translated.

## Accessibility

- Carousel controls use native buttons and expose the current image status.
- Pink/White selection uses an appropriately labelled native radio group.
- Add, increment, decrement, and remove controls use native buttons with specific accessible names.
- The header cart entry is a native link and exposes its count.
- Cart changes and submission states use polite live regions without moving focus unnecessarily.
- Removing a line moves focus to a logical remaining control or the empty-cart heading.
- Checkout fields use visible labels, correct autocomplete values, `aria-describedby`, and programmatic invalid state.
- Form submission moves focus to the first invalid field or an error summary when correction is required.
- All custom focus indicators meet WCAG 2.2 AA contrast and remain visible.
- Layout reflows at 320 CSS pixels without horizontal page scrolling or lost functionality.

## Failure Handling

- Missing or damaged local storage produces an empty functional cart.
- Unknown local product/configuration data is removed during cart normalization.
- Storage write failures leave the current page usable and surface a non-blocking message when an addition cannot be retained.
- Repeated rapid checkout activation produces one logical email attempt through client submission locking and provider idempotency.
- A failed checkout never clears the cart.
- A successful checkout clears the cart only after the server confirms that the owner email was accepted.

## Verification

Automated tests cover:

- Plumeria images, one-card/two-variant presentation, contents, and CAD $10/CAD $12 prices;
- Shop actions and product preselection;
- contrasting-stone derivation for every customizable product type;
- custom-text validation and set-wide text behavior;
- cart line identity, merging, quantity bounds, removal, totals, persistence, and corrupt-storage recovery;
- header item-count synchronization;
- checkout form behavior and cart preservation on failure;
- server rejection of unknown products, illegal variants, Plumeria customization, excessive quantities/lines, and client price tampering;
- trusted email subtotals/total, owner recipient configuration, order status, and idempotency behavior;
- customer-confirmation failure remaining non-fatal;
- English/Chinese translation-contract parity.

Manual verification covers:

- Shop → Customize → Add to cart → Cart → Checkout for a customizable single item;
- the same flow for both existing sets, confirming text applies to both pieces;
- direct Plumeria Pink and White additions;
- mixed-cart quantity editing and removal;
- refresh persistence;
- keyboard-only use and visible focus;
- English/Chinese switching;
- desktop, tablet, 390px mobile, and 320px reflow.

## Delivery Sequence

Implementation should proceed in independently testable slices:

1. trusted shared catalog and cart state module;
2. header cart entry and cart page shell;
3. Plumeria Shop card and direct add-to-cart flow;
4. customizable-product preselection, automatic contrasting stones, and add-to-cart flow;
5. server cart-order validation and trusted total calculation;
6. checkout form, owner email, customer confirmation, and final end-to-end verification.
