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

test("Shop renders one unified twelve-card catalog in the approved order", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="shop-products-title">([\s\S]*?)<\/section>/
  )?.[1] ?? "";
  const names = [...section.matchAll(/<h3(?: id="[^"]+")?>([^<]+)<\/h3>/g)].map((match) => match[1]);

  assert.deepEqual(names, [
    "Essentials Hairstyling Set",
    "Baby Hairstyling Set",
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
  assert.equal((section.match(/<article class="product-card">/g) ?? []).length, 12);
  assert.equal((section.match(/href="customize\.html">(?:Build this set|Customize this piece)<\/a>/g) ?? []).length, 12);
  assert.doesNotMatch(html, /single-products-title|set-products-title/);
});

test("Shop maps all ten square assets with accessible loading metadata", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="shop-products-title">([\s\S]*?)<\/section>/
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

test("single-piece cards use a square contain-fit image viewport", () => {
  const html = readFileSync("shop.html", "utf8");
  const viewportRule = html.match(/\.product-image,\s*\.set-placeholder\s*\{([^}]+)\}/)?.[1] ?? "";
  const imageRule = html.match(/\.product-image img\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.match(viewportRule, /aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(imageRule, /object-fit:\s*contain/);
});

test("the unified Shop grid uses four, two, and one responsive columns", () => {
  const html = readFileSync("shop.html", "utf8");

  assert.match(html, /\.shop-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(html, /@media \(max-width:\s*900px\)[\s\S]*?\.shop-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(html, /@media \(max-width:\s*560px\)[\s\S]*?\.shop-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});
