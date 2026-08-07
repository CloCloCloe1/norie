# Shop Single Pieces Image Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Shop Single Pieces imagery and expand the section to ten independent, square product cards.

**Architecture:** Keep the existing static HTML product-card structure and responsive grid. Copy the ten approved source PNGs into `assets/` under URL-safe names, then map one image to each product card; no carousel, filtering, or JavaScript is added.

**Tech Stack:** Static HTML/CSS, Node.js built-in test runner, Git

---

## File structure

- Create `tests/shop-single-pieces.test.js`: focused asset and Shop markup regression tests.
- Create ten `assets/shop-*.png` files: deployable square product photography copied without modifying the supplied originals.
- Modify `shop.html`: contain-fit product imagery, loading metadata, and ten Single Pieces cards.

### Task 1: Add and verify deployable product assets

**Files:**
- Create: `tests/shop-single-pieces.test.js`
- Create: `assets/shop-large-pink.png`
- Create: `assets/shop-large-white.png`
- Create: `assets/shop-small-pink.png`
- Create: `assets/shop-small-white.png`
- Create: `assets/shop-claw-pink-1.png`
- Create: `assets/shop-claw-pink-2.png`
- Create: `assets/shop-claw-pink-3.png`
- Create: `assets/shop-claw-white-1.png`
- Create: `assets/shop-claw-white-2.png`
- Create: `assets/shop-claw-white-3.png`

- [ ] **Step 1: Write the failing asset test**

Create `tests/shop-single-pieces.test.js` with:

```js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const productAssets = [
  "assets/shop-large-pink.png",
  "assets/shop-large-white.png",
  "assets/shop-small-pink.png",
  "assets/shop-small-white.png",
  "assets/shop-claw-pink-1.png",
  "assets/shop-claw-pink-2.png",
  "assets/shop-claw-pink-3.png",
  "assets/shop-claw-white-1.png",
  "assets/shop-claw-white-2.png",
  "assets/shop-claw-white-3.png"
];

test("the ten Single Pieces product assets exist and are tracked", () => {
  const trackedFiles = new Set(
    execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split(/\r?\n/)
  );

  assert.deepEqual(productAssets.filter((asset) => !existsSync(asset)), []);
  assert.deepEqual(productAssets.filter((asset) => !trackedFiles.has(asset)), []);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/shop-single-pieces.test.js`

Expected: FAIL because the ten `assets/shop-*.png` files do not exist or are not tracked.

- [ ] **Step 3: Copy the supplied square source files into assets**

Run these PowerShell commands from the repository root:

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\bamboo paddle brush pink.png' -Destination 'assets\shop-large-pink.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\bamboo paddle brush white.png' -Destination 'assets\shop-large-white.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\粉色小梳子.png' -Destination 'assets\shop-small-pink.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\白色小梳子.png' -Destination 'assets\shop-small-white.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\Claw clip 1 pink.png' -Destination 'assets\shop-claw-pink-1.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\clawclip 2 pink.png' -Destination 'assets\shop-claw-pink-2.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\claw clip 3 pink.png' -Destination 'assets\shop-claw-pink-3.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\clawclip white 1.png' -Destination 'assets\shop-claw-white-1.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\clawclip white 2.png' -Destination 'assets\shop-claw-white-2.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\clawclip white 3.png' -Destination 'assets\shop-claw-white-3.png'
git add tests/shop-single-pieces.test.js assets/shop-*.png
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/shop-single-pieces.test.js`

Expected: PASS with one passing test.

- [ ] **Step 5: Commit the asset boundary**

```powershell
git commit -m "test: add Shop single-piece product assets"
```

### Task 2: Render ten accessible square product cards

**Files:**
- Modify: `tests/shop-single-pieces.test.js`
- Modify: `shop.html:221-246`
- Modify: `shop.html:478-574`

- [ ] **Step 1: Add failing markup tests**

Append these tests to `tests/shop-single-pieces.test.js`:

```js
test("Shop renders ten independent Single Pieces cards in the approved order", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="single-products-title">([\s\S]*?)<section class="section" aria-labelledby="set-products-title">/
  )?.[1] ?? "";
  const names = [...section.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]);

  assert.deepEqual(names, [
    "Pink Large Comb",
    "White Large Comb",
    "Pink Small Comb",
    "White Small Comb",
    "Pink Claw Clip 1",
    "Pink Claw Clip 2",
    "Pink Claw Clip 3",
    "White Claw Clip 1",
    "White Claw Clip 2",
    "White Claw Clip 3"
  ]);
  assert.equal((section.match(/<article class="product-card">/g) ?? []).length, 10);
  assert.equal((section.match(/href="customize\.html">Customize this piece<\/a>/g) ?? []).length, 10);
});

test("Shop maps all ten square assets with accessible loading metadata", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="single-products-title">([\s\S]*?)<section class="section" aria-labelledby="set-products-title">/
  )?.[1] ?? "";
  const images = [...section.matchAll(/<img src="assets\/shop-[^"]+"[^>]+>/g)].map(([image]) => image);

  assert.equal(images.length, 10);
  for (const image of images) {
    assert.match(image, /alt="[^"]+"/);
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
    assert.match(image, /width="[0-9]+"/);
    assert.match(image, /height="[0-9]+"/);
  }
});

test("Single Pieces use a square contain-fit image viewport", () => {
  const html = readFileSync("shop.html", "utf8");
  const viewportRule = html.match(/\.product-image,\s*\.set-placeholder\s*\{([^}]+)\}/)?.[1] ?? "";
  const imageRule = html.match(/\.product-image img\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.match(viewportRule, /aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(imageRule, /object-fit:\s*contain/);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `node --test tests/shop-single-pieces.test.js`

Expected: the asset test passes; the three new markup tests fail because `shop.html` still has six old images/cards and uses `object-fit: cover`.

- [ ] **Step 3: Apply the minimal Shop CSS and card markup update**

In `shop.html`, keep `.product-image` at `aspect-ratio: 1 / 1` and change its image rule to:

```css
.product-image img {
  height: 100%;
  object-fit: contain;
  width: 100%;
}
```

Replace the Single Pieces grid content with ten cards in the approved order. Use these exact image sources and intrinsic dimensions:

```text
assets/shop-large-pink.png       1414 × 1414
assets/shop-large-white.png      1414 × 1414
assets/shop-small-pink.png       1248 × 1248
assets/shop-small-white.png      1287 × 1287
assets/shop-claw-pink-1.png      1252 × 1252
assets/shop-claw-pink-2.png      1251 × 1251
assets/shop-claw-pink-3.png      1371 × 1371
assets/shop-claw-white-1.png     1358 × 1358
assets/shop-claw-white-2.png     1192 × 1192
assets/shop-claw-white-3.png     1319 × 1319
```

Each `<img>` must follow this complete pattern with the corresponding square dimensions and specific alt text:

```html
<img src="assets/shop-claw-pink-1.png" alt="Pink pearl claw clip with a softly curved silhouette" loading="lazy" decoding="async" width="1252" height="1252">
```

Keep the four comb cards' current copy and prices. Duplicate the existing pink or white claw card structure for each numbered variation, retain CAD $12 / CAD $16, and change only the numbered heading and product-specific alt text.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `node --test tests/shop-single-pieces.test.js`

Expected: PASS with four passing tests.

- [ ] **Step 5: Commit the Shop markup update**

```powershell
git add shop.html tests/shop-single-pieces.test.js
git commit -m "feat: expand Shop single-piece products"
```

### Task 3: Run complete verification

**Files:**
- Verify: `shop.html`
- Verify: `tests/shop-single-pieces.test.js`
- Verify: `assets/shop-*.png`

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Check formatting and repository dependencies**

Run:

```powershell
git diff --check HEAD~2..HEAD
git status --short
```

Expected: no whitespace errors; only pre-existing unrelated untracked files remain.

- [ ] **Step 3: Check all ten image files and dimensions**

Run:

```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem assets\shop-*.png | ForEach-Object {
  $image = [System.Drawing.Image]::FromFile($_.FullName)
  try { [PSCustomObject]@{ Name = $_.Name; Width = $image.Width; Height = $image.Height } }
  finally { $image.Dispose() }
}
```

Expected: ten rows and `Width` equals `Height` for every row.

- [ ] **Step 4: Perform browser verification when available**

Open `shop.html` through the local site and inspect desktop and mobile widths. Confirm ten cards, a three/two/one-column responsive grid, full uncropped products, and working Customize links. If the browser runtime remains unavailable, record that limitation and rely on the automated markup, asset, and HTTP checks without claiming visual verification.

- [ ] **Step 5: Review the completed implementation**

Use the requesting-code-review workflow against the approved design, correct any findings, rerun `npm test`, and then use verification-before-completion before reporting success.
