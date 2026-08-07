import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import { persistOrder } from "../api/_google-sheets.js";
import { buildOrder, orderSheetRow } from "../api/_order.js";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const TEST_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" });

function response({ ok = true, status = 200, data = {} } = {}) {
  return {
    ok,
    status,
    async json() {
      return data;
    }
  };
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function order() {
  return buildOrder({
    requestId: REQUEST_ID,
    product: "flat-brush",
    variant: "pearl-white",
    quantity: 1,
    rhinestoneColor: "Pink stones",
    customText: "Norie",
    customerName: "Ava Chen",
    customerEmail: "ava@example.com",
    customerContact: "ava_wechat",
    fulfillment: "pickup",
    pageUrl: "https://norie-hair.vercel.app/customize"
  }, new Date("2026-07-19T16:30:00.000Z"));
}

async function withGoogleEnv(run) {
  const names = [
    "GOOGLE_SHEET_ID",
    "GOOGLE_SHEET_NAME",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY"
  ];
  const originals = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  process.env.GOOGLE_SHEET_ID = "sheet-123";
  process.env.GOOGLE_SHEET_NAME = "Orders";
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "norie-orders@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PRIVATE_KEY = TEST_PRIVATE_KEY.replace(/\n/g, "\\n");
  try {
    await run();
  } finally {
    names.forEach((name) => restoreEnv(name, originals[name]));
  }
}

test("persistOrder exchanges a service-account JWT and appends one 24-cell row", { concurrency: false }, async () => {
  await withGoogleEnv(async () => {
    const calls = [];
    const fetchImpl = async (url, options = {}) => {
      calls.push({ url: String(url), options });
      if (calls.length === 1) return response({ data: { access_token: "access-123" } });
      if (calls.length === 2) return response({ data: { values: [["Order ID"]] } });
      return response({ data: { updates: { updatedRows: 1 } } });
    };

    const result = await persistOrder(order(), { fetchImpl, nowSeconds: 1_784_480_000 });

    assert.deepEqual(result, { existing: false });
    assert.equal(calls.length, 3);
    assert.equal(calls[0].url, "https://oauth2.googleapis.com/token");
    const tokenBody = new URLSearchParams(calls[0].options.body);
    assert.equal(tokenBody.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
    const assertion = tokenBody.get("assertion");
    assert.equal(assertion.split(".").length, 3);
    const payload = JSON.parse(Buffer.from(assertion.split(".")[1], "base64url").toString("utf8"));
    assert.equal(payload.iss, "norie-orders@example.iam.gserviceaccount.com");
    assert.equal(payload.scope, "https://www.googleapis.com/auth/spreadsheets");
    assert.match(calls[1].url, /spreadsheets\/sheet-123\/values\/Orders!A%3AA$/);
    assert.equal(calls[1].options.headers.Authorization, "Bearer access-123");
    assert.match(calls[2].url, /Orders!A%3AX:append\?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS$/);
    assert.deepEqual(JSON.parse(calls[2].options.body), { values: [orderSheetRow(order())] });
  });
});

test("persistOrder does not append an existing order ID", { concurrency: false }, async () => {
  await withGoogleEnv(async () => {
    const calls = [];
    const fetchImpl = async (url, options = {}) => {
      calls.push({ url: String(url), options });
      if (calls.length === 1) return response({ data: { access_token: "access-123" } });
      return response({ data: { values: [["Order ID"], [REQUEST_ID]] } });
    };

    const result = await persistOrder(order(), { fetchImpl });

    assert.deepEqual(result, { existing: true });
    assert.equal(calls.length, 2);
  });
});

test("persistOrder rejects missing configuration without exposing a secret", { concurrency: false }, async () => {
  const original = process.env.GOOGLE_SHEET_ID;
  delete process.env.GOOGLE_SHEET_ID;
  try {
    await assert.rejects(
      persistOrder(order(), { fetchImpl: async () => response() }),
      /Order tracking is not configured\./
    );
  } finally {
    restoreEnv("GOOGLE_SHEET_ID", original);
  }
});

test("persistOrder converts Google API failures into a safe tracking error", { concurrency: false }, async () => {
  await withGoogleEnv(async () => {
    await assert.rejects(
      persistOrder(order(), {
        fetchImpl: async () => response({ ok: false, status: 403, data: { error: "private upstream detail" } })
      }),
      (error) => error.message === "Could not save order tracking." && !error.message.includes("private")
    );
  });
});
