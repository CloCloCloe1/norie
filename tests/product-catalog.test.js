import assert from "node:assert/strict";
import test from "node:test";
import {
  PRODUCT_CATALOG,
  resolveSelection,
  selectionFromSearch
} from "../product-catalog.js";

test("catalog contains the five approved products and fourteen variants", () => {
  assert.deepEqual(Object.keys(PRODUCT_CATALOG), [
    "bamboo-paddle-brush",
    "flat-brush",
    "claw-clip",
    "essentials-hairstyling-set",
    "baby-hairstyling-set"
  ]);
  assert.equal(Object.values(PRODUCT_CATALOG).flatMap(({ variants }) => Object.keys(variants)).length, 14);
});

test("catalog maps approved variant names, images, and prices", () => {
  const cherry = resolveSelection("claw-clip", "pink-cherry", 2);
  assert.equal(cherry.fullName, "Norie Clip in Pink Cherry");
  assert.equal(cherry.image, "assets/shop-claw-pink-3.png");
  assert.equal(cherry.unitPrice, 12);
  assert.equal(cherry.totalPrice, 24);

  const paddle = resolveSelection("bamboo-paddle-brush", "pearl-white", 1);
  assert.equal(paddle.fullName, "Bamboo Paddle Brush in Pearl White");
  assert.equal(paddle.image, "assets/shop-large-white.png");
  assert.equal(paddle.unitPrice, 30);
});

test("baby-pink variants keep their key but display Ballet Pink", () => {
  const productKeys = [
    "bamboo-paddle-brush",
    "flat-brush",
    "claw-clip",
    "essentials-hairstyling-set",
    "baby-hairstyling-set"
  ];

  for (const productKey of productKeys) {
    const selection = resolveSelection(productKey, "baby-pink", 1);
    assert.equal(selection.variantKey, "baby-pink");
    assert.equal(selection.label, "Ballet Pink");
    assert.match(selection.fullName, /Ballet Pink/);
    assert.match(selection.alt, /Ballet pink/i);
    assert.doesNotMatch(`${selection.label} ${selection.fullName} ${selection.alt}`, /Baby Pink/i);
  }
});

test("selection validation rejects unknown combinations and quantity outside 1 through 10", () => {
  assert.equal(resolveSelection("claw-clip", "unknown", 1), null);
  assert.equal(resolveSelection("unknown", "baby-pink", 1), null);
  assert.equal(resolveSelection("flat-brush", "baby-pink", 0), null);
  assert.equal(resolveSelection("flat-brush", "baby-pink", 11), null);
  assert.equal(resolveSelection("flat-brush", "baby-pink", 1.5), null);
});

test("invalid or missing Customize parameters use the approved safe default", () => {
  const selection = selectionFromSearch("?product=unknown&variant=bad&quantity=99");
  assert.equal(selection.productKey, "flat-brush");
  assert.equal(selection.variantKey, "baby-pink");
  assert.equal(selection.quantity, 1);
});
