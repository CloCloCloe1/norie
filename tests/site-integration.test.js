import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(file, "utf8");

test("the newsletter form loads the shared controller and submits natively", async () => {
  const html = await read("index.html");

  assert.match(html, /<form[^>]+id="subscribeForm"[^>]*>/i);
  assert.match(html, /<input[^>]+id="email"[^>]+type="email"[^>]+maxlength="254"/i);
  assert.match(html, /<button[^>]+type="submit"[^>]*>\s*Subscribe\s*<\/button>/i);
  assert.match(html, /<script[^>]+src="norie-forms\.js"[^>]+defer[^>]*><\/script>/i);
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

test("the shared controller exposes pending and validation state accessibly", async () => {
  const script = await read("norie-forms.js");

  assert.match(script, /setAttribute\("aria-busy",\s*"true"\)/);
  assert.match(script, /setAttribute\("aria-disabled",\s*"true"\)/);
  assert.match(script, /setAttribute\("aria-invalid",\s*"true"\)/);
  assert.match(script, /setAttribute\("role",\s*"status"\)/);
});

test("the Coming Soon section renders the supplied photos at a 3:4 ratio", async () => {
  const home = await read("index.html");

  assert.doesNotMatch(home, /coming-placeholder|Photo 0[1-3]/);
  assert.match(home, /assets\/coming-soon-blue-shelf\.png/);
  assert.match(home, /assets\/coming-soon-pink-bag\.png/);
  assert.match(home, /assets\/coming-soon-brown-clip\.png/);
  assert.match(home, /\.coming-photo\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/s);
  assert.match(home, /\.coming-photo img\s*\{[^}]*object-fit:\s*cover/s);
});

test("pages use a canonical doctype and do not name generic div elements", async () => {
  for (const page of ["index.html", "shop.html", "customize.html"]) {
    const html = await read(page);
    assert.match(html, /^<!DOCTYPE html>/);
    assert.doesNotMatch(html, /<div(?=[^>]*aria-label)(?![^>]*\brole=)[^>]*>/i);
  }
});
