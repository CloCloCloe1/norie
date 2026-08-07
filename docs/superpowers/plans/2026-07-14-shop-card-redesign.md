# Shop Product Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two Shop set carousels with the supplied square imagery and restyle all twelve product cards into the approved centered, uppercase, description-free product layout.

**Architecture:** Keep `shop.html` as the catalog source and reuse `norie-carousel.js` without behavior changes. Add four deployable square assets, strengthen the existing HTML/CSS regression tests first, then make the smallest markup and style changes needed to pass them.

**Tech Stack:** Static HTML/CSS, ES modules, Node.js built-in test runner, Vercel CLI

---

## File Map

- Create `assets/shop-set-essentials-white.png`: supplied white Essentials set image.
- Create `assets/shop-set-essentials-pink.png`: supplied pink Essentials set image.
- Create `assets/shop-set-baby-pink.png`: supplied pink Baby set image.
- Create `assets/shop-set-baby-white.png`: supplied white Baby set image.
- Modify `tests/set-carousel.test.js`: assert Shop-only set asset mappings and square dimensions while leaving Homepage assertions unchanged.
- Modify `tests/shop-single-pieces.test.js`: assert the approved card content, actions, square presentation, and smaller controls.
- Modify `shop.html`: replace set images and unify all twelve card presentations.

### Task 1: Add Failing Shop Redesign Tests

**Files:**
- Modify: `tests/set-carousel.test.js`
- Modify: `tests/shop-single-pieces.test.js`

- [ ] **Step 1: Update the Shop carousel assertions**

In `tests/set-carousel.test.js`, define the new Shop-only assets without changing the Homepage asset list:

```js
const shopSetAssets = [
  "assets/shop-set-essentials-white.png",
  "assets/shop-set-essentials-pink.png",
  "assets/shop-set-baby-pink.png",
  "assets/shop-set-baby-white.png"
];
```

Replace the Shop image assertions with:

```js
for (const asset of shopSetAssets) {
  assert.match(html, new RegExp(asset.replace("assets/", "").replace(".", "\\.")));
}
```

Split the intrinsic-dimension test by page so Homepage remains 1414x2000 and Shop becomes square:

```js
const homepageImages = [...readFileSync("index.html", "utf8").matchAll(/<img class="set-carousel-slide"[^>]+>/g)].map(([image]) => image);
const shopImages = [...readFileSync("shop.html", "utf8").matchAll(/<img class="set-carousel-slide"[^>]+>/g)].map(([image]) => image);

for (const image of homepageImages) {
  assert.match(image, /width="1414"/);
  assert.match(image, /height="2000"/);
}
for (const image of shopImages) {
  assert.match(image, /width="[0-9]+"/);
  const width = image.match(/width="([0-9]+)"/)?.[1];
  const height = image.match(/height="([0-9]+)"/)?.[1];
  assert.equal(width, height);
}
```

- [ ] **Step 2: Add card-presentation assertions**

Append focused tests to `tests/shop-single-pieces.test.js`:

```js
test("Shop cards use the approved description-free uppercase presentation", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(/<section class="section" aria-labelledby="shop-products-title">([\s\S]*?)<\/section>/)?.[1] ?? "";
  const headings = [...section.matchAll(/<h3(?: id="[^"]+")?>([^<]+)<\/h3>/g)].map(([, heading]) => heading);

  assert.equal(headings.length, 12);
  assert.ok(headings.every((heading) => heading === heading.toUpperCase()));
  assert.equal((section.match(/class="product-kicker"/g) ?? []).length, 0);
  assert.equal((section.match(/<div class="card-copy">[\s\S]*?<p>(?!<)/g) ?? []).length, 0);
  assert.equal((section.match(/class="price-row"/g) ?? []).length, 12);
});

test("Shop actions are full-card Customize links with approved labels", () => {
  const html = readFileSync("shop.html", "utf8");

  assert.equal((html.match(/class="product-action" href="customize\.html">BUILD THIS SET<\/a>/g) ?? []).length, 2);
  assert.equal((html.match(/class="product-action" href="customize\.html">CUSTOMIZE THIS PIECE<\/a>/g) ?? []).length, 10);
  assert.match(html, /\.product-action\s*\{[^}]*border:\s*1px solid/s);
  assert.match(html, /\.product-action:hover\s*\{[^}]*background:\s*#f1f1f1/s);
  assert.match(html, /\.product-action:focus-visible\s*\{/);
});

test("Shop set images and carousel controls use the approved square scale", () => {
  const html = readFileSync("shop.html", "utf8");
  const carouselRule = html.match(/\.set-carousel\s*\{([^}]+)\}/)?.[1] ?? "";
  const buttonRule = html.match(/\.set-carousel-button\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.match(carouselRule, /aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(buttonRule, /height:\s*1\.75rem/);
  assert.match(buttonRule, /width:\s*1\.75rem/);
});
```

- [ ] **Step 3: Run focused tests and confirm RED**

Run:

```powershell
node --test tests/set-carousel.test.js tests/shop-single-pieces.test.js
```

Expected: FAIL because the new four assets, uppercase headings, removed copy, `product-action` styling, square set carousel, and 28px controls are not implemented.

- [ ] **Step 4: Commit the failing tests**

```powershell
git add tests/set-carousel.test.js tests/shop-single-pieces.test.js
git commit -m "test: specify Shop card redesign"
```

### Task 2: Add the Four Square Set Assets

**Files:**
- Create: `assets/shop-set-essentials-white.png`
- Create: `assets/shop-set-essentials-pink.png`
- Create: `assets/shop-set-baby-pink.png`
- Create: `assets/shop-set-baby-white.png`

- [ ] **Step 1: Copy the supplied images to stable deployable names**

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\esssential white.png' -Destination 'assets\shop-set-essentials-white.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\essential pink.png' -Destination 'assets\shop-set-essentials-pink.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\baby pink.png' -Destination 'assets\shop-set-baby-pink.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\baby white.png' -Destination 'assets\shop-set-baby-white.png'
```

- [ ] **Step 2: Verify all sources are square PNGs**

Run a PowerShell image-dimension check using `System.Drawing.Image.FromFile` and assert `Width -eq Height` for all four destinations.

Expected: four records with equal width and height and no thrown error.

- [ ] **Step 3: Stage the assets for the markup implementation**

```powershell
git add assets/shop-set-essentials-white.png assets/shop-set-essentials-pink.png assets/shop-set-baby-pink.png assets/shop-set-baby-white.png
```

### Task 3: Implement the Unified Shop Card Presentation

**Files:**
- Modify: `shop.html`
- Test: `tests/set-carousel.test.js`
- Test: `tests/shop-single-pieces.test.js`

- [ ] **Step 1: Replace the two Shop carousel image pairs**

Use the four new `assets/shop-set-*.png` sources. Set each image's intrinsic `width` and `height` to its verified equal source dimensions, keep `loading="lazy" decoding="async"`, and use these informative alt texts:

```html
alt="White Essentials Hairstyling Set with bamboo paddle brush, cream claw clip, and white scrunchie"
alt="Pink Essentials Hairstyling Set with bamboo paddle brush, bow claw clip, and pink scrunchie"
alt="Pink Baby Hairstyling Set with flat brush, flower clip, and pink claw clip"
alt="White Baby Hairstyling Set with flat brush, floral claw clip, and white scrunchie"
```

- [ ] **Step 2: Simplify every card's markup**

For each of the twelve `.card-copy` blocks:

```html
<div class="card-copy">
  <h3>PINK LARGE COMB</h3>
  <div class="price-row">
    <span class="sale-price">CAD $30</span>
    <span class="original-price">CAD $38</span>
  </div>
  <a class="product-action" href="customize.html">CUSTOMIZE THIS PIECE</a>
</div>
```

Keep the existing heading IDs on the two set names for `aria-labelledby`, use `BUILD THIS SET` on those two actions, and preserve every existing price.

- [ ] **Step 3: Replace the product-card CSS with the approved styling**

Apply these exact structural rules in `shop.html`, retaining the existing color variables:

```css
.product-card {
  background: var(--white);
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
}

.set-carousel {
  aspect-ratio: 1 / 1;
  background: #fff;
  overflow: hidden;
  position: relative;
}

.set-carousel-slide {
  flex: 0 0 100%;
  height: 100%;
  object-fit: contain;
  scroll-snap-align: start;
  width: 100%;
}

.set-carousel-button {
  height: 1.75rem;
  width: 1.75rem;
  font-size: 0.75rem;
}

.card-copy {
  align-content: start;
  display: grid;
  gap: 0.75rem;
  padding: 1rem 0;
  text-align: center;
}

.card-copy h3 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: clamp(0.9rem, 1.4vw, 1.05rem);
  letter-spacing: 0.08em;
  line-height: 1.35;
  margin: 0;
  min-height: 2.7em;
  text-transform: uppercase;
}

.price-row {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
  margin: 0;
}

.product-action {
  align-items: center;
  background: #fff;
  border: 1px solid var(--soft-ink);
  color: var(--soft-ink);
  display: flex;
  font-size: 0.78rem;
  justify-content: center;
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
  min-height: 3rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: background-color 160ms ease-out, border-color 160ms ease-out;
  width: 100%;
}

.product-action:hover { background: #f1f1f1; }
.product-action:focus-visible {
  outline: 3px solid var(--berry);
  outline-offset: 3px;
}
```

Delete obsolete `.product-kicker` and description styling. Preserve the existing two-tone carousel focus ring and 4/2/1 responsive grid.

- [ ] **Step 4: Run focused tests and confirm GREEN**

```powershell
node --test tests/set-carousel.test.js tests/shop-single-pieces.test.js
```

Expected: all focused tests PASS.

- [ ] **Step 5: Commit the implementation**

```powershell
git add shop.html assets/shop-set-essentials-white.png assets/shop-set-essentials-pink.png assets/shop-set-baby-pink.png assets/shop-set-baby-white.png
git commit -m "feat: redesign Shop product cards"
```

### Task 4: Verify, Push, and Deploy

**Files:**
- Verify: `shop.html`
- Verify: `assets/shop-set-*.png`
- Verify: `tests/*.test.js`

- [ ] **Step 1: Run the complete automated suite**

```powershell
npm.cmd test
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Inspect the final diff and repository state**

```powershell
git diff --check origin/main...HEAD
git status --short --branch
```

Expected: no whitespace errors and no unstaged task files.

- [ ] **Step 3: Push the existing PR branch**

```powershell
git push origin codex/shop-unified-grid-pr
```

Expected: GitHub Pull Request #1 updates successfully.

- [ ] **Step 4: Deploy the verified source to Vercel production**

Use the already authenticated cached Vercel CLI from the linked Norie project, deploy with `--prod`, and ensure the production alias remains `https://norie-hair.vercel.app/`.

- [ ] **Step 5: Verify production output**

Fetch `https://norie-hair.vercel.app/shop` and assert:

```text
12 product cards
2 BUILD THIS SET actions
10 CUSTOMIZE THIS PIECE actions
4 new shop-set image paths
0 product-kicker elements
0 product-description paragraphs
```

Also request all four new asset URLs and require HTTP 200 responses.
