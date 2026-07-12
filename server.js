// Servidor de produção: arquivos estáticos do build (dist/) +
// API /api/news que consulta o RSS do Google News (evitando CORS no navegador).
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MUNICIPIOS } from "./src/data/municipios.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 3000);
const NEWS_UPSTREAM = process.env.NEWS_UPSTREAM || "https://news.google.com/rss/search";
const CHUVA_UPSTREAM = process.env.CHUVA_UPSTREAM || "https://api.open-meteo.com/v1/forecast";
const NORMAIS_UPSTREAM = process.env.NORMAIS_UPSTREAM || "https://archive-api.open-meteo.com/v1/archive";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min (notícias)
const CHUVA_TTL_MS = 30 * 60 * 1000; // 30 min (precipitação ao vivo)
const NORMAIS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias (climatologia)
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

// ── /api/chuva — precipitação nos municípios do CE ──────────
// Consulta em lote o Open-Meteo (sem chave): acumulado de ontem,
// hoje e previsão de amanhã para cada município da malha.
let chuvaCache = null; // { ts, payload }

async function handleChuva(res) {
  if (chuvaCache && Date.now() - chuvaCache.ts < CHUVA_TTL_MS) {
    res.writeHead(200, { "content-type": "application/json", "x-cache": "hit" });
    return res.end(chuvaCache.payload);
  }

  try {
    const lats = MUNICIPIOS.map((m) => m.lat).join(",");
    const lngs = MUNICIPIOS.map((m) => m.lng).join(",");
    const url = `${CHUVA_UPSTREAM}?latitude=${lats}&longitude=${lngs}` +
      `&daily=precipitation_sum&past_days=1&forecast_days=2&timezone=America/Fortaleza`;
    const upstream = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const data = await upstream.json();
    const results = Array.isArray(data) ? data : [data];

    const dias = results[0]?.daily?.time || [];
    const cidades = MUNICIPIOS.map((m, i) => ({
      nome: m.nome,
      lat: m.lat,
      lng: m.lng,
      // mm[0] = ontem, mm[1] = hoje, mm[2] = amanhã (previsão)
      mm: (results[i]?.daily?.precipitation_sum || []).map((v) => (v == null ? null : Math.round(v * 10) / 10)),
    }));

    const payload = JSON.stringify({ updatedAt: new Date().toISOString(), dias, cidades });
    chuvaCache = { ts: Date.now(), payload };
    res.writeHead(200, { "content-type": "application/json", "x-cache": "miss" });
    res.end(payload);
  } catch (err) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: String(err?.message || err) }));
  }
}

// ── /api/normais — média anual de precipitação (climatologia) ──
// Histórico ERA5 do Open-Meteo dos últimos 10 anos completos, somado
// por município e dividido pelos anos. Calculado uma vez e mantido em
// cache por 30 dias (a primeira chamada pode levar ~1 min).
let normaisCache = null;    // { ts, payload }
let normaisPromise = null;  // evita cálculos concorrentes

async function computeNormais() {
  const anoFim = new Date().getFullYear() - 1; // últimos 10 anos completos
  const anoIni = anoFim - 9;
  const ANOS = 10;
  const BATCH = 15;

  const cidades = [];
  for (let i = 0; i < MUNICIPIOS.length; i += BATCH) {
    const grupo = MUNICIPIOS.slice(i, i + BATCH);
    const lats = grupo.map((m) => m.lat).join(",");
    const lngs = grupo.map((m) => m.lng).join(",");
    const url = `${NORMAIS_UPSTREAM}?latitude=${lats}&longitude=${lngs}` +
      `&start_date=${anoIni}-01-01&end_date=${anoFim}-12-31` +
      `&daily=precipitation_sum&timezone=America/Fortaleza`;
    const upstream = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(60000),
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const data = await upstream.json();
    const results = Array.isArray(data) ? data : [data];
    grupo.forEach((m, j) => {
      const soma = (results[j]?.daily?.precipitation_sum || []).reduce((s, v) => s + (v || 0), 0);
      cidades.push({ nome: m.nome, lat: m.lat, lng: m.lng, media: Math.round(soma / ANOS) });
    });
  }

  return JSON.stringify({
    updatedAt: new Date().toISOString(),
    periodo: `${anoIni}–${anoFim}`,
    cidades,
  });
}

async function handleNormais(res) {
  if (normaisCache && Date.now() - normaisCache.ts < NORMAIS_TTL_MS) {
    res.writeHead(200, { "content-type": "application/json", "x-cache": "hit" });
    return res.end(normaisCache.payload);
  }
  try {
    if (!normaisPromise) {
      normaisPromise = computeNormais().finally(() => { normaisPromise = null; });
    }
    const payload = await normaisPromise;
    normaisCache = { ts: Date.now(), payload };
    res.writeHead(200, { "content-type": "application/json", "x-cache": "miss" });
    res.end(payload);
  } catch (err) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: String(err?.message || err) }));
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
  if (url.pathname === "/api/chuva") return handleChuva(res);
  if (url.pathname === "/api/normais") return handleNormais(res);
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
