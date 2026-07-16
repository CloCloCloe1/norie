# Product Detail Right-Panel Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all five product-detail right panels more compact and keep desktop product names on one line.

**Architecture:** Change only shared rules in `product-detail.css`, so the five pages stay identical without HTML or JavaScript duplication. Add a regression test to `tests/product-detail.test.js` that locks the compact desktop treatment and mobile wrapping override.

**Tech Stack:** Static CSS, Node test runner.

---

### Task 1: Compact Shared Right Panel

**Files:**
- Modify: `tests/product-detail.test.js`
- Modify: `product-detail.css`

- [ ] **Step 1: Write the failing CSS regression test**

Add a test that asserts:

```js
assert.match(css, /\.product-detail-copy\s*\{[^}]*line-height:\s*1\.45[^}]*padding:\s*clamp\(1\.25rem,3vw,2\.75rem\)/s);
assert.match(css, /\.product-detail-copy h1\s*\{[^}]*font-size:\s*clamp\(\.95rem,1\.4vw,1\.3rem\)[^}]*letter-spacing:\s*\.06em[^}]*line-height:\s*1\.12[^}]*white-space:\s*nowrap/s);
assert.match(css, /\.detail-price\s*\{[^}]*margin:\s*\.65rem 0 1\.25rem/s);
assert.match(css, /fieldset\s*\{[^}]*padding:\s*1rem 0/s);
assert.match(css, /\.quantity-block\s*\{[^}]*margin:\s*1rem 0/s);
assert.match(css, /\.product-description\s*\{[^}]*margin-top:\s*1\.25rem[^}]*padding-top:\s*1\.25rem/s);
assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.product-detail-copy h1\s*\{[^}]*white-space:\s*normal/s);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/product-detail.test.js
```

Expected: FAIL because the existing right panel uses the larger title and wider spacing.

- [ ] **Step 3: Implement the compact CSS rules**

Update shared CSS to use:

```css
.product-detail-copy { line-height:1.45; padding:clamp(1.25rem,3vw,2.75rem); }
.product-detail-copy h1 { font-size:clamp(.95rem,1.4vw,1.3rem); letter-spacing:.06em; line-height:1.12; white-space:nowrap; }
.detail-price { margin:.65rem 0 1.25rem; }
fieldset { padding:1rem 0; }
.quantity-block { margin:1rem 0; }
.product-description { margin-top:1.25rem; padding-top:1.25rem; }
@media (max-width:760px) { .product-detail-copy h1 { white-space:normal; } }
```

Also reduce the variant option gap and product-details heading size while preserving all controls and content.

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
node --test tests/product-detail.test.js
npm.cmd test
```

Expected: all tests PASS with zero failures.

- [ ] **Step 5: Commit**

```powershell
git add product-detail.css tests/product-detail.test.js
git commit -m "style: compact product detail information"
```

### Task 2: Publish and Verify Production

**Files:** No source changes expected.

- [ ] **Step 1: Push the existing branch**

```powershell
git push origin codex/shop-unified-grid-pr
```

- [ ] **Step 2: Deploy Production**

```powershell
vercel --prod --yes
```

- [ ] **Step 3: Verify the shared production stylesheet**

Fetch `https://norie-hair.vercel.app/product-detail.css` and assert it includes the compact title, padding, spacing, and mobile wrapping rules. Fetch all five detail pages and assert HTTP 200. Confirm the Vercel deployment status is `Ready`.
