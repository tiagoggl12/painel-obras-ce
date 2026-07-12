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

// Escala de média anual (mm/ano) — quente = semiárido, azul = úmido
const ESCALA_ANUAL = [
  { min: 1400, cor: "#1565C0", label: "1.400+ mm" },
  { min: 1100, cor: "#1E88E5", label: "1.100–1.400 mm" },
  { min: 900, cor: "#26A69A", label: "900–1.100 mm" },
  { min: 750, cor: "#9CCC65", label: "750–900 mm" },
  { min: 600, cor: "#FDD835", label: "600–750 mm" },
  { min: 450, cor: "#FB8C00", label: "450–600 mm" },
  { min: -1, cor: "#E65100", label: "< 450 mm" },
];

const corAnual = (mm) => ESCALA_ANUAL.find((e) => (mm ?? 0) > e.min || e.min === -1).cor;
const raioAnual = (mm) => 7 + Math.min(((mm ?? 0) / 1600) * 16, 18);
const fmtMil = (n) => (n == null ? "N/D" : n.toLocaleString("pt-BR"));

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
  const [normais, setNormais] = useState(null);
  const [dia, setDia] = useState(1); // 0=ontem, 1=hoje, 2=amanhã, 3=média anual
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

  // Climatologia: buscada na primeira vez que o modo anual é aberto
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
    if (anual && !normais) loadNormais();
  }, [anual, normais, loadNormais]);

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

  // Círculos de precipitação (ao vivo ou média anual)
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    if (anual ? !normais : !dados) return;
    layer.clearLayers();

    if (anual) {
      normais.cidades.forEach((c) => {
        L.circleMarker([c.lat, c.lng], {
          radius: raioAnual(c.media),
          color: corAnual(c.media),
          weight: 1.5,
          fillColor: corAnual(c.media),
          fillOpacity: 0.6,
        })
          .bindPopup(`
            <div class="obra-popup" style="max-width:200px">
              <div class="obra-popup-nome">${c.nome}</div>
              <div class="obra-popup-local">Média anual · ${normais.periodo} (ERA5)</div>
              <div style="font-size:20px;font-weight:800;color:${corAnual(c.media)}">
                ${fmtMil(c.media)} mm/ano
              </div>
            </div>`)
          .addTo(layer);
      });
    } else {
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
    }

    setTimeout(() => map.invalidateSize(), 60);
  }, [dados, normais, dia, anual]);

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
          <div className="map-legend-title">{anual ? "Média anual (mm/ano)" : "Precipitação (mm/dia)"}</div>
          {(anual ? ESCALA_ANUAL : ESCALA).map((e) => (
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
