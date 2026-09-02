import { addLine, createCartStore } from "./norie-cart.js";
import { getLocale, translate } from "./norie-i18n.js";

const fixed = (value) => Object.freeze(value);

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
  "pink-bow": fixed({
    cartProductId: "pink-bow", name: "Claw Clip in Pink Bow", image: "assets/shop-claw-pink-2.png",
    alt: "Pink claw clip with white bow details and crystals", defaultColor: "Pink",
    descriptionKey: "product.pinkBow.description", contentsKey: "product.pinkBow.contents", launchPrice: 12, originalPrice: 16
  }),
  "cherry-pink": fixed({
    cartProductId: "cherry-pink", name: "Claw Clip in Cherry Pink", image: "assets/shop-claw-pink-3.png",
    alt: "Pink claw clip with red cherry crystal details", defaultColor: "Pink",
    descriptionKey: "product.cherryPink.description", contentsKey: "product.cherryPink.contents", launchPrice: 12, originalPrice: 16
  }),
  "florie-white": fixed({
    cartProductId: "florie-white", name: "Claw Clip in Florie White", image: "assets/shop-claw-white-1.png",
    alt: "White claw clip with pale pink flower and butterfly details", defaultColor: "White",
    descriptionKey: "product.florieWhite.description", contentsKey: "product.florieWhite.contents", launchPrice: 12, originalPrice: 16
  }),
  "cherry-white": fixed({
    cartProductId: "cherry-white", name: "Claw Clip in Cherry White", image: "assets/shop-claw-white-3.png",
    alt: "White claw clip with red cherry crystal details", defaultColor: "White",
    descriptionKey: "product.cherryWhite.description", contentsKey: "product.cherryWhite.contents", launchPrice: 12, originalPrice: 16
  })
});

export function selectDetail(search) {
  const params = new URLSearchParams(search);
  const detail = detailCatalog[params.get("product")];
  if (!detail) return null;
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

  const { detail } = selection;
  let selectedColor = selection.color;
  const image = document.querySelector("[data-product-image]");
  const name = document.querySelector("[data-product-name]");
  const description = document.querySelector("[data-product-description]");
  const contents = document.querySelector("[data-product-contents]");
  const selector = document.querySelector("[data-color-selector]");
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
