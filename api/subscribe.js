import { createHash } from "node:crypto";

import { isEmail, readJson, sendEmail, sendJson } from "./_utils.js";

const MAX_WRITE_ATTEMPTS = 3;

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function githubRequest(url, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "GitHub request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

async function readSubscribers({ repo, branch, path }) {
  const url = `https://api.github.com/repos/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`;

  try {
    const data = await githubRequest(url);
    const content = Buffer.from(data.content || "", "base64").toString("utf8").trim();
    const list = content ? JSON.parse(content) : [];
    if (!Array.isArray(list)) {
      throw new Error("Subscriber file must contain a JSON array");
    }
    return { list, sha: data.sha };
  } catch (error) {
    if (error.status === 404) {
      return { list: [], sha: undefined };
    }
    throw error;
  }
}

async function writeSubscribers({ repo, branch, path, subscribers, sha }) {
  const body = {
    message: "Update Norie subscribers",
    branch,
    content: Buffer.from(`${JSON.stringify(subscribers, null, 2)}\n`, "utf8").toString("base64")
  };

  if (sha) {
    body.sha = sha;
  }

  return githubRequest(`https://api.github.com/repos/${repo}/contents/${encodePath(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function updateSubscribers(config, update) {
  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt += 1) {
    const { list, sha } = await readSubscribers(config);
    const change = update(list);
    if (!change.changed) {
      return change.result;
    }

    try {
      await writeSubscribers({ ...config, subscribers: change.list, sha });
      return change.result;
    } catch (error) {
      const conflict = error.status === 409 || error.status === 422;
      if (!conflict || attempt === MAX_WRITE_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new Error("Could not update subscribers");
}

function welcomeIdempotencyKey(email) {
  const digest = createHash("sha256").update(email).digest("hex");
  return `norie-welcome-${digest}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJson(req);
    const email = String(payload.email || "").trim().toLowerCase();

    if (!isEmail(email)) {
      sendJson(res, 400, { error: "Please enter a valid email." });
      return;
    }

    const repo = process.env.GITHUB_REPO;
    if (!repo) {
      throw new Error("Missing GITHUB_REPO");
    }
    const config = {
      repo,
      branch: process.env.GITHUB_BRANCH || "main",
      path: process.env.SUBSCRIBERS_PATH || "data/subscribers.json"
    };

    const subscription = await updateSubscribers(config, (list) => {
      const existing = list.find((entry) => String(entry.email || "").toLowerCase() === email);
      if (existing) {
        return {
          changed: false,
          result: {
            alreadySubscribed: true,
            needsWelcome: !existing.welcomeSentAt
          }
        };
      }

      return {
        changed: true,
        list: [...list, {
          email,
          subscribedAt: new Date().toISOString(),
          source: String(payload.pageUrl || "").slice(0, 2048),
          welcomeSentAt: null
        }],
        result: { alreadySubscribed: false, needsWelcome: true }
      };
    });

    if (subscription.needsWelcome) {
      await sendEmail({
        to: email,
        idempotencyKey: welcomeIdempotencyKey(email),
        subject: "Welcome to Norie",
        html: `
          <h1 style="font-family:Georgia,serif;color:#6b243d;">Welcome to Norie</h1>
          <p>Thank you for joining the Norie list. We will send launch updates, sample photos, and custom slot news soon.</p>
          <p style="color:#6b243d;">With love,<br>Norie</p>
        `,
        text: "Welcome to Norie. Thank you for joining the Norie list. We will send launch updates, sample photos, and custom slot news soon."
      });

      await updateSubscribers(config, (list) => {
        const index = list.findIndex((entry) => String(entry.email || "").toLowerCase() === email);
        if (index < 0 || list[index].welcomeSentAt) {
          return { changed: false, result: undefined };
        }

        const next = [...list];
        next[index] = { ...next[index], welcomeSentAt: new Date().toISOString() };
        return { changed: true, list: next, result: undefined };
      });
    }

    sendJson(res, 200, { ok: true, alreadySubscribed: subscription.alreadySubscribed });
  } catch (error) {
    if (error.statusCode) {
      sendJson(res, error.statusCode, { error: error.message });
      return;
    }
    console.error(error);
    sendJson(res, 500, { error: "Could not subscribe right now." });
  }
}
