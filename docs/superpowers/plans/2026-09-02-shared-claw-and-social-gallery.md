# Shared Claw Selector and Social Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate four fixed decorative claw clips into one circular-swatches detail experience and reshape the homepage with a curated social gallery, inline Follow Us links, and compact newsletter signup.

**Architecture:** Extend `norie-product-details.js` with a `decorative-claw` parent route whose allowlisted style records map to the existing trusted cart IDs. Keep the homepage gallery static and local for predictable China access, assigning each tile a fixed social destination. Reuse the existing i18n and form controllers instead of adding dependencies or live social embeds.

**Tech Stack:** Static HTML/CSS, browser ES modules, Vercel Node functions, Node built-in test runner.

---

## File map

- Modify `norie-product-details.js`: shared decorative style catalog, URL selection, style switching, history update, rendering.
- Modify `product.html`: circular native-radio swatches and shared-detail copy.
- Modify `shop.html`: four shared-detail URLs.
- Modify `index.html`: eight-tile social gallery, inline Follow Us line, compact newsletter layout.
- Modify `norie-i18n.js`: selector, gallery overlay, Follow Us, and newsletter translations.
- Create `tests/shared-claw-details.test.js`: shared route and style-selection contract.
- Modify `tests/product-details.test.js`: updated route and semantic markup assertions.
- Modify `tests/site-integration.test.js`: gallery, social links, and newsletter structure.

### Task 1: Add failing tests for the approved behavior

**Files:**
- Create: `tests/shared-claw-details.test.js`
- Modify: `tests/product-details.test.js`
- Modify: `tests/site-integration.test.js`

- [ ] **Step 1: Write shared-route tests**

Require all four Shop links to use one parent product with distinct style parameters:

```js
const routes = [
  ["Claw Clip in Pink Bow", "pink-bow"],
  ["Claw Clip in Cherry Pink", "cherry-pink"],
  ["Claw Clip in Florie White", "florie-white"],
  ["Claw Clip in Cherry White", "cherry-white"]
];

for (const [name, style] of routes) {
  assert.match(shop, new RegExp(`${name}[\\s\\S]*?product\\.html\\?product=decorative-claw&amp;style=${style}`, "i"));
}
```

- [ ] **Step 2: Write style-selection tests**

Import `selectDetail` and require valid styles plus fallback behavior:

```js
for (const style of ["pink-bow", "cherry-pink", "florie-white", "cherry-white"]) {
  const selected = selectDetail(`?product=decorative-claw&style=${style}`);
  assert.equal(selected.style.id, style);
  assert.equal(selected.detail.cartProductId, style);
}

assert.equal(
  selectDetail("?product=decorative-claw&style=unknown").style.id,
  "pink-bow"
);
```

- [ ] **Step 3: Write circular-radio markup tests**

Require a fieldset, four native radios, circular swatch class, and no old large option-card class:

```js
assert.match(product, /<fieldset[^>]*data-style-selector/);
assert.equal((product.match(/name="productStyle"/g) ?? []).length, 4);
assert.match(product, /class="style-swatch"/);
assert.doesNotMatch(product, /class="style-option-card"/);
```

- [ ] **Step 4: Write homepage gallery and footer tests**

Require exactly eight `data-social-tile` links, two cycles of the four official URLs, the absence of `.social-account-list`, the four inline account links, WeChat text, and the existing subscribe form action/controller.

- [ ] **Step 5: Run tests and verify RED**

```powershell
node --test tests/shared-claw-details.test.js tests/product-details.test.js tests/site-integration.test.js
```

Expected: FAIL because Shop still uses separate product IDs, the detail page has no four-style selector, and the homepage still uses the bordered social list and old newsletter layout.

- [ ] **Step 6: Commit failing tests**

```powershell
git add tests/shared-claw-details.test.js tests/product-details.test.js tests/site-integration.test.js
git commit -m "test: specify shared claw selector and social gallery"
```

### Task 2: Implement the shared decorative claw route

**Files:**
- Modify: `norie-product-details.js`
- Modify: `product.html`
- Modify: `norie-i18n.js`
- Test: `tests/shared-claw-details.test.js`
- Test: `tests/product-details.test.js`
- Test: `tests/i18n.test.js`

- [ ] **Step 1: Define the four allowlisted styles**

Add this frozen style map:

```js
export const decorativeClawStyles = Object.freeze({
  "pink-bow": Object.freeze({ id: "pink-bow", cartProductId: "pink-bow", name: "Claw Clip in Pink Bow", color: "Pink", image: "assets/shop-claw-pink-2.png", descriptionKey: "product.pinkBow.description", contentsKey: "product.pinkBow.contents" }),
  "cherry-pink": Object.freeze({ id: "cherry-pink", cartProductId: "cherry-pink", name: "Claw Clip in Cherry Pink", color: "Pink", image: "assets/shop-claw-pink-3.png", descriptionKey: "product.cherryPink.description", contentsKey: "product.cherryPink.contents" }),
  "florie-white": Object.freeze({ id: "florie-white", cartProductId: "florie-white", name: "Claw Clip in Florie White", color: "White", image: "assets/shop-claw-white-1.png", descriptionKey: "product.florieWhite.description", contentsKey: "product.florieWhite.contents" }),
  "cherry-white": Object.freeze({ id: "cherry-white", cartProductId: "cherry-white", name: "Claw Clip in Cherry White", color: "White", image: "assets/shop-claw-white-3.png", descriptionKey: "product.cherryWhite.description", contentsKey: "product.cherryWhite.contents" })
});
```

- [ ] **Step 2: Extend URL selection**

When `product=decorative-claw`, select `style` from the allowlist or fall back to `pink-bow`. Return `{ detail, style, color: style.color }`. Preserve existing Plumeria and unavailable behavior.

- [ ] **Step 3: Add the native radio selector**

Add a hidden-by-default fieldset containing four radios and image-backed labels. Each input has `name="productStyle"`, one of the four style values, and a complete accessible label. Style labels as 52px circles with `border-radius: 50%`; use `:checked + label` and `:focus-visible + label` for distinct selected/focus outlines.

- [ ] **Step 4: Render style changes**

On radio change, update the selected style, image, alt, name, description, details, launch/original prices, and cart product ID. Update the query using:

```js
const url = new URL(window.location.href);
url.searchParams.set("product", "decorative-claw");
url.searchParams.set("style", selectedStyle.id);
history.replaceState(null, "", url);
```

Only Add to cart calls `addLine`, using `selectedStyle.cartProductId`, `selectedStyle.color`, and empty custom text.

- [ ] **Step 5: Add bilingual selector keys**

Add matching English/Chinese keys for `product.style`, `product.viewStyle`, and any visible shared-detail helper copy. Keep product names English.

- [ ] **Step 6: Run tests and verify GREEN**

```powershell
node --test tests/shared-claw-details.test.js tests/product-details.test.js tests/i18n.test.js
```

Expected: all selector, routing, fallback, rendering-contract, and locale tests PASS.

- [ ] **Step 7: Commit**

```powershell
git add norie-product-details.js product.html norie-i18n.js tests/shared-claw-details.test.js tests/product-details.test.js tests/i18n.test.js
git commit -m "feat: add shared decorative claw selector"
```

### Task 3: Point Shop fixed products to the shared detail

**Files:**
- Modify: `shop.html`
- Test: `tests/shared-claw-details.test.js`
- Test: `tests/product-details.test.js`
- Test: `tests/shop-single-pieces.test.js`

- [ ] **Step 1: Replace the four fixed detail URLs**

Use these exact links:

```html
product.html?product=decorative-claw&amp;style=pink-bow
product.html?product=decorative-claw&amp;style=cherry-pink
product.html?product=decorative-claw&amp;style=florie-white
product.html?product=decorative-claw&amp;style=cherry-white
```

Do not change the two Norie Customize links or either Plumeria link.

- [ ] **Step 2: Run Shop route tests**

```powershell
node --test tests/shared-claw-details.test.js tests/product-details.test.js tests/shop-single-pieces.test.js
```

Expected: all Shop names, order, routes, and product-detail tests PASS.

- [ ] **Step 3: Commit**

```powershell
git add shop.html tests/shared-claw-details.test.js tests/product-details.test.js tests/shop-single-pieces.test.js
git commit -m "feat: link claw styles to shared detail"
```

### Task 4: Build the homepage social gallery and inline Follow Us line

**Files:**
- Modify: `index.html`
- Modify: `norie-i18n.js`
- Test: `tests/site-integration.test.js`
- Test: `tests/i18n.test.js`

- [ ] **Step 1: Add eight gallery tiles**

Use eight existing tracked Lookbook/social-style images. Each link has `data-social-tile`, a meaningful image alt, `target="_blank"`, `rel="noopener noreferrer"`, and a localized overlay. Assign destinations in this exact order twice:

```js
[
  "https://www.instagram.com/norie_hair/",
  "https://www.tiktok.com/@norie_hair",
  "https://xhslink.cn/m/38rRNyaQEbA",
  "https://v.douyin.com/S4fAA1Zxzbs/"
]
```

- [ ] **Step 2: Style the responsive mosaic**

Use a full-width grid with four columns on desktop/tablet and two below 640px. Tiles are square with `object-fit: cover`. Reveal the platform overlay on hover and `:focus-visible`; keep focus outline visible and respect `prefers-reduced-motion`.

- [ ] **Step 3: Replace the bordered account list**

Remove `.social-account-list` markup and render one centered `.follow-line` containing linked labels for Instagram, TikTok, RedNote, Douyin, plus plain text `WeChat NorieToronto`. Allow wrapping without table columns or borders.

- [ ] **Step 4: Add bilingual gallery/follow keys**

Add matching keys for the section heading, platform overlays, Follow Us lead-in, and helper text. Leave handles unchanged.

- [ ] **Step 5: Run homepage and i18n tests**

```powershell
node --test tests/site-integration.test.js tests/i18n.test.js
```

Expected: gallery count/order, official links, removed list, inline Follow Us, and locale-contract tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add index.html norie-i18n.js tests/site-integration.test.js tests/i18n.test.js
git commit -m "feat: add homepage social gallery"
```

### Task 5: Restyle the newsletter as compact Keep in Touch

**Files:**
- Modify: `index.html`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Preserve functional form hooks**

Keep the existing form ID/data attributes, email `type`, autocomplete, required state, submit button, and live status used by `norie-forms.js`. Do not change `/api/subscribe` behavior.

- [ ] **Step 2: Apply the compact structure**

Use centered `KEEP IN TOUCH`, one short helper line, and a `.newsletter-form-row` containing email input and button. Desktop uses `display:flex`; below 640px use one stacked column. Remove the oversized serif treatment and decorative card/table styling.

- [ ] **Step 3: Run integration tests**

```powershell
node --test tests/site-integration.test.js tests/api.test.js
```

Expected: the compact layout test and all original subscribe endpoint/form behavior tests PASS.

- [ ] **Step 4: Commit**

```powershell
git add index.html tests/site-integration.test.js
git commit -m "style: simplify homepage newsletter"
```

### Task 6: Verify, inspect, and publish

**Files:**
- Verify all changed files

- [ ] **Step 1: Run full automated verification**

```powershell
npm test
git diff --check
```

Expected: all tests PASS and no whitespace errors.

- [ ] **Step 2: Verify deployment assets**

Extract all `assets/...` paths from `index.html`, `shop.html`, `product.html`, and `norie-product-details.js`; confirm each exists and is returned by `git ls-files`.

- [ ] **Step 3: Inspect in a browser**

Check desktop and mobile layouts, both languages, all four keyboard-operable circular swatches, URL replacement, main image/name changes, direct cart additions, gallery overlays, fixed external destinations, wrapped Follow Us line, and compact newsletter states.

- [ ] **Step 4: Push**

```powershell
git push origin codex/shop-unified-grid
```

Expected: the remote branch advances to the verified commit.

- [ ] **Step 5: Promote and verify Production**

After Vercel reports Ready, promote the deployment and verify `/`, `/shop`, `/product?product=decorative-claw&style=pink-bow`, `/cart`, and the POST-only order and newsletter endpoints.
