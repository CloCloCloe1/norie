# Ballet Pink Display Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every customer-visible “Baby Pink” label with “Ballet Pink” while preserving the existing `baby-pink` internal variant key, URLs, and asset filenames.

**Architecture:** Keep `product-catalog.js` as the authoritative source for dynamic product names, email/receipt labels, and Google Sheet values. Update static fallback markup separately, but do not rename variant identifiers or media files so old links remain valid.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Vercel CLI.

---

## Task 1: Lock the compatibility contract with failing tests

**Files:**
- Modify: `tests/product-catalog.test.js`
- Modify: `tests/shop-single-pieces.test.js`
- Modify: `tests/api.test.js`

- [ ] Add a catalog test covering the `baby-pink` variant for the bamboo paddle brush, flat brush, claw clip, Essentials Hairstyling Set, and Baby Hairstyling Set.
- [ ] Assert each selection still returns `variantKey === "baby-pink"`.
- [ ] Assert each customer-visible label, full product name, and accessible image description uses “Ballet Pink” and no longer uses “Baby Pink”.
- [ ] Update Shop and email expectations to require “Ballet Pink” while retaining `variant=baby-pink` URL expectations and `baby-pink` request payloads.
- [ ] Run `npm.cmd test -- --test-name-pattern="Ballet Pink|single pieces|custom order"` from `C:\Users\limin\Documents\Norie-pr`.
- [ ] Confirm the focused suite fails because production display strings still use “Baby Pink”.

## Task 2: Update the catalog and static customer-visible copy

**Files:**
- Modify: `product-catalog.js`
- Modify: `index.html`
- Modify: `shop.html`
- Modify: `claw-clip.html`
- Modify: `customize.html`

- [ ] In `product-catalog.js`, change the five `baby-pink` variants’ visible label, full product name, and alt text to “Ballet Pink”.
- [ ] Update the homepage marketing sentence from “Baby pink clips” to “Ballet pink clips”.
- [ ] Update the Shop product-card headings for the bamboo paddle brush, flat brush, and Norie clip to “Ballet Pink”.
- [ ] Update the claw-clip detail page’s title, color legend, and accessible alt text to “Ballet Pink”.
- [ ] Update Customize-page fallback product, color, and summary text to “Ballet Pink”.
- [ ] Do not change `baby-pink` object keys, query values, hidden form values, URL parameters, or asset filenames.
- [ ] Re-run the focused test command and confirm it passes.

## Task 3: Audit, verify, commit, and deploy

**Files:**
- Verify: all application source and tests

- [ ] Run `rg -n -i "Baby Pink" --glob "*.html" --glob "*.js" --glob "!docs/**" --glob "!node_modules/**"` and classify every remaining result; production customer-visible copy must have none.
- [ ] Run `rg -n "baby-pink" --glob "*.html" --glob "*.js" --glob "!docs/**" --glob "!node_modules/**"` and confirm compatibility keys, links, and filenames remain.
- [ ] Run the complete suite with `npm.cmd test` and confirm all tests pass.
- [ ] Run `git diff --check` and inspect `git status --short`.
- [ ] Commit the implementation with `git commit -m "feat: rename Baby Pink display label"` and push `codex/shop-unified-grid-pr`.
- [ ] Deploy production with `vercel.cmd --prod --yes`.
- [ ] Fetch the live homepage, Shop, Customize, and claw-clip detail pages; confirm “Ballet Pink” is visible, no customer-facing “Baby Pink” remains, and `variant=baby-pink` links still work.
