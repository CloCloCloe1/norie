import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const productAssets = [
  "assets/shop-large-pink.png",
  "assets/shop-large-white.png",
  "assets/shop-small-pink.png",
  "assets/shop-small-white.png",
  "assets/shop-claw-pink-1.png",
  "assets/shop-claw-pink-2.png",
  "assets/shop-claw-pink-3.png",
  "assets/shop-claw-white-1.png",
  "assets/shop-claw-white-2.png",
  "assets/shop-claw-white-3.png"
];

test("the ten Single Pieces product assets exist and are tracked", () => {
  const trackedFiles = new Set(
    execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split(/\r?\n/)
  );

  assert.deepEqual(productAssets.filter((asset) => !existsSync(asset)), []);
  assert.deepEqual(productAssets.filter((asset) => !trackedFiles.has(asset)), []);
});

test("Shop renders ten independent Single Pieces cards in the approved order", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="single-products-title">([\s\S]*?)<section class="section" aria-labelledby="set-products-title">/
  )?.[1] ?? "";
  const names = [...section.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]);

  assert.deepEqual(names, [
    "Pink Large Comb",
    "White Large Comb",
    "Pink Small Comb",
    "White Small Comb",
    "Pink Claw Clip 1",
    "Pink Claw Clip 2",
    "Pink Claw Clip 3",
    "White Claw Clip 1",
    "White Claw Clip 2",
    "White Claw Clip 3"
  ]);
  assert.equal((section.match(/<article class="product-card">/g) ?? []).length, 10);
  assert.equal((section.match(/href="customize\.html">Customize this piece<\/a>/g) ?? []).length, 10);
});

test("Shop maps all ten square assets with accessible loading metadata", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="single-products-title">([\s\S]*?)<section class="section" aria-labelledby="set-products-title">/
  )?.[1] ?? "";
  const images = [...section.matchAll(/<img src="assets\/shop-[^"]+"[^>]+>/g)].map(([image]) => image);

  assert.equal(images.length, 10);
  for (const image of images) {
    assert.match(image, /alt="[^"]+"/);
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
    assert.match(image, /width="[0-9]+"/);
    assert.match(image, /height="[0-9]+"/);
  }
});

test("Single Pieces use a square contain-fit image viewport", () => {
  const html = readFileSync("shop.html", "utf8");
  const viewportRule = html.match(/\.product-image,\s*\.set-placeholder\s*\{([^}]+)\}/)?.[1] ?? "";
  const imageRule = html.match(/\.product-image img\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.match(viewportRule, /aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(imageRule, /object-fit:\s*contain/);
});
