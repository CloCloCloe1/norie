# Cart and Plumeria Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent bilingual cart and trusted email checkout for every product, plus a two-color CAD $10/CAD $12 Plumeria three-piece set.

**Architecture:** A dependency-free browser module owns catalog-derived cart state in `localStorage`; static pages use it for badges, configuration, and checkout. A new Vercel endpoint keeps an independent authoritative catalog, recalculates totals, validates every configuration, and sends owner/customer emails through the existing email utility.

**Tech Stack:** Static HTML/CSS, browser ES modules, Vercel Node functions, Resend, Node.js built-in test runner

---

## File Structure

- Create `norie-cart.js`: client display catalog, contrasting-stone derivation, cart normalization, persistence, totals, and events.
- Create `cart.html`: bilingual cart lines, quantity controls, and checkout form.
- Create `api/cart-order.js`: server catalog, validation, totals, and emails.
- Create `tests/cart.test.js`: pure cart behavior.
- Modify `tests/api.test.js`, `tests/site-integration.test.js`, `tests/shop-single-pieces.test.js`, and `tests/i18n.test.js`.
- Modify `index.html`, `shop.html`, `customize.html`, `lookbooks.html`, `norie-forms.js`, and `norie-i18n.js`.
- Track `assets/gift-flower-white.jpg` and `assets/gift-flower-pink.jpg`.

### Task 1: Cart domain module

**Files:** Create `norie-cart.js`; create `tests/cart.test.js`.

- [ ] **Step 1: Write the failing domain tests**

Create `tests/cart.test.js`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { addLine, cartCount, cartTotal, deriveStoneColor, lineKey, normalizeCart, productCatalog, setQuantity } from "../norie-cart.js";

test("Plumeria is a non-customizable CAD $10 three-piece set", () => {
  assert.deepEqual(productCatalog.plumeria, { name: "Plumeria Clip Set", customizable: false, launchPrice: 10, originalPrice: 12, variants: ["Pink", "White"] });
});

test("customizable products derive contrasting stones", () => {
  assert.equal(deriveStoneColor("Pink"), "White stones");
  assert.equal(deriveStoneColor("White"), "Pink stones");
  assert.throws(() => deriveStoneColor("Blue"), /valid base color/i);
});

test("identical configurations merge and different text stays separate", () => {
  const amy = { productId: "large-comb", baseColor: "Pink", customText: "Amy", quantity: 1 };
  const merged = addLine(addLine([], amy), amy);
  const separate = addLine(merged, { ...amy, customText: "Mia" });
  assert.equal(merged[0].quantity, 2);
  assert.equal(separate.length, 2);
  assert.notEqual(lineKey(separate[0]), lineKey(separate[1]));
});

test("normalization rejects unknown and customized Plumeria lines", () => {
  assert.deepEqual(normalizeCart([
    { productId: "unknown", baseColor: "Pink", customText: "", quantity: 1 },
    { productId: "plumeria", baseColor: "Pink", customText: "Amy", quantity: 1 },
    { productId: "plumeria", baseColor: "White", customText: "", quantity: 2 }
  ]), [{ productId: "plumeria", baseColor: "White", customText: "", quantity: 2 }]);
});

test("quantities are capped and totals use catalog prices", () => {
  const cart = [
    { productId: "plumeria", baseColor: "Pink", customText: "", quantity: 2 },
    { productId: "large-comb", baseColor: "White", customText: "Norie", quantity: 1 }
  ];
  assert.equal(setQuantity(cart, lineKey(cart[0]), 99)[0].quantity, 20);
  assert.equal(cartCount(cart), 3);
  assert.equal(cartTotal(cart), 50);
});
```

- [ ] **Step 2: Run `node --test tests/cart.test.js`**

Expected: FAIL because `norie-cart.js` is missing.

- [ ] **Step 3: Implement the minimal module**

Create `norie-cart.js` with constants `CART_STORAGE_KEY = "norie.cart.v1"`, `MAX_LINE_QUANTITY = 20`, and `MAX_CART_LINES = 40`; a frozen catalog for `essentials-set`, `baby-set`, `large-comb`, `small-comb`, `claw-clip`, and `plumeria`; and the tested exports. `normalizeLine` must accept only catalog variants, custom text up to eight characters, and no Plumeria text. `createCartStore(storage = globalThis.localStorage)` must safely read malformed storage, write normalized lines, clear the cart, and emit `norie:cartchange` after writes.

Use this exact pairing function:

```js
export function deriveStoneColor(baseColor) {
  if (baseColor === "Pink") return "White stones";
  if (baseColor === "White") return "Pink stones";
  throw new Error("Choose a valid base color.");
}
```

Use integer CAD prices and compute totals only from `productCatalog`, never from stored prices.

- [ ] **Step 4: Run `node --test tests/cart.test.js`; expected PASS**

- [ ] **Step 5: Commit `norie-cart.js` and `tests/cart.test.js` as `feat: add cart domain module`**

### Task 2: Shared cart entry and cart page

**Files:** Create `cart.html`; modify `index.html`, `shop.html`, `customize.html`, `lookbooks.html`, `norie-i18n.js`, and `tests/site-integration.test.js`.

- [ ] **Step 1: Add failing integration assertions**

Assert every public page links its bag control to `cart.html`, contains `[data-cart-count]`, and loads the cart module. Assert `cart.html` contains `<main id="main">`, `[data-cart-lines]`, `[data-cart-empty]`, `[data-cart-total]`, and a labelled checkout form with name, email, and contact fields.

- [ ] **Step 2: Run `node --test tests/site-integration.test.js`; expected FAIL because the cart page/links are missing**

- [ ] **Step 3: Create the cart page shell**

Reuse the existing header/footer and add:

```html
<main id="main">
  <section class="cart-section" aria-labelledby="cart-title">
    <h1 id="cart-title" data-i18n="cart.title">Your cart</h1>
    <p data-cart-empty hidden><span data-i18n="cart.empty">Your cart is empty.</span> <a href="shop.html" data-i18n="cart.shop">Continue shopping</a></p>
    <div data-cart-lines></div>
    <div class="cart-total"><span data-i18n="cart.total">Total</span> <strong data-cart-total>CAD $0</strong></div>
  </section>
  <section class="checkout-section" aria-labelledby="checkout-title" data-checkout>
    <h2 id="checkout-title" data-i18n="checkout.title">Checkout</h2>
    <form id="checkoutForm" novalidate>
      <label for="checkoutName" data-i18n="checkout.name">Name</label><input id="checkoutName" name="name" autocomplete="name" required>
      <label for="checkoutEmail" data-i18n="checkout.email">Email</label><input id="checkoutEmail" name="email" type="email" autocomplete="email" required>
      <label for="checkoutContact" data-i18n="checkout.contact">Phone or WeChat</label><input id="checkoutContact" name="contact" autocomplete="tel" required>
      <div id="checkoutStatus" role="status" aria-live="polite"></div>
      <button type="submit" data-i18n="checkout.submit">Confirm order</button>
    </form>
  </section>
</main>
```

Render each line as an `<article>` with native decrement, increment, and remove buttons. Quantity stays 1–20; removal is explicit; focus moves to the next logical control.

- [ ] **Step 4: Replace every bag with a cart link and count badge**

```html
<a class="cart-link" href="cart.html"><span class="visually-hidden" data-cart-label>Cart</span><span class="cart-count" data-cart-count hidden>0</span></a>
```

Update counts on load and `norie:cartchange`.

- [ ] **Step 5: Add complete English/Chinese keys for cart, checkout, quantities, remove, totals, pending, errors, and `订单已确认 · 待付款`**

- [ ] **Step 6: Run integration/i18n tests and `npm test`; expected PASS**

- [ ] **Step 7: Patch-stage only relevant hunks and commit as `feat: add persistent cart page and navigation`**

### Task 3: Plumeria card and direct addition

**Files:** Modify `shop.html` and `tests/shop-single-pieces.test.js`; track the two approved images.

- [ ] **Step 1: Add failing tests**

Assert the two images exist and are tracked; the unified catalog has 13 cards; one `Plumeria Clip Set` card has two carousel slides, Pink/White radios, `CAD $10`, `CAD $12`, three-piece copy, and an Add-to-cart button.

- [ ] **Step 2: Run `node --test tests/shop-single-pieces.test.js`; expected FAIL**

- [ ] **Step 3: Add one Plumeria card after the two existing sets**

Reuse the existing accessible carousel. Add a labelled native radio group and a polite result status. Submit through:

```js
const next = addLine(store.read(), { productId: "plumeria", baseColor: selectedColor, customText: "", quantity: 1 });
store.write(next);
```

- [ ] **Step 4: Run focused tests and `npm test`; expected PASS**

- [ ] **Step 5: Commit assets and relevant hunks as `feat: add Plumeria clip set`**

### Task 4: Add customized products to the cart

**Files:** Modify `shop.html`, `customize.html`, `norie-forms.js`, `norie-i18n.js`, `tests/site-integration.test.js`, and `tests/i18n.test.js`.

- [ ] **Step 1: Add failing tests**

Assert Shop uses stable `?product=` links for both sets and three base product types. Assert Customize removes customer contact fields and independent stone radios, shows derived stones, supports product preselection, limits text to eight characters, explains set-wide text, and submits to cart instead of `/api/custom-order`.

- [ ] **Step 2: Run focused tests; expected FAIL**

- [ ] **Step 3: Implement preselection and derived stones**

Accept only catalog IDs from `new URLSearchParams(location.search).get("product")`. Pink renders White stones; White renders Pink stones. Sets state that the same custom text applies to brush and clip.

- [ ] **Step 4: Convert the form action to Add to cart**

Persist `{ productId, baseColor, customText, quantity: 1 }`; announce success; update the header count; provide Cart and Continue shopping links; do not call the order API.

- [ ] **Step 5: Run focused tests and `npm test`; expected PASS**

- [ ] **Step 6: Patch-stage relevant hunks and commit as `feat: add customized products to cart`**

### Task 5: Trusted cart-order endpoint

**Files:** Create `api/cart-order.js`; modify `tests/api.test.js`.

- [ ] **Step 1: Write failing endpoint tests**

Cover POST-only, malformed JSON, required customer fields, empty/oversized carts, unknown products, invalid colors, quantity outside 1–20, text over eight characters, Plumeria customization rejection, client-price tampering, opposite-stone derivation, trusted mixed-cart total, recipient configuration, owner-email failure, non-fatal customer-email failure, status text, and attempt-ID idempotency.

- [ ] **Step 2: Run `node --test --test-name-pattern="cart order" tests/api.test.js`; expected FAIL because the handler is missing**

- [ ] **Step 3: Implement `api/cart-order.js`**

Use `readJson`, `isEmail`, `escapeHtml`, `sendEmail`, and `sendJson`. Define an independent server catalog. Recalculate unit prices/subtotals/total; derive stones; escape customer text; reject incompatible lines; and use the validated attempt ID for the owner email idempotency key. Read recipients only from `ORDER_TO_EMAIL`.

Return exactly:

```js
sendJson(res, 200, {
  ok: true,
  orderReference,
  status: "Order confirmed · Payment pending",
  total: `CAD $${total}`
});
```

Owner email failure returns failure. Customer confirmation failure is logged but still returns success.

- [ ] **Step 4: Run focused API tests and `npm test`; expected PASS**

- [ ] **Step 5: Commit as `feat: add trusted cart order endpoint`**

### Task 6: Checkout integration and final verification

**Files:** Modify `cart.html`, `norie-i18n.js`, and `tests/site-integration.test.js`.

- [ ] **Step 1: Add failing checkout assertions**

Assert checkout posts only normalized cart identifiers/configurations/quantities, customer fields, page URL, and a UUID attempt ID; never client prices. Assert empty-cart prevention, first-invalid-field focus, pending lock, cart retention on failure, and clearing only after `{ ok: true }`.

- [ ] **Step 2: Run focused integration tests; expected FAIL**

- [ ] **Step 3: Implement checkout**

Use localized inline errors. Keep one attempt ID for one logical submission. POST to `/api/cart-order`. On success clear the cart and show reference, trusted total, and localized confirmed/pending status. On failure retain cart/fields, restore the button, and focus the error summary.

- [ ] **Step 4: Run focused tests and `npm test`; expected PASS**

- [ ] **Step 5: Manually verify**

At desktop, 390px, and 320px: add both Plumeria colors; customize Pink/White singles and both sets; confirm opposite stones and set-wide text; refresh; edit quantities; remove lines; switch languages; use keyboard-only controls; simulate failure and confirm retention; submit in a test environment and inspect both email payloads.

- [ ] **Step 6: Configure the owner-provided address as Vercel `ORDER_TO_EMAIL` outside Git**

- [ ] **Step 7: Run fresh final verification**

```powershell
npm test
git diff --check
```

Expected: all tests pass with zero failures and no whitespace errors.

- [ ] **Step 8: Patch-stage only relevant hunks and commit as `feat: complete email checkout flow`**
