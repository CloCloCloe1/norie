# Product Recommendations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive `WORKS WELL WITH` section to every Norie detail page that links to the other four product families.

**Architecture:** Keep the five pages structurally identical by adding one empty semantic recommendation list to each page. `product-detail.js` derives the other four families from `PRODUCT_CATALOG`, renders accessible linked cards, and excludes the active family. `product-detail.css` owns the shared four/two/one-column layout.

**Tech Stack:** Static HTML, CSS Grid, browser-native ES modules, Node test runner.

---

## File Map

- Modify `product-detail.js`: expose and render recommendation data.
- Modify `product-detail.css`: style the new section and responsive grid.
- Modify the five `*-detail` HTML pages: add semantic section containers.
- Modify `tests/product-detail.test.js`: verify data, links, semantics, and breakpoints.

### Task 1: Recommendation Data and Page Structure

**Files:**
- Modify: `tests/product-detail.test.js`
- Modify: `product-detail.js`
- Modify: `bamboo-paddle-brush.html`
- Modify: `flat-brush.html`
- Modify: `claw-clip.html`
- Modify: `essentials-hairstyling-set.html`
- Modify: `baby-hairstyling-set.html`

- [ ] **Step 1: Write the failing tests**

Add tests that import `relatedProducts`, call `relatedProducts("claw-clip")`, and assert that it returns four entries, excludes `claw-clip`, preserves catalog order, uses default-variant images, includes unit prices, and links to the other detail pages. For every detail HTML file, assert this semantic structure exists:

```html
<section class="recommendations" aria-labelledby="works-well-with-title">
  <h2 id="works-well-with-title">WORKS WELL WITH</h2>
  <ul class="recommendation-grid" data-recommendations></ul>
</section>
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/product-detail.test.js
```

Expected: FAIL because `relatedProducts` and the recommendation sections do not exist.

- [ ] **Step 3: Implement recommendation data**

Import `detailUrl` in `product-detail.js` and add:

```js
export function relatedProducts(currentProductKey) {
  return Object.entries(PRODUCT_CATALOG)
    .filter(([productKey]) => productKey !== currentProductKey)
    .map(([productKey, product]) => {
      const variantKey = Object.keys(product.variants)[0];
      const selection = resolveSelection(productKey, variantKey, 1);
      return {
        productKey,
        name: product.label,
        image: selection.image,
        alt: selection.alt,
        price: selection.unitPrice,
        href: detailUrl(productKey, variantKey)
      };
    });
}
```

Render each entry as a semantic `<li>` containing one full-card `<a>`, image, `<h3>`, and price. Add the approved recommendation section after `.product-detail-layout` in all five detail pages.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/product-detail.test.js
```

Expected: all product detail tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add product-detail.js bamboo-paddle-brush.html flat-brush.html claw-clip.html essentials-hairstyling-set.html baby-hairstyling-set.html tests/product-detail.test.js
git commit -m "feat: add related products to detail pages"
```

### Task 2: Responsive Norie Card Presentation

**Files:**
- Modify: `tests/product-detail.test.js`
- Modify: `product-detail.css`

- [ ] **Step 1: Write the failing responsive-style test**

Assert that `.recommendation-grid` uses four columns by default, two columns at `980px`, and one column at `560px`; assert square media, visible focus styling, and a minimum 44px recommendation link target.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/product-detail.test.js
```

Expected: FAIL because the recommendation CSS does not exist.

- [ ] **Step 3: Add shared responsive styles**

Use CSS Grid and existing tokens:

```css
.recommendation-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); }
.recommendation-card-media { aspect-ratio:1 / 1; }
.recommendation-card-link { min-height:44px; }
@media (max-width:980px) { .recommendation-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:560px) { .recommendation-grid { grid-template-columns:1fr; } }
```

Complete the presentation with white cards, contain-fit images, centered uppercase names, berry text, borders, and visible hover/focus states.

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
node --test tests/product-detail.test.js
npm.cmd test
```

Expected: focused and full suites PASS with zero failures.

- [ ] **Step 5: Commit**

```powershell
git add product-detail.css tests/product-detail.test.js
git commit -m "style: add responsive related product grid"
```

### Task 3: Publish and Verify Production

**Files:** No source changes expected.

- [ ] **Step 1: Push the existing feature branch**

```powershell
git push origin codex/shop-unified-grid-pr
```

- [ ] **Step 2: Deploy Production**

```powershell
vercel --prod --yes
```

- [ ] **Step 3: Verify the live pages**

Fetch all five detail pages and shared assets from `https://norie-hair.vercel.app/`. Assert HTTP 200, `WORKS WELL WITH` markup, `data-recommendations`, and current production deployment status `Ready`.
