# Home Social Account Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the four social account rows on the home page into accessible external links while leaving WeChat text-only and avoiding embedded social content.

**Architecture:** Keep the feature entirely inside the existing static `index.html` social card. Update the integration test first, then add semantic anchors and focused CSS; no API, third-party script, iframe, or runtime JavaScript is needed.

**Tech Stack:** Static HTML/CSS, Node.js built-in test runner

---

## File Structure

- Modify `tests/site-integration.test.js`: specify the exact destinations, link safety attributes, account labels, WeChat fallback, and absence of embeds.
- Modify `index.html`: style linked rows and add the four external account anchors.

### Task 1: Specify linked-account behavior

**Files:**
- Modify: `tests/site-integration.test.js:108-126`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Replace the text-only social-account test with a failing linked-account test**

Use a helper inside the test to match attributes regardless of their order, then assert the four exact destinations and displayed account identifiers:

```js
test("the home contact section links to the official social accounts", async () => {
  const html = await read("index.html");
  const main = html.match(/<main[^>]*>[\s\S]*?<\/main>/i)?.[0] ?? "";
  const footer = html.match(/<footer[^>]+class="site-footer"[^>]*>[\s\S]*?<\/footer>/i)?.[0] ?? "";

  const assertExternalAccount = (href, platform, account) => {
    const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const row = main.match(new RegExp(`<div class="social-row">\\s*<dt>\\s*${platform}\\s*<\\/dt>[\\s\\S]*?<\\/div>`, "i"))?.[0] ?? "";
    const link = row.match(new RegExp(`<a(?=[^>]*href="${escapedHref}")(?=[^>]*target="_blank")(?=[^>]*rel="noopener noreferrer")[^>]*>[\\s\\S]*?<\\/a>`, "i"))?.[0] ?? "";
    assert.match(link, new RegExp(`>\\s*${account}\\s*<span[^>]*aria-hidden="true"[^>]*>\\s*→\\s*<\\/span>\\s*<\\/a>`, "i"));
  };

  assert.match(html, /Follow Norie for new samples, custom-order updates, and launch news\./);
  assert.match(main, /class="social-card"/i);
  assertExternalAccount("https://www.instagram.com/norie_hair/", "IG", "norie_hair");
  assertExternalAccount("https://www.tiktok.com/@norie_hair", "TikTok", "norie_hair");
  assertExternalAccount("https://xhslink.cn/m/38rRNyaQEbA", "Rednote", "itschloe_eee");
  assertExternalAccount("https://v.douyin.com/S4fAA1Zxzbs/", "Douyin", "40950053692");
  assert.match(main, /<div class="social-row">\s*<dt>\s*WeChat\s*<\/dt>\s*<dd>\s*NorieToronto\s*<\/dd>\s*<\/div>/i);
  assert.doesNotMatch(main, /<dt>\s*WeChat\s*<\/dt>\s*<a/i);
  assert.doesNotMatch(footer, /class="social-card"|>\s*(?:IG|TikTok|Rednote|Douyin)\s*</i);
  assert.match(footer, /<div class="footer-identity">\s*<p>© 2026 Norie<\/p>\s*<span[^>]*>WeChat\s+NorieToronto<\/span>\s*<\/div>/i);
  assert.doesNotMatch(html, /id="subscribeForm"|>\s*Subscribe\s*<|id="email"/i);
  assert.doesNotMatch(main, /<(?:iframe|script)[^>]+(?:instagram|tiktok|douyin|xiaohongshu|xhslink)/i);
  assert.match(html, /id="waitlist"/);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="home contact section" tests/site-integration.test.js
```

Expected: FAIL because the current account rows are not anchors and still show `Norie` for Rednote and Douyin.

- [ ] **Step 3: Commit the failing test**

```powershell
git add -- tests/site-integration.test.js
git commit -m "test: specify home social account links"
```

### Task 2: Implement accessible linked rows

**Files:**
- Modify: `index.html:606-648`
- Modify: `index.html:955-978`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Generalize the row layout and add link interaction styles**

Replace the `.social-list div` selectors with `.social-row`, then add link reset, hover, arrow, and focus-visible rules:

```css
.social-row {
  align-items: baseline;
  border-bottom: 1px solid rgba(191, 111, 135, 0.28);
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(5rem, 0.35fr) 1fr;
  padding: 1rem 0;
}

.social-row:first-child {
  padding-top: 0;
}

.social-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.social-row {
  position: relative;
}

.social-link {
  color: inherit;
  text-decoration: none;
}

.social-link::after {
  content: "";
  inset: 0;
  position: absolute;
}

.social-row:has(.social-link:hover) {
  color: var(--berry);
}

.social-link:focus-visible::after {
  border-radius: 0.2rem;
  outline: 3px solid var(--pink);
  outline-offset: 4px;
}

.social-arrow {
  display: inline-block;
  margin-left: 0.4rem;
  transition: transform 160ms ease;
}

.social-row:has(.social-link:hover) .social-arrow,
.social-row:has(.social-link:focus-visible) .social-arrow {
  transform: translateX(0.2rem);
}
```

Keep the existing `.social-list dt` and `.social-list dd` declarations unchanged.

- [ ] **Step 2: Replace the four linked rows and preserve text-only WeChat**

Replace the contents of `<dl class="social-list">` with:

```html
<div class="social-row">
  <dt>IG</dt>
  <dd><a class="social-link" href="https://www.instagram.com/norie_hair/" target="_blank" rel="noopener noreferrer" aria-label="Open Norie on Instagram">norie_hair <span class="social-arrow" aria-hidden="true">→</span></a></dd>
</div>
<div class="social-row">
  <dt>TikTok</dt>
  <dd><a class="social-link" href="https://www.tiktok.com/@norie_hair" target="_blank" rel="noopener noreferrer" aria-label="Open Norie on TikTok">norie_hair <span class="social-arrow" aria-hidden="true">→</span></a></dd>
</div>
<div class="social-row">
  <dt>Rednote</dt>
  <dd><a class="social-link" href="https://xhslink.cn/m/38rRNyaQEbA" target="_blank" rel="noopener noreferrer" aria-label="Open Norie on Rednote">itschloe_eee <span class="social-arrow" aria-hidden="true">→</span></a></dd>
</div>
<div class="social-row">
  <dt>Douyin</dt>
  <dd><a class="social-link" href="https://v.douyin.com/S4fAA1Zxzbs/" target="_blank" rel="noopener noreferrer" aria-label="Open Norie on Douyin">40950053692 <span class="social-arrow" aria-hidden="true">→</span></a></dd>
</div>
<div class="social-row">
  <dt>WeChat</dt>
  <dd>NorieToronto</dd>
</div>
```

- [ ] **Step 3: Run the focused test and confirm it passes**

Run:

```powershell
node --test --test-name-pattern="home contact section" tests/site-integration.test.js
```

Expected: PASS.

- [ ] **Step 4: Run the full automated suite**

Run:

```powershell
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 5: Inspect desktop and mobile layouts**

Serve the repository locally and inspect `index.html` at approximately 1440 px and 390 px widths. Confirm that each linked row is entirely clickable, account identifiers wrap safely, arrows remain aligned, keyboard focus is visible, and WeChat does not appear interactive.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- index.html
git commit -m "feat: link home social accounts"
```
