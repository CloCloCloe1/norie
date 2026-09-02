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

test("the pink and white editorial strips keep the supplied 3:4 accessory images third", async () => {
  const html = await read("index.html");

  await access("assets/pink-lookbook-accessories.png");
  await access("assets/white-lookbook-accessories.png");

  assert.match(
    html,
    /lookbook-pink-bag\.jpg[\s\S]*lookbook-pink-flower-bag\.jpg[\s\S]*pink-lookbook-accessories\.png[^>]+alt="A curated collection of pink combs, claw clips, scrunchies, and hair accessories"/i
  );
  assert.match(
    html,
    /white-lookbook-hair-clip\.jpg[\s\S]*lookbook-white-product\.jpg[\s\S]*white-lookbook-accessories\.png[^>]+alt="A curated collection of pearl white combs, claw clips, scrunchies, and hair accessories"/i
  );
  assert.match(html, /\.lookbook-photo\s*\{[\s\S]*aspect-ratio:\s*3\s*\/\s*4;/i);
});

test("the white lookbook opens with the supplied hair-clip portrait", async () => {
  const html = await read("index.html");

  await access("assets/white-lookbook-hair-clip.jpg");
  assert.match(
    html,
    /<div class="lookbook-strip">\s*<img class="lookbook-photo" src="assets\/white-lookbook-hair-clip\.jpg"[^>]+alt="White personalized claw clip styled in a ponytail"/i
  );
});

test("the standalone Lookbooks page keeps the approved text-free gallery", async () => {
  const homepage = await read("index.html");
  const html = await read("lookbooks.html");
  const galleryAssets = [
    "lookbooks-pink-scrunchie.jpg",
    "lookbooks-white-claw-bag.jpg",
    "lookbooks-white-hair-clip.jpg",
    "lookbooks-pink-brush-walk.jpg",
    "lookbooks-pink-claw-street.jpg",
    "lookbooks-pink-brush-detail.jpg",
    "lookbooks-pink-flower-clips.jpg",
    "lookbooks-white-heart-claw.jpg",
    "lookbooks-pink-heart-claw.jpg"
  ];

  for (const asset of [
    ...galleryAssets,
    "lookbook-pink-bag.jpg",
    "lookbook-pink-flower-bag.jpg",
    "lookbook-white-product.jpg"
  ]) {
    await access(`assets/${asset}`);
  }

  assert.match(html, /<a href="lookbooks\.html"[^>]+data-i18n="nav\.lookbooks"[^>]+aria-current="page"[^>]*>LOOKBOOKS<\/a>/);
  assert.match(html, /<main[^>]*>[\s\S]*<h1[^>]+data-i18n="home\.lookbooks\.title"[^>]*>LOOKBOOKS<\/h1>/i);
  assert.match(
    html,
    new RegExp(galleryAssets.map((asset) => asset.replace(".", "\\.")).join("[\\s\\S]*"))
  );
  const main = html.match(/<main[^>]*>[\s\S]*?<\/main>/i)?.[0] ?? "";
  assert.equal((main.match(/class="lookbooks-photo"/g) ?? []).length, 9);
  assert.doesNotMatch(main, /<figcaption|<p[\s>]/i);
  assert.match(html, /\.lookbooks-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/i);
  assert.match(html, /\.lookbooks-photo\s*\{[\s\S]*aspect-ratio:\s*3\s*\/\s*4;[\s\S]*object-fit:\s*cover;/i);
  assert.match(html, /@media[^{}]*\(max-width:[^)]+\)[\s\S]*\.lookbooks-grid\s*\{\s*grid-template-columns:\s*1fr;/i);
  assert.doesNotMatch(homepage, /id="lookbooks"|class="lookbooks-photo"/i);
  assert.match(homepage, /pink-edit[\s\S]*lookbook-pink-bag\.jpg[\s\S]*lookbook-pink-flower-bag\.jpg[\s\S]*pink-lookbook-accessories\.png/i);
  assert.match(homepage, /white-edit[\s\S]*white-lookbook-hair-clip\.jpg[\s\S]*lookbook-white-product\.jpg[\s\S]*white-lookbook-accessories\.png/i);
});

test("every public page links to the standalone Lookbooks page", async () => {
  for (const page of ["index.html", "shop.html", "customize.html", "lookbooks.html"]) {
    const html = await read(page);
    const navigation = html.match(/<nav[^>]+aria-label="Main"[^>]*>[\s\S]*?<\/nav>/i)?.[0] ?? "";

    assert.match(
      navigation,
      /<a href="lookbooks\.html"[^>]+data-i18n="nav\.lookbooks"[^>]*>LOOKBOOKS<\/a>/,
      `${page} must link to the standalone Lookbooks page`
    );
  }
});

test("homepage hero uses the supplied Norie bag photograph", async () => {
  const html = await read("index.html");

  await access("assets/hero-norie-bag-square.jpg");
  assert.match(
    html,
    /<div class="hero-visual">\s*<img src="assets\/hero-norie-bag-square\.jpg" alt="Open cream shoulder bag filled with personalized Norie hair brushes and claw clips">/i
  );
  assert.match(html, /\.hero-visual\s*\{[\s\S]*?aspect-ratio:\s*1\s*\/\s*1;/i);
  assert.doesNotMatch(html, /\.hero-visual\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5;/i);
});

test("the home contact section links to the official social accounts", async () => {
  const html = await read("index.html");
  const main = html.match(/<main[^>]*>[\s\S]*?<\/main>/i)?.[0] ?? "";
  const footer = html.match(/<footer[^>]+class="site-footer"[^>]*>[\s\S]*?<\/footer>/i)?.[0] ?? "";

  const assertExternalAccount = (href, platform, account) => {
    const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const row = main.match(
      new RegExp(`<div class="social-row">\\s*<dt>\\s*${platform}\\s*<\\/dt>[\\s\\S]*?<\\/div>`, "i")
    )?.[0] ?? "";
    const link = row.match(
      new RegExp(`<a(?=[^>]*href="${escapedHref}")(?=[^>]*target="_blank")(?=[^>]*rel="noopener noreferrer")[^>]*>[\\s\\S]*?<\\/a>`, "i")
    )?.[0] ?? "";

    assert.match(link, new RegExp(`>\\s*${account}\\s*<span[^>]*aria-hidden="true"[^>]*>\\s*→\\s*<\\/span>`, "i"));
    assert.match(
      link,
      /<span(?=[^>]*class="visually-hidden")(?=[^>]*data-i18n="common\.opensNewTab")[^>]*>\s*— opens in a new tab\s*<\/span>/i
    );
  };

  assert.match(html, /Follow Norie for new samples, custom-order updates, and launch news\./);
  assert.match(main, /class="social-card"/i);
  assertExternalAccount("https://www.instagram.com/norie_hair/", "IG", "norie_hair");
  assertExternalAccount("https://www.tiktok.com/@norie_hair", "TikTok", "norie_hair");
  assertExternalAccount("https://xhslink.cn/m/38rRNyaQEbA", "Rednote", "itschloe_eee");
  assertExternalAccount("https://v.douyin.com/S4fAA1Zxzbs/", "Douyin", "40950053692");
  assert.match(main, /<div class="social-row">\s*<dt>\s*WeChat\s*<\/dt>\s*<dd>\s*NorieToronto\s*<\/dd>\s*<\/div>/i);
  assert.doesNotMatch(main, /<dt>\s*WeChat\s*<\/dt>\s*<dd>\s*<a/i);
  assert.doesNotMatch(footer, /class="social-card"|>\s*(?:IG|TikTok|Rednote|Douyin)\s*</i);
  assert.match(footer, /<div class="footer-identity">\s*<p>© 2026 Norie<\/p>\s*<span[^>]*>WeChat\s+NorieToronto<\/span>\s*<\/div>/i);
  assert.doesNotMatch(html, /id="subscribeForm"|>\s*Subscribe\s*<|id="email"/i);
  assert.doesNotMatch(main, /<(?:iframe|script)[^>]+(?:instagram|tiktok|douyin|xiaohongshu|xhslink)/i);
  assert.match(html, /id="waitlist"/);
});

test("the customizer adds configured products to the cart", async () => {
  const html = await read("customize.html");

  assert.match(html, /<button[^>]+type="submit"[^>]*>\s*Add to cart\s*<\/button>/i);
  assert.match(html, /import \{ addLine, createCartStore \} from "\.\/norie-cart\.js"/i);
  assert.doesNotMatch(html, /id="customerName"|id="orderEmail"|id="customerContact"/i);
  assert.match(html, /new URLSearchParams\(location\.search\)\.get\("product"\)/i);
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

test("contact details are collected once on the cart page", async () => {
  const html = await read("customize.html");
  const cart = await read("cart.html");
  assert.doesNotMatch(html, /name="customer(?:Name|Email|Contact)"/i);
  assert.match(cart, /id="checkoutName"/);
  assert.match(cart, /id="checkoutEmail"/);
  assert.match(cart, /id="checkoutContact"/);
});

test("the shared controller exposes pending and validation state accessibly", async () => {
  const script = await read("norie-forms.js");

  assert.match(script, /setAttribute\("aria-busy",\s*"true"\)/);
  assert.match(script, /setAttribute\("aria-disabled",\s*"true"\)/);
  assert.match(script, /setAttribute\("aria-invalid",\s*"true"\)/);
  assert.match(script, /setAttribute\("role",\s*"status"\)/);
});

test("the temporary Coming Soon section is removed in both languages", async () => {
  const home = await read("index.html");

  assert.doesNotMatch(home, /Coming Soon|New sample photos for launch extras|class="section coming-soon"/i);
  assert.doesNotMatch(home, /assets\/coming-soon-(?:blue-shelf|pink-bag|brown-clip)\.png/i);
  assert.doesNotMatch(await read("norie-i18n.js"), /新品正在靠近|home\.coming\.title/);
});

test("customization keeps main option names English and localizes helper copy", async () => {
  const html = await read("customize.html");
  assert.match(html, />Flat Brush\s*<small[^>]+data-i18n="custom\.helper\.flat"/i);
  assert.match(html, />Bamboo Paddle Brush\s*<small[^>]+data-i18n="custom\.helper\.paddle"/i);
  assert.match(html, />Claw Clip\s*<small[^>]+data-i18n="custom\.helper\.clip"/i);
  assert.match(html, />Pink\s*<small[^>]+data-i18n="custom\.helper\.pinkBase"/i);
  assert.match(html, />White\s*<small[^>]+data-i18n="custom\.helper\.whiteBase"/i);
  assert.match(html, /id="automaticStone"[^>]*>Pink products use white stones\./i);
  assert.match(html, /type="hidden" name="stoneColor" value="white"/i);
});

test("pages use a canonical doctype and do not name generic div elements", async () => {
  for (const page of ["index.html", "shop.html", "customize.html"]) {
    const html = await read(page);
    assert.match(html, /^<!DOCTYPE html>/);
    assert.doesNotMatch(html, /<div(?=[^>]*aria-label)(?![^>]*\brole=)[^>]*>/i);
  }
});

test("every public page exposes the shared bilingual language control", async () => {
  for (const page of ["index.html", "shop.html", "customize.html"]) {
    const html = await read(page);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /data-language-switcher/);
    assert.match(html, /<button[^>]+data-locale="en"[^>]+aria-pressed="true"[^>]*>EN<\/button>/);
    assert.match(html, /<button[^>]+data-locale="zh-CN"[^>]+aria-pressed="false"[^>]*>中文<\/button>/);
    assert.match(html, /<script[^>]+type="module"[^>]+src="norie-i18n\.js"[^>]*><\/script>/);
  }
});

test("every public page exposes the shared shopping cart", async () => {
  for (const page of ["index.html", "shop.html", "customize.html", "lookbooks.html", "cart.html"]) {
    const html = await read(page);
    assert.match(html, /<a[^>]+class="cart-link"[^>]+href="cart\.html"/i, `${page} must link to the cart`);
    assert.match(html, /data-cart-count/i, `${page} must expose the cart count`);
    assert.match(html, /norie-cart\.js/i, `${page} must load the cart module`);
  }
});

test("the cart page exposes accessible cart and checkout regions", async () => {
  const html = await read("cart.html");
  assert.match(html, /data-language-switcher/i);
  assert.match(html, /data-locale="zh-CN"/i);
  assert.match(html, /<main id="main">/i);
  assert.match(html, /data-cart-lines/i);
  assert.match(html, /data-cart-empty/i);
  assert.match(html, /data-cart-total/i);
  assert.match(html, /<form[^>]+id="checkoutForm"[^>]+novalidate/i);
  assert.match(html, /<label[^>]+for="checkoutName"/i);
  assert.match(html, /<input[^>]+id="checkoutName"[^>]+autocomplete="name"[^>]+required/i);
  assert.match(html, /<input[^>]+id="checkoutEmail"[^>]+type="email"[^>]+autocomplete="email"[^>]+required/i);
  assert.match(html, /<input[^>]+id="checkoutContact"[^>]+required/i);
  assert.match(html, /role="status"[^>]+aria-live="polite"/i);
  assert.match(html, /fetch\("\/api\/cart-order"/i);
  assert.match(html, /crypto\.randomUUID\(\)/i);
  assert.match(html, /store\.clear\(\)/i);
  assert.match(html, /productCatalog\[line\.productId\]/i);
});

test("dynamic order messages use the active site locale", async () => {
  const script = await read("norie-forms.js");
  assert.match(script, /NorieI18n\?\.translate/);
  for (const key of [
    "form.error.name",
    "form.error.email",
    "form.error.contact",
    "form.order.pending",
    "form.order.success",
    "form.order.failure"
  ]) {
    assert.match(script, new RegExp(key.replaceAll(".", "\\.")));
  }
});

test("the customizer refreshes its dynamic summary after a locale change", async () => {
  const html = await read("customize.html");
  assert.match(html, /addEventListener\("norie:localechange",\s*updatePreview\)/);
  assert.match(html, /summaryProduct\.textContent = data\.label/);
});
