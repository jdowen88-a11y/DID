import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElementalCore } from "./src/core.js";
import { ModelClient } from "./src/model_client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const pageCodes = [60,33,100,111,99,116,121,112,101,32,104,116,109,108,62,60,104,116,109,108,62,60,104,101,97,100,62,60,116,105,116,108,101,62,69,108,101,109,101,110,116,32,76,97,98,60,47,116,105,116,108,101,62,60,108,105,110,107,32,114,101,108,61,34,115,116,121,108,101,115,104,101,101,116,34,32,104,114,101,102,61,34,47,115,116,121,108,101,115,46,99,115,115,34,62,60,47,104,101,97,100,62,60,98,111,100,121,62,60,100,105,118,32,105,100,61,34,97,112,112,34,62,60,47,100,105,118,62,60,115,99,114,105,112,116,32,116,121,112,101,61,34,109,111,100,117,108,101,34,32,115,114,99,61,34,47,97,112,112,46,106,115,34,62,60,47,115,99,114,105,112,116,62,60,47,98,111,100,121,62,60,47,104,116,109,108,62];

const core = new ElementalCore();
const modelClient = new ModelClient();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function sendPage(res) {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(String.fromCharCode(...pageCodes));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return { input: Buffer.concat(chunks).toString("utf8") };
  }
}

async function serveStatic(req, res) {
  const rawUrl = new URL(req.url, `http://${req.headers.host}`);
  const filePath = path.normalize(path.join(publicDir, rawUrl.pathname));

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
  res.end(await readFile(filePath));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/") {
      return sendPage(res);
    }

    if (req.method === "GET" && url.pathname === "/api/status") {
      return sendJson(res, 200, { ...core.status(), modelConfigured: modelClient.isConfigured(), model: modelClient.model });
    }

    if (req.method === "GET" && url.pathname === "/api/scan") {
      return sendJson(res, 200, core.scan());
    }

    if (req.method === "POST" && url.pathname === "/api/tick") {
      const body = await readJsonBody(req);
      return sendJson(res, 200, core.tick(body.input || ""));
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const body = await readJsonBody(req);
      const scan = core.tick(body.input || body.message || "");
      const reply = await modelClient.reply(body.input || body.message || "", scan);
      return sendJson(res, 200, { ...scan, reply });
    }

    if (req.method === "POST" && url.pathname === "/api/focus") {
      const body = await readJsonBody(req);
      return sendJson(res, 200, core.setFocus(body.loop, body.reason || "manual dashboard handoff"));
    }

    if (req.method === "POST" && url.pathname === "/api/reset") {
      core.reset();
      return sendJson(res, 200, core.status());
    }

    return serveStatic(req, res);
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Elemental Dialogue Lab running at http://localhost:${port}`);
});
