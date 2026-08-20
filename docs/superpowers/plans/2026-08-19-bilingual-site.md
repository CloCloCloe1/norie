# Norie Bilingual Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent, accessible English/Chinese switcher to all three Norie pages and deploy the verified result to the production Vercel site.

**Architecture:** Keep English HTML as the no-script fallback and add stable `data-i18n` keys to translatable content and attributes. A shared `norie-i18n.js` module owns dictionaries, locale persistence, DOM updates, and a `norie:localechange` event; dynamic form and customization messages use its public translation function.

**Tech Stack:** Static HTML/CSS, browser JavaScript, Node.js built-in test runner, Vercel CLI.

---

### Task 1: Translation Runtime and Contract Tests

**Files:**
- Create: `norie-i18n.js`
- Create: `tests/i18n.test.js`
- Modify: `tests/site-integration.test.js`

- [ ] **Step 1: Write failing tests for locale behavior and page integration**

Add tests that import pure exports and assert English fallback, locale validation, and complete dictionaries:

```js
import { normalizeLocale, translate, translations } from "../norie-i18n.js";

assert.equal(normalizeLocale("zh-CN"), "zh-CN");
assert.equal(normalizeLocale("fr"), "en");
assert.equal(translate("nav.shop", "zh-CN"), "选购");
assert.equal(translate("missing.key", "zh-CN", "Fallback"), "Fallback");
assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations["zh-CN"]).sort());
```

Extend the integration test to require `norie-i18n.js`, `data-language-switcher`, and `data-i18n` on `index.html`, `shop.html`, and `customize.html`.

- [ ] **Step 2: Run tests and confirm the new contract fails**

Run: `node --test tests/i18n.test.js tests/site-integration.test.js`

Expected: FAIL because `norie-i18n.js` and language controls do not exist.

- [ ] **Step 3: Implement the minimal shared runtime**

Create a side-effect-safe ES module with these exports and browser initialization:

```js
export const DEFAULT_LOCALE = "en";
export const STORAGE_KEY = "norie.locale";
export const translations = { en: {}, "zh-CN": {} };
export function normalizeLocale(value) {
  return value === "zh-CN" ? "zh-CN" : DEFAULT_LOCALE;
}
export function translate(key, locale = DEFAULT_LOCALE, fallback = key) {
  return translations[normalizeLocale(locale)][key] ?? fallback;
}
export function getLocale() {
  try { return normalizeLocale(localStorage.getItem(STORAGE_KEY)); }
  catch { return DEFAULT_LOCALE; }
}
export function setLocale(locale, { persist = true } = {}) {
  const normalized = normalizeLocale(locale);
  applyTranslations(document, normalized);
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, normalized); } catch {}
  }
  document.dispatchEvent(new CustomEvent("norie:localechange", { detail: { locale: normalized } }));
}
```

`applyTranslations` updates `[data-i18n]`, `[data-i18n-aria-label]`, `[data-i18n-alt]`, and `[data-i18n-placeholder]`, updates `<html lang>`, and synchronizes `aria-pressed` on `[data-locale]` buttons. Wrap storage access in `try/catch`, initialize on `DOMContentLoaded`, and leave English HTML untouched when JavaScript is unavailable.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/i18n.test.js tests/site-integration.test.js`

Expected: translation runtime tests PASS; page integration assertions remain FAIL until Task 2.

- [ ] **Step 5: Commit the runtime and tests**

```powershell
git add -- norie-i18n.js tests/i18n.test.js tests/site-integration.test.js
git commit -m "feat: add Norie translation runtime"
```

### Task 2: Shared Language Control and Static Page Copy

**Files:**
- Modify: `index.html`
- Modify: `shop.html`
- Modify: `customize.html`
- Modify: `norie-i18n.js`
- Test: `tests/i18n.test.js`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Add failing coverage for every HTML translation key**

Extract every `data-i18n*` key from all pages and assert both dictionaries contain a non-empty value. Assert each page keeps `<html lang="en">`, loads `<script type="module" src="norie-i18n.js"></script>`, and includes two real buttons:

```html
<div class="language-switcher" data-language-switcher aria-label="Language">
  <button type="button" data-locale="en" aria-pressed="true">EN</button>
  <span aria-hidden="true">/</span>
  <button type="button" data-locale="zh-CN" aria-pressed="false">中文</button>
</div>
```

- [ ] **Step 2: Run tests and confirm missing page keys fail**

Run: `node --test tests/i18n.test.js tests/site-integration.test.js`

Expected: FAIL listing untranslated or absent keys.

- [ ] **Step 3: Add the switcher and translation keys to all pages**

Add the control beside the existing header actions, responsive styles matching Norie's typography and berry color, the module script, and stable keys for every heading, paragraph, navigation item, button, form label, form hint, footer link, `aria-label`, `alt`, and placeholder found in the three pages. Use namespaced keys in the forms `common.*`, `home.*`, `shop.*`, and `custom.*`. Keep prices, `Norie`, email addresses, and product names such as `Flat Brush` and `Bamboo Paddle Brush` unchanged where specified by the design.

- [ ] **Step 4: Complete concise Chinese dictionaries**

Populate every key with adapted copy following the approved voice. Functional examples:

```js
"nav.home": "首页",
"nav.shop": "选购",
"nav.customize": "定制",
"home.hero.title": "把名字戴在头发上",
"home.hero.customize": "定制你的专属款",
"home.coming.title": "新品正在靠近",
"custom.contact.required": "请填写全部信息。",
"custom.submit": "提交定制需求"
```

- [ ] **Step 5: Run focused tests and commit**

Run: `node --test tests/i18n.test.js tests/site-integration.test.js`

Expected: PASS.

```powershell
git add -- index.html shop.html customize.html norie-i18n.js tests/i18n.test.js tests/site-integration.test.js
git commit -m "feat: translate Norie storefront"
```

### Task 3: Dynamic Customization and Form Messages

**Files:**
- Modify: `customize.html`
- Modify: `norie-forms.js`
- Modify: `norie-i18n.js`
- Modify: `tests/i18n.test.js`
- Modify: `tests/site-integration.test.js`

- [ ] **Step 1: Write failing tests for dynamic message keys**

Assert the form controller calls `window.NorieI18n.translate` for name, email, contact, pending, success, and fallback-error messages. Assert customization product labels resolve from translation keys and refresh on `norie:localechange` without changing price, selected values, or user-entered custom text.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test tests/i18n.test.js tests/site-integration.test.js tests/api.test.js`

Expected: FAIL because dynamic strings are still hard-coded in English.

- [ ] **Step 3: Expose and consume the browser translation interface**

Expose a frozen browser interface:

```js
window.NorieI18n = Object.freeze({
  getLocale,
  setLocale,
  translate: (key, fallback) => translate(key, getLocale(), fallback)
});
```

Replace hard-coded UI messages with calls such as:

```js
const t = (key, fallback) => window.NorieI18n?.translate(key, fallback) ?? fallback;
showFieldError(customerName, button, "order-status", t("form.error.name", "Name: enter your name."));
```

Keep submitted product values in stable English so existing order emails and API behavior do not change. Re-render only visible labels and status copy after `norie:localechange`.

- [ ] **Step 4: Run tests and commit**

Run: `npm test`

Expected: all tests PASS.

```powershell
git add -- customize.html norie-forms.js norie-i18n.js tests/i18n.test.js tests/site-integration.test.js
git commit -m "feat: localize Norie interactive states"
```

### Task 4: Browser QA and Production Deployment

**Files:**
- Verify: `index.html`
- Verify: `shop.html`
- Verify: `customize.html`
- Verify: `norie-i18n.js`

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Serve and inspect locally**

Run a local static server, then inspect all three pages at desktop and mobile widths. Confirm English first load, instant Chinese switching, keyboard focus, `aria-pressed`, layout fit, customizer behavior, form validation messages, and language retention across navigation.

- [ ] **Step 3: Verify storage failure fallback**

Block or stub `localStorage`, reload each page, and confirm English remains usable and switching still works for the current page without uncaught errors.

- [ ] **Step 4: Deploy the production build**

Run: `vercel --prod --yes`

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 5: Verify the live website**

Fetch and open:

```text
https://norie-hair.vercel.app/
https://norie-hair.vercel.app/shop.html
https://norie-hair.vercel.app/customize.html
https://norie-hair.vercel.app/norie-i18n.js
```

Confirm HTTP 200, the deployed script contains both locales, the three pages expose the language switcher, and switching persists across live-page navigation.

- [ ] **Step 6: Commit any QA-only corrections**

If browser QA required corrections, run `npm test`, then commit only the bilingual-site files with `git commit -m "fix: polish Norie bilingual experience"`. If no correction was needed, do not create an empty commit.
