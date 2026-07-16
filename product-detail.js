import { PRODUCT_CATALOG, customizeUrl, resolveSelection } from "./product-catalog.js";

export function clampQuantity(value) {
  return Math.max(1, Math.min(10, Number.parseInt(value, 10) || 1));
}

export function detailState(productKey, variantKey, quantity = 1) {
  const product = PRODUCT_CATALOG[productKey];
  const fallbackVariant = product ? Object.keys(product.variants)[0] : "";
  const safeQuantity = clampQuantity(quantity);
  const selection = resolveSelection(productKey, variantKey, safeQuantity)
    || resolveSelection(productKey, fallbackVariant, safeQuantity);
  return selection
    ? { ...selection, customizeHref: customizeUrl(productKey, selection.variantKey, safeQuantity) }
    : null;
}

function appendDefinition(list, label, value) {
  if (!value) return;
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const definition = document.createElement("dd");
  term.textContent = label;
  definition.textContent = value;
  row.append(term, definition);
  list.append(row);
}

function renderDescription(container, state) {
  container.replaceChildren();
  const description = document.createElement("p");
  description.textContent = state.description;
  container.append(description);

  const specifications = document.createElement("dl");
  specifications.className = "product-specifications";
  appendDefinition(specifications, "Color", state.label);
  appendDefinition(specifications, "Dimensions", state.dimensions);
  appendDefinition(specifications, "Material", state.material);
  container.append(specifications);

  if (state.features?.length) {
    const heading = document.createElement("h3");
    heading.textContent = "Features";
    const list = document.createElement("ul");
    state.features.forEach((feature) => {
      const item = document.createElement("li");
      item.textContent = feature;
      list.append(item);
    });
    container.append(heading, list);
  }

  if (state.note) {
    const note = document.createElement("p");
    note.className = "product-note";
    note.textContent = state.note;
    container.append(note);
  }
}

export function initializeProductDetail(root = document) {
  const page = root.querySelector("[data-product-detail]");
  if (!page) return;
  const productKey = page.dataset.product;
  const product = PRODUCT_CATALOG[productKey];
  if (!product) return;

  const params = new URLSearchParams(window.location.search);
  let variantKey = params.get("variant") || page.dataset.initialVariant;
  let quantity = clampQuantity(params.get("quantity") || 1);
  let state = detailState(productKey, variantKey, quantity);
  variantKey = state.variantKey;

  const image = page.querySelector("[data-product-image]");
  const name = page.querySelector("[data-product-name]");
  const price = page.querySelector("[data-product-price]");
  const variantName = page.querySelector("[data-variant-name]");
  const options = page.querySelector("[data-variant-options]");
  const quantityOutput = page.querySelector("[data-quantity]");
  const decrease = page.querySelector("[data-quantity-decrease]");
  const increase = page.querySelector("[data-quantity-increase]");
  const customizeLink = page.querySelector("[data-customize-link]");
  const description = page.querySelector("[data-product-description]");

  Object.entries(product.variants).forEach(([key, variant]) => {
    const label = document.createElement("label");
    label.className = "variant-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "product-variant";
    input.value = key;
    input.checked = key === variantKey;
    const swatch = document.createElement("span");
    swatch.className = "variant-swatch";
    swatch.style.setProperty("--swatch", variant.swatch);
    swatch.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "variant-label-text";
    text.textContent = variant.label;
    input.addEventListener("change", () => {
      if (!input.checked) return;
      variantKey = key;
      render();
    });
    label.append(input, swatch, text);
    options.append(label);
  });

  function render() {
    state = detailState(productKey, variantKey, quantity);
    variantKey = state.variantKey;
    image.src = state.image;
    image.alt = state.alt;
    name.textContent = state.fullName.toUpperCase();
    price.textContent = `CAD $${state.unitPrice}`;
    variantName.textContent = state.label;
    quantityOutput.textContent = String(state.quantity);
    decrease.disabled = state.quantity <= 1;
    increase.disabled = state.quantity >= 10;
    customizeLink.textContent = state.actionLabel;
    customizeLink.href = state.customizeHref;
    renderDescription(description, state);
    document.title = `${state.fullName} | Norie`;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("variant", state.variantKey);
    window.history.replaceState({}, "", nextUrl);
  }

  decrease.addEventListener("click", () => {
    quantity = clampQuantity(quantity - 1);
    render();
  });
  increase.addEventListener("click", () => {
    quantity = clampQuantity(quantity + 1);
    render();
  });

  render();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initializeProductDetail());
  } else {
    initializeProductDetail();
  }
}
