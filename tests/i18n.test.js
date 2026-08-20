import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LOCALE,
  normalizeLocale,
  translate,
  translations
} from "../norie-i18n.js";

test("English is the default and unsupported locales fall back safely", () => {
  assert.equal(DEFAULT_LOCALE, "en");
  assert.equal(normalizeLocale("zh-CN"), "zh-CN");
  assert.equal(normalizeLocale("fr"), "en");
  assert.equal(normalizeLocale(null), "en");
});

test("both locales expose the same complete translation contract", () => {
  assert.deepEqual(
    Object.keys(translations.en).sort(),
    Object.keys(translations["zh-CN"]).sort()
  );
  assert.equal(translate("nav.shop", "zh-CN"), "选购");
  assert.equal(translate("missing.key", "zh-CN", "Fallback"), "Fallback");
  assert.ok(Object.keys(translations.en).length > 80);
});

test("approved Chinese brand lines are present", () => {
  assert.equal(translate("home.hero.title", "zh-CN"), "把名字戴在头发上");
  assert.equal(translate("home.pink.title", "zh-CN"), "今天也要粉得刚刚好");
  assert.equal(translate("home.coming.title", "zh-CN"), "新品正在靠近");
  assert.equal(translate("custom.submit", "zh-CN"), "提交定制需求");
});
