import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { initializeCarousel, wrappedSlideIndex } from "../norie-carousel.js";

const setAssets = [
  "assets/set-bamboo-white.png",
  "assets/set-bamboo-pink.png",
  "assets/set-flat-white.png",
  "assets/set-flat-pink.png"
];

const shopSetAssets = [
  "assets/shop-set-essentials-white.png",
  "assets/shop-set-essentials-pink.png",
  "assets/shop-set-baby-pink.png",
  "assets/shop-set-baby-white.png"
];

test("the four limited-edition set images are deployable assets", () => {
  const missingAssets = setAssets.filter((asset) => !existsSync(asset));

  assert.deepEqual(missingAssets, [], `Missing set assets: ${missingAssets.join(", ")}`);
});

test("wrappedSlideIndex moves forward and wraps", () => {
  assert.equal(wrappedSlideIndex(0, 1, 2), 1);
  assert.equal(wrappedSlideIndex(1, 1, 2), 0);
});

test("wrappedSlideIndex moves backward and handles empty tracks", () => {
  assert.equal(wrappedSlideIndex(0, -1, 2), 1);
  assert.equal(wrappedSlideIndex(1, -1, 2), 0);
  assert.equal(wrappedSlideIndex(0, 1, 0), 0);
});

test("homepage renders the two updated set carousels", () => {
  const html = readFileSync("index.html", "utf8");

  assert.match(html, /First month limited edition\./);
  assert.match(html, /Bamboo Paddle Brush \+ Claw Clip/);
  assert.match(html, /Flat Brush \+ Claw Clip/);
  assert.match(html, /set-bamboo-white\.png/);
  assert.match(html, /set-bamboo-pink\.png/);
  assert.match(html, /set-flat-white\.png/);
  assert.match(html, /set-flat-pink\.png/);
  assert.equal((html.match(/data-carousel role="region"/g) ?? []).length, 2);
  assert.match(html, /<script type="module" src="norie-carousel\.js"><\/script>/);
});

test("Shop page renders the two updated set carousels", () => {
  const html = readFileSync("shop.html", "utf8");

  assert.match(html, /ESSENTIALS HAIRSTYLING SET/);
  assert.match(html, /BABY HAIRSTYLING SET/);
  assert.match(html, /Previous Essentials Hairstyling Set image/);
  assert.match(html, /Next Essentials Hairstyling Set image/);
  assert.match(html, /Previous Baby Hairstyling Set image/);
  assert.match(html, /Next Baby Hairstyling Set image/);
  for (const asset of shopSetAssets) {
    assert.match(html, new RegExp(asset.replace("assets/", "").replace(".", "\\.")));
  }
  assert.equal((html.match(/data-carousel role="region"/g) ?? []).length, 2);
  assert.equal((html.match(/class="product-action" href="customize\.html">BUILD THIS SET<\/a>/g) ?? []).length, 2);
  assert.match(html, /<script type="module" src="norie-carousel\.js"><\/script>/);
});

test("carousel controls use a two-tone focus indicator over product photos", () => {
  for (const page of ["index.html", "shop.html"]) {
    const html = readFileSync(page, "utf8");
    const focusRule = html.match(/\.set-carousel-button:focus-visible\s*\{([^}]+)\}/)?.[1] ?? "";

    assert.match(focusRule, /outline:\s*3px solid var\(--berry\)/);
    assert.match(focusRule, /box-shadow:\s*0 0 0 6px #fff/);
  }
});

test("Shop page image dependencies and Node metadata are tracked", () => {
  const trackedFiles = new Set(execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split(/\r?\n/));
  const requiredTrackedFiles = [
    "package.json",
    "assets/product-large-pink-square.jpg",
    "assets/product-large-white-square.jpg",
    "assets/product-small-pink-square.jpg",
    "assets/product-small-white-square.jpg",
    "assets/product-claw-pink-square.jpg",
    "assets/product-claw-white-square.jpg"
  ];

  assert.deepEqual(
    requiredTrackedFiles.filter((file) => !trackedFiles.has(file)),
    [],
    "Production dependencies must be committed"
  );
});

test("set carousel images defer loading and declare page-appropriate dimensions", () => {
  const homepageImages = [...readFileSync("index.html", "utf8").matchAll(/<img class="set-carousel-slide"[^>]+>/g)].map(([image]) => image);
  const shopImages = [...readFileSync("shop.html", "utf8").matchAll(/<img class="set-carousel-slide"[^>]+>/g)].map(([image]) => image);

  assert.equal(homepageImages.length, 4);
  assert.equal(shopImages.length, 4);
  for (const image of [...homepageImages, ...shopImages]) {
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
  }
  for (const image of homepageImages) {
    assert.match(image, /width="1414"/);
    assert.match(image, /height="2000"/);
  }
  for (const image of shopImages) {
    const width = image.match(/width="([0-9]+)"/)?.[1];
    const height = image.match(/height="([0-9]+)"/)?.[1];
    assert.equal(width, height);
  }
});

test("the four square Shop set images are deployable tracked assets", () => {
  const trackedFiles = new Set(execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split(/\r?\n/));

  assert.deepEqual(shopSetAssets.filter((asset) => !existsSync(asset)), []);
  assert.deepEqual(shopSetAssets.filter((asset) => !trackedFiles.has(asset)), []);
});

test("rapid carousel clicks keep the requested target during smooth scrolling", () => {
  const listeners = {};
  const previous = { hidden: true, addEventListener(type, listener) { this[type] = listener; } };
  const next = { hidden: true, addEventListener(type, listener) { this[type] = listener; } };
  const status = { hidden: true, textContent: "" };
  const track = {
    clientWidth: 100,
    scrollLeft: 0,
    scrollCalls: [],
    addEventListener(type, listener) { listeners[type] = listener; },
    scrollTo(options) { this.scrollCalls.push(options); }
  };
  const slides = [{}, {}];
  const carousel = {
    querySelector(selector) {
      return {
        "[data-carousel-track]": track,
        "[data-carousel-previous]": previous,
        "[data-carousel-next]": next,
        "[data-carousel-status]": status
      }[selector];
    },
    querySelectorAll() { return slides; }
  };
  const originalWindow = globalThis.window;
  globalThis.window = {
    matchMedia: () => ({ matches: false }),
    cancelAnimationFrame: () => {},
    requestAnimationFrame: (callback) => { callback(); return 1; },
    clearTimeout: () => {},
    setTimeout: () => 1
  };

  try {
    initializeCarousel(carousel);
    next.click();
    track.scrollLeft = 10;
    listeners.scroll();
    next.click();

    assert.deepEqual(track.scrollCalls.map(({ left }) => left), [100, 0]);
    assert.equal(status.textContent, "1 / 2");
  } finally {
    globalThis.window = originalWindow;
  }
});
