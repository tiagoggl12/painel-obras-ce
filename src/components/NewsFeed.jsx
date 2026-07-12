import { useState } from "react";
import { NOTICIAS } from "../data/noticias";
import { OBRAS } from "../data/obras";
import { OBRAS_BR } from "../data/brasil";

const REGIOES = [
  { key: "Todas", label: "Todas" },
  { key: "CE", label: "🌵 Ceará" },
  { key: "BR", label: "🇧🇷 Brasil" },
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function fmtData(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return { dia: String(d).padStart(2, "0"), mes: MESES[m - 1], ano: y };
}

function findObra(obraId) {
  if (obraId == null) return null;
  return OBRAS.find((o) => o.id === obraId) || OBRAS_BR.find((o) => o.id === obraId) || null;
}

export default function NewsFeed({ onSelect }) {
  const [regiao, setRegiao] = useState("Todas");

  const items = NOTICIAS
    .filter((n) => regiao === "Todas" || n.regiao === regiao)
    .sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="card-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Filtro por região */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "var(--filter-bg, #E0F7EA)", borderRadius: 10, padding: 3 }}>
          {REGIOES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRegiao(r.key)}
              aria-pressed={regiao === r.key}
              style={{
                padding: "7px 14px", border: "none", borderRadius: 8,
                fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                background: regiao === r.key ? "var(--filter-active, #1B6B3A)" : "transparent",
                color: regiao === r.key ? "#fff" : "var(--filter-text, #1B6B3A)",
                transition: "all .2s ease",
              }}
            >{r.label}</button>
          ))}
        </div>
        <span aria-live="polite" style={{ fontSize: 11, color: "var(--text-faint, #7A7A7A)" }}>
          {items.length} notícia{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div aria-hidden="true" style={{
          position: "absolute", left: 7, top: 8, bottom: 8, width: 2,
          background: "var(--border, #E0F7EA)", borderRadius: 1,
        }} />

        {items.map((n, i) => {
          const dt = fmtData(n.data);
          const obra = findObra(n.obraId);
          const clickable = obra != null;
          return (
            <article
              key={`${n.data}-${n.obra}`}
              className="news-item card-enter"
              onClick={clickable ? () => onSelect(obra) : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(obra); } } : undefined}
              tabIndex={clickable ? 0 : undefined}
              role={clickable ? "button" : undefined}
              aria-label={clickable ? `Ver detalhes da obra: ${n.obra}` : undefined}
              style={{
                position: "relative", marginBottom: 14,
                background: "var(--card-bg, #FFF)", borderRadius: 12, padding: "14px 18px",
                border: "1.5px solid var(--border, #E0F7EA)",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                cursor: clickable ? "pointer" : "default",
                transition: "all .2s ease",
                animationDelay: `${i * 50}ms`,
              }}
            >
              {/* Ponto na timeline */}
              <span aria-hidden="true" style={{
                position: "absolute", left: -22, top: 20, width: 12, height: 12, borderRadius: "50%",
                background: n.regiao === "CE" ? "var(--accent, #2EA55D)" : "#3498DB",
                border: "2.5px solid var(--card-bg, #FFF)", boxShadow: "0 0 0 2px var(--border, #E0F7EA)",
              }} />

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: "var(--accent, #1B6B3A)",
                  background: "var(--news-bg, #F0FBF4)", padding: "2px 8px", borderRadius: 12,
                }}>{dt.dia} {dt.mes} {dt.ano}</span>
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 12, color: "#fff",
                  background: n.regiao === "CE" ? "var(--filter-active, #1B6B3A)" : "#3498DB",
                }}>{n.regiao === "CE" ? "CEARÁ" : "BRASIL"}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-faint, #7A7A7A)" }}>
                  {n.icon} {n.obra}
                </span>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text, #0D3B1E)", lineHeight: 1.35, margin: "0 0 5px" }}>
                {n.titulo}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.55, margin: 0 }}>
                {n.resumo}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)" }}>📰 {n.fonte}</span>
                {clickable && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent, #218C48)" }}>
                    Ver obra →
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
