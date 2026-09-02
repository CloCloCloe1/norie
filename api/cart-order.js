import { escapeHtml, isEmail, readJson, sendEmail, sendJson } from "./_utils.js";

const CATALOG = Object.freeze({
  "essentials-set": { name: "Essentials Hairstyling Set", price: 38, customizable: true },
  "baby-set": { name: "Baby Hairstyling Set", price: 32, customizable: true },
  "large-comb": { name: "Bamboo Paddle Brush", price: 30, customizable: true },
  "small-comb": { name: "Flat Brush", price: 25, customizable: true },
  "claw-clip": { name: "Claw Clip", price: 12, customizable: true },
  plumeria: { name: "Plumeria Clip Set", price: 10, customizable: false }
});
const COLORS = new Set(["Pink", "White"]);
const ATTEMPT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const stonesFor = (color) => color === "Pink" ? "White stones" : "Pink stones";

function recipients(value) {
  const result = [...new Set(String(value || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))];
  if (!result.length || result.some((email) => !isEmail(email))) throw new Error("Invalid ORDER_TO_EMAIL");
  return result;
}

function normalizeLines(lines) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 40) throw new Error("Choose at least one valid cart item.");
  return lines.map((line) => {
    const product = CATALOG[clean(line?.productId)];
    const color = clean(line?.baseColor);
    const customText = clean(line?.customText);
    const quantity = Number(line?.quantity);
    if (!product || !COLORS.has(color) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Choose a valid product, color, and quantity.");
    }
    if (customText.length > 8 || (!product.customizable && customText)) throw new Error("Choose a valid customization.");
    return {
      productId: clean(line.productId),
      name: product.name,
      color,
      customText,
      stones: product.customizable ? stonesFor(color) : "Not applicable",
      price: product.price,
      quantity,
      subtotal: product.price * quantity
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJson(req);
    const customerName = clean(payload.customerName);
    const customerEmail = clean(payload.customerEmail).toLowerCase();
    const customerContact = clean(payload.customerContact);
    const attemptId = clean(payload.attemptId);
    if (!customerName || customerName.length > 100) return sendJson(res, 400, { error: "Please enter your name." });
    if (!isEmail(customerEmail)) return sendJson(res, 400, { error: "Please enter a valid email." });
    if (!customerContact || customerContact.length > 100) return sendJson(res, 400, { error: "Please enter your contact information." });
    if (!ATTEMPT_ID.test(attemptId)) return sendJson(res, 400, { error: "Please refresh the cart and try again." });

    let lines;
    try { lines = normalizeLines(payload.lines); }
    catch (error) { return sendJson(res, 400, { error: error.message }); }

    const destinations = recipients(process.env.ORDER_TO_EMAIL);
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const orderReference = attemptId.slice(0, 8).toUpperCase();
    const status = "Order confirmed · Payment pending";
    const lineRows = lines.map((line) => `<tr><td style="padding:8px;border-bottom:1px solid #ead0da;">${escapeHtml(line.name)}</td><td style="padding:8px;border-bottom:1px solid #ead0da;">${escapeHtml(line.color)}</td><td style="padding:8px;border-bottom:1px solid #ead0da;">${escapeHtml(line.customText || "Not entered")}</td><td style="padding:8px;border-bottom:1px solid #ead0da;">${escapeHtml(line.stones)}</td><td style="padding:8px;border-bottom:1px solid #ead0da;">${line.quantity}</td><td style="padding:8px;border-bottom:1px solid #ead0da;">CAD $${line.subtotal}</td></tr>`).join("");
    const summary = lines.map((line) => `${line.name} — ${line.color}; ${line.customText || "No custom text"}; ${line.stones}; ${line.quantity} × CAD $${line.price} = CAD $${line.subtotal}`).join("\n");
    const ownerHtml = `<h1>Norie order ${escapeHtml(orderReference)}</h1><p><strong>${escapeHtml(status)}</strong></p><p>${escapeHtml(customerName)} · ${escapeHtml(customerEmail)} · ${escapeHtml(customerContact)}</p><table><tbody>${lineRows}</tbody></table><p><strong>Total: CAD $${total}</strong></p>`;

    await sendEmail({
      to: destinations,
      replyTo: customerEmail,
      subject: `Norie order ${orderReference} — payment pending`,
      html: ownerHtml,
      text: `${status}\nOrder: ${orderReference}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nContact: ${customerContact}\n${summary}\nTotal: CAD $${total}`,
      idempotencyKey: attemptId
    });

    try {
      await sendEmail({
        to: customerEmail,
        replyTo: destinations[0],
        subject: `Norie order ${orderReference} confirmed — payment pending`,
        html: `<h1>${escapeHtml(status)}</h1><p>Order ${escapeHtml(orderReference)}</p><table><tbody>${lineRows}</tbody></table><p><strong>Total: CAD $${total}</strong></p><p>Norie will contact you with payment details.</p>`,
        text: `${status}\nOrder: ${orderReference}\n${summary}\nTotal: CAD $${total}\nNorie will contact you with payment details.`
      });
    } catch (error) {
      console.error("Customer confirmation email failed", error);
    }

    sendJson(res, 200, { ok: true, orderReference, status, total: `CAD $${total}` });
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    console.error(error);
    sendJson(res, 500, { error: "Could not send order" });
  }
}
