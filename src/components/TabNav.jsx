const TABS = [
  { key: "ce", label: "🌵 Ceará", desc: "Obras estruturantes do CE" },
  { key: "br", label: "🇧🇷 Brasil", desc: "Grandes obras nacionais" },
  { key: "news", label: "📰 Notícias", desc: "Últimas notícias das obras" },
];

export default function TabNav({ tab, setTab }) {
  return (
    <nav aria-label="Seções do painel" className="tab-nav" style={{
      display: "flex", gap: 6, marginBottom: 22,
      borderBottom: "2px solid var(--border, #E0F7EA)",
    }}>
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          aria-pressed={tab === t.key}
          title={t.desc}
          style={{
            padding: "10px 18px 9px", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
            fontFamily: "inherit",
            background: "transparent",
            color: tab === t.key ? "var(--accent, #1B6B3A)" : "var(--text-faint, #7A7A7A)",
            borderBottom: `3px solid ${tab === t.key ? "var(--accent, #1B6B3A)" : "transparent"}`,
            marginBottom: -2,
            transition: "all .2s ease",
          }}
        >{t.label}</button>
      ))}
    </nav>
  );
}
