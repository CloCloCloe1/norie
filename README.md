# Norie website

Static Norie storefront with two Vercel Functions:

- `POST /api/custom-order` sends the selected custom order to the Norie order inbox through Resend.
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
- `GITHUB_TOKEN`: fine-grained GitHub token limited to the subscriber-data repository, with repository contents read/write access.
- `GITHUB_REPO`: required `owner/repo` for subscriber storage.
- `GITHUB_BRANCH`: data branch; defaults to `main`.
- `SUBSCRIBERS_PATH`: JSON path; defaults to `data/subscribers.json`.

After the variables are saved, deploy from Vercel. Do not commit real secret values or a local `.env` file.

## Subscriber privacy

Do not point `GITHUB_REPO` at a public repository. Every subscriber email would be visible in the repository and its Git history, even if it is removed from the latest JSON file later.

At minimum, use a separate private repository with a narrowly scoped fine-grained token. For a production mailing list, the safer design is a private managed database or an email provider's subscriber-list API, with server-side access, unsubscribe handling, retention rules, and deletion support. The current GitHub JSON approach is suitable only for a small early-stage list where those limitations are understood.

## Public launch hardening

Both form endpoints are public and can trigger third-party API usage. Before sending public traffic to the site, add server-verified bot protection (for example, Turnstile) and durable per-IP/per-email rate limits through Vercel Firewall or another shared store. In-memory limits are not sufficient for serverless instances. The repository does not include CAPTCHA credentials because those must be created and configured in the site owner's accounts.
