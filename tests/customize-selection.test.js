import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { selectionFromSearch } from "../product-catalog.js";

test("Customize locks the product selection passed from a detail page", () => {
  const html = readFileSync("customize.html", "utf8");
  assert.match(html, /class="selected-style"/);
  assert.match(html, /id="selectedProductName"/);
  assert.match(html, /id="selectedVariantName"/);
  assert.match(html, /id="selectedQuantity"/);
  assert.match(html, /id="selectedUnitPrice"/);
  assert.match(html, /id="selectedTotalPrice"/);
  assert.match(html, /name="product" type="hidden"/);
  assert.match(html, /name="variant" type="hidden"/);
  assert.match(html, /name="quantity" type="hidden"/);
  assert.doesNotMatch(html, /name="baseColor"/);
  assert.doesNotMatch(html, /legend id="product-section-title">Product/);
  assert.match(html, /import \{[^}]*selectionFromSearch[^}]*detailUrl[^}]*\} from "\.\/product-catalog\.js"/);
});

test("Customize uses the approved direct-visit fallback", () => {
  const selection = selectionFromSearch("");
  assert.equal(selection.productKey, "flat-brush");
  assert.equal(selection.variantKey, "baby-pink");
  assert.equal(selection.quantity, 1);
});

test("the order payload sends canonical product, variant, and quantity", () => {
  const script = readFileSync("norie-forms.js", "utf8");
  assert.match(script, /product:\s*clean\(form\.elements\.product\?\.value\)/);
  assert.match(script, /variant:\s*clean\(form\.elements\.variant\?\.value\)/);
  assert.match(script, /quantity:\s*Number\.parseInt\(form\.elements\.quantity\?\.value/);
  assert.doesNotMatch(script, /baseColor:/);
});
