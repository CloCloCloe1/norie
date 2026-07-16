# Norie Product Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five product-detail pages, rename and link the Shop catalog, carry variant and quantity into Customize, and calculate itemized email totals from an authoritative catalog.

**Architecture:** A shared ESM catalog is the single source of product keys, variants, images, names, descriptions, and prices for browser pages and the Vercel order API. Five static HTML entry pages use one detail controller and stylesheet. Customize reads validated query parameters from the catalog, stores them in hidden form controls, and the API independently validates the same product/variant/quantity combination before calculating totals.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript ES modules, Vercel Node serverless functions, Node.js built-in test runner.

---

### Task 1: Create the authoritative product catalog

**Files:**
- Create: `product-catalog.js`
- Create: `tests/product-catalog.test.js`

- [ ] **Step 1: Write the failing catalog tests**

Create `tests/product-catalog.test.js` with assertions for all five products, fourteen variants, prices, image mappings, safe fallback, and quantity validation:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  PRODUCT_CATALOG,
  resolveSelection,
  selectionFromSearch
} from "../product-catalog.js";

test("catalog contains the five approved products and fourteen variants", () => {
  assert.deepEqual(Object.keys(PRODUCT_CATALOG), [
    "bamboo-paddle-brush",
    "flat-brush",
    "claw-clip",
    "essentials-hairstyling-set",
    "baby-hairstyling-set"
  ]);
  assert.equal(Object.values(PRODUCT_CATALOG).flatMap(({ variants }) => Object.keys(variants)).length, 14);
});

test("catalog maps approved variant names, images, and prices", () => {
  const cherry = resolveSelection("claw-clip", "pink-cherry", 2);
  assert.equal(cherry.fullName, "Norie Clip in Pink Cherry");
  assert.equal(cherry.image, "assets/shop-claw-pink-3.png");
  assert.equal(cherry.unitPrice, 12);
  assert.equal(cherry.totalPrice, 24);

  const paddle = resolveSelection("bamboo-paddle-brush", "pearl-white", 1);
  assert.equal(paddle.fullName, "Bamboo Paddle Brush in Pearl White");
  assert.equal(paddle.image, "assets/shop-large-white.png");
  assert.equal(paddle.unitPrice, 30);
});

test("selection validation rejects unknown combinations and quantity outside 1 through 10", () => {
  assert.equal(resolveSelection("claw-clip", "unknown", 1), null);
  assert.equal(resolveSelection("unknown", "baby-pink", 1), null);
  assert.equal(resolveSelection("flat-brush", "baby-pink", 0), null);
  assert.equal(resolveSelection("flat-brush", "baby-pink", 11), null);
  assert.equal(resolveSelection("flat-brush", "baby-pink", 1.5), null);
});

test("invalid or missing Customize parameters use the approved safe default", () => {
  const selection = selectionFromSearch("?product=unknown&variant=bad&quantity=99");
  assert.equal(selection.productKey, "flat-brush");
  assert.equal(selection.variantKey, "baby-pink");
  assert.equal(selection.quantity, 1);
});
```

The expected variant total is 14 because Bamboo, Flat, Essentials, and Baby each have two variants and Norie Clip has six.

- [ ] **Step 2: Run the catalog test and verify RED**

Run `node --test tests/product-catalog.test.js`.

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `product-catalog.js`.

- [ ] **Step 3: Implement `product-catalog.js`**

Export `PRODUCT_CATALOG` with these exact keys and values:

```js
export const PRODUCT_CATALOG = {
  "bamboo-paddle-brush": {
    label: "Bamboo Paddle Brush",
    detailPage: "bamboo-paddle-brush.html",
    actionLabel: "CUSTOMIZE THIS PIECE",
    unitPrice: 30,
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Bamboo Paddle Brush in Pearl White", image: "assets/shop-large-white.png", baseColor: "white" },
      "baby-pink": { label: "Baby Pink", fullName: "Bamboo Paddle Brush in Baby Pink", image: "assets/shop-large-pink.png", baseColor: "pink" }
    }
  },
  "flat-brush": {
    label: "Flat Brush",
    detailPage: "flat-brush.html",
    actionLabel: "CUSTOMIZE THIS PIECE",
    unitPrice: 25,
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Flat Brush in Pearl White", image: "assets/shop-small-white.png", baseColor: "white" },
      "baby-pink": { label: "Baby Pink", fullName: "Flat Brush in Baby Pink", image: "assets/shop-small-pink.png", baseColor: "pink" }
    }
  },
  "claw-clip": {
    label: "Norie Clip",
    detailPage: "claw-clip.html",
    actionLabel: "CUSTOMIZE THIS PIECE",
    unitPrice: 12,
    variants: {
      "baby-pink": { label: "Baby Pink", fullName: "Norie Clip in Baby Pink", image: "assets/shop-claw-pink-1.png", baseColor: "pink" },
      "pink-bow": { label: "Pink Bow", fullName: "Norie Clip in Pink Bow", image: "assets/shop-claw-pink-2.png", baseColor: "pink" },
      "pink-cherry": { label: "Pink Cherry", fullName: "Norie Clip in Pink Cherry", image: "assets/shop-claw-pink-3.png", baseColor: "pink" },
      "florie-pearl": { label: "Florie Pearl", fullName: "Norie Clip in Florie Pearl", image: "assets/shop-claw-white-1.png", baseColor: "white" },
      "cream-white": { label: "Cream White", fullName: "Norie Clip in Cream White", image: "assets/shop-claw-white-2.png", baseColor: "white" },
      "white-cherry": { label: "White Cherry", fullName: "Norie Clip in White Cherry", image: "assets/shop-claw-white-3.png", baseColor: "white" }
    }
  },
  "essentials-hairstyling-set": {
    label: "Essentials Hairstyling Set",
    detailPage: "essentials-hairstyling-set.html",
    actionLabel: "CUSTOMIZE THIS SET",
    unitPrice: 38,
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Essentials Hairstyling Set in Pearl White", image: "assets/shop-set-essentials-white.png", baseColor: "white" },
      "baby-pink": { label: "Baby Pink", fullName: "Essentials Hairstyling Set in Baby Pink", image: "assets/shop-set-essentials-pink.png", baseColor: "pink" }
    }
  },
  "baby-hairstyling-set": {
    label: "Baby Hairstyling Set",
    detailPage: "baby-hairstyling-set.html",
    actionLabel: "CUSTOMIZE THIS SET",
    unitPrice: 32,
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Baby Hairstyling Set in Pearl White", image: "assets/shop-set-baby-white.png", baseColor: "white" },
      "baby-pink": { label: "Baby Pink", fullName: "Baby Hairstyling Set in Baby Pink", image: "assets/shop-set-baby-pink.png", baseColor: "pink" }
    }
  }
};
```

Add product-specific `description`, `dimensions`, `material`, `features`, and `note` properties using the exact approved copy in `docs/superpowers/specs/2026-07-15-product-detail-pages-design.md`.

Export these pure helpers:

```js
export function resolveSelection(productKey, variantKey, quantity = 1) {
  const product = PRODUCT_CATALOG[productKey];
  const variant = product?.variants[variantKey];
  const normalizedQuantity = Number(quantity);
  if (!product || !variant || !Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 10) return null;
  return { productKey, variantKey, quantity: normalizedQuantity, ...product, ...variant, unitPrice: product.unitPrice, totalPrice: product.unitPrice * normalizedQuantity };
}

export function selectionFromSearch(search = "") {
  const params = new URLSearchParams(search);
  return resolveSelection(params.get("product"), params.get("variant"), Number(params.get("quantity") || 1))
    || resolveSelection("flat-brush", "baby-pink", 1);
}

export function detailUrl(productKey, variantKey) {
  const selection = resolveSelection(productKey, variantKey, 1);
  return selection ? `${selection.detailPage}?variant=${encodeURIComponent(variantKey)}` : "shop.html";
}

export function customizeUrl(productKey, variantKey, quantity) {
  const selection = resolveSelection(productKey, variantKey, quantity);
  if (!selection) return "customize.html";
  return `customize.html?product=${encodeURIComponent(productKey)}&variant=${encodeURIComponent(variantKey)}&quantity=${selection.quantity}`;
}
```

- [ ] **Step 4: Run the catalog test and verify GREEN**

Run `node --test tests/product-catalog.test.js`.

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the catalog**

```powershell
git add product-catalog.js tests/product-catalog.test.js
git commit -m "feat: add authoritative product catalog"
```

### Task 2: Rename and link the Shop cards

**Files:**
- Modify: `shop.html`
- Modify: `norie-carousel.js`
- Modify: `tests/shop-single-pieces.test.js`
- Modify: `tests/set-carousel.test.js`

- [ ] **Step 1: Update Shop tests for the approved names and destinations**

Change the expected twelve-card name array to the exact approved uppercase names from the design spec. Assert that every single product image, title, and `VIEW DETAILS` action uses the correct detail URL. For set cards, assert that each slide has `data-detail-href`, and the title/action links have `data-carousel-detail-link`.

Add a carousel-controller test with two fake slides and two fake detail links. After clicking Next, assert both links change from the first slide's `data-detail-href` to the second slide's value.

- [ ] **Step 2: Run focused Shop tests and verify RED**

Run:

```powershell
node --test tests/shop-single-pieces.test.js tests/set-carousel.test.js
```

Expected: FAIL because old names and Customize links remain and the carousel does not synchronize detail links.

- [ ] **Step 3: Update all Shop cards**

For each single card:

- Wrap the image in an anchor to the exact detail URL.
- Wrap the `<h3>` text in the same anchor.
- Change the bottom action text to `VIEW DETAILS` and use the same URL.
- Preserve all existing price and image metadata.

For each set carousel:

- Make each slide a focusable anchor with `data-carousel-slide` and `data-detail-href`.
- Put the image inside that anchor.
- Add `data-carousel-detail-link` to the title and bottom `VIEW DETAILS` links.
- Set the initial href to the first slide variant.

Add shared link styling so titles remain uppercase, centered, and undecorated, while focus remains visible.

- [ ] **Step 4: Synchronize set title/action links in `norie-carousel.js`**

Inside `initializeCarousel`, query all `[data-carousel-detail-link]` elements. Extend `updateStatus()`:

```js
function updateStatus() {
  status.textContent = `${currentIndex + 1} / ${slides.length}`;
  const detailHref = slides[currentIndex]?.dataset.detailHref;
  if (detailHref) {
    detailLinks.forEach((link) => link.setAttribute("href", detailHref));
  }
}
```

Do not change the visually hidden carousel status behavior.

- [ ] **Step 5: Run focused Shop tests and verify GREEN**

Run `node --test tests/shop-single-pieces.test.js tests/set-carousel.test.js`.

Expected: all focused tests PASS.

- [ ] **Step 6: Commit the Shop navigation**

```powershell
git add shop.html norie-carousel.js tests/shop-single-pieces.test.js tests/set-carousel.test.js
git commit -m "feat: link Shop cards to product details"
```

### Task 3: Build the five shared product-detail pages

**Files:**
- Create: `product-detail.css`
- Create: `product-detail.js`
- Create: `bamboo-paddle-brush.html`
- Create: `flat-brush.html`
- Create: `claw-clip.html`
- Create: `essentials-hairstyling-set.html`
- Create: `baby-hairstyling-set.html`
- Create: `tests/product-detail.test.js`
- Modify: `tests/project-structure.test.js`

- [ ] **Step 1: Write failing detail-page and controller tests**

Test that all five files exist, load `product-detail.css` and `product-detail.js` as a module, declare the correct `data-product`, contain one `<h1>`, one 1:1 image region, a variant fieldset, quantity controls, action link, and description section.

Import and test these pure controller helpers:

```js
import { clampQuantity, detailState } from "../product-detail.js";

test("quantity clamps to the approved 1 through 10 range", () => {
  assert.equal(clampQuantity(0), 1);
  assert.equal(clampQuantity(4), 4);
  assert.equal(clampQuantity(11), 10);
});

test("detail state resolves a selected variant and Customize URL", () => {
  const state = detailState("claw-clip", "pink-cherry", 2);
  assert.equal(state.fullName, "Norie Clip in Pink Cherry");
  assert.equal(state.image, "assets/shop-claw-pink-3.png");
  assert.equal(state.customizeHref, "customize.html?product=claw-clip&variant=pink-cherry&quantity=2");
});
```

- [ ] **Step 2: Run the detail tests and verify RED**

Run `node --test tests/product-detail.test.js tests/project-structure.test.js`.

Expected: FAIL because the shared files and five pages do not exist.

- [ ] **Step 3: Implement the shared detail controller**

`product-detail.js` imports `PRODUCT_CATALOG`, `resolveSelection`, and `customizeUrl`. Export:

```js
export function clampQuantity(value) {
  return Math.max(1, Math.min(10, Number.parseInt(value, 10) || 1));
}

export function detailState(productKey, variantKey, quantity = 1) {
  const product = PRODUCT_CATALOG[productKey];
  const fallbackVariant = product ? Object.keys(product.variants)[0] : "";
  const safeQuantity = clampQuantity(quantity);
  const selection = resolveSelection(productKey, variantKey, safeQuantity)
    || resolveSelection(productKey, fallbackVariant, safeQuantity);
  return selection ? { ...selection, customizeHref: customizeUrl(productKey, selection.variantKey, safeQuantity) } : null;
}
```

The browser initializer must:

- Read `data-product` and `?variant=`.
- Render native radio inputs with visible labels.
- Update image, alt text, uppercase heading, color text, selected state, URL, and Customize href.
- Update quantity and disabled states without moving focus.
- Render description, dynamic Color, dimensions/material, Features, and note from the catalog.

Guard browser initialization with `if (typeof document !== "undefined")` so Node tests can import the pure helpers.

- [ ] **Step 4: Implement the shared responsive CSS**

`product-detail.css` must provide:

```css
.product-detail-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); }
.product-detail-media { aspect-ratio:1 / 1; }
.product-detail-media img { height:100%; object-fit:contain; width:100%; }
.variant-options { display:flex; flex-wrap:wrap; gap:.75rem; }
.variant-option input { position:absolute; opacity:0; }
.variant-swatch { border:2px solid transparent; border-radius:50%; height:2.75rem; width:2.75rem; }
.variant-option input:checked + .variant-swatch { border-color:var(--berry); box-shadow:0 0 0 3px #fff,0 0 0 5px var(--berry); }
.quantity-control { display:inline-grid; grid-template-columns:2.75rem 3rem 2.75rem; }
.detail-action:hover { background:#f1f1f1; }
@media (max-width:760px) { .product-detail-layout { grid-template-columns:1fr; } }
```

Use the site's existing color variables, typography, 44px minimum interactive targets, visible `:focus-visible` outlines, and a 320px-safe layout.

- [ ] **Step 5: Create the five HTML entry pages**

Each page uses the existing Norie header/footer and this common semantic main structure:

```html
<main id="main" class="product-detail" data-product-detail data-product="PRODUCT_KEY">
  <div class="product-detail-layout">
    <section class="product-detail-media" aria-labelledby="product-name">
      <img data-product-image src="INITIAL_IMAGE" alt="INITIAL_ALT" width="1400" height="1400">
    </section>
    <section class="product-detail-copy" aria-labelledby="product-name">
      <h1 id="product-name" data-product-name>INITIAL_NAME</h1>
      <p class="detail-price" data-product-price>CAD $PRICE</p>
      <fieldset><legend>Color: <span data-variant-name>INITIAL_VARIANT</span></legend><div class="variant-options" data-variant-options></div></fieldset>
      <div class="quantity-block">
        <span id="quantity-label">Quantity</span>
        <div class="quantity-control" aria-labelledby="quantity-label">
          <button type="button" data-quantity-decrease aria-label="Decrease quantity">−</button>
          <output data-quantity aria-live="polite">1</output>
          <button type="button" data-quantity-increase aria-label="Increase quantity">+</button>
        </div>
      </div>
      <a class="detail-action" data-customize-link href="customize.html">ACTION_LABEL</a>
      <section class="product-description" aria-labelledby="details-title"><h2 id="details-title">Details</h2><div data-product-description></div></section>
    </section>
  </div>
</main>
```

Use exact product keys and initial values:

| File | Product key | Initial variant |
| --- | --- | --- |
| `bamboo-paddle-brush.html` | `bamboo-paddle-brush` | `pearl-white` |
| `flat-brush.html` | `flat-brush` | `pearl-white` |
| `claw-clip.html` | `claw-clip` | `baby-pink` |
| `essentials-hairstyling-set.html` | `essentials-hairstyling-set` | `pearl-white` |
| `baby-hairstyling-set.html` | `baby-hairstyling-set` | `pearl-white` |

- [ ] **Step 6: Run detail tests and verify GREEN**

Run `node --test tests/product-detail.test.js tests/project-structure.test.js`.

Expected: all detail and structure tests PASS.

- [ ] **Step 7: Commit the detail pages**

```powershell
git add product-detail.css product-detail.js product-catalog.js bamboo-paddle-brush.html flat-brush.html claw-clip.html essentials-hairstyling-set.html baby-hairstyling-set.html tests/product-detail.test.js tests/project-structure.test.js
git commit -m "feat: add shared product detail pages"
```

### Task 4: Carry product selection into Customize

**Files:**
- Modify: `customize.html`
- Modify: `norie-forms.js`
- Create: `tests/customize-selection.test.js`
- Modify: `tests/site-integration.test.js`

- [ ] **Step 1: Write failing Customize selection tests**

Assert that Customize:

- Loads `product-catalog.js` through a module script.
- Contains hidden `product`, `variant`, and `quantity` controls.
- Contains visible `Selected product`, `Selected style`, `Quantity`, `Unit price`, and `Estimated total` values.
- Does not render the old Product and Base color radio groups.
- Contains a `Change product or style` link.

Update the forms integration test to assert `orderPayload` sends raw approved keys plus quantity instead of label-derived old product/base color values.

- [ ] **Step 2: Run focused Customize tests and verify RED**

Run `node --test tests/customize-selection.test.js tests/site-integration.test.js`.

Expected: FAIL because Customize still repeats Product/Base color choices and the payload lacks variant/quantity.

- [ ] **Step 3: Replace repeated product controls with Selected Style**

In `customize.html`, replace the Product and Base color fieldsets with a semantic summary containing:

```html
<section class="selected-style" aria-labelledby="selected-style-title">
  <h2 id="selected-style-title">Selected style</h2>
  <dl>
    <div><dt>Selected product</dt><dd id="selectedProductName"></dd></div>
    <div><dt>Selected style</dt><dd id="selectedVariantName"></dd></div>
    <div><dt>Quantity</dt><dd id="selectedQuantity"></dd></div>
    <div><dt>Unit price</dt><dd id="selectedUnitPrice"></dd></div>
    <div><dt>Estimated total</dt><dd id="selectedTotalPrice"></dd></div>
  </dl>
  <a id="changeStyleLink" href="flat-brush.html?variant=baby-pink">Change product or style</a>
</section>
<input type="hidden" name="product" value="flat-brush">
<input type="hidden" name="variant" value="baby-pink">
<input type="hidden" name="quantity" value="1">
```

- [ ] **Step 4: Make the inline customizer script a module and resolve the selection**

Add at its top:

```js
import { selectionFromSearch, detailUrl } from "./product-catalog.js";
const orderSelection = selectionFromSearch(window.location.search);
```

Populate hidden inputs, summary fields, preview image/alt, unit/total prices, and change link from `orderSelection`. Derive the existing preview base from `orderSelection.baseColor`. Preserve rhinestone selection, lettering preview, customer fields, and validation. Remove the old `productData` and Product/Base-color change listeners that conflict with the locked selection.

- [ ] **Step 5: Update `norie-forms.js` payload construction**

Return these selection fields:

```js
product: clean(form.elements.product?.value),
variant: clean(form.elements.variant?.value),
quantity: clean(form.elements.quantity?.value),
rhinestoneColor: selectedLabel(form, "stoneColor", "Not selected")
```

Keep customer name, email, contact, custom text, and page URL unchanged. Do not send price values.

- [ ] **Step 6: Run focused Customize tests and verify GREEN**

Run `node --test tests/customize-selection.test.js tests/site-integration.test.js`.

Expected: all focused tests PASS.

- [ ] **Step 7: Commit Customize integration**

```powershell
git add customize.html norie-forms.js tests/customize-selection.test.js tests/site-integration.test.js
git commit -m "feat: carry detail selections into Customize"
```

### Task 5: Validate selections and calculate totals in order emails

**Files:**
- Modify: `api/custom-order.js`
- Modify: `tests/api.test.js`

- [ ] **Step 1: Rewrite the first API order test for authoritative selection pricing**

Use this valid payload:

```js
{
  product: "claw-clip",
  variant: "pink-cherry",
  quantity: 3,
  rhinestoneColor: "White stones",
  customText: "<Chloe>",
  customerName: "Chloe Lee",
  customerEmail: "chloe@example.com",
  customerContact: "chloe_wechat",
  unitPrice: "CAD $1",
  estimatedTotal: "CAD $1"
}
```

Assert both emails contain `Norie Clip in Pink Cherry`, `Pink Cherry`, `Quantity`, `3`, `CAD $12`, and `CAD $36`, and do not contain the forged `CAD $1`.

Update every other valid API fixture to use a valid product key, variant, and quantity. Add rejection tests for an invalid variant and quantities `0`, `11`, and `1.5`, each with no external requests.

- [ ] **Step 2: Run API tests and verify RED**

Run `node --test tests/api.test.js`.

Expected: FAIL because the API still expects old display labels/base colors and does not calculate quantity totals.

- [ ] **Step 3: Replace the API product table with the shared catalog**

Import:

```js
import { resolveSelection } from "../product-catalog.js";
```

Resolve with cleaned keys and the raw quantity. Reject a null selection with `400` and `Please choose a valid product, style, and quantity.` Keep the rhinestone whitelist and all customer/contact/custom-text checks.

Build order rows using:

```js
Product: selection.fullName,
Style: selection.label,
Quantity: String(selection.quantity),
"Unit price": `CAD $${selection.unitPrice}`,
"Estimated total": `CAD $${selection.totalPrice}`
```

Remove trust in browser-provided prices and the obsolete `Base color` row. Use `selection.fullName` in the owner subject and both email summaries.

- [ ] **Step 4: Run API tests and verify GREEN**

Run `node --test tests/api.test.js`.

Expected: all API tests PASS, including forged-price and invalid-selection cases.

- [ ] **Step 5: Commit API and email updates**

```powershell
git add api/custom-order.js tests/api.test.js
git commit -m "feat: validate variants and itemize order totals"
```

### Task 6: Verify, review, publish, and inspect production

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
npm.cmd test
git diff --check
```

Expected: every test PASS and `git diff --check` returns no errors.

- [ ] **Step 2: Inspect responsive pages locally or in Preview**

Check desktop and 320px layouts for all five details. Confirm variant radios, image/name updates, quantity boundaries, Customize navigation, visible focus, and no horizontal overflow.

- [ ] **Step 3: Review the implementation against the spec**

Verify line by line that all twelve names, five pages, fourteen variants, exact descriptions, selection summary, authoritative total, and both email formats are covered.

- [ ] **Step 4: Push the existing PR branch**

```powershell
git push origin codex/shop-unified-grid-pr
```

- [ ] **Step 5: Deploy production**

```powershell
& 'C:\Users\limin\AppData\Local\npm-cache\_npx\69f9afb961c37556\node_modules\.bin\vercel.cmd' --prod --yes
```

Expected: READY and aliased to `https://norie-hair.vercel.app/`.

- [ ] **Step 6: Verify production behavior**

Inspect Shop, all five details, Customize, and a non-sending API validation request. Confirm a Shop variant opens its correct image, changing a color updates the image/name, Quantity persists into Customize, and invalid API selection is rejected.

- [ ] **Step 7: Confirm a clean, synchronized worktree**

Run:

```powershell
git status --short
git rev-parse HEAD
git rev-parse origin/codex/shop-unified-grid-pr
```

Expected: clean status and matching local/remote commit IDs.
