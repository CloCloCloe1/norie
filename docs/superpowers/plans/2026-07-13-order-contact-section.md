# Order Contact Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move customer contact inputs below the price card, add a required Contact field with a `wechat_id` example, and include that value in order emails.

**Architecture:** Keep the entire configurator inside the existing `#customForm`. The HTML/CSS owns the responsive contact layout, `norie-forms.js` owns client payload and validation, and `api/custom-order.js` owns authoritative server validation and email rendering.

**Tech Stack:** Static HTML/CSS/JavaScript, Vercel Node Functions, Resend HTTP API, Node.js `node:test`, html-validate.

---

### Task 1: Lock the contact-section contract with failing tests

**Files:**
- Modify: `tests/site-integration.test.js`
- Modify: `tests/api.test.js`

- [ ] **Step 1: Add a site integration test for field placement, labels, placeholders, and payload**

```js
test("contact details follow pricing in a responsive required field group", async () => {
  const html = await read("customize.html");
  const script = await read("norie-forms.js");

  const pricePosition = html.indexOf('class="summary price-section"');
  const contactPosition = html.indexOf('class="summary contact-section"');
  assert.ok(pricePosition >= 0 && contactPosition > pricePosition);
  assert.match(html, /<label[^>]+for="customerName"[^>]*>\s*Your name\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="customerName"[^>]+placeholder="Name"[^>]+required/i);
  assert.match(html, /<label[^>]+for="orderEmail"[^>]*>\s*Email address\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="orderEmail"[^>]+placeholder="you@email\.com"[^>]+required/i);
  assert.match(html, /<label[^>]+for="customerContact"[^>]*>\s*Contact\s*<\/label>/i);
  assert.match(html, /<input[^>]+id="customerContact"[^>]+placeholder="wechat_id"[^>]+required/i);
  assert.match(html, /\.contact-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(html, /\.contact-field input::placeholder\s*\{[^}]*font-style:\s*italic/s);
  assert.match(script, /customerContact:/);
});
```

- [ ] **Step 2: Extend the custom-order email test with the required contact value**

Add `customerContact: "chloe_wechat"` to the valid payload and assert:

```js
assert.match(email.html, /Contact/);
assert.match(email.html, /chloe_wechat/);
assert.match(email.text, /Contact: chloe_wechat/);
```

Add a server validation test:

```js
test("custom order requires a contact value", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  let requested = false;
  process.env.ORDER_TO_EMAIL = "orders@example.com";
  global.fetch = async () => {
    requested = true;
    return response();
  };

  try {
    const res = await invoke(customOrder, {
      product: "Small comb",
      baseColor: "Pink",
      rhinestoneColor: "Pink stones",
      customerName: "Chloe Lee",
      customerEmail: "chloe@example.com"
    });
    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error, "Please enter your contact information.");
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});
```

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/site-integration.test.js tests/api.test.js`

Expected: failures for the missing contact section, missing `customerContact` payload, and missing API validation/email field.

### Task 2: Move the fields and add the responsive contact section

**Files:**
- Modify: `customize.html`
- Test: `tests/site-integration.test.js`

- [ ] **Step 1: Remove customer name and email from the custom-text panel**

Leave only this input and its hint in `.panel.text-field`:

```html
<label class="text-label" id="text-section-title" for="customText">Customize your text</label>
<input id="customText" name="customText" type="text" value="Chloe" maxlength="8" aria-describedby="textHint" autocomplete="off">
<p id="textHint" class="hint">Use one initial or a short English name, up to 8 letters.</p>
```

- [ ] **Step 2: End the price card after the dynamic total and add the new section**

```html
<section class="summary price-section" aria-labelledby="summary-title">
  <!-- existing heading and price rows remain unchanged -->
  <div class="price" id="totalPrice">CAD $25</div>
</section>

<section class="summary contact-section" aria-labelledby="contact-section-title">
  <h2 id="contact-section-title">Contact details</h2>
  <div class="contact-grid">
    <div class="contact-field">
      <label class="text-label" for="customerName">Your name</label>
      <input id="customerName" name="customerName" type="text" maxlength="100" autocomplete="name" placeholder="Name" required aria-required="true">
    </div>
    <div class="contact-field">
      <label class="text-label" for="orderEmail">Email address</label>
      <input id="orderEmail" name="customerEmail" type="email" maxlength="254" autocomplete="email" placeholder="you@email.com" required aria-required="true">
    </div>
    <div class="contact-field">
      <label class="text-label" for="customerContact">Contact</label>
      <input id="customerContact" name="customerContact" type="text" maxlength="100" autocomplete="off" placeholder="wechat_id" required aria-required="true">
    </div>
  </div>
  <button class="button" type="submit">Request custom order</button>
</section>
```

- [ ] **Step 3: Add desktop, placeholder, and mobile styles**

```css
.contact-section {
  margin-top: clamp(1rem, 3vw, 1.4rem);
}

.contact-section h2 {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
}

.contact-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.contact-field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

.contact-field input::placeholder {
  color: rgba(107, 77, 89, 0.72);
  font-style: italic;
  opacity: 1;
}

@media (max-width: 760px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run the site integration test and verify remaining failures are limited to browser/API handling**

Run: `node --test tests/site-integration.test.js`

Expected: layout and field assertions pass; the payload assertion remains red until Task 3.

### Task 3: Submit and validate Contact end to end

**Files:**
- Modify: `norie-forms.js`
- Modify: `api/custom-order.js`
- Test: `tests/site-integration.test.js`
- Test: `tests/api.test.js`

- [ ] **Step 1: Add Contact to the browser payload and binding**

In `orderPayload` add:

```js
customerContact: clean(form.querySelector("#customerContact")?.value),
```

In `bindOrderForm`, query and require the field:

```js
const customerContact = form?.querySelector("#customerContact");
if (!form || !button || !customerName || !customerEmail || !customerContact) return;
customerContact.addEventListener("input", () => clearFieldError(customerContact, "order-status"));
```

Before setting the busy state, add:

```js
if (!clean(customerContact.value)) {
  showFieldError(customerContact, button, "order-status", "Contact: enter your WeChat ID.");
  return;
}
```

- [ ] **Step 2: Add authoritative API validation and email rendering**

After cleaning `customerEmail`, add:

```js
const customerContact = clean(payload.customerContact);
```

After email validation, add:

```js
if (!customerContact || customerContact.length > 100) {
  sendJson(res, 400, { error: "Please enter your contact information." });
  return;
}
```

Add to the `order` object after customer email:

```js
Contact: customerContact,
```

- [ ] **Step 3: Run focused tests and verify GREEN**

Run: `node --test tests/site-integration.test.js tests/api.test.js`

Expected: all focused tests pass.

- [ ] **Step 4: Commit the implementation**

```powershell
git add -- customize.html norie-forms.js api/custom-order.js tests/site-integration.test.js tests/api.test.js
git commit -m "feat: add order contact section"
```

### Task 4: Verify and deploy

**Files:**
- Verify: `customize.html`
- Verify: `norie-forms.js`
- Verify: `api/custom-order.js`

- [ ] **Step 1: Run complete local verification**

Run: `npm.cmd test`

Expected: zero failing tests.

Run: `npx.cmd --yes html-validate@latest index.html shop.html customize.html`

Expected: exit code 0 with no validation errors.

- [ ] **Step 2: Deploy the linked project to production**

Run: `npx.cmd --yes vercel@latest --prod --yes`

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify production markup and submit one labeled test order**

Fetch `https://norie-hair.vercel.app/customize` and confirm `customerContact`, `placeholder="wechat_id"`, and `norie-forms.js` are present. POST a test order with `customerContact: "deployment_test"` to `/api/custom-order` and expect `{ "ok": true }`.
