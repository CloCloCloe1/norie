import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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
