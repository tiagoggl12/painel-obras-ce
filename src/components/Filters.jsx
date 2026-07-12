import { EIXOS, SORT_OPTIONS } from "../data/obras";

const VIEWS = [
  { key: "cards", label: "▦ Cards" },
  { key: "map", label: "🗺️ Mapa" },
];

export default function Filters({ filter, setFilter, search, setSearch, sort, setSort, count, view, setView }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
      {/* View toggle: cards / map */}
      <div role="group" aria-label="Modo de visualização" style={{
        display: "flex", background: "var(--filter-bg, #E0F7EA)",
        borderRadius: 10, padding: 3,
      }}>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            aria-label={`Visualizar em ${v.key === "map" ? "mapa" : "cards"}`}
            aria-pressed={view === v.key}
            style={{
              padding: "7px 13px", border: "none", borderRadius: 8,
              fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
              background: view === v.key ? "var(--filter-active, #1B6B3A)" : "transparent",
              color: view === v.key ? "#fff" : "var(--filter-text, #1B6B3A)",
              transition: "all .2s ease",
            }}
          >{v.label}</button>
        ))}
      </div>

      {/* Filter pills — horizontal scroll on mobile */}
      <div className="filter-scroll" style={{
        display: "flex", gap: 0, background: "var(--filter-bg, #E0F7EA)",
        borderRadius: 10, padding: 3,
      }}>
        {EIXOS.map((e) => (
          <button
            key={e}
            onClick={() => setFilter(e)}
            aria-label={`Filtrar por ${e}`}
            aria-pressed={filter === e}
            style={{
              padding: "7px 13px", border: "none", borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              background: filter === e ? "var(--filter-active, #1B6B3A)" : "transparent",
              color: filter === e ? "#fff" : "var(--filter-text, #1B6B3A)",
              transition: "all .2s ease",
            }}
          >{e}</button>
        ))}
      </div>

      {/* Sort dropdown (não se aplica ao mapa) */}
      {view !== "map" && (
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Ordenar obras"
        style={{
          padding: "8px 12px", borderRadius: 10,
          border: "1.5px solid var(--input-border, #B5ECCC)",
          fontSize: 11, fontWeight: 600, outline: "none",
          background: "var(--input-bg, #FFF)", color: "var(--text, #1A1A1A)",
          cursor: "pointer", appearance: "auto",
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      )}

      {/* Search with clear button */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar obras"
          className="search-input"
          style={{
            padding: "8px 32px 8px 14px", borderRadius: 10,
            border: "1.5px solid var(--input-border, #B5ECCC)",
            fontSize: 12, outline: "none", background: "var(--input-bg, #FFF)",
            color: "var(--text, #1A1A1A)", width: 200,
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Limpar busca"
            style={{
              position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
              background: "var(--filter-bg, #E0F7EA)", border: "none", borderRadius: "50%",
              width: 20, height: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
              color: "var(--text-faint, #7A7A7A)", display: "flex",
              alignItems: "center", justifyContent: "center", lineHeight: 1,
            }}
          >✕</button>
        )}
      </div>

      {/* Result count */}
      <span aria-live="polite" style={{ fontSize: 11, color: "var(--text-faint, #7A7A7A)" }}>
        {count} obra{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
