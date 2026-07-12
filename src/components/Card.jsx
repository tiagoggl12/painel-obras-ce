import { useState } from "react";
import { statusColor, progressColor } from "../data/obras";
import Ring from "./Ring";
import Bar from "./Bar";

export default function Card({ o, onClick, index }) {
  const [h, setH] = useState(false);
  const fresh = o.tag && ["mar/2026", "jun/2026", "jul/2026"].includes(o.tag);

  return (
    <div
      onClick={() => onClick(o)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(o); } }}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes: ${o.nome} — ${o.pct != null ? o.pct + "% concluída" : "sem dados de execução"}`}
      className="card-enter"
      style={{
        background: "var(--card-bg, #FFF)", borderRadius: 14, padding: "20px 22px", cursor: "pointer",
        border: `1.5px solid ${h ? "var(--border-hover, #4CC97A)" : "var(--border, #E0F7EA)"}`,
        boxShadow: h ? "0 8px 32px var(--card-shadow-hover, rgba(181,236,204,.5))" : "0 2px 8px rgba(0,0,0,.04)",
        transition: "all .25s ease", transform: h ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column", gap: 10, position: "relative", overflow: "hidden",
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #1B6B3A, #4CC97A)" }} />

      {fresh && (
        <div className="badge-pulse" style={{
          position: "absolute", top: 10, right: 10, background: "#E74C3C", color: "#fff",
          fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, letterSpacing: .5,
        }}>ATUALIZADO</div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "var(--accent, #218C48)", fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 3 }}>
            {o.icon} {o.eixo}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text, #0D3B1E)", lineHeight: 1.3 }}>
            {o.nome}
          </div>
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Ring pct={o.pct} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: o.pct != null ? 13 : 10, fontWeight: 800, color: progressColor(o.pct),
          }}>
            {o.pct != null ? `${o.pct}%` : "N/D"}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.4 }}>{o.obj}</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
        <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 9, fontWeight: 700, color: "#fff", background: statusColor(o.st) }}>{o.st}</span>
        <span style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)" }}>📅 {o.prev}</span>
        <span style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)" }}>💰 {o.inv}</span>
      </div>

      {/* News summary */}
      {o.not && (
        <div style={{
          background: "var(--news-bg, #F0FBF4)", borderRadius: 8,
          padding: "8px 10px", borderLeft: "3px solid var(--accent, #2EA55D)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--accent, #218C48)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>
            📰 Última notícia
          </div>
          <div style={{
            fontSize: 11, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.45,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {o.not}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-faint, #7A7A7A)", marginTop: 4, opacity: .8 }}>
            {o.src}
          </div>
        </div>
      )}

      {o.marcos && (
        <div style={{ borderTop: "1px solid var(--border, #E0F7EA)", paddingTop: 8 }}>
          {o.marcos.map((m, i) => <Bar key={i} l={m.l} p={m.p} />)}
        </div>
      )}
    </div>
  );
}
