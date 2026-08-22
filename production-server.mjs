import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const PORT = process.env.PORT || 3000;
const DIST = join(process.cwd(), "dist");
const CLIENT = join(DIST, "client");

const serverHandler = await import(join(DIST, "server", "server.js")).then(
  (m) => m.default
);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Serve static client assets
  const filePath = join(CLIENT, url.pathname);
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(readFileSync(filePath));
    return;
  }

  // Fall through to TanStack Start handler
  try {
    const response = await serverHandler.fetch(req, {}, {});
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Tradebee running on http://localhost:${PORT}`);
});
