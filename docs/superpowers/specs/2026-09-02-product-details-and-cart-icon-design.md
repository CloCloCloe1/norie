# Norie Product Detail Pages and Cart Icon Design

## Goal

Make the Shop catalog clearer by using a clean shopping-bag-only cart control, exposing both Plumeria colors as separate Shop cards, and giving every non-customizable decorative claw clip a product detail route before it is added to the cart.

## Approved Shop Catalog Changes

### Plumeria

The Shop page displays two cards at the same time:

- Plumeria White
- Plumeria Pink

Both cards link to the same reusable product detail page. The clicked card passes its color in the URL so the detail page opens with White or Pink selected. The customer may still switch colors on the detail page.

The product remains one catalog product with two variants. Each CAD $10 set contains one large claw clip and two small claw clips. The original price is CAD $12. Plumeria is not customizable.

### Claw clip names and behavior

The six Shop card names become:

| Existing card | New display name | Customizable | Destination |
| --- | --- | --- | --- |
| Pink Claw Clip 1 | Norie Claw Clip in Pink | Yes | Customize page |
| Pink Claw Clip 2 | Claw Clip in Pink Bow | No | Product detail page |
| Pink Claw Clip 3 | Claw Clip in Cherry Pink | No | Product detail page |
| White Claw Clip 1 | Claw Clip in Florie White | No | Product detail page |
| White Claw Clip 2 | Norie Claw Clip in White | Yes | Customize page |
| White Claw Clip 3 | Claw Clip in Cherry White | No | Product detail page |

The four non-customizable decorative claw clips retain the current CAD $12 launch price and CAD $16 original price. Their detail pages add the fixed pictured design directly to the cart without asking for custom text or stone choices.

## Product Detail Architecture

Use one data-driven `product.html` page for all non-customizable products. A URL parameter selects the product, and an optional color parameter preselects a Plumeria color. Supported products are restricted to an internal allowlist; unknown parameters show a safe not-found state and a link back to Shop.

The reusable detail page contains:

- product photograph and descriptive alternative text;
- product name, short description, launch price, and struck-through original price;
- contents or design details;
- color selector only for Plumeria;
- direct Add to cart button;
- link back to Shop;
- shared language control and shopping bag.

Shop cards link as follows:

- `product.html?product=plumeria&color=White`
- `product.html?product=plumeria&color=Pink`
- one allowlisted product identifier for each fixed decorative claw clip.

## Shopping Bag Control

Every public page displays only the shopping bag outline and, when the cart is non-empty, a small numerical badge. Text such as `Cart, empty` must never be visually displayed.

The link retains an accessible name through `aria-label`. The cart controller updates this label when the quantity changes, so assistive technology still announces whether the cart is empty or contains items.

## Cart and Order Data

Add separate catalog identifiers for the four fixed decorative claw clips. These entries are non-customizable, have one fixed color, and use trusted server-side prices. The browser cart and `/api/cart-order` server catalog must remain synchronized.

Plumeria remains a single catalog identifier with Pink and White variants. The two Shop cards do not create duplicate products.

## Localization and Accessibility

- Product names remain English in both locales.
- Helper descriptions, buttons, navigation, status messages, and product-detail labels support English and Simplified Chinese.
- Product cards and detail pages use semantic headings and links.
- Interactive controls have visible keyboard focus and a minimum 44 by 44 pixel target.
- The cart icon has an accessible label but no visible status text.
- Add-to-cart confirmation uses an `aria-live` status region.

## Error Handling

- Unknown or unsupported product URLs do not add anything to the cart.
- Invalid Plumeria colors fall back to White.
- If cart storage is unavailable or malformed, the page recovers with an empty cart.
- Fixed products reject custom text on both client and server.

## Verification

Automated tests must verify:

- cart status text is not visually rendered and the bag link keeps an accessible label;
- both Plumeria cards appear and link to one shared detail page with different preselected colors;
- the six approved claw clip names appear in the correct order;
- only Norie Claw Clip in Pink and Norie Claw Clip in White link to Customize;
- all four decorative claw clips link to detail routes and are non-customizable in both client and server catalogs;
- detail page URL allowlisting, Plumeria color selection, prices, and add-to-cart behavior;
- the complete existing test suite remains green.

Manual browser verification must cover desktop and mobile layouts, both languages, keyboard focus, product navigation, direct add-to-cart, cart totals, and retained checkout behavior.
