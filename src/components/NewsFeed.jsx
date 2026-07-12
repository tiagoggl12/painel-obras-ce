import { useState, useEffect, useCallback } from "react";
import { NOTICIAS } from "../data/noticias";
import { OBRAS } from "../data/obras";
import { OBRAS_BR } from "../data/brasil";

// ── Consultas do Google News por região ─────────────────────
const QUERIES = {
  CE: ['obras infraestrutura Ceará'],
  BR: ['"Novo PAC" obras infraestrutura'],
};
QUERIES.Todas = [...QUERIES.CE, ...QUERIES.BR];

const REGIOES = [
  { key: "Todas", label: "Todas" },
  { key: "CE", label: "🌵 Ceará" },
  { key: "BR", label: "🇧🇷 Brasil" },
];

// Consulta específica por obra (nome limpo + contexto)
const obraQuery = (o, regiao) => {
  const nome = o.nome.replace(/\s*\([^)]*\)/g, "").replace(/^(Duplicação|Requalificação) (da |do |de )?/i, "").trim();
  return regiao === "CE" && !/Ceará|Fortaleza|CE\b/i.test(nome) ? `${nome} Ceará` : nome;
};

const OBRA_OPTIONS = [
  { group: "🌵 Ceará", opts: OBRAS.map((o) => ({ label: `${o.icon} ${o.nome}`, q: obraQuery(o, "CE"), regiao: "CE" })) },
  { group: "🇧🇷 Brasil", opts: OBRAS_BR.map((o) => ({ label: `${o.icon} ${o.nome}`, q: obraQuery(o, "BR"), regiao: "BR" })) },
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 60) return `há ${Math.max(min, 1)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `há ${d} dia${d > 1 ? "s" : ""}`;
  const dt = new Date(iso);
  return `${String(dt.getDate()).padStart(2, "0")} ${MESES[dt.getMonth()]} ${dt.getFullYear()}`;
}

function fmtData(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MESES[m - 1]} ${y}`;
}

function findObra(obraId) {
  if (obraId == null) return null;
  return OBRAS.find((o) => o.id === obraId) || OBRAS_BR.find((o) => o.id === obraId) || null;
}

const chipStyle = (regiao) => ({
  fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 12, color: "#fff",
  background: regiao === "CE" ? "var(--filter-active, #1B6B3A)" : "#3498DB",
});

// ── Feed ao vivo (Google News) ──────────────────────────────
function LiveItem({ n, i }) {
  return (
    <a
      href={n.link} target="_blank" rel="noopener noreferrer"
      className="news-item card-enter"
      style={{
        display: "block", position: "relative", marginBottom: 12, textDecoration: "none",
        background: "var(--card-bg, #FFF)", borderRadius: 12, padding: "13px 17px",
        border: "1.5px solid var(--border, #E0F7EA)", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        transition: "all .2s ease", animationDelay: `${Math.min(i, 12) * 45}ms`,
      }}
    >
      <span aria-hidden="true" style={{
        position: "absolute", left: -22, top: 19, width: 12, height: 12, borderRadius: "50%",
        background: n.regiao === "CE" ? "var(--accent, #2EA55D)" : "#3498DB",
        border: "2.5px solid var(--card-bg, #FFF)", boxShadow: "0 0 0 2px var(--border, #E0F7EA)",
      }} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: "var(--accent, #1B6B3A)",
          background: "var(--news-bg, #F0FBF4)", padding: "2px 8px", borderRadius: 12,
        }}>{timeAgo(n.date)}</span>
        <span style={chipStyle(n.regiao)}>{n.regiao === "CE" ? "CEARÁ" : "BRASIL"}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-faint, #7A7A7A)" }}>{n.source}</span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text, #0D3B1E)", lineHeight: 1.4 }}>
        {n.title}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent, #218C48)", marginTop: 6 }}>
        Ler no veículo →
      </div>
    </a>
  );
}

// ── Fallback: notícias arquivadas (curadoria) ───────────────
function CuratedItem({ n, i, onSelect }) {
  const obra = findObra(n.obraId);
  const clickable = obra != null;
  return (
    <article
      className="news-item card-enter"
      onClick={clickable ? () => onSelect(obra) : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(obra); } } : undefined}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? `Ver detalhes da obra: ${n.obra}` : undefined}
      style={{
        position: "relative", marginBottom: 14,
        background: "var(--card-bg, #FFF)", borderRadius: 12, padding: "14px 18px",
        border: "1.5px solid var(--border, #E0F7EA)", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        cursor: clickable ? "pointer" : "default", transition: "all .2s ease",
        animationDelay: `${Math.min(i, 12) * 45}ms`,
      }}
    >
      <span aria-hidden="true" style={{
        position: "absolute", left: -22, top: 20, width: 12, height: 12, borderRadius: "50%",
        background: n.regiao === "CE" ? "var(--accent, #2EA55D)" : "#3498DB",
        border: "2.5px solid var(--card-bg, #FFF)", boxShadow: "0 0 0 2px var(--border, #E0F7EA)",
      }} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: "var(--accent, #1B6B3A)",
          background: "var(--news-bg, #F0FBF4)", padding: "2px 8px", borderRadius: 12,
        }}>{fmtData(n.data)}</span>
        <span style={chipStyle(n.regiao)}>{n.regiao === "CE" ? "CEARÁ" : "BRASIL"}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-faint, #7A7A7A)" }}>{n.icon} {n.obra}</span>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text, #0D3B1E)", lineHeight: 1.35, margin: "0 0 5px" }}>{n.titulo}</h3>
      <p style={{ fontSize: 12, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.55, margin: 0 }}>{n.resumo}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)" }}>📰 {n.fonte}</span>
        {clickable && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent, #218C48)" }}>Ver obra →</span>}
      </div>
    </article>
  );
}

export default function NewsFeed({ onSelect }) {
  const [regiao, setRegiao] = useState("Todas");
  const [obraQ, setObraQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Obra específica selecionada → uma consulta; senão as consultas da região
    const queries = obraQ
      ? [{ q: obraQ, regiao: OBRA_OPTIONS.flatMap((g) => g.opts).find((o) => o.q === obraQ)?.regiao || "BR" }]
      : QUERIES[regiao].map((q) => ({ q, regiao: QUERIES.CE.includes(q) ? "CE" : "BR" }));

    try {
      const results = await Promise.all(
        queries.map(({ q, regiao: r }) =>
          fetch(`/api/news?q=${encodeURIComponent(q)}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
            .then((data) => data.items.map((it) => ({ ...it, regiao: r })))
        )
      );
      const seen = new Set();
      const merged = results.flat()
        .filter((n) => { const k = n.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .slice(0, 30);
      if (merged.length === 0) throw new Error("empty");
      setItems(merged);
      setUpdatedAt(new Date());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [regiao, obraQ]);

  // Carrega ao trocar filtros + atualização automática a cada 10 min
  useEffect(() => {
    load();
    const t = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const curated = NOTICIAS
    .filter((n) => regiao === "Todas" || n.regiao === regiao)
    .sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="card-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "var(--filter-bg, #E0F7EA)", borderRadius: 10, padding: 3 }}>
          {REGIOES.map((r) => (
            <button
              key={r.key}
              onClick={() => { setRegiao(r.key); setObraQ(""); }}
              aria-pressed={regiao === r.key && !obraQ}
              style={{
                padding: "7px 14px", border: "none", borderRadius: 8,
                fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                background: regiao === r.key && !obraQ ? "var(--filter-active, #1B6B3A)" : "transparent",
                color: regiao === r.key && !obraQ ? "#fff" : "var(--filter-text, #1B6B3A)",
                transition: "all .2s ease",
              }}
            >{r.label}</button>
          ))}
        </div>

        <select
          value={obraQ}
          onChange={(e) => setObraQ(e.target.value)}
          aria-label="Filtrar notícias por obra"
          style={{
            padding: "8px 12px", borderRadius: 10, maxWidth: 260,
            border: "1.5px solid var(--input-border, #B5ECCC)",
            fontSize: 11, fontWeight: 600, outline: "none",
            background: "var(--input-bg, #FFF)", color: "var(--text, #1A1A1A)",
            cursor: "pointer",
          }}
        >
          <option value="">🔎 Todas as obras</option>
          {OBRA_OPTIONS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.opts.map((o) => <option key={o.q} value={o.q}>{o.label}</option>)}
            </optgroup>
          ))}
        </select>

        <button
          onClick={load}
          disabled={loading}
          aria-label="Atualizar notícias"
          style={{
            padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--input-border, #B5ECCC)",
            fontSize: 11, fontWeight: 700, cursor: loading ? "wait" : "pointer",
            background: "var(--input-bg, #FFF)", color: "var(--accent, #1B6B3A)",
          }}
        >{loading ? "⏳" : "🔄"} Atualizar</button>
      </div>

      {/* Status */}
      <div aria-live="polite" style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)", marginBottom: 16 }}>
        {failed
          ? null
          : updatedAt
            ? <>📡 Google News · atualizado às {String(updatedAt.getHours()).padStart(2, "0")}:{String(updatedAt.getMinutes()).padStart(2, "0")} · {items.length} notícias · atualização automática a cada 10 min</>
            : "Conectando ao Google News..."}
      </div>

      {/* Aviso de fallback */}
      {failed && !loading && (
        <div role="status" style={{
          background: "var(--news-bg, #F0FBF4)", border: "1.5px solid var(--border, #E0F7EA)",
          borderLeft: "4px solid #F0AD4E", borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          fontSize: 11.5, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.5,
        }}>
          ⚠️ Não foi possível conectar ao Google News agora — exibindo o arquivo de notícias da última
          pesquisa. <button onClick={load} style={{
            border: "none", background: "none", color: "var(--accent, #1B6B3A)",
            fontWeight: 700, cursor: "pointer", fontSize: 11.5, padding: 0, textDecoration: "underline",
          }}>Tentar novamente</button>
        </div>
      )}

      {/* Skeleton de carregamento */}
      {loading && (
        <div style={{ position: "relative", paddingLeft: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="news-skeleton" style={{
              height: 88, borderRadius: 12, marginBottom: 12,
              background: "var(--filter-bg, #E0F7EA)", opacity: .5,
              animationDelay: `${i * 120}ms`,
            }} />
          ))}
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div style={{ position: "relative", paddingLeft: 24 }}>
          <div aria-hidden="true" style={{
            position: "absolute", left: 7, top: 8, bottom: 8, width: 2,
            background: "var(--border, #E0F7EA)", borderRadius: 1,
          }} />
          {failed
            ? curated.map((n, i) => <CuratedItem key={`${n.data}-${n.obra}`} n={n} i={i} onSelect={onSelect} />)
            : items.map((n, i) => <LiveItem key={n.link} n={n} i={i} />)}
        </div>
      )}
    </div>
  );
}
