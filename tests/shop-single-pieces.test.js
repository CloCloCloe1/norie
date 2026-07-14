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
