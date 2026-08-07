# Homepage Social Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace sample Homepage social-account text with Norie's four live account names.

**Architecture:** This is a static Homepage content change in the existing definition-list social card. The integration test owns the exact visible label/value contract and ensures the card remains text-only.

**Tech Stack:** HTML, Node.js built-in test runner, Vercel static deployment.

---

### Task 1: Test the approved social-account content

**Files:**
- Modify: `tests/site-integration.test.js`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Replace the sample-account assertions with the four approved pairs**

```js
assert.match(html, /<dt>\s*IG\s*<\/dt>\s*<dd>\s*norie_hair\s*<\/dd>/i);
assert.match(html, /<dt>\s*Rednote\s*<\/dt>\s*<dd>\s*Norie\s*<\/dd>/i);
assert.match(html, /<dt>\s*Douyin\s*<\/dt>\s*<dd>\s*Norie\s*<\/dd>/i);
assert.match(html, /<dt>\s*WeChat\s*<\/dt>\s*<dd>\s*NorieToronto\s*<\/dd>/i);
assert.doesNotMatch(html, /sampleigacc|sampleacc/i);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/site-integration.test.js`

Expected: the test fails because the static Homepage still contains the two sample accounts and omits Douyin and WeChat.

### Task 2: Update the Homepage social card

**Files:**
- Modify: `index.html`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Update the two existing values and add the two approved rows**

Replace `sampleigacc` with `norie_hair`, replace `sampleacc` with `Norie`, then add:

```html
<div>
  <dt>Douyin</dt>
  <dd>Norie</dd>
</div>
<div>
  <dt>WeChat</dt>
  <dd>NorieToronto</dd>
</div>
```

Keep the card text-only and retain the existing `aria-label`.

- [ ] **Step 2: Run the focused test and verify GREEN**

Run: `node --test tests/site-integration.test.js`

Expected: all tests in the file pass.

- [ ] **Step 3: Commit the implementation**

```powershell
git add -- index.html tests/site-integration.test.js
git commit -m "feat: update homepage social accounts"
```

### Task 3: Verify and publish

**Files:**
- Verify: all tracked project files

- [ ] **Step 1: Run complete verification**

Run: `npm.cmd test; git diff --check; git status --short`

Expected: all tests pass, no whitespace errors, and no uncommitted changes after the commit.

- [ ] **Step 2: Push and deploy production**

Run:

```powershell
git push origin codex/shop-unified-grid-pr
& 'C:\Users\limin\AppData\Local\npm-cache\_npx\69f9afb961c37556\node_modules\.bin\vercel.cmd' --prod --yes
```

Expected: Vercel reports a ready deployment aliased to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify the live card**

Fetch the Homepage with a cache-busting query and assert it contains `norie_hair`, two `Norie` values, and `NorieToronto`, while neither sample account remains.
