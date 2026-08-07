import { sign } from "node:crypto";

import { orderSheetRow } from "./_order.js";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function configuration() {
  const config = {
    spreadsheetId: String(process.env.GOOGLE_SHEET_ID || "").trim(),
    sheetName: String(process.env.GOOGLE_SHEET_NAME || "Orders").trim(),
    clientEmail: String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim(),
    privateKey: String(process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim()
  };

  if (!config.spreadsheetId || !config.sheetName || !config.clientEmail || !config.privateKey) {
    throw new Error("Order tracking is not configured.");
  }
  return config;
}

function sheetReference(name) {
  return /^[A-Za-z0-9_-]+$/.test(name) ? name : `'${name.replace(/'/g, "''")}'`;
}

function serviceAccountAssertion(config, nowSeconds) {
  const header = encodeJson({ alg: "RS256", typ: "JWT" });
  const payload = encodeJson({
    iss: config.clientEmail,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: nowSeconds,
    exp: nowSeconds + 3600
  });
  const unsigned = `${header}.${payload}`;
  const signature = sign("RSA-SHA256", Buffer.from(unsigned), config.privateKey).toString("base64url");
  return `${unsigned}.${signature}`;
}

async function googleJson(fetchImpl, url, options, message) {
  const response = await fetchImpl(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(message);
  }
  return data;
}

async function accessToken(config, fetchImpl, nowSeconds) {
  const assertion = serviceAccountAssertion(config, nowSeconds);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });
  const data = await googleJson(fetchImpl, TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  }, "Could not save order tracking.");
  if (!data.access_token) {
    throw new Error("Could not save order tracking.");
  }
  return data.access_token;
}

export async function persistOrder(order, {
  fetchImpl = fetch,
  nowSeconds = Math.floor(Date.now() / 1000)
} = {}) {
  const config = configuration();
  try {
    const token = await accessToken(config, fetchImpl, nowSeconds);
    const sheet = sheetReference(config.sheetName);
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}/values/`;
    const headers = { Authorization: `Bearer ${token}` };
    const ids = await googleJson(
      fetchImpl,
      `${base}${encodeURIComponent(`${sheet}!A:A`)}`,
      { headers },
      "Could not save order tracking."
    );
    const existingIds = (ids.values || []).flat().map(String);
    if (existingIds.includes(order.id)) {
      return { existing: true };
    }

    await googleJson(
      fetchImpl,
      `${base}${encodeURIComponent(`${sheet}!A:X`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [orderSheetRow(order)] })
      },
      "Could not save order tracking."
    );
    return { existing: false };
  } catch (error) {
    if (error.message === "Order tracking is not configured.") throw error;
    throw new Error("Could not save order tracking.");
  }
}
