import { escapeHtml, isEmail, readJson, sendEmail, sendJson } from "./_utils.js";
import { buildOrder } from "./_order.js";

const CONFIRMATION_LOGO_URL = "https://norie-hair.vercel.app/assets/norie-logo.png?v=transparent-1";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJson(req);
    const destinations = configuredRecipients(process.env.ORDER_TO_EMAIL);
    const normalized = buildOrder(payload);
    const formattedAddress = [
      normalized.address.streetAddress,
      normalized.address.addressUnit,
      normalized.address.city,
      normalized.address.province,
      normalized.address.postalCode
    ].filter(Boolean).join(", ");

    const order = {
      "Customer name": normalized.customerName,
      "Customer email": normalized.customerEmail,
      Contact: normalized.customerContact,
      Fulfillment: normalized.fulfillmentLabel,
      Address: formattedAddress || normalized.pickupLocation,
      Product: normalized.productName,
      Style: normalized.style,
      Quantity: String(normalized.quantity),
      "Rhinestone color": normalized.rhinestoneColor,
      "Custom text": normalized.customText,
      "Free gift": normalized.freeGift,
      "Unit price": `CAD $${normalized.unitPrice}`,
      "Item subtotal": `CAD $${normalized.itemSubtotal}`,
      "Delivery fee": `CAD $${normalized.deliveryFee}`,
      "Estimated total": `CAD $${normalized.total}`,
      "Page URL": normalized.pageUrl
    };

    const rows = Object.entries(order).map(([label, value]) => (
      `<tr>
        <th align="left" style="padding:8px 12px;border-bottom:1px solid #ead0da;">${escapeHtml(label)}</th>
        <td style="padding:8px 12px;border-bottom:1px solid #ead0da;">${escapeHtml(value)}</td>
      </tr>`
    )).join("");

    await sendEmail({
      to: destinations,
      replyTo: normalized.customerEmail,
      subject: `Norie custom order request - ${normalized.productName}`,
      html: `
        <h1 style="font-family:Georgia,serif;color:#6b243d;">New custom order request</h1>
        <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">${rows}</table>
      `,
      text: Object.entries(order).map(([key, value]) => `${key}: ${value}`).join("\n")
    });

    const customerSummary = {
      Name: normalized.customerName,
      Product: normalized.productName,
      Style: normalized.style,
      Quantity: String(normalized.quantity),
      "Rhinestone color": normalized.rhinestoneColor,
      "Custom text": normalized.customText,
      "Free gift": normalized.freeGift,
      "Unit price": `CAD $${normalized.unitPrice}`,
      "Estimated total": `CAD $${normalized.total}`
    };

    const customerRows = Object.entries(customerSummary).map(([label, value]) => (
      `<tr>
        <th scope="row" align="left" style="padding:12px;border-bottom:1px solid #ead0da;color:#64243a;font-weight:700;vertical-align:top;">${escapeHtml(label)}</th>
        <td style="padding:12px;border-bottom:1px solid #ead0da;color:#39222d;overflow-wrap:anywhere;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`
    )).join("");

    const customerText = [
      `Hi ${normalized.customerName},`,
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
        <p>Hi ${escapeHtml(normalized.customerName)},</p>
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
        to: normalized.customerEmail,
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
