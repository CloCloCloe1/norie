# Plumeria Circular Color Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Plumeria White/Pink selector use the same circular real-product image controls as the decorative claw styles.

**Architecture:** Reuse the existing native-radio `.style-choice` and `.style-swatch` presentation rather than adding another component. Keep the existing `productColor` data flow so direct URLs, main-image updates, accessibility messages, and cart normalization remain unchanged.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner.

---

### Task 1: Specify the Plumeria circular selector

**Files:**
- Modify: `tests/product-details.test.js`

- [ ] **Step 1: Write the failing regression test**

Add assertions that the Plumeria color fieldset contains exactly two `productColor` native radios, each paired with a real product image using `.style-swatch`, and that the old `.color-options label` presentation is absent.

```js
test("Plumeria uses two circular product-image color swatches", () => {
  const html = read("product.html");
  assert.equal((html.match(/name="productColor"/g) ?? []).length, 2);
  assert.equal((html.match(/class="style-swatch plumeria-swatch"/g) ?? []).length, 2);
  assert.match(html, /assets\/gift-flower-white\.jpg/);
  assert.match(html, /assets\/gift-flower-pink\.jpg/);
  assert.doesNotMatch(html, /class="color-options"/);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test tests/product-details.test.js`

Expected: FAIL because the current markup still uses rectangular text labels and has no Plumeria image swatches.

- [ ] **Step 3: Commit the test contract**

```powershell
git add tests/product-details.test.js
git commit -m "test: require circular Plumeria color swatches"
```

### Task 2: Reuse the circular swatch component for Plumeria

**Files:**
- Modify: `product.html`
- Modify: `norie-product-details.js`
- Test: `tests/product-details.test.js`

- [ ] **Step 1: Replace the old rectangular Plumeria controls**

Use the existing swatch structure while retaining the current input names and values:

```html
<div class="style-options plumeria-style-options">
  <label class="style-choice" for="product-color-white">
    <input id="product-color-white" type="radio" name="productColor" value="White">
    <img class="style-swatch plumeria-swatch" src="assets/gift-flower-white.jpg" alt="" width="64" height="64">
    <span class="visually-hidden">Plumeria White</span>
  </label>
  <label class="style-choice" for="product-color-pink">
    <input id="product-color-pink" type="radio" name="productColor" value="Pink">
    <img class="style-swatch plumeria-swatch" src="assets/gift-flower-pink.jpg" alt="" width="64" height="64">
    <span class="visually-hidden">Plumeria Pink</span>
  </label>
</div>
```

Remove the obsolete `.color-options` CSS. Reuse `.style-options`, `.style-choice`, and `.style-swatch` selected/focus rules unchanged.

- [ ] **Step 2: Preserve accessible selection messages**

Update the Plumeria selection announcement to use the full selected label while preserving the URL and main-image behavior:

```js
status.textContent = translate("product.selection", getLocale(), `${detail.name}: ${input.value}`);
```

Do not change the trusted `plumeria` cart product ID, price, allowed colors, or quantity behavior.

- [ ] **Step 3: Run focused tests and confirm GREEN**

Run: `node --test tests/product-details.test.js tests/shared-claw-details.test.js tests/cart-store.test.js`

Expected: all focused tests PASS.

- [ ] **Step 4: Commit the implementation**

```powershell
git add product.html norie-product-details.js
git commit -m "feat: add circular Plumeria color selector"
```

### Task 3: Verify and release

**Files:**
- Verify only: all tracked site files

- [ ] **Step 1: Run the complete suite**

Run: `npm test`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Verify repository hygiene**

Run: `git diff --check`

Expected: no output and exit code 0.

- [ ] **Step 3: Browser-check both colors**

Open `product.html?product=plumeria&color=White`, select Pink, and verify the selected circle, main image, URL, accessible status, and cart item all update to Pink. Repeat from the Pink direct URL and select White.

- [ ] **Step 4: Push the approved branch**

Run: `git push origin codex/shop-unified-grid`

Expected: the remote branch advances to the implementation commit, after which the deployment can be promoted and checked at `https://norie-hair.vercel.app/`.
