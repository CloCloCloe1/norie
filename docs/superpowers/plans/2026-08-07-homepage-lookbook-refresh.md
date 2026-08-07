# Homepage Lookbook Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the specified Homepage lookbook images, preserve the current 3:4 presentation, remove Coming Soon, and publish the result to Vercel production.

**Architecture:** Keep the Homepage as static HTML with deployable assets stored in `assets/`. Tests inspect the real HTML and asset files, locking the exact image order and ensuring the removed section leaves no markup or dedicated CSS behind.

**Tech Stack:** Static HTML/CSS, Node.js built-in test runner, Git, Vercel CLI.

---

### Task 1: Lock the new Homepage contract with failing tests

**Files:**
- Modify: `tests/site-integration.test.js`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Replace the lookbook test with exact new asset expectations**

Change the lookbook test so it checks these three new deployable assets and this exact order:

```js
test("the Homepage uses the supplied lifestyle photos in the approved lookbook positions", async () => {
  const html = await read("index.html");

  await access("assets/pink-lookbook-hair-clip.jpg");
  await access("assets/pink-lookbook-bag-detail.jpg");
  await access("assets/white-lookbook-norie-clip.png");

  assert.match(
    html,
    /pink-lookbook-hair-clip\.jpg[^>]+alt="Ballet pink claw clip styled in long dark hair with a pink handbag"[\s\S]*pink-lookbook-bag-detail\.jpg[^>]+alt="Pink handbag styled with a satin scrunchie and white flower accessory"[\s\S]*pink-lookbook-accessories\.png/i
  );
  assert.match(
    html,
    /white-lookbook-spray\.png[\s\S]*white-lookbook-norie-clip\.png[^>]+alt="Pearl white Norie claw clip with pink crystal lettering styled on embroidered fabric"[\s\S]*white-lookbook-accessories\.png/i
  );
  assert.match(html, /\.lookbook-photo\s*\{[\s\S]*aspect-ratio:\s*3\s*\/\s*4;/i);
  assert.match(html, /\.lookbook-photo\s*\{[\s\S]*object-fit:\s*cover;/i);
});
```

- [ ] **Step 2: Replace the Coming Soon presence test with an absence test**

```js
test("the Homepage omits the Coming Soon section and its dedicated styles", async () => {
  const home = await read("index.html");

  assert.doesNotMatch(home, /coming-soon-title|Coming Soon|coming-grid|coming-photo/i);
  assert.doesNotMatch(home, /coming-soon-blue-shelf|coming-soon-pink-bag|coming-soon-brown-clip/i);
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run: `node --test tests/site-integration.test.js`

Expected: FAIL because the three new asset files and Homepage references do not exist, while Coming Soon is still present.

### Task 2: Add the approved assets and update the Homepage

**Files:**
- Create: `assets/pink-lookbook-hair-clip.jpg`
- Create: `assets/pink-lookbook-bag-detail.jpg`
- Create: `assets/white-lookbook-norie-clip.png`
- Modify: `index.html`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Copy the supplied source images into deployable assets**

Run from `C:\Users\limin\Documents\Norie-pr`:

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\Desktop\Norie\图片_20260727103005_2_1.jpg' -Destination 'assets\pink-lookbook-hair-clip.jpg'
Copy-Item -LiteralPath 'C:\Users\limin\Desktop\Norie\图片_20260727103003_1_1.jpg' -Destination 'assets\pink-lookbook-bag-detail.jpg'
Copy-Item -LiteralPath 'C:\Users\limin\Desktop\Norie\Codex 图像 2026年8月4日 16_48_23.png' -Destination 'assets\white-lookbook-norie-clip.png'
```

- [ ] **Step 2: Replace the exact lookbook image elements**

Use these three elements in `index.html`, preserving the current third images:

```html
<img class="lookbook-photo" src="assets/pink-lookbook-hair-clip.jpg" alt="Ballet pink claw clip styled in long dark hair with a pink handbag">
<img class="lookbook-photo" src="assets/pink-lookbook-bag-detail.jpg" alt="Pink handbag styled with a satin scrunchie and white flower accessory">
<img class="lookbook-photo" src="assets/white-lookbook-norie-clip.png" alt="Pearl white Norie claw clip with pink crystal lettering styled on embroidered fabric">
```

- [ ] **Step 3: Remove Coming Soon markup and dedicated CSS**

Delete the complete `<section class="section coming-soon" ...>` block. Delete the `.coming-grid`, `.coming-photo`, and `.coming-photo img` rules, plus `.coming-grid` entries in both responsive selector groups. Do not remove the supplied image files already in `assets/`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/site-integration.test.js`

Expected: all tests in the file pass.

- [ ] **Step 5: Commit the implementation**

```powershell
git add -- index.html tests/site-integration.test.js assets/pink-lookbook-hair-clip.jpg assets/pink-lookbook-bag-detail.jpg assets/white-lookbook-norie-clip.png
git commit -m "feat: refresh homepage lookbook"
```

### Task 3: Verify, push, deploy, and inspect production

**Files:**
- Verify: all tracked project files

- [ ] **Step 1: Run complete local verification**

Run:

```powershell
npm.cmd test
git diff --check
git status --short
```

Expected: all tests pass, `git diff --check` prints nothing, and the worktree is clean after committing.

- [ ] **Step 2: Push the existing feature branch**

Run: `git push origin codex/shop-unified-grid-pr`

Expected: remote branch advances to the Homepage implementation commit.

- [ ] **Step 3: Deploy to Vercel production**

Run:

```powershell
& 'C:\Users\limin\AppData\Local\npm-cache\_npx\69f9afb961c37556\node_modules\.bin\vercel.cmd' --prod --yes
```

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 4: Verify the live Homepage**

Fetch the production Homepage with a cache-busting query and assert that all three new asset filenames are present, `Coming Soon` and `coming-grid` are absent, and each asset URL returns HTTP 200.
