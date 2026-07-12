import { useState, useEffect } from "react";
import { OBRAS, EIXOS, sortObras } from "./data/obras";
import Header from "./components/Header";
import Filters from "./components/Filters";
import KPI from "./components/KPI";
import Card from "./components/Card";
import Modal from "./components/Modal";
import MapView from "./components/MapView";
import TabNav from "./components/TabNav";
import BrasilView from "./components/BrasilView";
import NewsFeed from "./components/NewsFeed";

export default function App() {
  const [tab, setTab] = useState(() => localStorage.getItem("painel-tab") || "ce");
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [view, setView] = useState(() => localStorage.getItem("painel-view") || "cards");
  const [sel, setSel] = useState(null);
  const [now, setNow] = useState(new Date());
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("painel-dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Dark mode class + persist
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("painel-dark", dark);
  }, [dark]);

  // Persist view mode + tab
  useEffect(() => {
    localStorage.setItem("painel-view", view);
  }, [view]);
  useEffect(() => {
    localStorage.setItem("painel-tab", tab);
  }, [tab]);

  // Filtered & sorted
  const filtered = OBRAS.filter((o) =>
    (filter === "Todos" || o.eixo === filter) &&
    (!search || o.nome.toLowerCase().includes(search.toLowerCase()) || o.obj.toLowerCase().includes(search.toLowerCase()))
  );
  const sorted = sortObras(filtered, sort);

  // Computed KPIs
  const withPct = OBRAS.filter((o) => o.pct != null);
  const avgPct = withPct.length > 0 ? Math.round(withPct.reduce((s, o) => s + o.pct, 0) / withPct.length) : 0;

  return (
    <div className="app-root" style={{
      minHeight: "100vh",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      background: "var(--bg-gradient, linear-gradient(180deg, #F0FBF4 0%, #FFF 40%))",
      color: "var(--text, #1A1A1A)",
      transition: "background .4s, color .4s",
    }}>
      <Header now={now} dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 24px 60px" }}>
        {/* Abas: Ceará · Brasil · Notícias */}
        <TabNav tab={tab} setTab={setTab} />

        {tab === "ce" && (
          <>
            {/* KPIs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <KPI label="Obras" value={OBRAS.length} sub={`${EIXOS.length - 1} eixos`} />
              <KPI label="Concluídas" value={OBRAS.filter((o) => o.pct === 100).length} />
              <KPI label="Em Andamento" value={OBRAS.filter((o) => o.st === "Em andamento").length} />
              <KPI label="Progresso Médio" value={`${avgPct}%`} sub={`${withPct.length} obras com dados`} />
              <KPI label="Investimento" value="R$ 30+ bi" sub="Fed. + Est. + Priv." />
              <KPI label="Desemprego CE" value="5,0%" sub="Menor da história" />
            </div>

            {/* Filters */}
            <Filters
              filter={filter} setFilter={setFilter}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              count={sorted.length}
              view={view} setView={setView}
            />

            {view === "map" ? (
              <MapView
                obras={sorted}
                dark={dark}
                onSelect={(id) => setSel(OBRAS.find((o) => o.id === id) ?? null)}
              />
            ) : (
              <>
                {/* Cards grid */}
                <div key={`${filter}-${sort}`} style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
                  gap: 16,
                }}>
                  {sorted.map((o, i) => (
                    <Card key={o.id} o={o} onClick={setSel} index={i} />
                  ))}
                </div>

                {sorted.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text-faint, #7A7A7A)" }}>
                    Nenhuma obra encontrada.
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "br" && <BrasilView onSelect={setSel} />}

        {tab === "news" && <NewsFeed onSelect={setSel} />}

        <footer style={{
          marginTop: 44, paddingTop: 18,
          borderTop: "2px solid var(--border, #E0F7EA)", textAlign: "center",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent, #1B6B3A)" }}>AJE FORTALEZA</div>
          <div style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)", marginTop: 3 }}>
            Associação de Jovens Empresários de Fortaleza · Presidência 2025
          </div>
          <div style={{ fontSize: 9, color: "var(--text-faint, #7A7A7A)", marginTop: 6, fontStyle: "italic", opacity: .6 }}>
            Documento de acompanhamento institucional · Dados de fontes públicas oficiais · Pesquisa ativa: Ceará 25/mar/2026 · Brasil 12/jul/2026
          </div>
        </footer>
      </main>

      <Modal o={sel} onClose={() => setSel(null)} />
    </div>
  );
}
