import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

const requiredFiles = [
  "index.html",
  "shop.html",
  "customize.html",
  "norie-forms.js",
  "product-catalog.js",
  "product-detail.js",
  "product-detail.css",
  "bamboo-paddle-brush.html",
  "flat-brush.html",
  "claw-clip.html",
  "essentials-hairstyling-set.html",
  "baby-hairstyling-set.html",
  "vercel.json",
  ".env.example",
  "README.md",
  "api/_utils.js",
  "api/custom-order.js",
  "api/subscribe.js",
  "data/subscribers.json"
];

test("the deployable site and Vercel functions share one project root", () => {
  const missingFiles = requiredFiles.filter((file) => !existsSync(file));

  assert.deepEqual(missingFiles, [], `Missing deployable files: ${missingFiles.join(", ")}`);
});
