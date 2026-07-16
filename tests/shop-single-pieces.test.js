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
  const names = [...section.matchAll(/<h3(?: id="[^"]+")?>(?:<a[^>]+>)?([^<]+)(?:<\/a>)?<\/h3>/g)].map((match) => match[1]);

  assert.deepEqual(names, [
    "ESSENTIALS HAIRSTYLING SET",
    "BABY HAIRSTYLING SET",
    "BAMBOO PADDLE BRUSH IN BABY PINK",
    "BAMBOO PADDLE BRUSH IN PEARL WHITE",
    "FLAT BRUSH IN BABY PINK",
    "FLAT BRUSH IN PEARL WHITE",
    "NORIE CLIP IN BABY PINK",
    "NORIE CLIP IN PINK BOW",
    "NORIE CLIP IN PINK CHERRY",
    "NORIE CLIP IN FLORIE PEARL",
    "NORIE CLIP IN CREAM WHITE",
    "NORIE CLIP IN WHITE CHERRY"
  ]);
  assert.equal((section.match(/<article class="product-card">/g) ?? []).length, 12);
  assert.equal((section.match(/class="product-action"[^>]+>VIEW DETAILS<\/a>/g) ?? []).length, 12);
  assert.doesNotMatch(html, /single-products-title|set-products-title/);
});

test("Shop images, names, and actions link to the approved product details", () => {
  const html = readFileSync("shop.html", "utf8");
  const destinations = [
    "bamboo-paddle-brush.html?variant=baby-pink",
    "bamboo-paddle-brush.html?variant=pearl-white",
    "flat-brush.html?variant=baby-pink",
    "flat-brush.html?variant=pearl-white",
    "claw-clip.html?variant=baby-pink",
    "claw-clip.html?variant=pink-bow",
    "claw-clip.html?variant=pink-cherry",
    "claw-clip.html?variant=florie-pearl",
    "claw-clip.html?variant=cream-white",
    "claw-clip.html?variant=white-cherry"
  ];

  for (const destination of destinations) {
    assert.equal((html.match(new RegExp(destination.replaceAll("?", "\\?").replaceAll("-", "\\-"), "g")) ?? []).length, 3);
  }
  assert.equal((html.match(/data-carousel-detail-link/g) ?? []).length, 6);
  assert.equal((html.match(/data-detail-href=/g) ?? []).length, 4);
});

test("Shop cards use the approved description-free centered presentation", () => {
  const html = readFileSync("shop.html", "utf8");
  const section = html.match(
    /<section class="section" aria-labelledby="shop-products-title">([\s\S]*?)<\/section>/
  )?.[1] ?? "";
  const cardCopy = [...section.matchAll(/<div class="card-copy">([\s\S]*?)<\/div>\s*<\/article>/g)].map((match) => match[1]);

  assert.equal(cardCopy.length, 12);
  assert.equal((section.match(/class="product-kicker"/g) ?? []).length, 0);
  assert.ok(cardCopy.every((copy) => (copy.match(/<p>/g) ?? []).length === 0));
  assert.equal((section.match(/class="price-row"/g) ?? []).length, 12);
  assert.match(html, /\.card-copy\s*\{[^}]*text-align:\s*center/s);
  assert.match(html, /\.price-row\s*\{[^}]*justify-content:\s*center/s);
});

test("Shop actions and carousel controls use the approved scale and states", () => {
  const html = readFileSync("shop.html", "utf8");
  const carouselRule = html.match(/\.set-carousel\s*\{([^}]+)\}/)?.[1] ?? "";
  const buttonRule = html.match(/\.set-carousel-button\s*\{([^}]+)\}/)?.[1] ?? "";

  assert.equal((html.match(/class="product-action"[^>]+>VIEW DETAILS<\/a>/g) ?? []).length, 12);
  assert.match(carouselRule, /aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(buttonRule, /height:\s*1\.75rem/);
  assert.match(buttonRule, /width:\s*1\.75rem/);
  assert.match(html, /\.product-action\s*\{[^}]*border:\s*1px solid/s);
  assert.match(html, /\.product-action:hover\s*\{[^}]*background:\s*#f1f1f1/s);
  assert.match(html, /\.product-action:focus-visible\s*\{/);
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
