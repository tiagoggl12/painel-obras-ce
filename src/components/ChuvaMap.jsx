import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MUNICIPIOS } from "../data/municipios";

const CE_CENTER = [-5.1, -39.5];
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · Dados: <a href="https://open-meteo.com/">Open-Meteo</a> · Malha: IBGE';

// ── Escalas de cor (stops contínuos para o gradiente) ───────
// Diária (mm/dia): cinza → azuis → roxo
const STOPS_DIA = [
  { v: 0, cor: [158, 158, 158] },
  { v: 1, cor: [179, 229, 252] },
  { v: 8, cor: [79, 195, 247] },
  { v: 25, cor: [30, 136, 229] },
  { v: 50, cor: [21, 101, 192] },
  { v: 85, cor: [123, 31, 162] },
];
const ESCALA_DIA = [
  { cor: "#7B1FA2", label: "60+ mm" },
  { cor: "#1565C0", label: "30–60 mm" },
  { cor: "#1E88E5", label: "10–30 mm" },
  { cor: "#4FC3F7", label: "2–10 mm" },
  { cor: "#B3E5FC", label: "0,1–2 mm" },
  { cor: "#9E9E9E", label: "Sem chuva" },
];

// Anual (mm/ano): quente = semiárido → azul = úmido
const STOPS_ANUAL = [
  { v: 400, cor: [230, 81, 0] },
  { v: 600, cor: [251, 140, 0] },
  { v: 750, cor: [253, 216, 53] },
  { v: 900, cor: [156, 204, 101] },
  { v: 1100, cor: [38, 166, 154] },
  { v: 1400, cor: [30, 136, 229] },
  { v: 1700, cor: [21, 101, 192] },
];
const ESCALA_ANUAL = [
  { cor: "#1565C0", label: "1.400+ mm" },
  { cor: "#1E88E5", label: "1.100–1.400 mm" },
  { cor: "#26A69A", label: "900–1.100 mm" },
  { cor: "#9CCC65", label: "750–900 mm" },
  { cor: "#FDD835", label: "600–750 mm" },
  { cor: "#FB8C00", label: "450–600 mm" },
  { cor: "#E65100", label: "< 450 mm" },
];

const corStops = (v, stops) => {
  if (v == null) return [158, 158, 158];
  if (v <= stops[0].v) return stops[0].cor;
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i].v) {
      const a = stops[i - 1], b = stops[i];
      const t = (v - a.v) / (b.v - a.v);
      return [0, 1, 2].map((k) => Math.round(a.cor[k] + (b.cor[k] - a.cor[k]) * t));
    }
  }
  return stops[stops.length - 1].cor;
};
// ── Geometria: polígonos do contorno + bbox ─────────────────
function extractPolygons(geo) {
  const geom = geo?.type === "FeatureCollection" ? geo.features?.[0]?.geometry
    : geo?.type === "Feature" ? geo.geometry : geo;
  if (!geom) return null;
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  return null;
}

function geoBbox(polys) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  polys.forEach((poly) => poly.forEach((ring) => ring.forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  })));
  return { minLng, minLat, maxLng, maxLat };
}

// ── Superfície interpolada (IDW) recortada pelo contorno ────
function buildSurface({ pontos, getVal, stops, polys, bbox }) {
  const pad = 0.05;
  const b = {
    minLng: bbox.minLng - pad, maxLng: bbox.maxLng + pad,
    minLat: bbox.minLat - pad, maxLat: bbox.maxLat + pad,
  };
  const W = 420;
  const H = Math.round(W * ((b.maxLat - b.minLat) / (b.maxLng - b.minLng)));
  const toX = (lng) => ((lng - b.minLng) / (b.maxLng - b.minLng)) * W;
  const toY = (lat) => ((b.maxLat - lat) / (b.maxLat - b.minLat)) * H;

  const pts = pontos
    .map((p) => ({ x: toX(p.lng), y: toY(p.lat), v: getVal(p) }))
    .filter((p) => p.v != null);
  if (!pts.length) return null;

  // Campo IDW (potência 2) calculado por pixel
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const octx = off.getContext("2d");
  const img = octx.createImageData(W, H);
  const data = img.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let num = 0, den = 0;
      for (let i = 0; i < pts.length; i++) {
        const dx = x - pts[i].x, dy = y - pts[i].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 1) { num = pts[i].v; den = 1; break; }
        const w = 1 / d2;
        num += pts[i].v * w;
        den += w;
      }
      const [r, g, bb] = corStops(num / den, stops);
      const idx = (y * W + x) * 4;
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = bb; data[idx + 3] = 185;
    }
  }
  octx.putImageData(img, 0, 0);

  // Recorte pelo contorno do estado
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  polys.forEach((poly) => poly.forEach((ring) => {
    ring.forEach(([lng, lat], i) => {
      const px = toX(lng), py = toY(lat);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
  }));
  ctx.clip("evenodd");
  ctx.drawImage(off, 0, 0);

  return {
    url: canvas.toDataURL("image/png"),
    bounds: [[b.minLat, b.minLng], [b.maxLat, b.maxLng]],
  };
}

const DIAS_LABEL = ["Ontem", "Hoje", "Amanhã (previsão)"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtDia = (iso) => {
  if (!iso) return "";
  const [, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${MESES[m - 1]}`;
};
const fmtMil = (n) => (n == null ? "N/D" : n.toLocaleString("pt-BR"));
const fmtMm = (v) => (v == null ? "N/D" : String(v).replace(".", ","));

export default function ChuvaMap({ dark }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const overlayRef = useRef(null);
  const boundaryRef = useRef(null);
  const stateRef = useRef({}); // dados atuais p/ handler de clique
  const [dados, setDados] = useState(null);
  const [normais, setNormais] = useState(null);
  const [malha, setMalha] = useState(null);
  const [dia, setDia] = useState(1); // 0..2 = ao vivo, 3 = média anual
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const anual = dia === 3;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chuva");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.cidades?.length) throw new Error("empty");
      setDados(json);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNormais = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/normais");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.cidades?.length) throw new Error("empty");
      setNormais(json);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/malha").then((r) => (r.ok ? r.json() : null)).then(setMalha).catch(() => setMalha(null));
    const t = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (anual && !normais) loadNormais();
  }, [anual, normais, loadNormais]);

  // Mapa (uma vez) + clique → município mais próximo
  useEffect(() => {
    const map = L.map(containerRef.current, { center: CE_CENTER, zoom: 7, scrollWheelZoom: true });
    mapRef.current = map;

    map.on("click", (e) => {
      const { cidades, modoAnual, periodo, dias } = stateRef.current;
      if (!cidades?.length) return;
      let best = null, bestD = Infinity;
      cidades.forEach((c) => {
        const d = (c.lat - e.latlng.lat) ** 2 + (c.lng - e.latlng.lng) ** 2;
        if (d < bestD) { bestD = d; best = c; }
      });
      if (!best || bestD > 0.6 * 0.6) return; // clique fora do estado
      const html = modoAnual
        ? `<div class="obra-popup" style="max-width:210px">
             <div class="obra-popup-nome">${best.nome}</div>
             <div class="obra-popup-local">Média anual · ${periodo} (ERA5)</div>
             <div style="font-size:20px;font-weight:800">${fmtMil(best.media)} mm/ano</div>
           </div>`
        : `<div class="obra-popup" style="max-width:220px">
             <div class="obra-popup-nome">${best.nome}</div>
             <div class="obra-popup-local">Precipitação (mm)</div>
             <div style="font-size:12px;line-height:1.7">
               Ontem${dias?.[0] ? ` (${fmtDia(dias[0])})` : ""}: <strong>${fmtMm(best.mm?.[0])}</strong><br/>
               Hoje${dias?.[1] ? ` (${fmtDia(dias[1])})` : ""}: <strong>${fmtMm(best.mm?.[1])}</strong><br/>
               Amanhã${dias?.[2] ? ` (${fmtDia(dias[2])})` : ""}: <strong>${fmtMm(best.mm?.[2])}</strong>
             </div>
           </div>`;
      L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Tiles seguem o dark mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(dark ? TILES.dark : TILES.light, { attribution: ATTR, maxZoom: 12 }).addTo(map);
    // Mantém a superfície acima dos tiles recém-adicionados
    overlayRef.current?.bringToFront?.();
  }, [dark]);

  // Superfície de gradiente + contorno
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const fonte = anual ? normais : dados;
    if (!fonte) return;

    // Polígonos: IBGE quando disponível; senão casca convexa aproximada pela malha de pontos
    const polys = malha ? extractPolygons(malha) : null;
    const pontos = fonte.cidades;
    const bbox = polys ? geoBbox(polys) : {
      minLng: Math.min(...pontos.map((p) => p.lng)) - 0.15,
      maxLng: Math.max(...pontos.map((p) => p.lng)) + 0.15,
      minLat: Math.min(...pontos.map((p) => p.lat)) - 0.15,
      maxLat: Math.max(...pontos.map((p) => p.lat)) + 0.15,
    };
    const fallbackPolys = polys || [[[
      [bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.minLat],
      [bbox.maxLng, bbox.maxLat], [bbox.minLng, bbox.maxLat],
    ]]];

    const surface = buildSurface({
      pontos,
      getVal: (p) => (anual ? p.media : p.mm?.[dia]),
      stops: anual ? STOPS_ANUAL : STOPS_DIA,
      polys: fallbackPolys,
      bbox,
    });
    if (!surface) return;

    map.closePopup();
    if (overlayRef.current) map.removeLayer(overlayRef.current);
    overlayRef.current = L.imageOverlay(surface.url, surface.bounds, { opacity: 1, interactive: false }).addTo(map);

    if (polys && !boundaryRef.current) {
      boundaryRef.current = L.geoJSON(malha, {
        interactive: false,
        style: { color: "#1B6B3A", weight: 2, fill: false, opacity: 0.9 },
      }).addTo(map);
      map.fitBounds(boundaryRef.current.getBounds().pad(0.06));
    }
    boundaryRef.current?.bringToFront?.();

    // Estado compartilhado com o handler de clique
    stateRef.current = {
      cidades: fonte.cidades,
      modoAnual: anual,
      periodo: normais?.periodo,
      dias: dados?.dias,
    };

    setTimeout(() => map.invalidateSize(), 60);
  }, [dados, normais, malha, dia, anual]);

  // Resumo do modo selecionado
  const mms = (dados?.cidades || []).map((c) => c.mm?.[dia]).filter((v) => v != null);
  const media = mms.length ? Math.round((mms.reduce((s, v) => s + v, 0) / mms.length) * 10) / 10 : 0;
  const comChuva = mms.filter((v) => v >= 0.1).length;
  const max = dados?.cidades?.reduce(
    (best, c) => ((c.mm?.[dia] ?? -1) > (best?.mm ?? -1) ? { nome: c.nome, mm: c.mm?.[dia] } : best),
    null
  );
  const medias = (normais?.cidades || []).map((c) => c.media).filter((v) => v != null);
  const mediaAnualCE = medias.length ? Math.round(medias.reduce((s, v) => s + v, 0) / medias.length) : 0;
  const maxAnual = normais?.cidades?.reduce((b, c) => (c.media > (b?.media ?? -1) ? c : b), null);
  const minAnual = normais?.cidades?.reduce((b, c) => (c.media < (b?.media ?? Infinity) ? c : b), null);

  return (
    <div className="card-enter">
      {/* Controles */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <div className="filter-scroll" style={{ display: "flex", background: "var(--filter-bg, #E0F7EA)", borderRadius: 10, padding: 3 }}>
          {[...DIAS_LABEL, "📊 Média anual"].map((d, i) => (
            <button
              key={d}
              onClick={() => { setDia(i); setFailed(false); }}
              aria-pressed={dia === i}
              style={{
                padding: "7px 14px", border: "none", borderRadius: 8,
                fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                background: dia === i ? "var(--filter-active, #1B6B3A)" : "transparent",
                color: dia === i ? "#fff" : "var(--filter-text, #1B6B3A)",
                transition: "all .2s ease",
              }}
            >{d}{i < 3 && dados?.dias?.[i] ? ` · ${fmtDia(dados.dias[i])}` : ""}</button>
          ))}
        </div>
        <button
          onClick={anual ? loadNormais : load}
          disabled={loading}
          aria-label="Atualizar dados de chuva"
          style={{
            padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--input-border, #B5ECCC)",
            fontSize: 11, fontWeight: 700, cursor: loading ? "wait" : "pointer",
            background: "var(--input-bg, #FFF)", color: "var(--accent, #1B6B3A)",
          }}
        >{loading ? "⏳" : "🔄"} Atualizar</button>
        <span aria-live="polite" style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)" }}>
          {failed
            ? "⚠️ Sem conexão com o serviço meteorológico."
            : anual
              ? normais
                ? <>📊 Média {normais.periodo}: {fmtMil(mediaAnualCE)} mm/ano no estado
                  {maxAnual ? <> · mais chuvoso: {maxAnual.nome} ({fmtMil(maxAnual.media)} mm)</> : null}
                  {minAnual ? <> · mais seco: {minAnual.nome} ({fmtMil(minAnual.media)} mm)</> : null} · ERA5/Open-Meteo</>
                : "Calculando climatologia (a primeira vez pode levar ~1 min)..."
              : dados
                ? <>🌧️ {comChuva} de {dados.cidades.length} municípios com chuva · média {fmtMm(media)} mm
                  {max?.mm > 0 ? <> · máx: {max.nome} ({fmtMm(max.mm)} mm)</> : null} · Open-Meteo · clique no mapa para detalhes</>
                : "Carregando precipitação..."}
        </span>
      </div>

      {/* Mapa */}
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden",
        border: "1.5px solid var(--border, #E0F7EA)", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      }}>
        <div
          ref={containerRef}
          role="application"
          aria-label="Mapa de precipitação do Ceará"
          style={{ height: "min(72vh, 680px)", minHeight: 420, width: "100%", background: "var(--card-bg, #FFF)" }}
        />

        {/* Legenda */}
        <div className="map-legend">
          <div className="map-legend-title">{anual ? "Média anual (mm/ano)" : "Precipitação (mm/dia)"}</div>
          {(anual ? ESCALA_ANUAL : ESCALA_DIA).map((e) => (
            <div key={e.label} className="map-legend-item">
              <span className="map-legend-dot" style={{ background: e.cor }} />
              {e.label}
            </div>
          ))}
        </div>

        {failed && !loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 10,
            alignItems: "center", justifyContent: "center", zIndex: 500,
            background: "var(--modal-overlay, rgba(13,59,30,.45))", color: "#fff",
            fontSize: 13, fontWeight: 600, textAlign: "center", padding: 20,
          }}>
            <div>⚠️ Não foi possível carregar os dados de precipitação agora.</div>
            <button onClick={anual ? loadNormais : load} style={{
              padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "#fff", color: "#1B6B3A", fontWeight: 800, fontSize: 12,
            }}>Tentar novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}
