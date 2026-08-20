# Norie Chinese Copy and Product Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Chinese copy, English product terminology, Coming Soon removal, and responsive product-layout refinements to the bilingual Norie site.

**Architecture:** Update the existing centralized dictionaries and static HTML fallback rather than adding a second locale path. Integration tests lock down content and structural removal; browser checks validate responsive wrapping and layout.

**Tech Stack:** Static HTML/CSS, ES modules, Node.js built-in test runner, Vercel.

---

### Task 1: Homepage Copy and Section Removal

**Files:**
- Modify: `tests/i18n.test.js`
- Modify: `tests/site-integration.test.js`
- Modify: `norie-i18n.js`
- Modify: `index.html`

- [ ] Add failing assertions:

```js
assert.equal(translate("home.hero.title", "zh-CN"), "属于你的闪闪发光");
assert.doesNotMatch(home, /Coming Soon|新品正在靠近|New sample photos for launch extras|class="section coming-soon"/i);
```
- [ ] Run `node --test tests/i18n.test.js tests/site-integration.test.js` and confirm the assertions fail on the old heading and section.
- [ ] Change `home.hero.title` to `["Custom Hair Pieces", "属于你的闪闪发光"]`, remove the Coming Soon translation key, and delete the complete `<section class="section coming-soon">…</section>` block.
- [ ] Run the focused tests and confirm they pass.

### Task 2: English Product Names and Chinese Helper Copy

**Files:**
- Modify: `tests/i18n.test.js`
- Modify: `tests/site-integration.test.js`
- Modify: `norie-i18n.js`
- Modify: `customize.html`
- Modify: `shop.html`

- [ ] Add failing tests asserting both locales use identical English main labels and translated helpers:

```js
assert.equal(translate("shop.largePink", "zh-CN"), "Pink Bamboo Paddle Brush");
assert.equal(translate("custom.pink", "zh-CN"), "Pink");
assert.equal(translate("custom.pinkStones", "zh-CN"), "Pink stones");
assert.equal(translate("custom.helper.flat", "zh-CN"), "迷你椭圆梳");
assert.equal(translate("custom.helper.paddle", "zh-CN"), "竹制气垫梳");
```
- [ ] Run the focused tests and confirm failure against the current localized product names.
- [ ] Add stable helper-text translation keys and `data-i18n` attributes to each `<small>`. Rename static product labels to `Flat Brush`, `Bamboo Paddle Brush`, and `Claw Clip`; retain `Pink`, `White`, `Pink stones`, and `White stones` in both dictionaries.
- [ ] Set Shop product-name Chinese values equal to their English display names, including set titles and all color variants.
- [ ] Add controlled card-title typography in `shop.html` using `font-size: clamp(1.35rem, 2vw, 1.8rem)`, `line-height: 1.08`, and balanced wrapping.
- [ ] Run focused tests and confirm they pass.

### Task 3: Customize Single-Line Layout and Deployment

**Files:**
- Modify: `tests/site-integration.test.js`
- Modify: `norie-i18n.js`
- Modify: `customize.html`

- [ ] Add failing assertions for the Customize copy:

```js
assert.equal(translate("custom.hero", "zh-CN"), "属于你的闪闪发光");
assert.equal(translate("custom.hero.copy", "zh-CN"), "选好款式与颜色，加上花体水钻名字，再收下一份随机小礼物。");
```
- [ ] Change the Chinese hero translation and add desktop/tablet `white-space: nowrap` rules scoped to `html[lang="zh-CN"]`, resetting to `normal` below 560px to prevent overflow.
- [ ] Run `npm test` and require zero failures.
- [ ] Inspect Shop and Customize in English and Chinese at desktop and 390px mobile widths. Confirm no horizontal overflow and mobile wrapping only where necessary.
- [ ] Deploy with `npx vercel deploy --prod --yes --scope cloclocloe1s-projects` and verify the production homepage, Shop, Customize, Hero, Lookbooks, and footer contacts.
