# Product Details and Cart Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible cart status text with a bag-only control, split Plumeria into two Shop cards sharing one detail page, rename all six claw clips, and route the four fixed decorative claw clips through product details into the cart.

**Architecture:** Extend the trusted cart catalogs with four fixed product IDs and add a small `norie-product-details.js` module that reads an allowlisted URL parameter and renders one reusable `product.html`. Shop remains static HTML for crawlable product cards; Plumeria White and Pink use the same catalog ID and shared page with different `color` parameters. The server independently validates the same fixed IDs and prices.

**Tech Stack:** Static HTML/CSS, browser ES modules, Vercel Node functions, Node built-in test runner.

---

## File map

- Create `product.html`: reusable accessible product-detail shell.
- Create `norie-product-details.js`: allowlisted detail catalog, URL selection, render, and direct add-to-cart behavior.
- Create `tests/product-details.test.js`: detail catalog, routing, markup, and Shop-link tests.
- Modify `shop.html`: bag-only link, two Plumeria cards, approved names, and destinations.
- Modify `index.html`, `customize.html`, `lookbooks.html`, `cart.html`: bag-only cart markup.
- Modify `norie-cart.js`: fixed product catalog entries and accessible link-label updates.
- Modify `api/cart-order.js`: matching trusted server catalog entries.
- Modify `norie-i18n.js`: product-detail interface translations.
- Modify existing integration/catalog/API tests to reflect the fourteen-card Shop grid and fixed products.

### Task 1: Lock the catalog and routing contract with failing tests

**Files:**
- Create: `tests/product-details.test.js`
- Modify: `tests/cart.test.js`
- Modify: `tests/shop-single-pieces.test.js`
- Modify: `tests/site-integration.test.js`
- Modify: `tests/api.test.js`

- [ ] **Step 1: Write the failing Shop and detail-route tests**

Create assertions that read `shop.html`, `product.html`, and `norie-product-details.js` and require these exact names and destinations:

```js
const fixedProducts = [
  ["Claw Clip in Pink Bow", "pink-bow"],
  ["Claw Clip in Cherry Pink", "cherry-pink"],
  ["Claw Clip in Florie White", "florie-white"],
  ["Claw Clip in Cherry White", "cherry-white"]
];

for (const [name, id] of fixedProducts) {
  assert.match(shop, new RegExp(`<h3>${name}</h3>[\\s\\S]*?href="product\\.html\\?product=${id}"`, "i"));
}

assert.match(shop, /<h3>Norie Claw Clip in Pink<\/h3>[\s\S]*?customize\.html\?product=claw-clip/i);
assert.match(shop, /<h3>Norie Claw Clip in White<\/h3>[\s\S]*?customize\.html\?product=claw-clip/i);
assert.match(shop, /<h3>Plumeria White<\/h3>[\s\S]*?product\.html\?product=plumeria&amp;color=White/i);
assert.match(shop, /<h3>Plumeria Pink<\/h3>[\s\S]*?product\.html\?product=plumeria&amp;color=Pink/i);
```

- [ ] **Step 2: Write the failing cart catalog tests**

Require the four fixed IDs to accept only their pictured color and reject custom text:

```js
for (const [productId, baseColor] of [
  ["pink-bow", "Pink"], ["cherry-pink", "Pink"],
  ["florie-white", "White"], ["cherry-white", "White"]
]) {
  assert.equal(productCatalog[productId].customizable, false);
  assert.deepEqual(productCatalog[productId].variants, [baseColor]);
  assert.equal(productCatalog[productId].launchPrice, 12);
  assert.equal(normalizeLine({ productId, baseColor, customText: "C", quantity: 1 }), null);
}
```

- [ ] **Step 3: Write the failing bag-only accessibility test**

For every public page, require the cart link itself to carry the accessible label and prohibit visible `data-cart-label` spans:

```js
assert.match(html, /<a[^>]*class="cart-link"[^>]*aria-label="Cart, empty"/i);
assert.doesNotMatch(html, /<span[^>]*data-cart-label/i);
```

- [ ] **Step 4: Run focused tests and verify RED**

Run:

```powershell
node --test tests/product-details.test.js tests/cart.test.js tests/shop-single-pieces.test.js tests/site-integration.test.js tests/api.test.js
```

Expected: FAIL because the detail page/module, fixed product IDs, new names, split Plumeria cards, and bag-only markup do not exist.

- [ ] **Step 5: Commit the failing contract tests**

```powershell
git add tests/product-details.test.js tests/cart.test.js tests/shop-single-pieces.test.js tests/site-integration.test.js tests/api.test.js
git commit -m "test: specify product detail routes and bag-only cart"
```

### Task 2: Add fixed products to the trusted cart catalogs

**Files:**
- Modify: `norie-cart.js`
- Modify: `api/cart-order.js`
- Test: `tests/cart.test.js`
- Test: `tests/api.test.js`

- [ ] **Step 1: Add the browser catalog entries**

Insert these entries into `productCatalog`:

```js
"pink-bow": { name: "Claw Clip in Pink Bow", customizable: false, launchPrice: 12, originalPrice: 16, variants: ["Pink"] },
"cherry-pink": { name: "Claw Clip in Cherry Pink", customizable: false, launchPrice: 12, originalPrice: 16, variants: ["Pink"] },
"florie-white": { name: "Claw Clip in Florie White", customizable: false, launchPrice: 12, originalPrice: 16, variants: ["White"] },
"cherry-white": { name: "Claw Clip in Cherry White", customizable: false, launchPrice: 12, originalPrice: 16, variants: ["White"] },
```

- [ ] **Step 2: Mirror the entries in the server catalog**

Add the same IDs, names, fixed variants, and CAD $12 trusted prices to `api/cart-order.js`. Keep all client-supplied price fields ignored.

- [ ] **Step 3: Run cart and API tests and verify GREEN**

```powershell
node --test tests/cart.test.js tests/api.test.js
```

Expected: all catalog, normalization, trusted-total, and custom-text rejection tests PASS.

- [ ] **Step 4: Commit the catalog implementation**

```powershell
git add norie-cart.js api/cart-order.js tests/cart.test.js tests/api.test.js
git commit -m "feat: add fixed decorative claw clips to cart"
```

### Task 3: Build the reusable product detail page

**Files:**
- Create: `product.html`
- Create: `norie-product-details.js`
- Modify: `norie-i18n.js`
- Test: `tests/product-details.test.js`
- Test: `tests/i18n.test.js`

- [ ] **Step 1: Define the allowlisted detail data**

Export a frozen `detailCatalog` from `norie-product-details.js` with `cartProductId`, `name`, `image`, `alt`, `description`, `contents`, and `defaultColor`. Use these mappings:

```js
plumeria: {
  cartProductId: "plumeria",
  name: "Plumeria Clip Set",
  images: { White: "assets/gift-flower-white.jpg", Pink: "assets/gift-flower-pink.jpg" },
  colors: ["White", "Pink"]
},
"pink-bow": { cartProductId: "pink-bow", name: "Claw Clip in Pink Bow", image: "assets/shop-claw-pink-2.png", defaultColor: "Pink" },
"cherry-pink": { cartProductId: "cherry-pink", name: "Claw Clip in Cherry Pink", image: "assets/shop-claw-pink-3.png", defaultColor: "Pink" },
"florie-white": { cartProductId: "florie-white", name: "Claw Clip in Florie White", image: "assets/shop-claw-white-1.png", defaultColor: "White" },
"cherry-white": { cartProductId: "cherry-white", name: "Claw Clip in Cherry White", image: "assets/shop-claw-white-3.png", defaultColor: "White" }
```

- [ ] **Step 2: Implement safe URL selection**

Implement and export:

```js
export function selectDetail(search) {
  const params = new URLSearchParams(search);
  const detail = detailCatalog[params.get("product")];
  if (!detail) return null;
  const requested = params.get("color");
  const color = detail.colors?.includes(requested) ? requested : detail.defaultColor || detail.colors?.[0];
  return { detail, color };
}
```

- [ ] **Step 3: Create semantic detail markup**

Build `product.html` with a shared header, language switcher, bag-only cart link, breadcrumb/back link, product image, `h1`, prices, description, optional Plumeria color fieldset, Add to cart button, and `role="status" aria-live="polite"`. Use a two-column desktop layout and one column below 760px.

- [ ] **Step 4: Render and add to cart**

On page load, render only text and attributes from `detailCatalog`. If selection is null, hide the purchase panel and show a localized unavailable message with a Shop link. On submit/click:

```js
store.write(addLine(store.read(), {
  productId: selection.detail.cartProductId,
  baseColor: selectedColor,
  customText: "",
  quantity: 1
}));
```

Update the image immediately when the Plumeria color changes and announce the localized add-to-cart confirmation.

- [ ] **Step 5: Add translation keys**

Add matching English and Simplified Chinese keys for `product.back`, `product.color`, `product.contents`, `product.add`, `product.added`, and `product.unavailable`. Product names remain English.

- [ ] **Step 6: Run detail and localization tests**

```powershell
node --test tests/product-details.test.js tests/i18n.test.js
```

Expected: PASS for allowlisting, color fallback, semantic regions, translations, and direct cart addition.

- [ ] **Step 7: Commit the detail page**

```powershell
git add product.html norie-product-details.js norie-i18n.js tests/product-details.test.js tests/i18n.test.js
git commit -m "feat: add reusable product detail page"
```

### Task 4: Update Shop cards and bag-only navigation

**Files:**
- Modify: `shop.html`
- Modify: `index.html`
- Modify: `customize.html`
- Modify: `lookbooks.html`
- Modify: `cart.html`
- Modify: `norie-cart.js`
- Test: `tests/shop-single-pieces.test.js`
- Test: `tests/site-integration.test.js`
- Test: `tests/product-details.test.js`

- [ ] **Step 1: Split the Plumeria Shop presentation**

Replace the one carousel/radio card with two standard product cards using the White and Pink images. Each card shows CAD $10 and CAD $12 and links to the shared detail page with its preselected color. The Shop grid total becomes fourteen cards: two sets, two Plumeria colors, four brushes, and six claw clips.

- [ ] **Step 2: Rename and reroute all claw clip cards**

Apply the six approved display names. Keep `Norie Claw Clip in Pink` and `Norie Claw Clip in White` pointed at `customize.html?product=claw-clip`. Point the four decorated products at their allowlisted `product.html?product=...` URLs and change the visible action from Customize to View details.

- [ ] **Step 3: Remove visible cart-label spans from every page**

Use this structure everywhere:

```html
<a class="cart-link" href="cart.html" aria-label="Cart, empty">
  <span class="cart-count" data-cart-count hidden>0</span>
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">...</svg>
</a>
```

Keep only the bag outline visually visible.

- [ ] **Step 4: Update the badge controller**

Replace the `data-cart-label` loop with:

```js
document.querySelectorAll(".cart-link").forEach((link) => {
  link.setAttribute("aria-label", count ? `Cart, ${count} items` : "Cart, empty");
});
```

- [ ] **Step 5: Run Shop and integration tests**

```powershell
node --test tests/shop-single-pieces.test.js tests/site-integration.test.js tests/product-details.test.js
```

Expected: PASS for fourteen-card order, exact names, destinations, bag-only rendering, and accessible labels.

- [ ] **Step 6: Commit the Shop and navigation changes**

```powershell
git add shop.html index.html customize.html lookbooks.html cart.html norie-cart.js tests/shop-single-pieces.test.js tests/site-integration.test.js tests/product-details.test.js
git commit -m "feat: link fixed products and simplify cart icon"
```

### Task 5: Full verification and deployment

**Files:**
- Verify all changed files

- [ ] **Step 1: Run the complete automated suite**

```powershell
npm test
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Check patch formatting and referenced assets**

```powershell
git diff --check
```

Expected: no whitespace errors. Confirm every `assets/...` reference in the five public pages and `norie-product-details.js` resolves to a tracked file.

- [ ] **Step 3: Run local browser verification**

Serve the project locally and verify desktop and mobile layouts. Check both languages, keyboard focus, the bag-only header, both Plumeria Shop cards, color-preselected shared Plumeria details, all four fixed claw routes, direct additions, correct totals, and unchanged customized-product checkout.

- [ ] **Step 4: Push the implementation branch**

```powershell
git push origin codex/shop-unified-grid
```

Expected: GitHub reports the new branch tip successfully.

- [ ] **Step 5: Promote the successful Vercel deployment**

Wait for the new deployment to report Ready, promote it to Production, and verify `https://norie-hair.vercel.app/shop`, `/product`, `/cart`, and the POST-only `/api/cart-order` endpoint.
