import { escapeHtml, isEmail, readJson, sendEmail, sendJson } from "./_utils.js";

const PRODUCTS = {
  "Small comb": { originalPrice: "CAD $32", launchPrice: "CAD $25" },
  "Large comb": { originalPrice: "CAD $38", launchPrice: "CAD $30" },
  "Claw clip": { originalPrice: "CAD $16", launchPrice: "CAD $12" }
};
const BASE_COLORS = new Set(["Pink", "White"]);
const STONE_COLORS = new Set(["Pink stones", "White stones"]);

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function validPageUrl(value) {
  const url = clean(value);
  if (!url || url.length > 2048) {
    return "";
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJson(req);
    const destination = process.env.ORDER_TO_EMAIL;
    if (!destination) {
      throw new Error("Missing ORDER_TO_EMAIL");
    }

    const customerName = clean(payload.customerName);
    const customerEmail = clean(payload.customerEmail).toLowerCase();
    const customerContact = clean(payload.customerContact);
    const productName = clean(payload.product);
    const baseColor = clean(payload.baseColor);
    const rhinestoneColor = clean(payload.rhinestoneColor);
    const customText = clean(payload.customText);
    const product = PRODUCTS[productName];

    if (!customerName || customerName.length > 100) {
      sendJson(res, 400, { error: "Please enter your name." });
      return;
    }
    if (!isEmail(customerEmail)) {
      sendJson(res, 400, { error: "Please enter a valid email." });
      return;
    }
    if (!customerContact || customerContact.length > 100) {
      sendJson(res, 400, { error: "Please enter your contact information." });
      return;
    }
    if (!product || !BASE_COLORS.has(baseColor) || !STONE_COLORS.has(rhinestoneColor)) {
      sendJson(res, 400, { error: "Please choose a valid product and color combination." });
      return;
    }
    if (customText.length > 8) {
      sendJson(res, 400, { error: "Custom text must be 8 characters or fewer." });
      return;
    }

    const order = {
      "Customer name": customerName,
      "Customer email": customerEmail,
      Contact: customerContact,
      Product: productName,
      "Base color": baseColor,
      "Rhinestone color": rhinestoneColor,
      "Custom text": customText || "Not entered",
      "Free gift": "One random free gift",
      "Original price": product.originalPrice,
      "Launch price": product.launchPrice,
      "Page URL": validPageUrl(payload.pageUrl)
    };

    const rows = Object.entries(order).map(([label, value]) => (
      `<tr>
        <th align="left" style="padding:8px 12px;border-bottom:1px solid #ead0da;">${escapeHtml(label)}</th>
        <td style="padding:8px 12px;border-bottom:1px solid #ead0da;">${escapeHtml(value)}</td>
      </tr>`
    )).join("");

    await sendEmail({
      to: destination,
      replyTo: customerEmail,
      subject: `Norie custom order request - ${productName}`,
      html: `
        <h1 style="font-family:Georgia,serif;color:#6b243d;">New custom order request</h1>
        <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">${rows}</table>
      `,
      text: Object.entries(order).map(([key, value]) => `${key}: ${value}`).join("\n")
    });

    sendJson(res, 200, { ok: true });
  } catch (error) {
    if (error.statusCode) {
      sendJson(res, error.statusCode, { error: error.message });
      return;
    }
    console.error(error);
    sendJson(res, 500, { error: "Could not send order request" });
  }
}
