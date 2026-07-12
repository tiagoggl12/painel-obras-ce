// Servidor de produção: arquivos estáticos do build (dist/) +
// API /api/news que consulta o RSS do Google News (evitando CORS no navegador).
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 3000);
const NEWS_UPSTREAM = process.env.NEWS_UPSTREAM || "https://news.google.com/rss/search";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
const MAX_ITEMS = 25;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

// ── Cache simples em memória por consulta ──────────────────
const cache = new Map();
function getCached(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.payload;
  return null;
}
function setCached(key, payload) {
  cache.set(key, { ts: Date.now(), payload });
  if (cache.size > 100) cache.delete(cache.keys().next().value);
}

// ── Parser do RSS do Google News ────────────────────────────
function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]) : "";
}

export function parseRss(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    let title = tag(block, "title");
    const link = tag(block, "link");
    const pubDate = tag(block, "pubDate");
    const source = tag(block, "source");
    const srcUrl = block.match(/<source[^>]*url="([^"]*)"/)?.[1] || "";
    // Google News encerra o título com " - Veículo"; remove quando redundante
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3)).trim();
    }
    const dt = pubDate ? new Date(pubDate) : null;
    if (!title || !link) continue;
    items.push({
      title,
      link,
      source: source || "Google News",
      sourceUrl: srcUrl,
      date: dt && !Number.isNaN(dt.getTime()) ? dt.toISOString() : null,
    });
  }
  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return items.slice(0, MAX_ITEMS);
}

// ── /api/news ───────────────────────────────────────────────
async function handleNews(q, res) {
  const query = String(q || "").slice(0, 200).trim();
  if (!query) {
    res.writeHead(400, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "missing q" }));
  }

  const cached = getCached(query);
  if (cached) {
    res.writeHead(200, { "content-type": "application/json", "x-cache": "hit" });
    return res.end(cached);
  }

  try {
    const url = `${NEWS_UPSTREAM}?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const upstream = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const xml = await upstream.text();
    const payload = JSON.stringify({
      query,
      updatedAt: new Date().toISOString(),
      items: parseRss(xml),
    });
    setCached(query, payload);
    res.writeHead(200, { "content-type": "application/json", "x-cache": "miss" });
    res.end(payload);
  } catch (err) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: String(err?.message || err), items: [] }));
  }
}

// ── Estáticos + fallback SPA ────────────────────────────────
async function handleStatic(pathname, res) {
  let filePath = path.normalize(path.join(DIST, pathname));
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end();
  }
  if (pathname === "/" || pathname === "") filePath = path.join(DIST, "index.html");

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    });
    res.end(data);
  } catch {
    // Fallback SPA: qualquer rota desconhecida devolve o index
    const index = await readFile(path.join(DIST, "index.html"));
    res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-cache" });
    res.end(index);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    return res.end();
  }
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/news") return handleNews(url.searchParams.get("q"), res);
  if (url.pathname === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }
  return handleStatic(decodeURIComponent(url.pathname), res);
});

// Só sobe o servidor quando executado diretamente (permite importar parseRss em testes)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`painel-obras-ce on :${PORT} (news upstream: ${NEWS_UPSTREAM})`));
}
