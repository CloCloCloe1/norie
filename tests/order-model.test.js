import assert from "node:assert/strict";
import test from "node:test";

import {
  DELIVERY_FEE,
  PICKUP_LOCATION,
  buildOrder,
  orderSheetRow
} from "../api/_order.js";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

function payload(overrides = {}) {
  return {
    requestId: REQUEST_ID,
    product: "bamboo-paddle-brush",
    variant: "baby-pink",
    quantity: 2,
    rhinestoneColor: "White stones",
    customText: "Chloe",
    customerName: "Chloe Lee",
    customerEmail: "chloe@example.com",
    customerContact: "chloe_wechat",
    fulfillment: "delivery",
    streetAddress: "123 Finch Ave W",
    addressUnit: "Unit 8",
    city: "North York",
    province: "ON",
    postalCode: "M2N 1M6",
    pageUrl: "https://norie-hair.vercel.app/customize",
    ...overrides
  };
}

test("delivery adds one flat CAD $5 fee and a ready date 14 days later", () => {
  const now = new Date("2026-07-19T16:30:00.000Z");
  const order = buildOrder(payload(), now);

  assert.equal(DELIVERY_FEE, 5);
  assert.equal(order.id, REQUEST_ID);
  assert.equal(order.submittedAt, "2026-07-19T16:30:00.000Z");
  assert.equal(order.readyBy, "2026-08-02");
  assert.equal(order.status, "New");
  assert.equal(order.itemSubtotal, 60);
  assert.equal(order.deliveryFee, 5);
  assert.equal(order.total, 65);
  assert.equal(order.fulfillment, "delivery");
  assert.equal(order.fulfillmentLabel, "Delivery");
  assert.deepEqual(order.address, {
    streetAddress: "123 Finch Ave W",
    addressUnit: "Unit 8",
    city: "North York",
    province: "ON",
    postalCode: "M2N 1M6"
  });
  assert.equal(order.pickupLocation, "");
});

test("pickup is free and ignores stale address values", () => {
  const order = buildOrder(payload({ fulfillment: "pickup" }));

  assert.equal(PICKUP_LOCATION, "North York / Finch");
  assert.equal(order.itemSubtotal, 60);
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.total, 60);
  assert.equal(order.fulfillmentLabel, "Pickup");
  assert.deepEqual(order.address, {
    streetAddress: "",
    addressUnit: "",
    city: "",
    province: "",
    postalCode: ""
  });
  assert.equal(order.pickupLocation, PICKUP_LOCATION);
});

test("delivery requires every shipping field except unit", () => {
  assert.throws(
    () => buildOrder(payload({ postalCode: "" })),
    (error) => error.statusCode === 400 && error.message === "Please enter your delivery postal code."
  );
});

test("Cherry stones are accepted as a third rhinestone color", () => {
  const order = buildOrder(payload({ rhinestoneColor: "Cherry stones" }));

  assert.equal(order.rhinestoneColor, "Cherry stones");
});

test("order IDs must be browser-generated UUIDs", () => {
  assert.throws(
    () => buildOrder(payload({ requestId: "not-an-order-id" })),
    (error) => error.statusCode === 400 && error.message === "Please refresh the page and try again."
  );
});

test("the tracking row uses the approved 24-column order", () => {
  const order = buildOrder(payload(), new Date("2026-07-19T16:30:00.000Z"));
  const row = orderSheetRow(order);

  assert.equal(row.length, 24);
  assert.deepEqual(row.slice(0, 8), [
    REQUEST_ID,
    "2026-07-19T16:30:00.000Z",
    "New",
    "2026-08-02",
    "Chloe Lee",
    "chloe@example.com",
    "chloe_wechat",
    "Delivery"
  ]);
  assert.deepEqual(row.slice(19, 23), [30, 60, 5, 65]);
  assert.equal(row[23], "https://norie-hair.vercel.app/customize");
});
