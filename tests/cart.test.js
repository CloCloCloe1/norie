import assert from "node:assert/strict";
import test from "node:test";
import {
  CART_STORAGE_KEY,
  addLine,
  cartCount,
  cartTotal,
  createCartStore,
  deriveStoneColor,
  lineKey,
  normalizeCart,
  productCatalog,
  removeLine,
  setQuantity
} from "../norie-cart.js";

test("Plumeria is a non-customizable CAD $10 three-piece set", () => {
  assert.deepEqual(productCatalog.plumeria, {
    name: "Plumeria Clip Set",
    customizable: false,
    launchPrice: 10,
    originalPrice: 12,
    variants: ["Pink", "White"]
  });
});

test("fixed decorative claw clips accept only their pictured color and no custom text", () => {
  for (const [productId, baseColor] of [
    ["pink-bow", "Pink"],
    ["cherry-pink", "Pink"],
    ["florie-white", "White"],
    ["cherry-white", "White"]
  ]) {
    assert.equal(productCatalog[productId].customizable, false);
    assert.deepEqual(productCatalog[productId].variants, [baseColor]);
    assert.equal(productCatalog[productId].launchPrice, 12);
    assert.equal(normalizeCart([{ productId, baseColor, customText: "C", quantity: 1 }]).length, 0);
    assert.deepEqual(normalizeCart([{ productId, baseColor, customText: "", quantity: 1 }]), [
      { productId, baseColor, customText: "", quantity: 1 }
    ]);
  }
});

test("customizable products derive contrasting stones", () => {
  assert.equal(deriveStoneColor("Pink"), "White stones");
  assert.equal(deriveStoneColor("White"), "Pink stones");
  assert.throws(() => deriveStoneColor("Blue"), /valid base color/i);
});

test("identical configurations merge and different text stays separate", () => {
  const amy = { productId: "large-comb", baseColor: "Pink", customText: "Amy", quantity: 1 };
  const merged = addLine(addLine([], amy), amy);
  const separate = addLine(merged, { ...amy, customText: "Mia" });

  assert.equal(merged[0].quantity, 2);
  assert.equal(separate.length, 2);
  assert.notEqual(lineKey(separate[0]), lineKey(separate[1]));
});

test("normalization rejects unknown and customized Plumeria lines", () => {
  assert.deepEqual(normalizeCart([
    { productId: "unknown", baseColor: "Pink", customText: "", quantity: 1 },
    { productId: "plumeria", baseColor: "Pink", customText: "Amy", quantity: 1 },
    { productId: "plumeria", baseColor: "White", customText: "", quantity: 2 }
  ]), [{ productId: "plumeria", baseColor: "White", customText: "", quantity: 2 }]);
});

test("quantities are capped and totals use catalog prices", () => {
  const cart = [
    { productId: "plumeria", baseColor: "Pink", customText: "", quantity: 2 },
    { productId: "large-comb", baseColor: "White", customText: "Norie", quantity: 1 }
  ];

  assert.equal(setQuantity(cart, lineKey(cart[0]), 99)[0].quantity, 20);
  assert.equal(cartCount(cart), 3);
  assert.equal(cartTotal(cart), 50);
  assert.equal(removeLine(cart, lineKey(cart[0])).length, 1);
});

test("the store recovers from malformed storage and persists normalized lines", () => {
  const values = new Map([[CART_STORAGE_KEY, "not-json"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const store = createCartStore(storage, null);

  assert.deepEqual(store.read(), []);
  store.write([{ productId: "plumeria", baseColor: "Pink", customText: "", quantity: 1 }]);
  assert.deepEqual(JSON.parse(values.get(CART_STORAGE_KEY)), [
    { productId: "plumeria", baseColor: "Pink", customText: "", quantity: 1 }
  ]);
});
