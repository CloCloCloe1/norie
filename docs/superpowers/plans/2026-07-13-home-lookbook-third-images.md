# Homepage Lookbook Third Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the third homepage image in both the pink and white lookbook strips with the supplied 3:4 accessory collection images.

**Architecture:** Add an integration test that fixes the first two images and the new third source/alt text for each section. Copy the supplied images unchanged into stable project asset paths, update only the two third `<img>` elements, then verify and deploy.

**Tech Stack:** Static HTML, PNG assets, Node.js built-in test runner, Vercel

---

### Task 1: Replace Both Third Lookbook Images

**Files:**
- Modify: `tests/site-integration.test.js`
- Modify: `index.html`
- Create: `assets/pink-lookbook-accessories.png`
- Create: `assets/white-lookbook-accessories.png`

- [ ] **Step 1: Write the failing integration test**

Add this test to `tests/site-integration.test.js`:

```js
test("the pink and white lookbooks use the supplied 3:4 accessory images third", async () => {
  const html = await read("index.html");

  await access("assets/pink-lookbook-accessories.png");
  await access("assets/white-lookbook-accessories.png");

  assert.match(
    html,
    /pink-lookbook-bag\.png[\s\S]*pink-lookbook-car\.png[\s\S]*pink-lookbook-accessories\.png[^>]+alt="A curated collection of pink combs, claw clips, scrunchies, and hair accessories"/i
  );
  assert.match(
    html,
    /white-lookbook-spray\.png[\s\S]*white-lookbook-cafe\.png[\s\S]*white-lookbook-accessories\.png[^>]+alt="A curated collection of pearl white combs, claw clips, scrunchies, and hair accessories"/i
  );
  assert.match(html, /\.lookbook-photo\s*\{[\s\S]*aspect-ratio:\s*3\s*\/\s*4;/i);
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```powershell
node --test --test-name-pattern="lookbooks use the supplied" tests/site-integration.test.js
```

Expected: FAIL with `ENOENT` because the two new project assets do not exist.

- [ ] **Step 3: Copy the supplied images unchanged**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\未命名的设计 (17).png' -Destination 'C:\Users\limin\Documents\Norie\assets\pink-lookbook-accessories.png'
Copy-Item -LiteralPath 'C:\Users\limin\Downloads\未命名的设计 (16).png' -Destination 'C:\Users\limin\Documents\Norie\assets\white-lookbook-accessories.png'
```

- [ ] **Step 4: Update only the two third image elements**

In `index.html`, replace the pink third image with:

```html
<img class="lookbook-photo" src="assets/pink-lookbook-accessories.png" alt="A curated collection of pink combs, claw clips, scrunchies, and hair accessories">
```

Replace the white third image with:

```html
<img class="lookbook-photo" src="assets/white-lookbook-accessories.png" alt="A curated collection of pearl white combs, claw clips, scrunchies, and hair accessories">
```

- [ ] **Step 5: Run the focused and complete tests**

Run:

```powershell
node --test --test-name-pattern="lookbooks use the supplied" tests/site-integration.test.js
npm.cmd test
```

Expected: focused test and complete test suite PASS.

- [ ] **Step 6: Commit the replacements**

```powershell
git add index.html tests/site-integration.test.js assets/pink-lookbook-accessories.png assets/white-lookbook-accessories.png
git commit -m "feat: replace homepage lookbook images"
```

### Task 2: Validate and Deploy Production

**Files:**
- Verify: `index.html`
- Verify: `assets/pink-lookbook-accessories.png`
- Verify: `assets/white-lookbook-accessories.png`

- [ ] **Step 1: Run static verification**

Run:

```powershell
npx.cmd --yes html-validate@latest index.html
git diff --check
```

Expected: both commands exit 0.

- [ ] **Step 2: Deploy production**

Run:

```powershell
npx.cmd --yes vercel@latest --prod --yes
```

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify both production assets and homepage references**

Run:

```powershell
$pink = Invoke-WebRequest -Uri 'https://norie-hair.vercel.app/assets/pink-lookbook-accessories.png' -UseBasicParsing
$white = Invoke-WebRequest -Uri 'https://norie-hair.vercel.app/assets/white-lookbook-accessories.png' -UseBasicParsing
$home = Invoke-WebRequest -Uri 'https://norie-hair.vercel.app/' -UseBasicParsing
if ($pink.StatusCode -ne 200 -or $white.StatusCode -ne 200) { throw 'Production lookbook asset verification failed' }
if (-not $home.Content.Contains('pink-lookbook-accessories.png') -or -not $home.Content.Contains('white-lookbook-accessories.png')) { throw 'Production homepage does not reference both replacement images' }
```

Expected: both assets return 200 and the production homepage references both filenames.
