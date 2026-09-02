export const CART_STORAGE_KEY = "norie.cart.v1";
export const MAX_LINE_QUANTITY = 20;
export const MAX_CART_LINES = 40;

export const productCatalog = Object.freeze({
  "essentials-set": { name: "Essentials Hairstyling Set", customizable: true, launchPrice: 38, originalPrice: 48, variants: ["Pink", "White"] },
  "baby-set": { name: "Baby Hairstyling Set", customizable: true, launchPrice: 32, originalPrice: 40, variants: ["Pink", "White"] },
  "large-comb": { name: "Bamboo Paddle Brush", customizable: true, launchPrice: 30, originalPrice: 38, variants: ["Pink", "White"] },
  "small-comb": { name: "Flat Brush", customizable: true, launchPrice: 25, originalPrice: 32, variants: ["Pink", "White"] },
  "claw-clip": { name: "Claw Clip", customizable: true, launchPrice: 12, originalPrice: 16, variants: ["Pink", "White"] },
  plumeria: { name: "Plumeria Clip Set", customizable: false, launchPrice: 10, originalPrice: 12, variants: ["Pink", "White"] }
});

const cleanText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export function deriveStoneColor(baseColor) {
  if (baseColor === "Pink") return "White stones";
  if (baseColor === "White") return "Pink stones";
  throw new Error("Choose a valid base color.");
}

export function normalizeLine(value) {
  const product = productCatalog[value?.productId];
  const baseColor = cleanText(value?.baseColor);
  const customText = cleanText(value?.customText);
  const quantity = Math.min(MAX_LINE_QUANTITY, Math.max(1, Number.parseInt(value?.quantity, 10) || 1));

  if (!product || !product.variants.includes(baseColor)) return null;
  if (customText.length > 8) return null;
  if (!product.customizable && customText) return null;

  return { productId: value.productId, baseColor, customText, quantity };
}

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_CART_LINES).map(normalizeLine).filter(Boolean);
}

export const lineKey = (line) => `${line.productId}|${line.baseColor}|${cleanText(line.customText)}`;

export function addLine(cart, candidate) {
  const line = normalizeLine(candidate);
  if (!line) throw new Error("Choose a valid product configuration.");

  const next = normalizeCart(cart);
  const match = next.find((item) => lineKey(item) === lineKey(line));
  if (match) {
    match.quantity = Math.min(MAX_LINE_QUANTITY, match.quantity + line.quantity);
  } else if (next.length < MAX_CART_LINES) {
    next.push(line);
  } else {
    throw new Error("The cart has too many different items.");
  }
  return next;
}

export function setQuantity(cart, key, quantity) {
  const nextQuantity = Math.min(MAX_LINE_QUANTITY, Math.max(1, Number.parseInt(quantity, 10) || 1));
  return normalizeCart(cart).map((line) => lineKey(line) === key ? { ...line, quantity: nextQuantity } : line);
}

export const removeLine = (cart, key) => normalizeCart(cart).filter((line) => lineKey(line) !== key);
export const cartCount = (cart) => normalizeCart(cart).reduce((sum, line) => sum + line.quantity, 0);
export const cartTotal = (cart) => normalizeCart(cart).reduce(
  (sum, line) => sum + productCatalog[line.productId].launchPrice * line.quantity,
  0
);

export function createCartStore(storage = globalThis.localStorage, eventTarget = globalThis) {
  const read = () => {
    try {
      return normalizeCart(JSON.parse(storage?.getItem(CART_STORAGE_KEY) || "[]"));
    } catch {
      return [];
    }
  };

  const write = (cart) => {
    const normalized = normalizeCart(cart);
    storage?.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
    if (eventTarget?.dispatchEvent && typeof CustomEvent === "function") {
      eventTarget.dispatchEvent(new CustomEvent("norie:cartchange", { detail: normalized }));
    }
    return normalized;
  };

  return { read, write, clear: () => write([]) };
}

export function updateCartBadges(cart = createCartStore().read()) {
  if (typeof document === "undefined") return;
  const count = cartCount(cart);
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
  document.querySelectorAll("[data-cart-label]").forEach((label) => {
    label.textContent = count ? `Cart, ${count} items` : "Cart, empty";
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const refresh = (event) => updateCartBadges(event?.detail);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => refresh());
  else refresh();
  window.addEventListener("norie:cartchange", refresh);
}
