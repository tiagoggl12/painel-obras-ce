import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { statusColor } from "../data/obras";

const CE_CENTER = [-5.1, -39.3];
const TILES = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function markerIcon(o) {
  const color = statusColor(o.st);
  const pct = o.pct != null ? `${Math.round(o.pct)}%` : "";
  return L.divIcon({
    className: "obra-marker",
    html: `
      <div class="obra-pin" style="--pin-color:${color}">
        <span class="obra-pin-icon">${o.icon}</span>
        ${pct ? `<span class="obra-pin-pct">${pct}</span>` : ""}
      </div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 44],
    popupAnchor: [0, -44],
  });
}

function popupHtml(o) {
  const color = statusColor(o.st);
  return `
    <div class="obra-popup">
      <div class="obra-popup-eixo">${o.icon} ${esc(o.eixo)}</div>
      <div class="obra-popup-nome">${esc(o.nome)}</div>
      <div class="obra-popup-local">📍 ${esc(o.local || "Ceará")}</div>
      <div class="obra-popup-tags">
        <span class="obra-popup-status" style="background:${color}">${esc(o.st)}</span>
        ${o.pct != null ? `<span class="obra-popup-pill">⚙️ ${o.pct}%</span>` : ""}
        <span class="obra-popup-pill">📅 ${esc(o.prev)}</span>
        <span class="obra-popup-pill">💰 ${esc(o.inv)}</span>
      </div>
      <div class="obra-popup-obj">${esc(o.obj)}</div>
      <button type="button" class="obra-popup-btn" data-obra-id="${o.id}">Ver detalhes completos →</button>
    </div>`;
}

export default function MapView({ obras, dark, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const layerRef = useRef(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create map once
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: CE_CENTER,
      zoom: 7,
      scrollWheelZoom: true,
      zoomControl: true,
    });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    // Open the details modal when the popup button is clicked
    const handleClick = (e) => {
      const btn = e.target.closest("[data-obra-id]");
      if (btn) onSelectRef.current?.(Number(btn.dataset.obraId));
    };
    containerRef.current.addEventListener("click", handleClick);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Tile layer follows dark mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const t = dark ? TILES.dark : TILES.light;
    tileRef.current = L.tileLayer(t.url, { attribution: t.attribution, maxZoom: 18 }).addTo(map);
  }, [dark]);

  // Markers follow filters/search
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const located = obras.filter((o) => o.lat != null && o.lng != null);
    located.forEach((o) => {
      L.marker([o.lat, o.lng], { icon: markerIcon(o), title: o.nome, alt: o.nome })
        .bindPopup(popupHtml(o), { maxWidth: 300, closeButton: true })
        .addTo(layer);
    });

    if (located.length > 0) {
      const bounds = L.latLngBounds(located.map((o) => [o.lat, o.lng]));
      map.fitBounds(bounds.pad(0.18), { maxZoom: 11 });
    }
    // Recalculate size in case the container was just shown
    setTimeout(() => map.invalidateSize(), 60);
  }, [obras]);

  return (
    <div
      className="map-wrap card-enter"
      style={{
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        border: "1.5px solid var(--border, #E0F7EA)",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      }}
    >
      <div
        ref={containerRef}
        role="application"
        aria-label="Mapa das obras estruturantes do Ceará"
        style={{ height: "min(72vh, 680px)", minHeight: 420, width: "100%", background: "var(--card-bg, #FFF)" }}
      />

      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-title">Status</div>
        {[
          ["Concluída", "#27AE60"],
          ["Em andamento", "#3498DB"],
          ["Retomada / Início", "#8E44AD"],
          ["Licitação", "#E67E22"],
          ["Planejamento / Outros", "#F0AD4E"],
        ].map(([label, color]) => (
          <div key={label} className="map-legend-item">
            <span className="map-legend-dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {obras.filter((o) => o.lat != null).length === 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--modal-overlay, rgba(13,59,30,.35))", color: "#fff",
          fontSize: 13, fontWeight: 600, zIndex: 500, pointerEvents: "none",
        }}>
          Nenhuma obra encontrada para os filtros atuais.
        </div>
      )}
    </div>
  );
}
