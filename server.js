import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElementalCognitionEngine } from "./src/engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);

const engine = new ElementalCognitionEngine();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
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
  const safePath = rawUrl.pathname === "/" ? "/index.html" : rawUrl.pathname;
  const filePath = path.normalize(path.join(publicDir, safePath));

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

    if (req.method === "GET" && url.pathname === "/api/status") {
      return sendJson(res, 200, engine.status());
    }

    if (req.method === "GET" && url.pathname === "/api/scan") {
      return sendJson(res, 200, engine.scan());
    }

    if (req.method === "POST" && url.pathname === "/api/tick") {
      const body = await readJsonBody(req);
      return sendJson(res, 200, engine.tick(body.input || ""));
    }

    if (req.method === "POST" && url.pathname === "/api/force") {
      const body = await readJsonBody(req);
      return sendJson(res, 200, engine.forceSpotlight(body.loop, body.reason || "manual dashboard override"));
    }

    if (req.method === "POST" && url.pathname === "/api/reset") {
      engine.reset();
      return sendJson(res, 200, engine.status());
    }

    return serveStatic(req, res);
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Elemental Dialogue Lab running at http://localhost:${port}`);
});
