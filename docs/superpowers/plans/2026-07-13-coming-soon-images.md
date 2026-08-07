# Coming Soon Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's three “Coming Soon” placeholders with the supplied photos in consistent 3:4 responsive frames.

**Architecture:** Keep the existing home-page section and responsive grid. Store the three source files as stable site assets, render them as semantic informative images, and use a focused CSS class for 3:4 cover cropping.

**Tech Stack:** Static HTML/CSS, PNG assets, Node.js test runner, html-validate.

---

### Task 1: Lock the three-image contract with a failing test

**Files:**
- Modify: `tests/site-integration.test.js`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Add a test for the new asset references and 3:4 styling**

```js
test("the Coming Soon section renders the supplied photos at a 3:4 ratio", async () => {
  const home = await readFile("index.html", "utf8");
  assert.doesNotMatch(home, /coming-placeholder|Photo 0[1-3]/);
  assert.match(home, /assets\/coming-soon-blue-shelf\.png/);
  assert.match(home, /assets\/coming-soon-pink-bag\.png/);
  assert.match(home, /assets\/coming-soon-brown-clip\.png/);
  assert.match(home, /\.coming-photo\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/s);
  assert.match(home, /\.coming-photo img\s*\{[^}]*object-fit:\s*cover/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/site-integration.test.js`

Expected: FAIL because the page still contains placeholders and does not reference the three photo assets.

### Task 2: Add the supplied assets and replace the placeholders

**Files:**
- Create: `assets/coming-soon-blue-shelf.png`
- Create: `assets/coming-soon-pink-bag.png`
- Create: `assets/coming-soon-brown-clip.png`
- Modify: `index.html:312-330`
- Modify: `index.html:833-837`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Copy the supplied images into stable asset paths without altering the originals**

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\AppData\Local\Temp\codex-clipboard-91546e0d-6a26-4e74-9b33-929886608207.png' -Destination 'assets\coming-soon-blue-shelf.png'
Copy-Item -LiteralPath 'C:\Users\limin\AppData\Local\Temp\codex-clipboard-1ace1d94-c5d6-4248-994e-44f87ebcf07e.png' -Destination 'assets\coming-soon-pink-bag.png'
Copy-Item -LiteralPath 'C:\Users\limin\AppData\Local\Temp\codex-clipboard-07c254e5-f9f9-4c9f-a3db-4da8fda587f2.png' -Destination 'assets\coming-soon-brown-clip.png'
```

- [ ] **Step 2: Replace the placeholder CSS with a 3:4 photo frame**

```css
.coming-photo {
  aspect-ratio: 3 / 4;
  border: 1px solid rgba(191, 111, 135, 0.72);
  margin: 0;
  overflow: hidden;
}

.coming-photo img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}
```

- [ ] **Step 3: Replace the three placeholder elements with informative images in supplied order**

```html
<div class="coming-grid">
  <figure class="coming-photo">
    <img src="assets/coming-soon-blue-shelf.png" alt="Blue floral claw clips styled with haircare products on cream shelves" loading="lazy">
  </figure>
  <figure class="coming-photo">
    <img src="assets/coming-soon-pink-bag.png" alt="Pink pearl claw clip and flower clips styled with haircare products inside a fabric bag" loading="lazy">
  </figure>
  <figure class="coming-photo">
    <img src="assets/coming-soon-brown-clip.png" alt="Brown rhinestone flower claw clip styled with hair mist and lip tint on white fabric" loading="lazy">
  </figure>
</div>
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/site-integration.test.js`

Expected: all site integration tests pass.

- [ ] **Step 5: Commit the focused implementation**

```powershell
git add -- index.html tests/site-integration.test.js assets/coming-soon-blue-shelf.png assets/coming-soon-pink-bag.png assets/coming-soon-brown-clip.png
git commit -m "feat: add coming soon product photos"
```

### Task 3: Verify the page and repository

**Files:**
- Verify: `index.html`
- Verify: `assets/coming-soon-blue-shelf.png`
- Verify: `assets/coming-soon-pink-bag.png`
- Verify: `assets/coming-soon-brown-clip.png`

- [ ] **Step 1: Run the complete automated suite**

Run: `npm.cmd test`

Expected: zero failing tests.

- [ ] **Step 2: Validate the site HTML**

Run: `npx.cmd --yes html-validate@latest index.html shop.html customize.html`

Expected: exit code 0 with no validation errors.

- [ ] **Step 3: Confirm each image resolves over the local HTTP server**

```powershell
$server = Start-Process -FilePath python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
try {
  Start-Sleep -Milliseconds 750
  @('index.html','assets/coming-soon-blue-shelf.png','assets/coming-soon-pink-bag.png','assets/coming-soon-brown-clip.png') | ForEach-Object {
    $response = Invoke-WebRequest -UseBasicParsing -Uri ("http://127.0.0.1:8765/" + $_)
    if ($response.StatusCode -ne 200) { throw "Unexpected status for $_" }
  }
} finally {
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}
```

Expected: command exits successfully and all four requests return 200.
