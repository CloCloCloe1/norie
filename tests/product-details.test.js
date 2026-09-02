import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(file, "utf8");

test("Shop exposes both Plumeria colors through one shared detail page", async () => {
  const shop = await read("shop.html");

  assert.match(shop, /<h3[^>]*>Plumeria White<\/h3>[\s\S]*?href="product\.html\?product=plumeria&amp;color=White"/i);
  assert.match(shop, /<h3[^>]*>Plumeria Pink<\/h3>[\s\S]*?href="product\.html\?product=plumeria&amp;color=Pink"/i);
});

test("Shop uses the approved claw clip names and destinations", async () => {
  const shop = await read("shop.html");
  const fixedProducts = [
    ["Claw Clip in Pink Bow", "pink-bow"],
    ["Claw Clip in Cherry Pink", "cherry-pink"],
    ["Claw Clip in Florie White", "florie-white"],
    ["Claw Clip in Cherry White", "cherry-white"]
  ];

  for (const [name, id] of fixedProducts) {
    assert.match(shop, new RegExp(`<h3[^>]*>${name}<\\/h3>[\\s\\S]*?href="product\\.html\\?product=${id}"`, "i"));
  }
  assert.match(shop, /<h3[^>]*>Norie Claw Clip in Pink<\/h3>[\s\S]*?customize\.html\?product=claw-clip/i);
  assert.match(shop, /<h3[^>]*>Norie Claw Clip in White<\/h3>[\s\S]*?customize\.html\?product=claw-clip/i);
});

test("the reusable detail module allowlists routes and defaults invalid Plumeria colors", async () => {
  const module = await import("../norie-product-details.js");

  assert.equal(module.selectDetail("?product=unknown"), null);
  assert.equal(module.selectDetail("?product=plumeria&color=Pink").color, "Pink");
  assert.equal(module.selectDetail("?product=plumeria&color=Blue").color, "White");
  for (const id of ["pink-bow", "cherry-pink", "florie-white", "cherry-white"]) {
    assert.equal(module.selectDetail(`?product=${id}`).detail.cartProductId, id);
  }
});

test("product detail markup supports selection, direct cart addition, and live status", async () => {
  const [html, script] = await Promise.all([read("product.html"), read("norie-product-details.js")]);

  assert.match(html, /<main[^>]+id="main"/i);
  assert.match(html, /<h1[^>]+data-product-name/i);
  assert.match(html, /<fieldset[^>]+data-color-selector/i);
  assert.match(html, /<button[^>]+data-add-to-cart/i);
  assert.match(html, /role="status"[^>]+aria-live="polite"/i);
  assert.match(script, /addLine\(store\.read\(\)/);
  assert.match(script, /customText:\s*""/);
});
