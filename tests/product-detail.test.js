import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { clampQuantity, detailState } from "../product-detail.js";

const pages = {
  "bamboo-paddle-brush.html": "bamboo-paddle-brush",
  "flat-brush.html": "flat-brush",
  "claw-clip.html": "claw-clip",
  "essentials-hairstyling-set.html": "essentials-hairstyling-set",
  "baby-hairstyling-set.html": "baby-hairstyling-set"
};

test("five detail pages use the shared responsive product structure", () => {
  for (const [page, productKey] of Object.entries(pages)) {
    assert.equal(existsSync(page), true, `Missing ${page}`);
    const html = readFileSync(page, "utf8");
    assert.match(html, new RegExp(`data-product="${productKey}"`));
    assert.match(html, /<link rel="stylesheet" href="product-detail\.css">/);
    assert.match(html, /<script type="module" src="product-detail\.js"><\/script>/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.match(html, /class="product-detail-media"/);
    assert.match(html, /data-variant-options/);
    assert.match(html, /data-quantity-decrease/);
    assert.match(html, /data-quantity-increase/);
    assert.match(html, /data-customize-link/);
    assert.match(html, /data-product-description/);
  }
});

test("detail stylesheet uses a square image and one-column mobile layout", () => {
  const css = readFileSync("product-detail.css", "utf8");
  assert.match(css, /\.product-detail-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.product-detail-media\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.product-detail-layout\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("quantity clamps to the approved 1 through 10 range", () => {
  assert.equal(clampQuantity(0), 1);
  assert.equal(clampQuantity(4), 4);
  assert.equal(clampQuantity(11), 10);
});

test("detail state resolves a selected variant and Customize URL", () => {
  const state = detailState("claw-clip", "pink-cherry", 2);
  assert.equal(state.fullName, "Norie Clip in Pink Cherry");
  assert.equal(state.image, "assets/shop-claw-pink-3.png");
  assert.equal(state.customizeHref, "customize.html?product=claw-clip&variant=pink-cherry&quantity=2");
});
