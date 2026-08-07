import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(file, "utf8");

test("the customer confirmation logo is a deployable transparent PNG", async () => {
  await access("assets/norie-logo.png");
  const logo = await readFile("assets/norie-logo.png");

  assert.deepEqual([...logo.subarray(1, 4)], [80, 78, 71]);
  assert.ok([4, 6].includes(logo[25]), "PNG must contain an alpha channel");
});

test("the Homepage uses the supplied lifestyle photos in the approved lookbook positions", async () => {
  const html = await read("index.html");

  await access("assets/pink-lookbook-hair-clip.jpg");
  await access("assets/pink-lookbook-bag-detail.jpg");
  await access("assets/white-lookbook-norie-clip.png");

  assert.match(
    html,
    /pink-lookbook-hair-clip\.jpg[^>]+alt="Ballet pink claw clip styled in long dark hair with a pink handbag"[\s\S]*pink-lookbook-bag-detail\.jpg[^>]+alt="Pink handbag styled with a satin scrunchie and white flower accessory"[\s\S]*pink-lookbook-accessories\.png/i
  );
  assert.match(
    html,
    /white-lookbook-spray\.png[\s\S]*white-lookbook-norie-clip\.png[^>]+alt="Pearl white Norie claw clip with pink crystal lettering styled on embroidered fabric"[\s\S]*white-lookbook-accessories\.png/i
  );
  assert.match(html, /\.lookbook-photo\s*\{[\s\S]*aspect-ratio:\s*3\s*\/\s*4;/i);
  assert.match(html, /\.lookbook-photo\s*\{[\s\S]*object-fit:\s*cover;/i);
});

test("the home contact section shows Norie's text-only social accounts", async () => {
  const html = await read("index.html");

  assert.match(html, /Follow Norie for new samples, custom-order updates, and launch news\./);
  assert.match(html, /<dt>\s*IG\s*<\/dt>\s*<dd>\s*norie_hair\s*<\/dd>/i);
  assert.match(html, /<dt>\s*Rednote\s*<\/dt>\s*<dd>\s*Norie\s*<\/dd>/i);
  assert.match(html, /<dt>\s*Douyin\s*<\/dt>\s*<dd>\s*Norie\s*<\/dd>/i);
  assert.match(html, /<dt>\s*WeChat\s*<\/dt>\s*<dd>\s*NorieToronto\s*<\/dd>/i);
  assert.doesNotMatch(html, /sampleigacc|sampleacc/i);
  assert.doesNotMatch(html, /id="subscribeForm"|>\s*Subscribe\s*<|id="email"/i);
  assert.doesNotMatch(html, /<a[^>]*>\s*(?:norie_hair|Norie|NorieToronto)\s*<\/a>/i);
  assert.match(html, /id="waitlist"/);
});

test("the custom order form uses a submit button and loads the shared controller", async () => {
  const html = await read("customize.html");

  assert.match(html, /<button[^>]+type="submit"[^>]*>\s*Request custom order\s*<\/button>/i);
  assert.doesNotMatch(html, /mailto:[^"']+[^>]*>\s*Request custom order/i);
  assert.match(html, /<script[^>]+src="norie-forms\.js"[^>]+defer[^>]*><\/script>/i);
  assert.match(html, /<label[^>]+for="customerName"[^>]*>\s*Your name\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="customerName"[^>]+required/i);
  assert.match(html, /<label[^>]+for="orderEmail"[^>]*>\s*Email address\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="orderEmail"[^>]+type="email"[^>]+maxlength="254"[^>]+required/i);
});

test("the shared controller submits each form to its Vercel endpoint", async () => {
  const script = await read("norie-forms.js");

  assert.match(script, /addEventListener\("submit"/);
  assert.match(script, /postJson\("\/api\/custom-order"/);
  assert.match(script, /customerEmail:/);
  assert.match(script, /customerName:/);
  assert.match(script, /customerContact:/);
  assert.match(script, /postJson\("\/api\/subscribe"/);
});

test("contact details follow pricing in a responsive required field group", async () => {
  const html = await read("customize.html");

  const pricePosition = html.indexOf('class="summary price-section"');
  const contactPosition = html.indexOf('class="summary contact-section"');
  assert.ok(pricePosition >= 0 && contactPosition > pricePosition);
  assert.match(html, /All fields are required\./i);
  assert.match(html, /<label[^>]+for="customerName"[^>]*>\s*Your name\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="customerName"[^>]+placeholder="Name"[^>]+required/i);
  assert.match(html, /<label[^>]+for="orderEmail"[^>]*>\s*Email address\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="orderEmail"[^>]+placeholder="you@email\.com"[^>]+required/i);
  assert.match(html, /<label[^>]+for="customerContact"[^>]*>\s*Contact\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="customerContact"[^>]+placeholder="wechat_id"[^>]+required/i);
  assert.match(html, /\.contact-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(html, /\.contact-field input::placeholder\s*\{[^}]*font-style:\s*italic/s);
});

test("Customize offers accessible delivery and pickup fulfillment", async () => {
  const html = await read("customize.html");

  assert.match(html, /<fieldset[^>]+class="fulfillment-options"[^>]*>[\s\S]*<legend>\s*Fulfillment\s*<\/legend>/i);
  assert.match(html, /<input[^>]+type="radio"[^>]+name="fulfillment"[^>]+value="delivery"[^>]+required/i);
  assert.match(html, /Delivery\s*<small>\+ CAD \$5<\/small>/i);
  assert.match(html, /<input[^>]+type="radio"[^>]+name="fulfillment"[^>]+value="pickup"/i);
  assert.match(html, /Pickup\s*<small>North York \/ Finch \(Free\)<\/small>/i);
  assert.match(html, /<fieldset[^>]+id="deliveryAddress"[^>]+hidden[^>]*>[\s\S]*<legend>\s*Delivery address\s*<\/legend>/i);
  assert.match(html, /id="streetAddress"[^>]+autocomplete="street-address"[^>]+disabled[^>]+required/i);
  assert.match(html, /id="addressUnit"[^>]+autocomplete="address-line2"[^>]+disabled/i);
  assert.match(html, /id="addressCity"[^>]+autocomplete="address-level2"[^>]+disabled[^>]+required/i);
  assert.match(html, /id="addressProvince"[^>]+autocomplete="address-level1"[^>]+disabled[^>]+required/i);
  assert.match(html, /id="addressPostalCode"[^>]+autocomplete="postal-code"[^>]+disabled[^>]+required/i);
});

test("Customize price summary separates subtotal, delivery fee, and total", async () => {
  const html = await read("customize.html");

  assert.match(html, /id="itemSubtotal"[^>]*>\s*CAD \$25\s*</i);
  assert.match(html, /id="deliveryFee"[^>]*>\s*CAD \$0\s*</i);
  assert.match(html, /id="totalPrice"[^>]*aria-live="polite"[^>]*>\s*CAD \$25\s*</i);
});

test("the shared controller exposes pending and validation state accessibly", async () => {
  const script = await read("norie-forms.js");

  assert.match(script, /setAttribute\("aria-busy",\s*"true"\)/);
  assert.match(script, /setAttribute\("aria-disabled",\s*"true"\)/);
  assert.match(script, /setAttribute\("aria-invalid",\s*"true"\)/);
  assert.match(script, /setAttribute\("role",\s*"status"\)/);
});

test("the Homepage omits the Coming Soon section and its dedicated styles", async () => {
  const home = await read("index.html");

  assert.doesNotMatch(home, /coming-soon-title|Coming Soon|coming-grid|coming-photo/i);
  assert.doesNotMatch(home, /coming-soon-blue-shelf|coming-soon-pink-bag|coming-soon-brown-clip/i);
});

test("pages use a canonical doctype and do not name generic div elements", async () => {
  for (const page of ["index.html", "shop.html", "customize.html"]) {
    const html = await read(page);
    assert.match(html, /^<!DOCTYPE html>/);
    assert.doesNotMatch(html, /<div(?=[^>]*aria-label)(?![^>]*\brole=)[^>]*>/i);
  }
});
