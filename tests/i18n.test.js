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
  assert.equal(translate("home.hero.title", "zh-CN"), "属于你的闪闪发光");
  assert.equal(translate("home.pink.title", "zh-CN"), "今天也要粉得刚刚好");
  assert.equal(translate("custom.hero", "zh-CN"), "属于你的闪闪发光");
  assert.equal(translate("custom.submit", "zh-CN"), "提交定制需求");
});

test("product names stay English while Chinese helper copy is localized", () => {
  for (const key of [
    "shop.essentials", "shop.baby", "shop.largePink", "shop.largeWhite",
    "shop.smallPink", "shop.smallWhite", "custom.pink", "custom.white",
    "custom.pinkStones", "custom.whiteStones"
  ]) {
    assert.equal(translations["zh-CN"][key], translations.en[key]);
  }
  assert.equal(translate("custom.helper.flat", "zh-CN"), "迷你椭圆梳");
  assert.equal(translate("custom.helper.paddle", "zh-CN"), "竹制气垫梳");
  assert.equal(translate("custom.helper.clip", "zh-CN"), "亮面醋酸抓夹");
  assert.equal(translate("custom.helper.pinkBase", "zh-CN"), "柔雾粉醋酸材质");
  assert.equal(translate("custom.helper.whiteBase", "zh-CN"), "珍珠白醋酸材质");
  assert.equal(translate("custom.helper.pinkStones", "zh-CN"), "柔粉闪光");
  assert.equal(translate("custom.helper.whiteStones", "zh-CN"), "通透珍珠光");
});
