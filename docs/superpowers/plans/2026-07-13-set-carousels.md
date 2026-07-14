# Homepage and Shop Set Carousels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two old set cards on the homepage and Shop page with accurate limited-edition brush-and-clip content and accessible two-image 3:4 carousels.

**Architecture:** Both pages keep their existing card layouts but use the same carousel markup contract and a shared `norie-carousel.js` progressive-enhancement module. Native horizontal scroll snap provides touch/trackpad navigation without JavaScript; the module adds wrapping previous/next buttons, position synchronization, and reduced-motion-aware scrolling.

**Tech Stack:** Static HTML/CSS, browser-native ES modules, Node.js built-in test runner, Vercel static hosting.

---

## File map

- Create `norie-carousel.js`: shared carousel indexing and browser interaction logic.
- Create `tests/set-carousel.test.js`: pure navigation tests plus static integration checks for both pages.
- Modify `tests/project-structure.test.js`: require the shared script and four new production assets.
- Modify `index.html`: homepage set copy, carousel markup/styles, and module reference.
- Modify `shop.html`: Shop set copy, carousel markup/styles, and module reference.
- Create `assets/set-bamboo-white.png`, `assets/set-bamboo-pink.png`, `assets/set-flat-white.png`, and `assets/set-flat-pink.png`: URL-safe copies of the supplied images.

### Task 1: Add the four production image assets

**Files:**
- Modify: `tests/project-structure.test.js`
- Create: `assets/set-bamboo-white.png`
- Create: `assets/set-bamboo-pink.png`
- Create: `assets/set-flat-white.png`
- Create: `assets/set-flat-pink.png`

- [ ] **Step 1: Extend the required-file test**

Add these entries to `requiredFiles` in `tests/project-structure.test.js`:

```js
  "assets/set-bamboo-white.png",
  "assets/set-bamboo-pink.png",
  "assets/set-flat-white.png",
  "assets/set-flat-pink.png",
```

- [ ] **Step 2: Run the structure test and verify it fails**

Run: `node --test tests/project-structure.test.js`

Expected: FAIL listing the four new asset paths as missing.

- [ ] **Step 3: Copy the supplied files to URL-safe asset names**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\Limited Edition Hiar Styling Set (1).png' -Destination 'assets\set-bamboo-white.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\Limited Edition Hiar Styling Set (2).png' -Destination 'assets\set-bamboo-pink.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\Limited Edition Hiar Styling Set 副本.png' -Destination 'assets\set-flat-white.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\Limited Edition Hiar Styling Set 副本 (1).png' -Destination 'assets\set-flat-pink.png'
```

- [ ] **Step 4: Verify the four PNG files are readable and record their dimensions**

Run a PowerShell script using `System.Drawing.Image::FromFile` and record each image's width and height. The supplied files are 1414 by 2000; the required 3:4 presentation is created by the CSS carousel viewport with centered `object-fit: cover` cropping.

Expected: all four files load successfully and report 1414 by 2000. Rerunning `node --test tests/project-structure.test.js` reports PASS.

- [ ] **Step 5: Commit the asset and structure-test work**

```powershell
git add tests/project-structure.test.js assets/set-bamboo-white.png assets/set-bamboo-pink.png assets/set-flat-white.png assets/set-flat-pink.png
git commit -m "test: require limited edition set assets"
```

### Task 2: Build the shared carousel controller

**Files:**
- Create: `norie-carousel.js`
- Create: `tests/set-carousel.test.js`
- Modify: `tests/project-structure.test.js`

- [ ] **Step 1: Write failing wraparound tests**

Create `tests/set-carousel.test.js`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { wrappedSlideIndex } from "../norie-carousel.js";

test("wrappedSlideIndex moves forward and wraps", () => {
  assert.equal(wrappedSlideIndex(0, 1, 2), 1);
  assert.equal(wrappedSlideIndex(1, 1, 2), 0);
});

test("wrappedSlideIndex moves backward and handles empty tracks", () => {
  assert.equal(wrappedSlideIndex(0, -1, 2), 1);
  assert.equal(wrappedSlideIndex(1, -1, 2), 0);
  assert.equal(wrappedSlideIndex(0, 1, 0), 0);
});
```

Also add `"norie-carousel.js"` to `requiredFiles` in `tests/project-structure.test.js`.

- [ ] **Step 2: Run the targeted tests and verify they fail**

Run: `node --test tests/set-carousel.test.js tests/project-structure.test.js`

Expected: FAIL because `norie-carousel.js` does not exist.

- [ ] **Step 3: Implement the shared progressive-enhancement module**

Create `norie-carousel.js`:

```js
export function wrappedSlideIndex(currentIndex, direction, slideCount) {
  if (slideCount <= 0) return 0;
  return (currentIndex + direction + slideCount) % slideCount;
}

export function initializeCarousel(carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const status = carousel.querySelector("[data-carousel-status]");

  if (!track || slides.length < 2 || !previous || !next || !status) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentIndex = 0;
  let scrollFrame = 0;

  previous.hidden = false;
  next.hidden = false;
  status.hidden = false;

  function updateStatus() {
    status.textContent = `${currentIndex + 1} / ${slides.length}`;
  }

  function showSlide(index) {
    currentIndex = index;
    track.scrollTo({
      left: currentIndex * track.clientWidth,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    updateStatus();
  }

  previous.addEventListener("click", () => {
    showSlide(wrappedSlideIndex(currentIndex, -1, slides.length));
  });

  next.addEventListener("click", () => {
    showSlide(wrappedSlideIndex(currentIndex, 1, slides.length));
  });

  track.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      if (track.clientWidth <= 0) return;
      currentIndex = Math.max(0, Math.min(
        slides.length - 1,
        Math.round(track.scrollLeft / track.clientWidth)
      ));
      updateStatus();
    });
  }, { passive: true });

  updateStatus();
}

export function initializeCarousels(root = document) {
  root.querySelectorAll("[data-carousel]").forEach(initializeCarousel);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initializeCarousels());
  } else {
    initializeCarousels();
  }
}
```

- [ ] **Step 4: Run the targeted tests and verify they pass**

Run: `node --test tests/set-carousel.test.js tests/project-structure.test.js`

Expected: 3 tests PASS with no failures.

- [ ] **Step 5: Commit the controller**

```powershell
git add norie-carousel.js tests/set-carousel.test.js tests/project-structure.test.js
git commit -m "feat: add shared set carousel controller"
```

### Task 3: Replace the homepage set cards

**Files:**
- Modify: `tests/set-carousel.test.js`
- Modify: `index.html`

- [ ] **Step 1: Add a failing homepage integration test**

Append to `tests/set-carousel.test.js`:

```js
import { readFileSync } from "node:fs";

test("homepage renders the two updated set carousels", () => {
  const html = readFileSync("index.html", "utf8");

  assert.match(html, /First month limited edition\./);
  assert.match(html, /Bamboo Paddle Brush \+ Claw Clip/);
  assert.match(html, /Flat Brush \+ Claw Clip/);
  assert.match(html, /set-bamboo-white\.png/);
  assert.match(html, /set-bamboo-pink\.png/);
  assert.match(html, /set-flat-white\.png/);
  assert.match(html, /set-flat-pink\.png/);
  assert.equal((html.match(/data-carousel/g) ?? []).length >= 2, true);
  assert.match(html, /<script type="module" src="norie-carousel\.js"><\/script>/);
});
```

- [ ] **Step 2: Run the homepage test and verify it fails**

Run: `node --test tests/set-carousel.test.js`

Expected: the homepage integration test FAILS because `index.html` still contains the old products.

- [ ] **Step 3: Add the reusable carousel styles to `index.html`**

Replace the square set-image override with these styles near the existing product-card rules:

```css
      .set-carousel {
        aspect-ratio: 3 / 4;
        background: #f8f1ef;
        overflow: hidden;
        position: relative;
      }

      .set-carousel-track {
        display: flex;
        height: 100%;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
      }

      .set-carousel-track::-webkit-scrollbar {
        display: none;
      }

      .set-carousel-slide {
        flex: 0 0 100%;
        height: 100%;
        object-fit: cover;
        scroll-snap-align: start;
        width: 100%;
      }

      .set-carousel-button {
        align-items: center;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid var(--berry);
        border-radius: 999px;
        color: var(--berry);
        cursor: pointer;
        display: inline-flex;
        font-size: 1.25rem;
        height: 2.75rem;
        justify-content: center;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 2.75rem;
      }

      .set-carousel-button[data-carousel-previous] { left: 0.75rem; }
      .set-carousel-button[data-carousel-next] { right: 0.75rem; }

      .set-carousel-button[hidden],
      .set-carousel-status[hidden] {
        display: none;
      }

      .set-carousel-button:focus-visible {
        outline: 3px solid var(--berry);
        outline-offset: 3px;
      }

      .set-carousel-status {
        background: rgba(255, 255, 255, 0.92);
        bottom: 0.75rem;
        color: var(--berry);
        font-size: 0.78rem;
        font-weight: 800;
        left: 50%;
        padding: 0.35rem 0.65rem;
        position: absolute;
        transform: translateX(-50%);
      }
```

- [ ] **Step 4: Replace the homepage section markup**

Use `First month limited edition.` for the intro. Give each `<h3>` a stable ID and replace each `.product-image` with this pattern, using the correct pair of images and product ID:

```html
<div class="set-carousel" data-carousel role="region" aria-labelledby="home-set-1-title">
  <div class="set-carousel-track" data-carousel-track>
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-bamboo-white.png" alt="White limited-edition bamboo paddle brush and cream claw clip set">
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-bamboo-pink.png" alt="Pink limited-edition bamboo paddle brush and pink claw clip set">
  </div>
  <button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Bamboo Paddle Brush and Claw Clip image" hidden><span aria-hidden="true">&#8592;</span></button>
  <button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Bamboo Paddle Brush and Claw Clip image" hidden><span aria-hidden="true">&#8594;</span></button>
  <span class="set-carousel-status" data-carousel-status hidden>1 / 2</span>
</div>
```

Set the card content to the exact names, descriptions, and prices from the design spec. Replace the Set 2 image with this complete structure:

```html
<div class="set-carousel" data-carousel role="region" aria-labelledby="home-set-2-title">
  <div class="set-carousel-track" data-carousel-track>
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-flat-white.png" alt="White limited-edition flat brush and floral cream claw clip set">
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-flat-pink.png" alt="Pink limited-edition flat brush and pink claw clip set">
  </div>
  <button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Flat Brush and Claw Clip image" hidden><span aria-hidden="true">&#8592;</span></button>
  <button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Flat Brush and Claw Clip image" hidden><span aria-hidden="true">&#8594;</span></button>
  <span class="set-carousel-status" data-carousel-status hidden>1 / 2</span>
</div>
```

Set its heading ID to `home-set-2-title` and use the exact Set 2 name, description, and prices from the spec.

Add this before `</body>`:

```html
<script type="module" src="norie-carousel.js"></script>
```

- [ ] **Step 5: Run the targeted test and verify it passes**

Run: `node --test tests/set-carousel.test.js`

Expected: all carousel unit tests and the homepage integration test PASS.

- [ ] **Step 6: Commit the homepage update**

```powershell
git add index.html tests/set-carousel.test.js
git commit -m "feat: update homepage limited edition sets"
```

### Task 4: Replace the Shop page set cards

**Files:**
- Modify: `tests/set-carousel.test.js`
- Modify: `shop.html`

- [ ] **Step 1: Add a failing Shop page integration test**

Append to `tests/set-carousel.test.js`:

```js
test("Shop page renders the two updated set carousels", () => {
  const html = readFileSync("shop.html", "utf8");

  assert.match(html, /First month limited edition\./);
  assert.match(html, /Bamboo Paddle Brush \+ Claw Clip/);
  assert.match(html, /Flat Brush \+ Claw Clip/);
  assert.match(html, /set-bamboo-white\.png/);
  assert.match(html, /set-bamboo-pink\.png/);
  assert.match(html, /set-flat-white\.png/);
  assert.match(html, /set-flat-pink\.png/);
  assert.match(html, /href="customize\.html">Build this set<\/a>/);
  assert.match(html, /<script type="module" src="norie-carousel\.js"><\/script>/);
});
```

- [ ] **Step 2: Run the Shop page test and verify it fails**

Run: `node --test tests/set-carousel.test.js`

Expected: the Shop page integration test FAILS because `shop.html` still contains the old products.

- [ ] **Step 3: Add the carousel styles to `shop.html`**

Insert these rules near the existing `.product-image` rules:

```css
      .set-carousel {
        aspect-ratio: 3 / 4;
        background: #f8f1ef;
        overflow: hidden;
        position: relative;
      }

      .set-carousel-track {
        display: flex;
        height: 100%;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
      }

      .set-carousel-track::-webkit-scrollbar {
        display: none;
      }

      .set-carousel-slide {
        flex: 0 0 100%;
        height: 100%;
        object-fit: cover;
        scroll-snap-align: start;
        width: 100%;
      }

      .set-carousel-button {
        align-items: center;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid var(--berry);
        border-radius: 999px;
        color: var(--berry);
        cursor: pointer;
        display: inline-flex;
        font-size: 1.25rem;
        height: 2.75rem;
        justify-content: center;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 2.75rem;
      }

      .set-carousel-button[data-carousel-previous] { left: 0.75rem; }
      .set-carousel-button[data-carousel-next] { right: 0.75rem; }

      .set-carousel-button[hidden],
      .set-carousel-status[hidden] {
        display: none;
      }

      .set-carousel-button:focus-visible {
        outline: 3px solid var(--berry);
        outline-offset: 3px;
      }

      .set-carousel-status {
        background: rgba(255, 255, 255, 0.92);
        bottom: 0.75rem;
        color: var(--berry);
        font-size: 0.78rem;
        font-weight: 800;
        left: 50%;
        padding: 0.35rem 0.65rem;
        position: absolute;
        transform: translateX(-50%);
      }
```

- [ ] **Step 4: Replace the Shop set-section markup**

Use `First month limited edition.` for the section intro. For Set 1, replace the old image with:

```html
<div class="set-carousel" data-carousel role="region" aria-labelledby="shop-set-1-title">
  <div class="set-carousel-track" data-carousel-track>
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-bamboo-white.png" alt="White limited-edition bamboo paddle brush and cream claw clip set">
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-bamboo-pink.png" alt="Pink limited-edition bamboo paddle brush and pink claw clip set">
  </div>
  <button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Bamboo Paddle Brush and Claw Clip image" hidden><span aria-hidden="true">&#8592;</span></button>
  <button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Bamboo Paddle Brush and Claw Clip image" hidden><span aria-hidden="true">&#8594;</span></button>
  <span class="set-carousel-status" data-carousel-status hidden>1 / 2</span>
</div>
```

Set the heading ID to `shop-set-1-title` and use the exact Set 1 name, description, prices, and existing `Build this set` link from the spec. Replace the Set 2 image with this complete structure:

```html
<div class="set-carousel" data-carousel role="region" aria-labelledby="shop-set-2-title">
  <div class="set-carousel-track" data-carousel-track>
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-flat-white.png" alt="White limited-edition flat brush and floral cream claw clip set">
    <img class="set-carousel-slide" data-carousel-slide src="assets/set-flat-pink.png" alt="Pink limited-edition flat brush and pink claw clip set">
  </div>
  <button class="set-carousel-button" type="button" data-carousel-previous aria-label="Previous Flat Brush and Claw Clip image" hidden><span aria-hidden="true">&#8592;</span></button>
  <button class="set-carousel-button" type="button" data-carousel-next aria-label="Next Flat Brush and Claw Clip image" hidden><span aria-hidden="true">&#8594;</span></button>
  <span class="set-carousel-status" data-carousel-status hidden>1 / 2</span>
</div>
```

Set its heading ID to `shop-set-2-title` and use the exact Set 2 name, description, prices, and existing `Build this set` link from the spec.

Add this before `</body>`:

```html
<script type="module" src="norie-carousel.js"></script>
```

- [ ] **Step 5: Run the targeted tests and verify they pass**

Run: `node --test tests/set-carousel.test.js`

Expected: four tests PASS with no failures.

- [ ] **Step 6: Commit the Shop page update**

```powershell
git add shop.html tests/set-carousel.test.js
git commit -m "feat: update Shop limited edition sets"
```

### Task 5: Accessibility, responsive, and production verification

**Files:**
- Verify: `index.html`
- Verify: `shop.html`
- Verify: `norie-carousel.js`
- Verify: `assets/set-bamboo-white.png`
- Verify: `assets/set-bamboo-pink.png`
- Verify: `assets/set-flat-white.png`
- Verify: `assets/set-flat-pink.png`

- [ ] **Step 1: Run the full automated suite**

Run: `npm.cmd test`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run repository checks**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors. Only intentional task changes or pre-existing unrelated untracked files appear.

- [ ] **Step 3: Start a local static server**

Run from the project root in a hidden background process:

```powershell
Start-Process -FilePath 'python' -ArgumentList '-m','http.server','4173' -WorkingDirectory (Get-Location) -WindowStyle Hidden
```

Expected: `http://127.0.0.1:4173/index.html` and `http://127.0.0.1:4173/shop.html` return HTTP 200.

- [ ] **Step 4: Verify both pages visually and interactively**

Using the in-app browser, inspect both URLs at desktop width and approximately 390px mobile width. Confirm:

- Both cards use 3:4 image viewports with no page-level horizontal overflow.
- Each arrow changes exactly one image and wraps from image 2 to image 1.
- The `1 / 2` label updates after arrow clicks and touch/trackpad scrolling.
- Tab reaches both arrow buttons in logical order and the focus ring is visible.
- The Shop page keeps both `Build this set` links targeting `customize.html`.
- Disabling JavaScript leaves each image track manually horizontally scrollable.

Expected: all checks pass on both pages. If a check fails, add a focused failing test where practical, make the minimal fix, rerun `npm.cmd test`, and commit the fix with `git commit -m "fix: polish set carousel behavior"`.

- [ ] **Step 5: Deploy to Vercel production**

Run: `npx.cmd --yes vercel@latest --prod --yes`

Expected: deployment succeeds and the production alias is `https://norie-hair.vercel.app`.

- [ ] **Step 6: Verify production pages and assets**

Open and verify:

```text
https://norie-hair.vercel.app/
https://norie-hair.vercel.app/shop.html
https://norie-hair.vercel.app/assets/set-bamboo-white.png
https://norie-hair.vercel.app/assets/set-bamboo-pink.png
https://norie-hair.vercel.app/assets/set-flat-white.png
https://norie-hair.vercel.app/assets/set-flat-pink.png
```

Expected: both pages render the updated carousels and every asset URL returns HTTP 200.

- [ ] **Step 7: Record final verification evidence**

Run:

```powershell
npm.cmd test
git log -5 --oneline
git status --short
```

Expected: the final test run passes; the task commits are visible; no unexpected tracked changes remain.
