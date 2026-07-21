const clipDescription = "Made to elevate your everyday hair routine, this claw clip is crafted from premium custom cellulose acetate for a durable, lightweight feel. Designed to comfortably hold a full head of hair, it provides a secure, all-day grip without pulling or snagging. Perfect for effortless updos, messy buns, French twists, or half-up styles.";

const flatBrushDescription = "Elevate your everyday hair ritual with our handcrafted acetate comb. Made from premium custom cellulose acetate, it effortlessly glides through the hair to detangle, smooth, and enhance natural shine without pulling or snagging. Lightweight yet durable, its thoughtfully designed shape is comfortable to hold and suitable for all hair types, whether styling, detangling, or refreshing your look throughout the day.";

const paddleBrushDescription = "Designed to elevate your everyday hair routine, this premium acetate paddle brush effortlessly glides through hair to detangle knots while helping distribute natural oils from root to tip. Crafted from custom cellulose acetate with rounded pins for a comfortable brushing experience, it smooths strands, reduces static, and leaves hair looking healthier, shinier, and beautifully polished. Suitable for all hair types and perfect for daily use.";

const paddleFeatures = [
  "Gently detangles wet or dry hair",
  "Helps smooth frizz and reduce static",
  "Rounded pins massage the scalp for added comfort",
  "Lightweight, durable, and comfortable for everyday styling",
  "Suitable for all hair types"
];

export const PRODUCT_CATALOG = {
  "bamboo-paddle-brush": {
    label: "Bamboo Paddle Brush",
    detailPage: "bamboo-paddle-brush.html",
    actionLabel: "CUSTOMIZE THIS PIECE",
    unitPrice: 30,
    description: paddleBrushDescription,
    material: "Custom Cellulose Acetate",
    dimensions: "25 × 7 cm (9.8\" × 2.8\")",
    features: paddleFeatures,
    note: "Due to the natural characteristics of cellulose acetate, slight variations in color and pattern may occur, making each brush uniquely yours.",
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Bamboo Paddle Brush in Pearl White", image: "assets/shop-large-white.png", alt: "Pearl white bamboo paddle brush", baseColor: "white", swatch: "#f4eee3" },
      "baby-pink": { label: "Ballet Pink", fullName: "Bamboo Paddle Brush in Ballet Pink", image: "assets/shop-large-pink.png", alt: "Ballet pink bamboo paddle brush", baseColor: "pink", swatch: "#f2cbd4" }
    }
  },
  "flat-brush": {
    label: "Flat Brush",
    detailPage: "flat-brush.html",
    actionLabel: "CUSTOMIZE THIS PIECE",
    unitPrice: 25,
    description: flatBrushDescription,
    material: "Custom Cellulose Acetate",
    dimensions: "14 × 7 cm (5.5\" × 2.8\")",
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Flat Brush in Pearl White", image: "assets/shop-small-white.png", alt: "Pearl white flat brush", baseColor: "white", swatch: "#f4eee3" },
      "baby-pink": { label: "Ballet Pink", fullName: "Flat Brush in Ballet Pink", image: "assets/shop-small-pink.png", alt: "Ballet pink flat brush", baseColor: "pink", swatch: "#e7a9b8" }
    }
  },
  "claw-clip": {
    label: "Norie Clip",
    detailPage: "claw-clip.html",
    actionLabel: "CUSTOMIZE THIS PIECE",
    unitPrice: 12,
    description: clipDescription,
    material: "Custom Cellulose Acetate",
    dimensions: "10.5 × 5 cm (4.1\" × 2.0\")",
    variants: {
      "baby-pink": { label: "Ballet Pink", fullName: "Norie Clip in Ballet Pink", image: "assets/shop-claw-pink-1.png", alt: "Norie translucent ballet pink claw clip", baseColor: "pink", swatch: "#edc0cc" },
      "pink-bow": { label: "Pink Bow", fullName: "Norie Clip in Pink Bow", image: "assets/shop-claw-pink-2.png", alt: "Norie pink claw clip with bow details", baseColor: "pink", swatch: "#e4a5b6" },
      "pink-cherry": { label: "Pink Cherry", fullName: "Norie Clip in Pink Cherry", image: "assets/shop-claw-pink-3.png", alt: "Norie pink claw clip with cherry crystals", baseColor: "pink", swatch: "#efb9c9" },
      "florie-pearl": { label: "Florie Pearl", fullName: "Norie Clip in Florie Pearl", image: "assets/shop-claw-white-1.png", alt: "Norie pearl claw clip with flower details", baseColor: "white", swatch: "#f0e8dc" },
      "cream-white": { label: "Cream White", fullName: "Norie Clip in Cream White", image: "assets/shop-claw-white-2.png", alt: "Norie cream white pearl claw clip", baseColor: "white", swatch: "#eee5d5" },
      "white-cherry": { label: "White Cherry", fullName: "Norie Clip in White Cherry", image: "assets/shop-claw-white-3.png", alt: "Norie white claw clip with cherry crystals", baseColor: "white", swatch: "#f5efe6" }
    }
  },
  "essentials-hairstyling-set": {
    label: "Essentials Hairstyling Set",
    detailPage: "essentials-hairstyling-set.html",
    actionLabel: "CUSTOMIZE THIS SET",
    unitPrice: 38,
    description: "A limited-edition bamboo paddle brush and claw clip pairing with one free gift.",
    material: "Custom Cellulose Acetate",
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Essentials Hairstyling Set in Pearl White", image: "assets/shop-set-essentials-white.png", alt: "Pearl white Essentials Hairstyling Set", baseColor: "white", swatch: "#f4eee3" },
      "baby-pink": { label: "Ballet Pink", fullName: "Essentials Hairstyling Set in Ballet Pink", image: "assets/shop-set-essentials-pink.png", alt: "Ballet pink Essentials Hairstyling Set", baseColor: "pink", swatch: "#efc4cf" }
    }
  },
  "baby-hairstyling-set": {
    label: "Baby Hairstyling Set",
    detailPage: "baby-hairstyling-set.html",
    actionLabel: "CUSTOMIZE THIS SET",
    unitPrice: 32,
    description: "A limited-edition flat brush and claw clip pairing with one free gift.",
    material: "Custom Cellulose Acetate",
    variants: {
      "pearl-white": { label: "Pearl White", fullName: "Baby Hairstyling Set in Pearl White", image: "assets/shop-set-baby-white.png", alt: "Pearl white Baby Hairstyling Set", baseColor: "white", swatch: "#f4eee3" },
      "baby-pink": { label: "Ballet Pink", fullName: "Baby Hairstyling Set in Ballet Pink", image: "assets/shop-set-baby-pink.png", alt: "Ballet pink Baby Hairstyling Set", baseColor: "pink", swatch: "#e8b5c4" }
    }
  }
};

export function resolveSelection(productKey, variantKey, quantity = 1) {
  const product = PRODUCT_CATALOG[productKey];
  const variant = product?.variants[variantKey];
  const normalizedQuantity = Number(quantity);
  if (!product || !variant || !Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 10) {
    return null;
  }
  return {
    productKey,
    variantKey,
    quantity: normalizedQuantity,
    ...product,
    ...variant,
    unitPrice: product.unitPrice,
    totalPrice: product.unitPrice * normalizedQuantity
  };
}

export function selectionFromSearch(search = "") {
  const params = new URLSearchParams(search);
  return resolveSelection(params.get("product"), params.get("variant"), Number(params.get("quantity") || 1))
    || resolveSelection("flat-brush", "baby-pink", 1);
}

export function detailUrl(productKey, variantKey, quantity = 1) {
  const selection = resolveSelection(productKey, variantKey, quantity);
  if (!selection) return "shop.html";
  const quantityQuery = selection.quantity === 1 ? "" : `&quantity=${selection.quantity}`;
  return `${selection.detailPage}?variant=${encodeURIComponent(variantKey)}${quantityQuery}`;
}

export function customizeUrl(productKey, variantKey, quantity) {
  const selection = resolveSelection(productKey, variantKey, quantity);
  if (!selection) return "customize.html";
  return `customize.html?product=${encodeURIComponent(productKey)}&variant=${encodeURIComponent(variantKey)}&quantity=${selection.quantity}`;
}
