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
  "assets/shop-claw-white-3.png",
  "assets/gift-flower-pink.jpg",
  "assets/gift-flower-white.jpg"
];

test("the ten Single Pieces product assets exist and are tracked", () => {
  const trackedFiles = new Set(
    execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split(/\r?\n/)
  );

  assert.deepEqual(productAssets.filter((asset) => !existsSync(asset)), []);
  assert.deepEqual(productAssets.filter((asset) => !trackedFiles.has(asset)), []);
});

test("Shop renders one unified fourteen-card catalog in the approved order", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="shop-products-title">([\s\S]*?)<\/section>/
  )?.[1] ?? "";
  const names = [...section.matchAll(/<h3(?: id="[^"]+")?>([^<]+)<\/h3>/g)].map((match) => match[1]);

  assert.deepEqual(names, [
    "Essentials Hairstyling Set",
    "Baby Hairstyling Set",
    "Plumeria White",
    "Plumeria Pink",
    "Pink Bamboo Paddle Brush",
    "White Bamboo Paddle Brush",
    "Pink Flat Brush",
    "White Flat Brush",
    "Norie Claw Clip in Pink",
    "Claw Clip in Pink Bow",
    "Claw Clip in Cherry Pink",
    "Claw Clip in Florie White",
    "Norie Claw Clip in White",
    "Claw Clip in Cherry White"
  ]);
  assert.equal((section.match(/<article class="product-card"(?:\s[^>]*)?>/g) ?? []).length, 14);
  assert.doesNotMatch(html, /single-products-title|set-products-title/);
});

test("Shop presents Plumeria as two cards that share a detail route", () => {
  const html = readFileSync("shop.html", "utf8");
  assert.match(html, /gift-flower-white\.jpg[\s\S]*?<h3[^>]*>Plumeria White<\/h3>[\s\S]*?product\.html\?product=plumeria&amp;color=White/i);
  assert.match(html, /gift-flower-pink\.jpg[\s\S]*?<h3[^>]*>Plumeria Pink<\/h3>[\s\S]*?product\.html\?product=plumeria&amp;color=Pink/i);
  assert.equal((html.match(/product\.html\?product=plumeria&amp;color=/g) ?? []).length, 2);
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

test("all product cards use a 3:4 contain-fit image viewport", () => {
  const html = readFileSync("shop.html", "utf8");
  const viewportRule = html.match(/\.product-image,\s*\.set-placeholder\s*\{([^}]+)\}/)?.[1] ?? "";
  const imageRule = html.match(/\.product-image img\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.match(viewportRule, /aspect-ratio:\s*3\s*\/\s*4/);
  assert.match(imageRule, /object-fit:\s*contain/);
});

test("single-product media is white while set media keeps its editorial background", () => {
  const html = readFileSync("shop.html", "utf8");
  const productRule = html.match(/\.product-image\s*\{([^}]+)\}/)?.[1] ?? "";
  const setRule = html.match(/\.set-carousel\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.match(productRule, /background:\s*#fff(?:fff)?\s*;/i);
  assert.match(setRule, /background:\s*#f8f1ef\s*;/i);
});

test("the unified Shop grid uses four, two, and one responsive columns", () => {
  const html = readFileSync("shop.html", "utf8");

  assert.match(html, /\.shop-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(html, /@media \(max-width:\s*900px\)[\s\S]*?\.shop-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(html, /@media \(max-width:\s*560px\)[\s\S]*?\.shop-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});
