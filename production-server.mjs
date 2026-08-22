import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
};

const PORT = process.env.PORT || 3000;
const DIST = join(process.cwd(), "dist");
const CLIENT = join(DIST, "client");

const serverHandler = await import(join(DIST, "server", "server.js")).then(
  (m) => m.default,
);

const server = createServer(async (nodeReq, nodeRes) => {
  try {
    const url = new URL(nodeReq.url, `http://localhost:${PORT}`);

    // Serve static client assets first
    const filePath = join(CLIENT, url.pathname);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath);
      nodeRes.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
      });
      nodeRes.end(readFileSync(filePath));
      return;
    }

    // Build a proper Web Request for the TanStack Start handler
    const headers = new Headers();
    for (const [key, value] of Object.entries(nodeReq.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    let body = null;
    if (nodeReq.method !== "GET" && nodeReq.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of nodeReq) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const webRequest = new Request(url.href, {
      method: nodeReq.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const response = await serverHandler.fetch(webRequest, {}, {});

    nodeRes.writeHead(response.status, Object.fromEntries(response.headers));
    const respBody = await response.arrayBuffer();
    nodeRes.end(Buffer.from(respBody));
  } catch (err) {
    console.error("Server error:", err);
    nodeRes.writeHead(500, { "Content-Type": "text/plain" });
    nodeRes.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Tradebee running on http://localhost:${PORT}`);
});
