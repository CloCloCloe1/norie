import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { wrappedSlideIndex } from "../norie-carousel.js";

const setAssets = [
  "assets/set-bamboo-white.png",
  "assets/set-bamboo-pink.png",
  "assets/set-flat-white.png",
  "assets/set-flat-pink.png"
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

  assert.match(html, /First month limited edition\./);
  assert.match(html, /Bamboo Paddle Brush \+ Claw Clip/);
  assert.match(html, /Flat Brush \+ Claw Clip/);
  assert.match(html, /set-bamboo-white\.png/);
  assert.match(html, /set-bamboo-pink\.png/);
  assert.match(html, /set-flat-white\.png/);
  assert.match(html, /set-flat-pink\.png/);
  assert.equal((html.match(/data-carousel role="region"/g) ?? []).length, 2);
  assert.equal((html.match(/href="customize\.html">Build this set<\/a>/g) ?? []).length, 2);
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
