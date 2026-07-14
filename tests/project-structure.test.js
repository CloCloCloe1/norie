import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

const requiredFiles = [
  "index.html",
  "shop.html",
  "customize.html",
  "norie-forms.js",
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
