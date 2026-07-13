import { escapeHtml, isEmail, readJson, sendEmail, sendJson } from "./_utils.js";

const PRODUCTS = {
  "Small comb": { originalPrice: "CAD $32", launchPrice: "CAD $25" },
  "Large comb": { originalPrice: "CAD $38", launchPrice: "CAD $30" },
  "Claw clip": { originalPrice: "CAD $16", launchPrice: "CAD $12" }
};
const BASE_COLORS = new Set(["Pink", "White"]);
const STONE_COLORS = new Set(["Pink stones", "White stones"]);
const CONFIRMATION_LOGO_URL = "https://norie-hair.vercel.app/assets/norie-logo.png";

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function configuredRecipients(value) {
  const recipients = [...new Set(
    String(value || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )];

  if (!recipients.length || recipients.some((email) => !isEmail(email))) {
    throw new Error("Invalid ORDER_TO_EMAIL");
  }

  return recipients;
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
    const destinations = configuredRecipients(process.env.ORDER_TO_EMAIL);

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
      to: destinations,
      replyTo: customerEmail,
      subject: `Norie custom order request - ${productName}`,
      html: `
        <h1 style="font-family:Georgia,serif;color:#6b243d;">New custom order request</h1>
        <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">${rows}</table>
      `,
      text: Object.entries(order).map(([key, value]) => `${key}: ${value}`).join("\n")
    });

    const customerSummary = {
      Name: customerName,
      Product: productName,
      "Base color": baseColor,
      "Rhinestone color": rhinestoneColor,
      "Custom text": customText || "Not entered",
      "Free gift": "One random free gift",
      "Estimated price": product.launchPrice
    };

    const customerRows = Object.entries(customerSummary).map(([label, value]) => (
      `<tr>
        <th scope="row" align="left" style="padding:12px;border-bottom:1px solid #ead0da;color:#64243a;font-weight:700;vertical-align:top;">${escapeHtml(label)}</th>
        <td style="padding:12px;border-bottom:1px solid #ead0da;color:#39222d;overflow-wrap:anywhere;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`
    )).join("");

    const customerText = [
      `Hi ${customerName},`,
      "",
      "Welcome to Norie. Thank you for creating something special with us — we’ve received your custom order request.",
      "",
      "Your request summary",
      ...Object.entries(customerSummary).map(([label, value]) => `${label}: ${value}`),
      "",
      "Once your final details and payment are confirmed, your handmade piece is expected to be ready in approximately 7–10 days.",
      "",
      "We’ll be in touch soon to confirm the next steps. Thank you for choosing Norie — we can’t wait to create your piece.",
      "",
      "With love, Norie"
    ].join("\n");

    const customerHtml = `
      <div style="background:#fff9f7;color:#39222d;font-family:Arial,sans-serif;line-height:1.6;margin:0 auto;max-width:600px;padding:32px 24px;">
        <img src="${CONFIRMATION_LOGO_URL}" alt="Norie" width="240" style="display:block;height:auto;margin:0 auto 24px;max-width:70%;width:240px;">
        <p style="color:#64243a;font-size:13px;font-weight:700;letter-spacing:0.18em;margin:0 0 12px;text-align:center;">IT ALL STARTS HERE</p>
        <h1 style="color:#64243a;font-family:Georgia,serif;font-size:32px;line-height:1.2;margin:0 0 24px;text-align:center;">Your custom order request</h1>
        <p>Hi ${escapeHtml(customerName)},</p>
        <p>Welcome to Norie. Thank you for creating something special with us — we’ve received your custom order request.</p>
        <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:28px 0;width:100%;">
          <caption style="color:#64243a;font-family:Georgia,serif;font-size:24px;font-weight:700;padding:0 0 12px;text-align:left;">Your request summary</caption>
          <tbody>${customerRows}</tbody>
        </table>
        <p>Once your final details and payment are confirmed, your handmade piece is expected to be ready in approximately 7–10 days.</p>
        <p>We’ll be in touch soon to confirm the next steps. Thank you for choosing Norie — we can’t wait to create your piece.</p>
        <p style="color:#64243a;font-family:Georgia,serif;font-size:20px;margin:28px 0 0;">With love, Norie</p>
      </div>
    `;

    try {
      await sendEmail({
        to: customerEmail,
        replyTo: destinations[0],
        subject: "We received your Norie custom order request",
        html: customerHtml,
        text: customerText
      });
    } catch (error) {
      console.error("Customer confirmation email failed", error);
    }

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
