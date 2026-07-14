# Shop Unified Product Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine the two Shop product sections into one twelve-card catalog, show four cards per desktop row, and rename the two featured sets.

**Architecture:** Keep the existing static product-card and carousel implementations. Move both existing set articles to the start of the same `.shop-grid` as the ten single-piece articles, change only Shop-specific names and accessible labels, and adjust the desktop grid column count without changing tablet/mobile breakpoints.

**Tech Stack:** Static HTML/CSS, shared vanilla JavaScript carousel controller, Node.js built-in test runner, Vercel CLI

---

## File structure

- Modify `tests/shop-single-pieces.test.js`: assert unified section structure, product order, card/link count, and responsive columns.
- Modify `tests/set-carousel.test.js`: update Shop-only set-name expectations while retaining Homepage expectations.
- Modify `shop.html`: one unified section/grid, featured sets first, four desktop columns, and renamed set labels.

### Task 1: Specify the unified catalog behavior

**Files:**
- Modify: `tests/shop-single-pieces.test.js`
- Modify: `tests/set-carousel.test.js`

- [ ] **Step 1: Replace the existing Shop card-order test with a failing unified-catalog test**

Replace `Shop renders ten independent Single Pieces cards in the approved order` in `tests/shop-single-pieces.test.js` with:

```js
test("Shop renders one unified twelve-card catalog in the approved order", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="shop-products-title">([\s\S]*?)<\/section>/
  )?.[1] ?? "";
  const names = [...section.matchAll(/<h3(?: id="[^"]+")?>([^<]+)<\/h3>/g)].map((match) => match[1]);

  assert.deepEqual(names, [
    "Essentials Hairstyling Set",
    "Baby Hairstyling Set",
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
  assert.equal((section.match(/<article class="product-card">/g) ?? []).length, 12);
  assert.equal((section.match(/href="customize\.html">(?:Build this set|Customize this piece)<\/a>/g) ?? []).length, 12);
  assert.doesNotMatch(html, /single-products-title|set-products-title/);
});
```

- [ ] **Step 2: Add a failing responsive-column test**

Append to `tests/shop-single-pieces.test.js`:

```js
test("the unified Shop grid uses four, two, and one responsive columns", () => {
  const html = readFileSync("shop.html", "utf8");

  assert.match(html, /\.shop-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(html, /@media \(max-width:\s*900px\)[\s\S]*?\.shop-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(html, /@media \(max-width:\s*560px\)[\s\S]*?\.shop-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});
```

- [ ] **Step 3: Update the Shop carousel test to expect the new names and labels**

In `tests/set-carousel.test.js`, keep the Homepage test unchanged. In `Shop page renders the two updated set carousels`, replace the old Shop name assertions with:

```js
assert.match(html, /Essentials Hairstyling Set/);
assert.match(html, /Baby Hairstyling Set/);
assert.match(html, /Previous Essentials Hairstyling Set image/);
assert.match(html, /Next Essentials Hairstyling Set image/);
assert.match(html, /Previous Baby Hairstyling Set image/);
assert.match(html, /Next Baby Hairstyling Set image/);
```

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```powershell
node --test tests/shop-single-pieces.test.js tests/set-carousel.test.js
```

Expected: FAIL because Shop still has separate sections, old set names, old carousel labels, and a three-column desktop grid.

- [ ] **Step 5: Commit the failing specification**

Do not commit while tests are red. Continue directly to Task 2 so the behavior and implementation ship together in one green commit.

### Task 2: Build the unified twelve-card Shop grid

**Files:**
- Modify: `shop.html:221-224`
- Modify: `shop.html:474-699`
- Test: `tests/shop-single-pieces.test.js`
- Test: `tests/set-carousel.test.js`

- [ ] **Step 1: Change only the desktop grid to four columns**

Update the base rule in `shop.html` to:

```css
.shop-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
```

Keep the existing `max-width: 900px` two-column rule and `max-width: 560px` one-column rule unchanged.

- [ ] **Step 2: Replace the two product sections with one unified section**

Use this outer structure:

```html
<section class="section" aria-labelledby="shop-products-title">
  <div class="section-heading">
    <h2 id="shop-products-title">Shop All</h2>
    <p>Explore limited-edition sets and individual pieces, then customize your selection.</p>
  </div>
  <div class="shop-grid">
    <!-- Essentials set article -->
    <!-- Baby set article -->
    <!-- the ten existing single-piece articles, unchanged -->
  </div>
</section>
```

Move the two existing set `<article class="product-card">` blocks to the start of this grid. Move the ten existing single-piece article blocks after them without changing their content. Remove the former second section heading and second `.shop-grid` wrapper.

- [ ] **Step 3: Rename both Shop sets and carousel accessible labels**

For the first set card, use:

```html
<button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Essentials Hairstyling Set image" hidden><span aria-hidden="true">&#8592;</span></button>
<button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Essentials Hairstyling Set image" hidden><span aria-hidden="true">&#8594;</span></button>
<h3 id="shop-set-1-title">Essentials Hairstyling Set</h3>
```

For the second set card, use:

```html
<button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Baby Hairstyling Set image" hidden><span aria-hidden="true">&#8592;</span></button>
<button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Baby Hairstyling Set image" hidden><span aria-hidden="true">&#8594;</span></button>
<h3 id="shop-set-2-title">Baby Hairstyling Set</h3>
```

Keep both carousel `aria-labelledby` references connected to these h3 IDs.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
node --test tests/shop-single-pieces.test.js tests/set-carousel.test.js
```

Expected: all focused tests pass with zero failures.

- [ ] **Step 5: Run the complete test suite**

Run: `npm.cmd test`

Expected: all tests pass with zero failures.

- [ ] **Step 6: Commit the unified catalog**

```powershell
git add shop.html tests/shop-single-pieces.test.js tests/set-carousel.test.js
git commit -m "feat: unify Shop product catalog"
```

### Task 3: Verify and deploy production

**Files:**
- Verify: `shop.html`
- Verify: `tests/shop-single-pieces.test.js`
- Verify: `tests/set-carousel.test.js`

- [ ] **Step 1: Run final local verification**

Run:

```powershell
npm.cmd test
git diff --check HEAD~1..HEAD
```

Expected: all tests pass and Git reports no whitespace errors.

- [ ] **Step 2: Deploy the linked Vercel project**

Run the already authenticated cached CLI:

```powershell
& 'C:\Users\limin\AppData\Local\npm-cache\_npx\69f9afb961c37556\node_modules\.bin\vercel.cmd' --prod --yes
```

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify the production Shop markers**

Run:

```powershell
$body = curl.exe -sS -L 'https://norie-hair.vercel.app/shop'
if ($body -notmatch 'Essentials Hairstyling Set') { throw 'Essentials set name missing in production.' }
if ($body -notmatch 'Baby Hairstyling Set') { throw 'Baby set name missing in production.' }
if ($body -notmatch 'repeat\(4, minmax\(0, 1fr\)\)') { throw 'Four-column grid missing in production.' }
if ($body -match 'single-products-title|set-products-title') { throw 'Separated Shop sections remain in production.' }
```

Expected: command exits successfully without throwing.

- [ ] **Step 4: Complete review and report the browser limitation accurately**

Review the committed diff against the design, rerun verification-before-completion, and report the production URL. If the app browser runtime still fails to connect, do not claim live visual inspection; cite the production HTML checks instead.
