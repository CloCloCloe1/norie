import { isEmail } from "./_utils.js";
import { resolveSelection } from "../product-catalog.js";

export const DELIVERY_FEE = 5;
export const PICKUP_LOCATION = "North York / Finch";

const STONE_COLORS = new Set(["Pink stones", "White stones", "Cherry stones"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requestError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function required(value, maxLength, message) {
  const normalized = clean(value);
  if (!normalized || normalized.length > maxLength) {
    throw requestError(message);
  }
  return normalized;
}

function validPageUrl(value) {
  const url = clean(value);
  if (!url || url.length > 2048) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function readyDate(now) {
  const ready = new Date(now);
  ready.setUTCDate(ready.getUTCDate() + 14);
  return ready.toISOString().slice(0, 10);
}

export function buildOrder(payload, now = new Date()) {
  const requestId = clean(payload.requestId);
  if (!UUID_PATTERN.test(requestId)) {
    throw requestError("Please refresh the page and try again.");
  }

  const selection = resolveSelection(
    clean(payload.product),
    clean(payload.variant),
    Number(payload.quantity)
  );
  const rhinestoneColor = clean(payload.rhinestoneColor);
  if (!selection || !STONE_COLORS.has(rhinestoneColor)) {
    throw requestError("Please choose a valid product and color combination.");
  }

  const customerName = required(payload.customerName, 100, "Please enter your name.");
  const customerEmail = clean(payload.customerEmail).toLowerCase();
  if (!isEmail(customerEmail)) {
    throw requestError("Please enter a valid email.");
  }
  const customerContact = required(
    payload.customerContact,
    100,
    "Please enter your contact information."
  );
  const customText = clean(payload.customText);
  if (customText.length > 8) {
    throw requestError("Custom text must be 8 characters or fewer.");
  }

  const fulfillment = clean(payload.fulfillment).toLowerCase();
  if (fulfillment !== "delivery" && fulfillment !== "pickup") {
    throw requestError("Please choose Delivery or Pickup.");
  }

  const address = {
    streetAddress: "",
    addressUnit: "",
    city: "",
    province: "",
    postalCode: ""
  };
  if (fulfillment === "delivery") {
    address.streetAddress = required(
      payload.streetAddress,
      160,
      "Please enter your delivery street address."
    );
    address.addressUnit = clean(payload.addressUnit).slice(0, 40);
    address.city = required(payload.city, 80, "Please enter your delivery city.");
    address.province = required(payload.province, 80, "Please enter your delivery province.");
    address.postalCode = required(
      payload.postalCode,
      20,
      "Please enter your delivery postal code."
    );
  }

  const submittedAt = new Date(now).toISOString();
  const itemSubtotal = selection.totalPrice;
  const deliveryFee = fulfillment === "delivery" ? DELIVERY_FEE : 0;

  return {
    id: requestId,
    submittedAt,
    readyBy: readyDate(new Date(submittedAt)),
    status: "New",
    customerName,
    customerEmail,
    customerContact,
    fulfillment,
    fulfillmentLabel: fulfillment === "delivery" ? "Delivery" : "Pickup",
    address,
    pickupLocation: fulfillment === "pickup" ? PICKUP_LOCATION : "",
    productKey: selection.productKey,
    variantKey: selection.variantKey,
    productName: selection.fullName,
    style: selection.label,
    quantity: selection.quantity,
    rhinestoneColor,
    customText: customText || "Not entered",
    freeGift: "One random free gift",
    unitPrice: selection.unitPrice,
    itemSubtotal,
    deliveryFee,
    total: itemSubtotal + deliveryFee,
    pageUrl: validPageUrl(payload.pageUrl)
  };
}

export function orderSheetRow(order) {
  return [
    order.id,
    order.submittedAt,
    order.status,
    order.readyBy,
    order.customerName,
    order.customerEmail,
    order.customerContact,
    order.fulfillmentLabel,
    order.address.streetAddress,
    order.address.addressUnit,
    order.address.city,
    order.address.province,
    order.address.postalCode,
    order.pickupLocation,
    order.productName,
    order.style,
    order.quantity,
    order.rhinestoneColor,
    order.customText,
    order.unitPrice,
    order.itemSubtotal,
    order.deliveryFee,
    order.total,
    order.pageUrl
  ];
}
