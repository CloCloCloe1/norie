# Order Fulfillment and Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add delivery/pickup fulfillment, authoritative CAD $5 delivery pricing, distinct owner/customer emails, and automatic private Google Sheet order tracking.

**Architecture:** Keep the existing static Customize page and Vercel order endpoint. Move fulfillment normalization, order identity, price breakdown, and ready-by calculation into a focused order module; isolate Google Sheets REST access in a second module. The API validates and persists the order before sending idempotent owner/customer emails.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js Vercel functions, Google Sheets API v4 with service-account JWT OAuth, Resend API, Node test runner, native Google Sheets imported from a verified `.xlsx` template.

---

### Task 1: Fulfillment UI and dynamic total

**Files:**
- Modify: `customize.html`
- Modify: `norie-forms.js`
- Test: `tests/site-integration.test.js`
- Test: `tests/customize-selection.test.js`

- [ ] **Step 1: Write failing form-structure tests**

Assert that `customize.html` contains a required `fulfillment` radio group for `delivery` and `pickup`, a conditionally hidden address fieldset with correctly labelled/autocomplete-enabled fields, and subtotal/delivery/total output elements.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `node --test tests/site-integration.test.js tests/customize-selection.test.js`

Expected: FAIL because fulfillment controls, address fields, and delivery price output do not exist.

- [ ] **Step 3: Add accessible fulfillment and address markup**

Add native `<fieldset>` / `<legend>` groups. Use `required` on fulfillment choices and required address fields while Delivery is active. Use `autocomplete="street-address"`, `address-line2`, `address-level2`, `address-level1`, and `postal-code`. Keep address inputs disabled and the fieldset hidden for Pickup.

- [ ] **Step 4: Add dynamic pricing and validation behavior**

Extend `norie-forms.js` with pure helpers equivalent to:

```js
function fulfillmentPrice(method) {
  return method === "delivery" ? 5 : 0;
}

function estimatedTotal(subtotal, method) {
  return subtotal + fulfillmentPrice(method);
}
```

On fulfillment change, toggle the address fieldset, required/disabled state, displayed fee, and total. On submit, focus the first missing fulfillment/address field and provide a field-specific inline error. Add the fulfillment/address fields and a stable request ID to `orderPayload()`.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/site-integration.test.js tests/customize-selection.test.js`

Expected: all focused tests pass.

- [ ] **Step 6: Commit**

```bash
git add customize.html norie-forms.js tests/site-integration.test.js tests/customize-selection.test.js
git commit -m "feat: add order fulfillment selection"
```

### Task 2: Authoritative order model and pricing

**Files:**
- Create: `api/_order.js`
- Modify: `api/custom-order.js`
- Test: `tests/order-model.test.js`
- Test: `tests/api.test.js`

- [ ] **Step 1: Write failing order-model tests**

Cover delivery and pickup normalization, required delivery address, ignored pickup address, flat CAD $5 delivery fee, catalog subtotal, total, stable request ID validation, Toronto timestamps, and a ready-by date exactly 14 calendar days later.

- [ ] **Step 2: Run model tests and confirm RED**

Run: `node --test tests/order-model.test.js`

Expected: FAIL because `api/_order.js` does not exist.

- [ ] **Step 3: Implement the order model**

Export `DELIVERY_FEE = 5`, `PICKUP_LOCATION = "North York / Finch"`, `buildOrder(payload, now = new Date())`, and `orderSheetRow(order)` as the module's complete public interface.

`buildOrder` must call `resolveSelection`, accept only UUID-format request IDs, validate field lengths, calculate `itemSubtotal`, `deliveryFee`, and `total`, and return ISO timestamps plus a `YYYY-MM-DD` ready-by date computed from `now + 14 days`.

- [ ] **Step 4: Make the endpoint consume `buildOrder`**

Remove duplicated catalog/customer normalization from `api/custom-order.js`. Convert model validation failures into 400 responses with field-specific messages.

- [ ] **Step 5: Run model/API tests and confirm GREEN**

Run: `node --test tests/order-model.test.js tests/api.test.js`

Expected: all focused tests pass.

- [ ] **Step 6: Commit**

```bash
git add api/_order.js api/custom-order.js tests/order-model.test.js tests/api.test.js
git commit -m "feat: validate fulfillment pricing server side"
```

### Task 3: Google Sheets persistence

**Files:**
- Create: `api/_google-sheets.js`
- Modify: `api/custom-order.js`
- Test: `tests/google-sheets.test.js`
- Test: `tests/api.test.js`

- [ ] **Step 1: Write failing Google Sheets client tests**

Mock `fetch` and assert JWT token exchange, private-key newline normalization, Order ID lookup, one-row append to `Orders!A:X`, duplicate retry behavior, safe upstream errors, and missing configuration errors.

- [ ] **Step 2: Run Sheets tests and confirm RED**

Run: `node --test tests/google-sheets.test.js`

Expected: FAIL because the Sheets client does not exist.

- [ ] **Step 3: Implement service-account authentication and append**

Use only Node built-ins (`node:crypto`) to create an RS256 JWT for `https://oauth2.googleapis.com/token` with scope `https://www.googleapis.com/auth/spreadsheets`. Export `persistOrder(order, { fetchImpl = fetch } = {})`; it reads `Orders!A:A`, returns the existing match when the order ID is present, and otherwise appends `orderSheetRow(order)` to `Orders!A:X`.

Read configuration from `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`. Do not include secrets or raw upstream response bodies in thrown client-facing errors.

- [ ] **Step 4: Persist before email delivery**

Call `persistOrder(order)` in `custom-order.js` after validation and before sending email. A persistence failure returns a retryable 500 response and sends no email.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/google-sheets.test.js tests/api.test.js`

Expected: all focused tests pass, including duplicate request ID behavior.

- [ ] **Step 6: Commit**

```bash
git add api/_google-sheets.js api/custom-order.js tests/google-sheets.test.js tests/api.test.js
git commit -m "feat: persist orders to Google Sheets"
```

### Task 4: Distinct owner and customer emails

**Files:**
- Modify: `api/custom-order.js`
- Test: `tests/api.test.js`

- [ ] **Step 1: Write failing email-content tests**

Assert that the owner email contains full contact/address, item subtotal, fee, total, submitted timestamp, exact ready-by date, and `Status: New`. Assert that the customer email contains the order ID, receipt, fulfillment/address, and 14-day message but omits status/source URL. Assert Resend idempotency keys are stable per order and audience.

- [ ] **Step 2: Run API tests and confirm RED**

Run: `node --test tests/api.test.js`

Expected: FAIL against the previous shared order summaries and 7–10-day copy.

- [ ] **Step 3: Build two explicit email views**

Build `ownerSummary` and `customerSummary` separately from the normalized order. Use the same server totals in both. For pickup, show `North York / Finch`; for delivery, render the structured address. Use `norie-owner-${order.id}` and `norie-customer-${order.id}` Resend idempotency keys.

- [ ] **Step 4: Preserve delivery semantics**

Require successful owner email for a 200 response. Keep customer confirmation best-effort, log only a non-sensitive failure message, and return the stable order ID in the success JSON for the UI.

- [ ] **Step 5: Run API tests and confirm GREEN**

Run: `node --test tests/api.test.js`

Expected: all API tests pass.

- [ ] **Step 6: Commit**

```bash
git add api/custom-order.js tests/api.test.js
git commit -m "feat: send fulfillment-aware order emails"
```

### Task 5: Create and import the private order tracker

**Files:**
- Create: `artifacts/Norie Order Tracker.xlsx`
- Create temporarily: a single `.mjs` workbook builder outside the repository

- [ ] **Step 1: Load bundled workspace dependencies and read required spreadsheet references**

Use `codex_app__load_workspace_dependencies`. Read `style_guidelines.md` and `artifact_tool_docs/API_QUICK_START.md` completely. Create a writable temporary working directory with a `node_modules` junction to the loader-provided dependency path.

- [ ] **Step 2: Build the workbook template**

Use `@oai/artifact-tool` to create an `Orders` sheet with the 24 approved headers, frozen first row, filter, status validation list, date/currency formats, readable column widths, accessible contrast, and an empty formatted table area.

- [ ] **Step 3: Verify the local workbook**

Reload the `.xlsx` with artifact-tool, verify the sheet name, header values, validation, frozen row, and formats, then render a preview and inspect it for clipped text or unreadable columns.

- [ ] **Step 4: Import as native Google Sheets**

Call `mcp__codex_apps__google_drive_import_spreadsheet` with `upload_mode: "native_google_sheets"` and title `Norie Order Tracker`. Record the returned spreadsheet URL/ID.

- [ ] **Step 5: Verify the native sheet**

Read `Orders!A1:X5` with the Google Drive spreadsheet range tool. Confirm the 24 headers and empty data area. Keep the sheet private.

- [ ] **Step 6: Commit only the reusable blank workbook**

```bash
git add "artifacts/Norie Order Tracker.xlsx"
git commit -m "feat: add Norie order tracker template"
```

The workbook contains no customer data.

### Task 6: Configure, deploy, and verify production

**Files:**
- Modify: `README.md`
- Test: all project tests

- [ ] **Step 1: Document required configuration**

Document how to create a dedicated Google Cloud service account, enable the Google Sheets API, share the private tracker with the service-account email as Editor, and add the four Google variables to Vercel Production and Preview. Confirm `ORDER_TO_EMAIL` includes `liminxuan118@gmail.com`.

- [ ] **Step 2: Add production variables**

Add `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME=Orders`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and multiline `GOOGLE_PRIVATE_KEY` through Vercel environment configuration without committing secret values.

- [ ] **Step 3: Run the full test suite**

Run: `npm.cmd test`

Expected: zero failures.

- [ ] **Step 4: Push and deploy**

Push `codex/shop-unified-grid-pr`, deploy with Vercel production, and verify the alias `https://norie-hair.vercel.app` reports `Ready`.

- [ ] **Step 5: Perform a controlled production order test**

Submit one clearly labelled test order for Pickup and verify: HTTP 200, owner email fields, customer email fields, one Google Sheet row, `Status=New`, total without delivery fee, and ready-by = submitted date + 14 days. Submit the same request ID again and verify there is still only one row/email per audience.

- [ ] **Step 6: Verify delivery calculation without creating a second real row**

Exercise the tested server model locally with Delivery and confirm item subtotal + CAD $5. Confirm the live Customize UI displays the same fee/total and hides/disables address fields for Pickup.

- [ ] **Step 7: Commit documentation and final verification state**

```bash
git add README.md
git commit -m "docs: document private order tracking setup"
git push origin codex/shop-unified-grid-pr
```
