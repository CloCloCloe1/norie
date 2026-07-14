# Home Social Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page newsletter form with text-only Instagram and Rednote sample account details.

**Architecture:** Preserve the existing responsive two-column `#waitlist` section and replace only its copy and right-side card. Use a semantic definition list for platform/account associations, while leaving the dormant subscription API and controller code untouched.

**Tech Stack:** Static HTML/CSS, Node.js `node:test`, html-validate, Vercel.

---

### Task 1: Write the failing home social-card test

**Files:**
- Modify: `tests/site-integration.test.js`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Replace the newsletter-form test with the social-card contract**

```js
test("the home contact section shows text-only sample social accounts", async () => {
  const html = await read("index.html");

  assert.match(html, /Follow Norie for new samples, custom-order updates, and launch news\./);
  assert.match(html, /<dt>\s*IG\s*<\/dt>\s*<dd>\s*sampleigacc\s*<\/dd>/i);
  assert.match(html, /<dt>\s*Rednote\s*<\/dt>\s*<dd>\s*sampleacc\s*<\/dd>/i);
  assert.doesNotMatch(html, /id="subscribeForm"|>\s*Subscribe\s*<|id="email"/i);
  assert.doesNotMatch(html, /<a[^>]*>\s*(?:sampleigacc|sampleacc)\s*<\/a>/i);
  assert.match(html, /id="waitlist"/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/site-integration.test.js`

Expected: the new test fails because the newsletter form remains and the sample social rows are absent.

### Task 2: Replace the newsletter form with social account text

**Files:**
- Modify: `index.html`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Replace signup-form styles with the social card and definition-list styles**

```css
.social-card {
  background: var(--white);
  border: 1px solid rgba(191, 111, 135, 0.72);
  padding: clamp(1rem, 3vw, 1.6rem);
}

.social-list {
  display: grid;
  gap: 0;
  margin: 0;
}

.social-list div {
  align-items: baseline;
  border-bottom: 1px solid rgba(191, 111, 135, 0.28);
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(5rem, 0.35fr) 1fr;
  padding: 1rem 0;
}

.social-list div:first-child {
  padding-top: 0;
}

.social-list div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.social-list dt {
  color: var(--berry);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.social-list dd {
  color: var(--ink);
  margin: 0;
  overflow-wrap: anywhere;
}
```

Remove the now-unused `.signup-form`, global home-page `label`, `input`, `.hint`, and signup-button style blocks.

- [ ] **Step 2: Replace the section copy and form markup**

```html
<section class="section newsletter" id="waitlist" aria-labelledby="waitlist-title">
  <div>
    <p class="eyebrow">Toronto-based, handmade-to-order</p>
    <h2 id="waitlist-title">keep in touch</h2>
    <p>Follow Norie for new samples, custom-order updates, and launch news.</p>
  </div>
  <div class="social-card" aria-label="Social accounts">
    <dl class="social-list">
      <div>
        <dt>IG</dt>
        <dd>sampleigacc</dd>
      </div>
      <div>
        <dt>Rednote</dt>
        <dd>sampleacc</dd>
      </div>
    </dl>
  </div>
</section>
```

Remove `<script src="norie-forms.js" defer></script>` from `index.html`, because the home page no longer has a form that uses it. The script remains loaded by `customize.html` for order submission.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run: `node --test tests/site-integration.test.js`

Expected: all site integration tests pass.

- [ ] **Step 4: Commit the focused change**

```powershell
git add -- index.html tests/site-integration.test.js
git commit -m "feat: replace newsletter with social accounts"
```

### Task 3: Verify and deploy

**Files:**
- Verify: `index.html`

- [ ] **Step 1: Run complete local verification**

Run: `npm.cmd test`

Expected: zero failing tests.

Run: `npx.cmd --yes html-validate@latest index.html shop.html customize.html`

Expected: exit code 0 with no HTML validation errors.

- [ ] **Step 2: Deploy to production**

Run: `npx.cmd --yes vercel@latest --prod --yes`

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify production content**

Fetch `https://norie-hair.vercel.app/` and confirm `sampleigacc`, `sampleacc`, and the new supporting copy are present, while `subscribeForm` and the Subscribe button are absent.
