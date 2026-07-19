# Norie website

Static Norie storefront with two Vercel Functions:

- `POST /api/custom-order` validates fulfillment and pricing, saves the order to a private Google Sheet, sends an internal order email, and sends a different confirmation email to the customer through Resend.
- `POST /api/subscribe` records the subscriber through the GitHub Contents API, then sends a welcome email through Resend.

## Local checks

```powershell
npm.cmd test
```

The pages are static, so they can also be served from the repository root with any local HTTP server.

## Vercel setup

Import this repository as a Vercel project and keep the project root at the repository root. Add the variables from `.env.example` under Project Settings > Environment Variables:

- `RESEND_API_KEY`: Resend API key.
- `EMAIL_FROM`: sender on a domain verified in Resend.
- `ORDER_TO_EMAIL`: required comma-separated private inbox list for custom-order requests. Whitespace and duplicates are removed, and every address must be valid.
- `GOOGLE_SHEET_ID`: the ID between `/d/` and `/edit` in the private order tracker URL.
- `GOOGLE_SHEET_NAME`: order worksheet tab; use `Orders` for the provided tracker.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Cloud service-account email with Editor access to the tracker.
- `GOOGLE_PRIVATE_KEY`: private key from the service-account JSON file. In Vercel it may be pasted with literal `\\n` line breaks; the API converts them back to newlines.
- `GITHUB_TOKEN`: fine-grained GitHub token limited to the subscriber-data repository, with repository contents read/write access.
- `GITHUB_REPO`: required `owner/repo` for subscriber storage.
- `GITHUB_BRANCH`: data branch; defaults to `main`.
- `SUBSCRIBERS_PATH`: JSON path; defaults to `data/subscribers.json`.

After the variables are saved, deploy from Vercel. Do not commit real secret values or a local `.env` file.

## Private Google Sheet order tracking

The order endpoint treats spreadsheet persistence as required: if the order cannot be saved, it returns an error and sends no order email. A stable browser-generated order ID plus a server-side duplicate check prevents the same request from being appended twice.

1. In Google Cloud, create or select a project and enable the **Google Sheets API**.
2. Create a service account under **IAM & Admin > Service Accounts**.
3. Create a JSON key for that service account and download it once. Keep it private.
4. Open the private **Norie Order Tracker** Google Sheet and share it with the service account's `client_email` as **Editor**.
5. In Vercel, set `GOOGLE_SERVICE_ACCOUNT_EMAIL` to `client_email` and `GOOGLE_PRIVATE_KEY` to `private_key` from the downloaded JSON.
6. Set `GOOGLE_SHEET_ID` to the tracker spreadsheet ID and `GOOGLE_SHEET_NAME` to `Orders`, for Production and Preview.
7. Redeploy after saving the environment variables.

Never commit the service-account JSON or private key. The tracker must remain private and should only be shared with the Norie owner and the service account.

### Order tracker columns

The `Orders` tab contains the order ID, submission and ready-by dates, status, customer and fulfillment details, product customization, server-calculated CAD pricing, and source URL. Update the `Status` dropdown as an order moves through production. New orders are expected to be ready 14 days after submission.

## Subscriber privacy

Do not point `GITHUB_REPO` at a public repository. Every subscriber email would be visible in the repository and its Git history, even if it is removed from the latest JSON file later.

At minimum, use a separate private repository with a narrowly scoped fine-grained token. For a production mailing list, the safer design is a private managed database or an email provider's subscriber-list API, with server-side access, unsubscribe handling, retention rules, and deletion support. The current GitHub JSON approach is suitable only for a small early-stage list where those limitations are understood.

## Public launch hardening

Both form endpoints are public and can trigger third-party API usage. Before sending public traffic to the site, add server-verified bot protection (for example, Turnstile) and durable per-IP/per-email rate limits through Vercel Firewall or another shared store. In-memory limits are not sufficient for serverless instances. The repository does not include CAPTCHA credentials because those must be created and configured in the site owner's accounts.
