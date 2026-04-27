import "dotenv/config";
import http from "http";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { generatePost } from "./utils/generatePost.js";
import { saveGeneration } from "./utils/saveGeneration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "text/plain; charset=utf-8";
}

async function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  try {
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/generate") {
    try {
      const rawBody = await readRequestBody(req);
      const { theme, postType, slideCount } = JSON.parse(rawBody || "{}");

      if (!theme?.trim()) {
        return sendJson(res, 400, { error: "Theme is required." });
      }

      const result = await generatePost({
        question: theme.trim(),
        postType: postType === "carousel" ? "carousel" : "standalone",
        slideCount,
      });

      return sendJson(res, 200, result);
    } catch (error) {
      return sendJson(res, 500, {
        error: error.message || "Failed to generate post.",
      });
    }
  }

  if (req.method === "POST" && req.url === "/save-generation") {
    try {
      const rawBody = await readRequestBody(req);
      const payload = JSON.parse(rawBody || "{}");

      if (!payload.theme?.trim()) {
        return sendJson(res, 400, { error: "Theme is required." });
      }

      if (!Array.isArray(payload.slides) || !payload.slides.length) {
        return sendJson(res, 400, { error: "Slides are required." });
      }

      const result = await saveGeneration({
        ...payload,
        theme: payload.theme.trim(),
        postType: payload.postType === "carousel" ? "carousel" : "standalone",
      });

      return sendJson(res, 200, { saved: true, record: result });
    } catch (error) {
      return sendJson(res, 500, {
        error: error.message || "Failed to save generation.",
      });
    }
  }

  if (req.method === "GET" || req.method === "HEAD") {
    return serveStatic(req, res);
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(port, host, () => {
  console.log(`WFTS generator running at http://${host}:${port}`);
});
