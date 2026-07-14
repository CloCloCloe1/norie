# Customer Order Confirmation Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a branded, personalized order-request confirmation to the customer after the existing owner notification succeeds, without failing the accepted order when only the customer email fails.

**Architecture:** Keep the existing `/api/custom-order` endpoint and `sendEmail` transport. The handler will build two audience-specific messages from the same server-validated order data, send the owner notification first, then attempt the customer confirmation in a guarded second call. The supplied logo will be served as a static production asset and referenced by an absolute URL in the accessible HTML email.

**Tech Stack:** Vercel Node.js serverless functions, Resend HTTP API, HTML email with inline CSS, Node.js built-in test runner

---

## File Structure

- Modify `api/custom-order.js`: build the accessible customer confirmation, send it second, and make only its failure non-fatal.
- Modify `tests/api.test.js`: verify the two-message flow, content, escaping, trusted pricing, and non-fatal confirmation failure.
- Modify `tests/site-integration.test.js`: verify the deployable logo asset exists.
- Create `assets/norie-logo.png`: stable public copy of the supplied Norie logo.
- Create `tests/order-confirmation-email-palette.json`: reproducible WCAG contrast checks for the email palette.

### Task 1: Add the Deployable Norie Logo

**Files:**
- Modify: `tests/site-integration.test.js`
- Create: `assets/norie-logo.png`

- [ ] **Step 1: Write the failing asset test**

Add `access` to the filesystem import and add this test:

```js
import { access, readFile } from "node:fs/promises";

test("the customer confirmation logo is included in the deployable assets", async () => {
  await access("assets/norie-logo.png");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node --test tests/site-integration.test.js
```

Expected: FAIL with `ENOENT` for `assets/norie-logo.png`.

- [ ] **Step 3: Copy the supplied logo under its stable public filename**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\limin\Desktop\MY\product\Norie.png' -Destination 'C:\Users\limin\Documents\Norie\assets\norie-logo.png'
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```powershell
node --test tests/site-integration.test.js
```

Expected: all site integration tests PASS.

- [ ] **Step 5: Commit the logo and its test**

```powershell
git add tests/site-integration.test.js assets/norie-logo.png
git commit -m "feat: add Norie email logo asset"
```

### Task 2: Send the Branded Customer Confirmation

**Files:**
- Modify: `tests/api.test.js`
- Modify: `api/custom-order.js`

- [ ] **Step 1: Expand the successful-order test before changing production code**

In `custom order sends an escaped order email to the configured inbox`, change the call-count assertion to two, keep all existing owner assertions against the first request, and add these assertions for the second request:

```js
assert.equal(calls.length, 2);

const ownerEmail = JSON.parse(calls[0].options.body);
assert.deepEqual(ownerEmail.to, ["orders@example.com", "backup@example.com"]);
assert.equal(ownerEmail.reply_to, "chloe@example.com");

const customerEmail = JSON.parse(calls[1].options.body);
assert.deepEqual(customerEmail.to, ["chloe@example.com"]);
assert.equal(customerEmail.reply_to, "orders@example.com");
assert.equal(customerEmail.subject, "We received your Norie custom order request");
assert.match(customerEmail.html, /https:\/\/norie-hair\.vercel\.app\/assets\/norie-logo\.png/);
assert.match(customerEmail.html, /alt="Norie"/);
assert.match(customerEmail.html, /IT ALL STARTS HERE/);
assert.match(customerEmail.html, /Hi Chloe Lee,/);
assert.match(customerEmail.html, /Your request summary/);
assert.match(customerEmail.html, /Large comb/);
assert.match(customerEmail.html, /Pink/);
assert.match(customerEmail.html, /White stones/);
assert.match(customerEmail.html, /&lt;Chloe&gt;/);
assert.doesNotMatch(customerEmail.html, /<Chloe>/);
assert.match(customerEmail.html, /One random free gift/);
assert.match(customerEmail.html, /CAD \$30/);
assert.doesNotMatch(customerEmail.html, /CAD \$999/);
assert.match(customerEmail.html, /7–10 days/);
assert.match(customerEmail.html, /<caption[^>]*>\s*Your request summary\s*<\/caption>/i);
assert.match(customerEmail.html, /<th scope="row"/i);
assert.match(customerEmail.text, /Hi Chloe Lee,/);
assert.match(customerEmail.text, /Custom text: <Chloe>/);
assert.match(customerEmail.text, /Estimated price: CAD \$30/);
assert.match(customerEmail.text, /7–10 days/);
```

Rename the existing local `email` variable to `ownerEmail` and keep its existing subject, escaping, contact, and trusted-price assertions.

- [ ] **Step 2: Run the focused test to verify it fails for the missing second email**

Run:

```powershell
node --test --test-name-pattern="custom order sends an escaped" tests/api.test.js
```

Expected: FAIL because `calls.length` is `1`, not `2`.

- [ ] **Step 3: Add the minimal customer confirmation builder and second send**

In `api/custom-order.js`, add this constant after the catalog constants:

```js
const CONFIRMATION_LOGO_URL = "https://norie-hair.vercel.app/assets/norie-logo.png";
```

After building and sending the existing owner notification, create the customer summary from trusted values:

```js
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

await sendEmail({
  to: customerEmail,
  replyTo: destinations[0],
  subject: "We received your Norie custom order request",
  html: `
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
  `,
  text: customerText
});
```

Place this second send before the existing `sendJson(res, 200, { ok: true })` line.

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```powershell
node --test --test-name-pattern="custom order sends an escaped" tests/api.test.js
```

Expected: the focused test PASS.

- [ ] **Step 5: Commit the successful two-message flow**

```powershell
git add api/custom-order.js tests/api.test.js
git commit -m "feat: send customer order confirmation"
```

### Task 3: Make Customer Confirmation Failure Non-Fatal

**Files:**
- Modify: `tests/api.test.js`
- Modify: `api/custom-order.js`

- [ ] **Step 1: Write the failing non-fatal failure test**

Add this test to `tests/api.test.js`:

```js
test("custom order succeeds when only the customer confirmation fails", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  const calls = [];
  const errors = [];

  process.env.RESEND_API_KEY = "test-key";
  process.env.ORDER_TO_EMAIL = "orders@example.com";
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1
      ? response({ data: { id: "owner-email" } })
      : response({ ok: false, status: 403, data: { message: "Recipient is not allowed" } });
  };
  console.error = (...args) => errors.push(args);

  try {
    const res = await invoke(customOrder, {
      product: "Small comb",
      baseColor: "White",
      rhinestoneColor: "Pink stones",
      customText: "Norie",
      customerName: "Ava Chen",
      customerEmail: "ava@example.com",
      customerContact: "ava_wechat"
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true });
    assert.equal(calls.length, 2);
    assert.deepEqual(JSON.parse(calls[0].options.body).to, ["orders@example.com"]);
    assert.deepEqual(JSON.parse(calls[1].options.body).to, ["ava@example.com"]);
    assert.equal(errors.length, 1);
    assert.equal(errors[0][0], "Customer confirmation email failed");
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
node --test --test-name-pattern="only the customer confirmation fails" tests/api.test.js
```

Expected: FAIL because the endpoint currently returns 500 when the second Resend request fails.

- [ ] **Step 3: Guard only the customer send**

Wrap only the second `sendEmail` call in `api/custom-order.js`:

```js
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
```

Extract the HTML template from Task 2 into a `customerHtml` constant immediately before this block. Do not wrap the owner notification; it must remain fatal.

- [ ] **Step 4: Run the focused and complete API tests**

Run:

```powershell
node --test --test-name-pattern="only the customer confirmation fails" tests/api.test.js
node --test tests/api.test.js
```

Expected: the focused test and all API tests PASS.

- [ ] **Step 5: Commit the failure policy**

```powershell
git add api/custom-order.js tests/api.test.js
git commit -m "fix: keep accepted orders successful on confirmation failure"
```

### Task 4: Verify Email Color Contrast

**Files:**
- Create: `tests/order-confirmation-email-palette.json`

- [ ] **Step 1: Create the reproducible palette checks**

Create `tests/order-confirmation-email-palette.json` with:

```json
{
  "checks": [
    {
      "id": "confirmation-body-text",
      "foreground": "#39222d",
      "background": "#fff9f7",
      "type": "text-normal",
      "notes": "Customer confirmation paragraphs and table values"
    },
    {
      "id": "confirmation-brand-text",
      "foreground": "#64243a",
      "background": "#fff9f7",
      "type": "text-normal",
      "notes": "Eyebrow, headings, sign-off, and table row labels"
    }
  ]
}
```

- [ ] **Step 2: Run the required WCAG contrast checker**

Run:

```powershell
node 'C:\Users\limin\.codex\skills\intopia-web-accessibility-skill\scripts\check-colour-contrast.js' tests/order-confirmation-email-palette.json
```

Expected: both checks PASS with normal-text contrast of at least 4.5:1.

- [ ] **Step 3: Commit the accessibility verification asset**

```powershell
git add tests/order-confirmation-email-palette.json
git commit -m "test: verify confirmation email contrast"
```

### Task 5: Full Verification and Production Deployment

**Files:**
- Verify: `api/custom-order.js`
- Verify: `tests/api.test.js`
- Verify: `tests/site-integration.test.js`
- Verify: `assets/norie-logo.png`

- [ ] **Step 1: Run all automated and static checks**

Run:

```powershell
npm.cmd test
node --check api/custom-order.js
node --check api/_utils.js
node --check norie-forms.js
npx.cmd --yes html-validate@latest index.html customize.html shop.html
git diff --check
```

Expected: every command exits 0, all Node tests PASS, and there are no HTML or whitespace errors.

- [ ] **Step 2: Deploy the production build**

Run:

```powershell
npx.cmd --yes vercel@latest --prod --yes
```

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 3: Verify the public logo**

Run:

```powershell
$logo = Invoke-WebRequest -Uri 'https://norie-hair.vercel.app/assets/norie-logo.png' -UseBasicParsing
if ($logo.StatusCode -ne 200 -or $logo.RawContentLength -lt 1000) { throw 'Production logo verification failed' }
```

Expected: status 200 and a non-empty image response.

- [ ] **Step 4: Submit an authorized production test order**

Use the Resend account owner's email so the confirmation can be delivered before a custom domain is verified:

```powershell
$payload = @{
  product = 'Small comb'
  baseColor = 'Pink'
  rhinestoneColor = 'White stones'
  customText = 'TEST'
  customerName = 'Norie confirmation test'
  customerEmail = 'liminxuan118@gmail.com'
  customerContact = 'confirmation_test'
  pageUrl = 'https://norie-hair.vercel.app/customize'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'https://norie-hair.vercel.app/api/custom-order' -Method Post -ContentType 'application/json' -Body $payload | ConvertTo-Json -Compress
```

Expected: `{ "ok": true }`. The Gmail inbox receives both the owner notification and the customer confirmation. Delivery to arbitrary customer addresses remains blocked by Resend until a user-owned sending domain is verified.

- [ ] **Step 5: Inspect production errors and final repository state**

Run:

```powershell
npx.cmd --yes vercel@latest logs --environment production --level error --since 15m --expand --limit 20 --no-branch
git status --short
git log --oneline -8
```

Expected: no customer-confirmation error for the authorized Gmail test. Only pre-existing unrelated untracked workspace files may remain.
