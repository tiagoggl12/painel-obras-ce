import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CE_CENTER = [-5.1, -39.5];
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · Dados: <a href="https://open-meteo.com/">Open-Meteo</a>';

// Escala de precipitação (mm/dia) — paleta meteorológica
const ESCALA = [
  { min: 60, cor: "#7B1FA2", label: "60+ mm" },
  { min: 30, cor: "#1565C0", label: "30–60 mm" },
  { min: 10, cor: "#1E88E5", label: "10–30 mm" },
  { min: 2, cor: "#4FC3F7", label: "2–10 mm" },
  { min: 0.1, cor: "#B3E5FC", label: "0,1–2 mm" },
  { min: -1, cor: "#9E9E9E", label: "Sem chuva" },
];

const corChuva = (mm) => ESCALA.find((e) => (mm ?? 0) > e.min || e.min === -1).cor;
const raioChuva = (mm) => 6 + Math.min(Math.sqrt(mm ?? 0) * 3.2, 22);

const DIAS_LABEL = ["Ontem", "Hoje", "Amanhã (previsão)"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtDia = (iso) => {
  if (!iso) return "";
  const [, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${MESES[m - 1]}`;
};

export default function ChuvaMap({ dark }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const layerRef = useRef(null);
  const [dados, setDados] = useState(null);
  const [dia, setDia] = useState(1); // 0=ontem, 1=hoje, 2=amanhã
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

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

  // Carga inicial + atualização a cada 30 min
  useEffect(() => {
    load();
    const t = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  // Mapa Leaflet (uma vez)
  useEffect(() => {
    const map = L.map(containerRef.current, { center: CE_CENTER, zoom: 7, scrollWheelZoom: true });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Tiles seguem o dark mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(dark ? TILES.dark : TILES.light, { attribution: ATTR, maxZoom: 12 }).addTo(map);
  }, [dark]);

  // Círculos de precipitação
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !dados) return;
    layer.clearLayers();

    dados.cidades.forEach((c) => {
      const mm = c.mm?.[dia];
      L.circleMarker([c.lat, c.lng], {
        radius: raioChuva(mm),
        color: corChuva(mm),
        weight: 1.5,
        fillColor: corChuva(mm),
        fillOpacity: (mm ?? 0) > 0 ? 0.55 : 0.25,
      })
        .bindPopup(`
          <div class="obra-popup" style="max-width:200px">
            <div class="obra-popup-nome">${c.nome}</div>
            <div class="obra-popup-local">${DIAS_LABEL[dia]}${dados.dias?.[dia] ? ` · ${fmtDia(dados.dias[dia])}` : ""}</div>
            <div style="font-size:20px;font-weight:800;color:${corChuva(mm)}">
              ${mm == null ? "N/D" : `${String(mm).replace(".", ",")} mm`}
            </div>
            <div class="obra-popup-local">
              Ontem: ${c.mm?.[0] ?? "–"} mm · Hoje: ${c.mm?.[1] ?? "–"} mm · Amanhã: ${c.mm?.[2] ?? "–"} mm
            </div>
          </div>`)
        .addTo(layer);
    });

    setTimeout(() => map.invalidateSize(), 60);
  }, [dados, dia]);

  // Resumo do dia selecionado
  const mms = (dados?.cidades || []).map((c) => c.mm?.[dia]).filter((v) => v != null);
  const media = mms.length ? Math.round((mms.reduce((s, v) => s + v, 0) / mms.length) * 10) / 10 : 0;
  const comChuva = mms.filter((v) => v >= 0.1).length;
  const max = dados?.cidades?.reduce(
    (best, c) => ((c.mm?.[dia] ?? -1) > (best?.mm ?? -1) ? { nome: c.nome, mm: c.mm?.[dia] } : best),
    null
  );

  return (
    <div className="card-enter">
      {/* Controles */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ display: "flex", background: "var(--filter-bg, #E0F7EA)", borderRadius: 10, padding: 3 }}>
          {DIAS_LABEL.map((d, i) => (
            <button
              key={d}
              onClick={() => setDia(i)}
              aria-pressed={dia === i}
              style={{
                padding: "7px 14px", border: "none", borderRadius: 8,
                fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                background: dia === i ? "var(--filter-active, #1B6B3A)" : "transparent",
                color: dia === i ? "#fff" : "var(--filter-text, #1B6B3A)",
                transition: "all .2s ease",
              }}
            >{d}{dados?.dias?.[i] ? ` · ${fmtDia(dados.dias[i])}` : ""}</button>
          ))}
        </div>
        <button
          onClick={load}
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
            : dados
              ? <>🌧️ {comChuva} de {dados.cidades.length} municípios com chuva · média {String(media).replace(".", ",")} mm
                {max?.mm > 0 ? <> · máx: {max.nome} ({String(max.mm).replace(".", ",")} mm)</> : null} · Open-Meteo</>
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
          <div className="map-legend-title">Precipitação (mm/dia)</div>
          {ESCALA.map((e) => (
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
            <button onClick={load} style={{
              padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "#fff", color: "#1B6B3A", fontWeight: 800, fontSize: 12,
            }}>Tentar novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}
