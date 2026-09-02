import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { decorativeClawStyles, selectDetail } from "../norie-product-details.js";

const read = (file) => readFile(file, "utf8");

const expectedStyles = Object.freeze({
  "pink-bow": { name: "Claw Clip in Pink Bow", color: "Pink", image: "assets/shop-claw-pink-2.png" },
  "cherry-pink": { name: "Claw Clip in Cherry Pink", color: "Pink", image: "assets/shop-claw-pink-3.png" },
  "florie-white": { name: "Claw Clip in Florie White", color: "White", image: "assets/shop-claw-white-1.png" },
  "cherry-white": { name: "Claw Clip in Cherry White", color: "White", image: "assets/shop-claw-white-3.png" }
});

test("the decorative claw parent route selects each trusted fixed style", () => {
  assert.deepEqual(Object.keys(decorativeClawStyles), Object.keys(expectedStyles));

  for (const [id, expected] of Object.entries(expectedStyles)) {
    const selected = selectDetail(`?product=decorative-claw&style=${id}`);
    assert.equal(selected.style.id, id);
    assert.equal(selected.style.cartProductId, id);
    assert.equal(selected.style.name, expected.name);
    assert.equal(selected.style.color, expected.color);
    assert.equal(selected.style.image, expected.image);
    assert.equal(selected.detail.cartProductId, id);
    assert.equal(selected.detail.launchPrice, 12);
    assert.equal(selected.detail.originalPrice, 16);
  }
});

test("an unknown decorative claw style safely falls back to Pink Bow", () => {
  const selected = selectDetail("?product=decorative-claw&style=unknown");

  assert.equal(selected.style.id, "pink-bow");
  assert.equal(selected.detail.cartProductId, "pink-bow");
});

test("the shared detail exposes four circular native-radio style choices", async () => {
  const product = await read("product.html");

  assert.match(product, /<fieldset[^>]*data-style-selector/i);
  assert.equal((product.match(/name="productStyle"/g) ?? []).length, 4);
  assert.equal((product.match(/class="style-swatch"/g) ?? []).length, 4);
  for (const id of Object.keys(expectedStyles)) {
    assert.match(product, new RegExp(`type="radio"[^>]+name="productStyle"[^>]+value="${id}"`, "i"));
  }
  assert.match(product, /\.style-swatch\s*\{[^}]*border-radius:\s*50%/i);
  assert.doesNotMatch(product, /class="style-option-card"/i);
});

test("Shop sends all four decorative cards to the shared style route", async () => {
  const shop = await read("shop.html");

  for (const [style, { name }] of Object.entries(expectedStyles)) {
    assert.match(
      shop,
      new RegExp(`${name}[\\s\\S]*?product\\.html\\?product=decorative-claw&amp;style=${style}`, "i")
    );
  }
});
