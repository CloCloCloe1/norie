# Set Card Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the visible carousel position on Shop and Homepage, align Homepage set names with Shop, and remove Homepage set descriptions.

**Architecture:** Keep the existing carousel markup and JavaScript so screen readers still receive slide-position updates. Change only page-local HTML/CSS and regression tests: both status elements use a standard visually-hidden CSS pattern, while Homepage copy and accessible control labels are updated in place.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript carousel controller, Node.js built-in test runner.

---

### Task 1: Add regression coverage for the approved set-card presentation

**Files:**
- Modify: `tests/set-carousel.test.js`

- [ ] **Step 1: Update the Homepage carousel test with the approved copy**

Replace the old Homepage name assertions in `homepage renders the two updated set carousels` and add assertions for accessible labels and absent descriptions:

```js
assert.match(html, /ESSENTIALS HAIRSTYLING SET/);
assert.match(html, /BABY HAIRSTYLING SET/);
assert.match(html, /Previous Essentials Hairstyling Set image/);
assert.match(html, /Next Essentials Hairstyling Set image/);
assert.match(html, /Previous Baby Hairstyling Set image/);
assert.match(html, /Next Baby Hairstyling Set image/);
assert.doesNotMatch(html, /A limited-edition bamboo paddle brush and claw clip pairing with one free gift\./);
assert.doesNotMatch(html, /A limited-edition flat brush and claw clip pairing with one free gift\./);
```

- [ ] **Step 2: Add a failing visual-status regression test**

Add this test to verify that both pages retain two status elements but visually clip them instead of using a visible overlay:

```js
test("Shop and Homepage visually hide carousel status while keeping accessible updates", () => {
  for (const page of ["index.html", "shop.html"]) {
    const html = readFileSync(page, "utf8");
    const statusRule = html.match(/\.set-carousel-status\s*\{([^}]+)\}/)?.[1] ?? "";

    assert.equal((html.match(/data-carousel-status/g) ?? []).length, 2);
    assert.match(statusRule, /clip-path:\s*inset\(50%\)/);
    assert.match(statusRule, /height:\s*1px/);
    assert.match(statusRule, /overflow:\s*hidden/);
    assert.match(statusRule, /white-space:\s*nowrap/);
    assert.match(statusRule, /width:\s*1px/);
    assert.doesNotMatch(statusRule, /display:\s*none/);
  }
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
node --test tests/set-carousel.test.js
```

Expected: FAIL because Homepage still uses the old names and both pages still render `.set-carousel-status` as a visible bottom overlay.

- [ ] **Step 4: Commit the failing regression test**

```powershell
git add tests/set-carousel.test.js
git commit -m "test: cover hidden carousel status and homepage copy"
```

### Task 2: Implement the minimal HTML and CSS cleanup

**Files:**
- Modify: `index.html`
- Modify: `shop.html`
- Test: `tests/set-carousel.test.js`

- [ ] **Step 1: Replace the visible status style on both pages**

In both `index.html` and `shop.html`, replace the `.set-carousel-status` declaration with:

```css
.set-carousel-status {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

Keep `.set-carousel-status[hidden] { display: none; }` unchanged so the status enters the accessibility tree only after the carousel initializes.

- [ ] **Step 2: Update the first Homepage set card**

Use the new accessible control labels and name, and remove its description:

```html
<button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Essentials Hairstyling Set image" hidden><span aria-hidden="true">&#8592;</span></button>
<button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Essentials Hairstyling Set image" hidden><span aria-hidden="true">&#8594;</span></button>
```

```html
<h3 id="home-set-1-title">ESSENTIALS HAIRSTYLING SET</h3>
<p class="price">CAD $38 <span class="original-price">CAD $48</span></p>
```

- [ ] **Step 3: Update the second Homepage set card**

Use the new accessible control labels and name, and remove its description:

```html
<button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Baby Hairstyling Set image" hidden><span aria-hidden="true">&#8592;</span></button>
<button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Baby Hairstyling Set image" hidden><span aria-hidden="true">&#8594;</span></button>
```

```html
<h3 id="home-set-2-title">BABY HAIRSTYLING SET</h3>
<p class="price">CAD $32 <span class="original-price">CAD $40</span></p>
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/set-carousel.test.js
```

Expected: all tests in `tests/set-carousel.test.js` PASS, including the existing JavaScript assertion that the status text updates to `1 / 2`.

- [ ] **Step 5: Run the complete test suite**

Run:

```powershell
npm.cmd test
```

Expected: all tests PASS with no failures.

- [ ] **Step 6: Commit the implementation**

```powershell
git add index.html shop.html
git commit -m "fix: hide carousel status and align homepage sets"
```

### Task 3: Publish and verify production

**Files:**
- Verify: `index.html`
- Verify: `shop.html`

- [ ] **Step 1: Push the PR branch**

```powershell
git push origin codex/shop-unified-grid-pr
```

Expected: the existing pull request updates with the new commits.

- [ ] **Step 2: Deploy the linked Vercel project to production**

```powershell
& 'C:\Users\limin\AppData\Local\npm-cache\_npx\69f9afb961c37556\node_modules\.bin\vercel.cmd' --prod --yes
```

Expected: Vercel reports a successful production deployment and aliases it to `https://norie-hair.vercel.app/`.

- [ ] **Step 3: Verify the production pages**

Fetch `https://norie-hair.vercel.app/` and `https://norie-hair.vercel.app/shop.html`, then verify:

```text
Homepage contains ESSENTIALS HAIRSTYLING SET and BABY HAIRSTYLING SET.
Homepage does not contain either removed limited-edition description.
Both pages retain two data-carousel-status elements.
Both pages contain the visually-hidden clip-path: inset(50%) status rule.
```

- [ ] **Step 4: Confirm the worktree is clean**

```powershell
git status --short
```

Expected: no output.
