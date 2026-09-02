import { addLine, createCartStore } from "./norie-cart.js";
import { getLocale, translate } from "./norie-i18n.js";

const fixed = (value) => Object.freeze(value);

export const decorativeClawStyles = Object.freeze({
  "pink-bow": fixed({ id: "pink-bow", cartProductId: "pink-bow", name: "Claw Clip in Pink Bow", color: "Pink", image: "assets/shop-claw-pink-2.png", alt: "Pink claw clip with white bow details and crystals", descriptionKey: "product.pinkBow.description", contentsKey: "product.pinkBow.contents" }),
  "cherry-pink": fixed({ id: "cherry-pink", cartProductId: "cherry-pink", name: "Claw Clip in Cherry Pink", color: "Pink", image: "assets/shop-claw-pink-3.png", alt: "Pink claw clip with red cherry crystal details", descriptionKey: "product.cherryPink.description", contentsKey: "product.cherryPink.contents" }),
  "florie-white": fixed({ id: "florie-white", cartProductId: "florie-white", name: "Claw Clip in Florie White", color: "White", image: "assets/shop-claw-white-1.png", alt: "White claw clip with pale pink flower and butterfly details", descriptionKey: "product.florieWhite.description", contentsKey: "product.florieWhite.contents" }),
  "cherry-white": fixed({ id: "cherry-white", cartProductId: "cherry-white", name: "Claw Clip in Cherry White", color: "White", image: "assets/shop-claw-white-3.png", alt: "White claw clip with red cherry crystal details", descriptionKey: "product.cherryWhite.description", contentsKey: "product.cherryWhite.contents" })
});

export const detailCatalog = Object.freeze({
  plumeria: fixed({
    cartProductId: "plumeria",
    name: "Plumeria Clip Set",
    images: fixed({ White: "assets/gift-flower-white.jpg", Pink: "assets/gift-flower-pink.jpg" }),
    alts: fixed({ White: "White Plumeria three-piece claw clip set", Pink: "Pink Plumeria three-piece claw clip set" }),
    colors: fixed(["White", "Pink"]),
    defaultColor: "White",
    descriptionKey: "product.plumeria.description",
    contentsKey: "product.plumeria.contents",
    launchPrice: 10,
    originalPrice: 12
  }),
  "decorative-claw": fixed({ launchPrice: 12, originalPrice: 16 })
});

export function selectDetail(search) {
  const params = new URLSearchParams(search);
  const detail = detailCatalog[params.get("product")];
  if (!detail) return null;
  if (params.get("product") === "decorative-claw") {
    const style = decorativeClawStyles[params.get("style")] || decorativeClawStyles["pink-bow"];
    return { detail: fixed({ ...detail, ...style, defaultColor: style.color }), color: style.color, style };
  }
  const requested = params.get("color");
  const color = detail.colors?.includes(requested) ? requested : detail.defaultColor || detail.colors?.[0];
  return { detail, color };
}

function initialize() {
  const selection = selectDetail(window.location.search);
  const product = document.querySelector("[data-product-detail]");
  const unavailable = document.querySelector("[data-product-unavailable]");
  if (!selection) {
    product.hidden = true;
    unavailable.hidden = false;
    document.querySelector("[data-unavailable-message]").textContent = translate("product.unavailable", getLocale());
    document.querySelector("[data-product-unavailable] h1").focus();
    return;
  }

  let detail = selection.detail;
  let selectedColor = selection.color;
  const image = document.querySelector("[data-product-image]");
  const name = document.querySelector("[data-product-name]");
  const description = document.querySelector("[data-product-description]");
  const contents = document.querySelector("[data-product-contents]");
  const selector = document.querySelector("[data-color-selector]");
  const styleSelector = document.querySelector("[data-style-selector]");
  const status = document.querySelector("[data-product-status]");
  const store = createCartStore();

  const renderImage = () => {
    image.src = detail.images?.[selectedColor] || detail.image;
    image.alt = detail.alts?.[selectedColor] || detail.alt;
  };
  const renderLocale = () => {
    document.title = `${detail.name} | Norie`;
    description.textContent = translate(detail.descriptionKey, getLocale());
    contents.textContent = translate(detail.contentsKey, getLocale());
  };

  name.textContent = detail.name;
  document.querySelector("[data-launch-price]").textContent = `CAD $${detail.launchPrice}`;
  document.querySelector("[data-original-price]").textContent = `CAD $${detail.originalPrice}`;
  renderImage();
  renderLocale();

  if (detail.colors) {
    selector.hidden = false;
    selector.querySelectorAll("input[name='productColor']").forEach((input) => {
      input.checked = input.value === selectedColor;
      input.addEventListener("change", () => {
        selectedColor = input.value;
        renderImage();
        const url = new URL(window.location.href);
        url.searchParams.set("product", "plumeria");
        url.searchParams.set("color", selectedColor);
        window.history.replaceState({}, "", url);
        status.textContent = translate("product.selection", getLocale(), `${detail.name}: ${selectedColor}`);
      });
    });
  }

  if (selection.style) {
    styleSelector.hidden = false;
    styleSelector.querySelectorAll("input[name='productStyle']").forEach((input) => {
      input.checked = input.value === selection.style.id;
      input.addEventListener("change", () => {
        const next = decorativeClawStyles[input.value];
        if (!next) return;
        detail = fixed({ ...detailCatalog["decorative-claw"], ...next, defaultColor: next.color });
        selectedColor = next.color;
        name.textContent = next.name;
        renderImage();
        renderLocale();
        const url = new URL(window.location.href);
        url.searchParams.set("product", "decorative-claw");
        url.searchParams.set("style", next.id);
        window.history.replaceState({}, "", url);
        status.textContent = `${next.name}: ${translate("product.styleSelected", getLocale())}`;
      });
    });
  }

  document.querySelector("[data-add-to-cart]").addEventListener("click", () => {
    try {
      store.write(addLine(store.read(), {
        productId: detail.cartProductId,
        baseColor: selectedColor,
        customText: "",
        quantity: 1
      }));
      status.textContent = `${detail.name}: ${translate("product.added", getLocale())}`;
    } catch {
      status.textContent = translate("checkout.failure", getLocale());
    }
  });

  document.addEventListener("norie:localechange", renderLocale);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", initialize) : initialize();
}
