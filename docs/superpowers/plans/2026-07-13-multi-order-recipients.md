# Multiple Order Recipients Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send each custom-order notification to every valid email in the comma-separated `ORDER_TO_EMAIL` configuration.

**Architecture:** Parse and validate recipient configuration inside the custom-order function before reading customer order fields or calling Resend. Continue using the shared email sender's existing array support so one Resend request delivers the same message to both visible To recipients.

**Tech Stack:** Vercel Node Functions, Resend HTTP API, Node.js `node:test`, Vercel environment variables.

---

### Task 1: Lock multi-recipient behavior with failing tests

**Files:**
- Modify: `tests/api.test.js`
- Test: `tests/api.test.js`

- [ ] **Step 1: Make the successful order test configure two unique recipients with whitespace and a duplicate**

Change the environment setup to:

```js
process.env.ORDER_TO_EMAIL = " orders@example.com, backup@example.com, orders@example.com ";
```

Change the recipient assertion to:

```js
assert.deepEqual(email.to, ["orders@example.com", "backup@example.com"]);
```

- [ ] **Step 2: Add a test that rejects any invalid configured recipient before delivery**

```js
test("custom order rejects an invalid configured recipient list", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  let requested = false;

  process.env.ORDER_TO_EMAIL = "orders@example.com,not-an-email";
  global.fetch = async () => {
    requested = true;
    return response();
  };
  console.error = () => {};

  try {
    const res = await invoke(customOrder, {
      product: "Small comb",
      baseColor: "Pink",
      rhinestoneColor: "Pink stones",
      customerName: "Chloe Lee",
      customerEmail: "chloe@example.com",
      customerContact: "chloe_wechat"
    });
    assert.equal(res.statusCode, 500);
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});
```

- [ ] **Step 3: Run the focused API tests and verify RED**

Run: `node --test tests/api.test.js`

Expected: the array assertion fails because the current handler passes one comma-containing string; the invalid-recipient test fails because the handler attempts external delivery.

### Task 2: Parse and validate the configured recipients

**Files:**
- Modify: `api/custom-order.js`
- Modify: `.env.example`
- Modify: `README.md`
- Test: `tests/api.test.js`

- [ ] **Step 1: Add a focused recipient parser**

Add after `clean`:

```js
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
```

- [ ] **Step 2: Use the validated array for the Resend request**

Replace the single destination setup with:

```js
const destinations = configuredRecipients(process.env.ORDER_TO_EMAIL);
```

Then change the email call to:

```js
to: destinations,
```

- [ ] **Step 3: Document the comma-separated format**

Set the example to:

```dotenv
ORDER_TO_EMAIL=orders@example.com,backup@example.com
```

Update the README entry to:

```markdown
- `ORDER_TO_EMAIL`: required comma-separated private inbox list that receives custom-order requests. Whitespace and duplicates are removed; every address must be valid.
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test tests/api.test.js`

Expected: all API tests pass.

- [ ] **Step 5: Commit the implementation**

```powershell
git add -- api/custom-order.js tests/api.test.js .env.example README.md
git commit -m "feat: send orders to multiple inboxes"
```

### Task 3: Update Vercel configuration, deploy, and verify

**Files:**
- Verify: `api/custom-order.js`

- [ ] **Step 1: Update Production and Preview `ORDER_TO_EMAIL` values**

Use `vercel env update ORDER_TO_EMAIL production` and `vercel env update ORDER_TO_EMAIL preview`, entering the same comma-separated value for both:

```text
liminxuan118@gmail.com,843395381@qq.com
```

Do not display or modify `RESEND_API_KEY`.

- [ ] **Step 2: Run the complete test suite**

Run: `npm.cmd test`

Expected: zero failing tests.

- [ ] **Step 3: Deploy the combined home-page and recipient changes**

Run: `npx.cmd --yes vercel@latest --prod --yes`

Expected: deployment reaches `READY` and aliases to `https://norie-hair.vercel.app`.

- [ ] **Step 4: Submit one labeled production order**

POST a valid test order to `https://norie-hair.vercel.app/api/custom-order` with `customerContact: "dual_recipient_test"` and expect `{ "ok": true }`. Confirm both owner inboxes receive the same message and both addresses appear in To.
