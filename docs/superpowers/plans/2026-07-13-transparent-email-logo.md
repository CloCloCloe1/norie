# Transparent Email Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the white-backed customer-confirmation logo with a transparent PNG while preserving the Norie wordmark and public asset URL.

**Architecture:** Add a binary-level regression test for a PNG alpha channel, use the approved image-editing workflow to isolate the black wordmark, remove the flat background into alpha, validate transparent corners and visible logo coverage, then overwrite the existing public asset and redeploy.

**Tech Stack:** Built-in image generation/editing, PNG alpha post-processing, Node.js built-in test runner, Vercel

---

### Task 1: Require Transparency in the Logo Asset

**Files:**
- Modify: `tests/site-integration.test.js`

- [ ] **Step 1: Strengthen the existing logo test before editing the image**

Replace the existing logo asset test with:

```js
test("the customer confirmation logo is a deployable transparent PNG", async () => {
  await access("assets/norie-logo.png");
  const logo = await readFile("assets/norie-logo.png");

  assert.deepEqual([...logo.subarray(1, 4)], [80, 78, 71]);
  assert.ok([4, 6].includes(logo[25]), "PNG must contain an alpha channel");
});
```

Add this import at the top:

```js
import assert from "node:assert/strict";
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```powershell
node --test --test-name-pattern="transparent PNG" tests/site-integration.test.js
```

Expected: FAIL with `PNG must contain an alpha channel` because the current PNG uses an opaque color type.

### Task 2: Extract the Wordmark onto Transparency

**Files:**
- Modify: `assets/norie-logo.png`

- [ ] **Step 1: Inspect the current local edit target**

Use the local image viewer on:

```text
C:\Users\limin\Documents\Norie\assets\norie-logo.png
```

Confirm that the black Norie wordmark is surrounded by a flat white background.

- [ ] **Step 2: Use the built-in image editor for background extraction**

Edit the inspected image with this prompt:

```text
Use case: background-extraction
Asset type: customer confirmation email logo
Primary request: Preserve the exact black Norie wordmark, lettering, proportions, framing, and edge shape. Replace only the white background with a perfectly flat solid #00ff00 chroma-key background for removal.
Composition/framing: Keep the original landscape canvas and original wordmark position with the same padding.
Text (verbatim): "Norie"
Constraints: Change only the background; preserve the black logo exactly; crisp smooth edges; no shadow; no added elements.
Avoid: altered spelling, redrawn letters, blur, gradients, texture, reflections, watermark, or any green inside the wordmark.
```

Save the selected built-in output as:

```text
C:\Users\limin\Documents\Norie\tmp\imagegen\norie-logo-chroma.png
```

- [ ] **Step 3: Convert the flat key color to alpha**

Run:

```powershell
python 'C:\Users\limin\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py' --input 'C:\Users\limin\Documents\Norie\tmp\imagegen\norie-logo-chroma.png' --out 'C:\Users\limin\Documents\Norie\assets\norie-logo-transparent.png' --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

- [ ] **Step 4: Validate the alpha output before replacing the public asset**

Run this read-only validation:

```powershell
@'
from PIL import Image

path = r"C:\Users\limin\Documents\Norie\assets\norie-logo-transparent.png"
image = Image.open(path).convert("RGBA")
alpha = image.getchannel("A")
corners = [alpha.getpixel((0, 0)), alpha.getpixel((image.width - 1, 0)), alpha.getpixel((0, image.height - 1)), alpha.getpixel((image.width - 1, image.height - 1))]
opaque = sum(1 for value in alpha.getdata() if value >= 240)
coverage = opaque / (image.width * image.height)

assert corners == [0, 0, 0, 0], f"Corners are not transparent: {corners}"
assert 0.03 <= coverage <= 0.45, f"Unexpected visible-logo coverage: {coverage:.4f}"
print({"size": image.size, "corners": corners, "opaque_coverage": round(coverage, 4)})
'@ | python -
```

Expected: all corner alpha values are `0`, and opaque coverage is between 3% and 45%.

- [ ] **Step 5: Visually inspect the transparent result**

View:

```text
C:\Users\limin\Documents\Norie\assets\norie-logo-transparent.png
```

Confirm the wordmark still reads exactly `Norie`, the shape is unchanged, the background is transparent, and there is no visible green or white fringe.

- [ ] **Step 6: Replace the stable public asset and verify GREEN**

Run:

```powershell
Move-Item -LiteralPath 'C:\Users\limin\Documents\Norie\assets\norie-logo-transparent.png' -Destination 'C:\Users\limin\Documents\Norie\assets\norie-logo.png' -Force
node --test --test-name-pattern="transparent PNG" tests/site-integration.test.js
```

Expected: the focused test PASS.

- [ ] **Step 7: Commit the transparent logo**

```powershell
git add tests/site-integration.test.js assets/norie-logo.png
git commit -m "fix: remove email logo background"
```

### Task 3: Verify and Redeploy

**Files:**
- Verify: `assets/norie-logo.png`
- Verify: `tests/site-integration.test.js`

- [ ] **Step 1: Run the complete local verification**

Run:

```powershell
npm.cmd test
node --check api/custom-order.js
git diff --check
```

Expected: every command exits 0 and all tests PASS.

- [ ] **Step 2: Deploy production**

Run:

```powershell
npx.cmd --yes vercel@latest --prod --yes
```

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify the production PNG has transparency**

Download the deployed asset to a temporary file and inspect its PNG color type:

```powershell
$productionLogo = Join-Path $env:TEMP 'norie-logo-production.png'
Invoke-WebRequest -Uri 'https://norie-hair.vercel.app/assets/norie-logo.png' -OutFile $productionLogo -UseBasicParsing
$bytes = [System.IO.File]::ReadAllBytes($productionLogo)
if ($bytes[25] -notin @(4, 6)) { throw 'Production logo does not have an alpha channel' }
```

Expected: the deployed PNG color type is `4` or `6`, confirming an alpha channel.
