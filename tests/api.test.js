import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import customOrder from "../api/custom-order.js";
import cartOrder from "../api/cart-order.js";
import subscribe from "../api/subscribe.js";
import { isEmail, readJson } from "../api/_utils.js";

function response({ ok = true, status = 200, data = {} } = {}) {
  return {
    ok,
    status,
    async json() {
      return data;
    }
  };
}

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

async function invoke(handler, payload, method = "POST") {
  const req = Readable.from(payload === undefined ? [] : [JSON.stringify(payload)]);
  req.method = method;

  return invokeRequest(handler, req);
}

async function invokeRequest(handler, req) {
  const res = {
    body: "",
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body = "") {
      this.body = body;
    }
  };

  await handler(req, res);
  return res;
}

test("readJson accepts Vercel's pre-parsed request body", async () => {
  const body = { email: "hello@example.com" };

  assert.deepEqual(await readJson({ body }), body);
});

test("email validation enforces the internet mailbox length limit", () => {
  const oversized = `${"a".repeat(245)}@example.com`;

  assert.equal(isEmail(oversized), false);
});

test("endpoints distinguish malformed and oversized JSON requests", async () => {
  const malformed = await invokeRequest(customOrder, { method: "POST", body: "{" });
  const oversized = await invokeRequest(subscribe, {
    method: "POST",
    body: "x".repeat((1024 * 1024) + 1)
  });

  assert.equal(malformed.statusCode, 400);
  assert.equal(oversized.statusCode, 413);
});

test("custom order sends an escaped order email to the configured inbox", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  const calls = [];

  process.env.RESEND_API_KEY = "test-key";
  process.env.ORDER_TO_EMAIL = " orders@example.com, backup@example.com, orders@example.com ";
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return response({ data: { id: "email-1" } });
  };

  try {
    const res = await invoke(customOrder, {
      product: "Large comb",
      baseColor: "Pink",
      rhinestoneColor: "White stones",
      customText: "<Chloe>",
      customerName: "Chloe Lee",
      customerEmail: "chloe@example.com",
      customerContact: "chloe_wechat",
      originalPrice: "CAD $999",
      launchPrice: "CAD $1",
      pageUrl: "https://norie.example/customize"
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://api.resend.com/emails");

    const ownerEmail = JSON.parse(calls[0].options.body);
    assert.deepEqual(ownerEmail.to, ["orders@example.com", "backup@example.com"]);
    assert.equal(ownerEmail.reply_to, "chloe@example.com");
    assert.match(ownerEmail.subject, /Large comb/);
    assert.match(ownerEmail.html, /Chloe Lee/);
    assert.match(ownerEmail.html, /CAD \$38/);
    assert.match(ownerEmail.html, /CAD \$30/);
    assert.doesNotMatch(ownerEmail.html, /CAD \$999/);
    assert.match(ownerEmail.html, /&lt;Chloe&gt;/);
    assert.doesNotMatch(ownerEmail.html, /<Chloe>/);
    assert.match(ownerEmail.html, /Contact/);
    assert.match(ownerEmail.html, /chloe_wechat/);
    assert.match(ownerEmail.text, /Contact: chloe_wechat/);

    const customerEmail = JSON.parse(calls[1].options.body);
    assert.deepEqual(customerEmail.to, ["chloe@example.com"]);
    assert.equal(customerEmail.reply_to, "orders@example.com");
    assert.equal(customerEmail.subject, "We received your Norie custom order request");
    assert.match(customerEmail.html, /https:\/\/norie-hair\.vercel\.app\/assets\/norie-logo\.png\?v=transparent-1/);
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
  } finally {
    global.fetch = originalFetch;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});

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

test("custom order rejects a missing customer email without sending", { concurrency: false }, async () => {
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
      customerName: "Chloe Lee"
    });

    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error, "Please enter a valid email.");
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});

test("custom order rejects catalog values that were not offered by the form", { concurrency: false }, async () => {
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
      product: "Diamond tiara",
      baseColor: "Pink",
      rhinestoneColor: "White stones",
      customerName: "Chloe Lee",
      customerEmail: "chloe@example.com",
      customerContact: "chloe_wechat"
    });

    assert.equal(res.statusCode, 400);
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});

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

test("custom order requires an explicit destination inbox", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  let requested = false;

  process.env.RESEND_API_KEY = "test-key";
  delete process.env.ORDER_TO_EMAIL;
  global.fetch = async () => {
    requested = true;
    return response();
  };
  console.error = () => {};

  try {
    const res = await invoke(customOrder, { product: "Small comb" });

    assert.equal(res.statusCode, 500);
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});

test("custom order rejects an invalid configured recipient list", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  let requested = false;

  process.env.RESEND_API_KEY = "test-key";
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
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});

test("subscribe stores a normalized email in GitHub before sending the welcome email", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalGithubToken = process.env.GITHUB_TOKEN;
  const originalGithubRepo = process.env.GITHUB_REPO;
  const calls = [];

  process.env.RESEND_API_KEY = "test-key";
  process.env.GITHUB_TOKEN = "github-test-token";
  process.env.GITHUB_REPO = "norie/private-subscriber-data";
  let githubReads = 0;
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (options.method === "PUT") {
      return response({ data: { content: { sha: `written-sha-${calls.length}` } } });
    }
    if (url === "https://api.resend.com/emails") {
      return response({ data: { id: "welcome-1" } });
    }
    githubReads += 1;
    const stored = githubReads === 1 ? [] : [{
      email: "hello@example.com",
      subscribedAt: "2026-07-13T00:00:00.000Z",
      source: "https://norie.example/#waitlist",
      welcomeSentAt: null
    }];
    return response({
      data: {
        content: Buffer.from(JSON.stringify(stored), "utf8").toString("base64"),
        sha: `subscribers-file-sha-${githubReads}`
      }
    });
  };

  try {
    const res = await invoke(subscribe, {
      email: " HELLO@Example.com ",
      pageUrl: "https://norie.example/#waitlist"
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true, alreadySubscribed: false });
    assert.equal(calls.length, 5);

    const githubWrites = calls.filter(({ options }) => options.method === "PUT");
    assert.equal(githubWrites.length, 2);
    const githubBody = JSON.parse(githubWrites[0].options.body);
    const subscribers = JSON.parse(Buffer.from(githubBody.content, "base64").toString("utf8"));
    assert.equal(subscribers[0].email, "hello@example.com");
    assert.equal(subscribers[0].source, "https://norie.example/#waitlist");
    assert.equal(subscribers[0].welcomeSentAt, null);

    const completedBody = JSON.parse(githubWrites[1].options.body);
    const completed = JSON.parse(Buffer.from(completedBody.content, "base64").toString("utf8"));
    assert.match(completed[0].welcomeSentAt, /^\d{4}-\d{2}-\d{2}T/);

    const welcomeCall = calls.find(({ url }) => url === "https://api.resend.com/emails");
    assert.ok(welcomeCall, "expected a Resend welcome email request");
    const welcomeEmail = JSON.parse(welcomeCall.options.body);
    assert.deepEqual(welcomeEmail.to, ["hello@example.com"]);
    assert.equal(welcomeEmail.subject, "Welcome to Norie");
    assert.match(welcomeCall.options.headers["Idempotency-Key"], /^norie-welcome-[a-f0-9]{64}$/);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("GITHUB_TOKEN", originalGithubToken);
    restoreEnv("GITHUB_REPO", originalGithubRepo);
  }
});

test("subscribe retries a conflicting GitHub write with a fresh file SHA", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalGithubToken = process.env.GITHUB_TOKEN;
  const originalGithubRepo = process.env.GITHUB_REPO;
  let githubReads = 0;
  let githubWrites = 0;

  process.env.RESEND_API_KEY = "test-key";
  process.env.GITHUB_TOKEN = "github-test-token";
  process.env.GITHUB_REPO = "norie/private-subscriber-data";
  global.fetch = async (url, options = {}) => {
    if (url === "https://api.resend.com/emails") {
      return response({ data: { id: "welcome-1" } });
    }
    if (options.method === "PUT") {
      githubWrites += 1;
      if (githubWrites === 1) {
        return response({ ok: false, status: 409, data: { message: "sha conflict" } });
      }
      return response({ data: { content: { sha: `written-${githubWrites}` } } });
    }

    githubReads += 1;
    const stored = githubReads < 3 ? [] : [{
      email: "hello@example.com",
      subscribedAt: "2026-07-13T00:00:00.000Z",
      source: "",
      welcomeSentAt: null
    }];
    return response({
      data: {
        content: Buffer.from(JSON.stringify(stored), "utf8").toString("base64"),
        sha: `read-${githubReads}`
      }
    });
  };

  try {
    const res = await invoke(subscribe, { email: "hello@example.com" });

    assert.equal(res.statusCode, 200);
    assert.equal(githubWrites, 3);
    assert.equal(githubReads, 3);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("GITHUB_TOKEN", originalGithubToken);
    restoreEnv("GITHUB_REPO", originalGithubRepo);
  }
});

test("subscribe does not resend welcome email to a completed subscriber", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalGithubToken = process.env.GITHUB_TOKEN;
  const originalGithubRepo = process.env.GITHUB_REPO;
  const calls = [];

  process.env.RESEND_API_KEY = "test-key";
  process.env.GITHUB_TOKEN = "github-test-token";
  process.env.GITHUB_REPO = "norie/private-subscriber-data";
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return response({
      data: {
        content: Buffer.from(JSON.stringify([{
          email: "hello@example.com",
          subscribedAt: "2026-07-01T00:00:00.000Z",
          source: "",
          welcomeSentAt: "2026-07-01T00:00:01.000Z"
        }]), "utf8").toString("base64"),
        sha: "subscribers-file-sha"
      }
    });
  };

  try {
    const res = await invoke(subscribe, { email: "hello@example.com" });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true, alreadySubscribed: true });
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /api\.github\.com/);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("GITHUB_TOKEN", originalGithubToken);
    restoreEnv("GITHUB_REPO", originalGithubRepo);
  }
});

test("subscribe refuses to use an implicit GitHub repository", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const originalGithubToken = process.env.GITHUB_TOKEN;
  const originalGithubRepo = process.env.GITHUB_REPO;
  let requested = false;

  process.env.GITHUB_TOKEN = "github-test-token";
  delete process.env.GITHUB_REPO;
  global.fetch = async () => {
    requested = true;
    return response();
  };
  console.error = () => {};

  try {
    const res = await invoke(subscribe, { email: "hello@example.com" });

    assert.equal(res.statusCode, 500);
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreEnv("GITHUB_TOKEN", originalGithubToken);
    restoreEnv("GITHUB_REPO", originalGithubRepo);
  }
});

test("subscribe rejects an invalid email without external requests", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  let requested = false;
  global.fetch = async () => {
    requested = true;
    return response();
  };

  try {
    const res = await invoke(subscribe, { email: "not-an-email" });

    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error, "Please enter a valid email.");
    assert.equal(requested, false);
  } finally {
    global.fetch = originalFetch;
  }
});

test("both endpoints reject non-POST requests", { concurrency: false }, async () => {
  const orderRes = await invoke(customOrder, undefined, "GET");
  const subscribeRes = await invoke(subscribe, undefined, "GET");

  assert.equal(orderRes.statusCode, 405);
  assert.equal(subscribeRes.statusCode, 405);
});

test("cart order validates lines and sends trusted totals with pending-payment status", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalOrderEmail = process.env.ORDER_TO_EMAIL;
  const calls = [];
  process.env.RESEND_API_KEY = "test-key";
  process.env.ORDER_TO_EMAIL = "owner@example.com";
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return response({ data: { id: `email-${calls.length}` } });
  };

  const payload = {
    customerName: "Clo <script>",
    customerEmail: "clo@example.com",
    customerContact: "wechat-clo",
    attemptId: "123e4567-e89b-42d3-a456-426614174000",
    pageUrl: "https://norie.example/cart.html",
    prices: [1],
    lines: [
      { productId: "plumeria", baseColor: "Pink", customText: "", quantity: 2 },
      { productId: "large-comb", baseColor: "White", customText: "Norie", quantity: 1 }
    ]
  };

  try {
    const res = await invoke(cartOrder, payload);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), {
      ok: true,
      orderReference: "123E4567",
      status: "Order confirmed · Payment pending",
      total: "CAD $50"
    });
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0].body.to, ["owner@example.com"]);
    assert.match(calls[0].body.html, /Pink stones/);
    assert.match(calls[0].body.html, /CAD \$50/);
    assert.match(calls[0].body.html, /Clo &lt;script&gt;/);
    assert.doesNotMatch(calls[0].body.html, /CAD \$1(?:\D|$)/);
    assert.equal(calls[0].options.headers["Idempotency-Key"], payload.attemptId);
    assert.deepEqual(calls[1].body.to, ["clo@example.com"]);

    const invalid = await invoke(cartOrder, { ...payload, lines: [{ ...payload.lines[0], customText: "No" }] });
    assert.equal(invalid.statusCode, 400);
  } finally {
    global.fetch = originalFetch;
    restoreEnv("RESEND_API_KEY", originalApiKey);
    restoreEnv("ORDER_TO_EMAIL", originalOrderEmail);
  }
});
