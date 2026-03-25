import { C, OBRAS, EIXOS } from "../data/obras";

export default function Header({ now, dark, onToggleDark }) {
  return (
    <header style={{
      background: dark
        ? "linear-gradient(135deg, #0A1510 0%, #162018 100%)"
        : `linear-gradient(135deg, ${C.g9} 0%, ${C.g7} 100%)`,
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 4px 24px rgba(13,59,30,.3)",
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: C.g3,
          }}>AJE</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: ".5px" }}>
              PAINEL DE OBRAS ESTRUTURANTES DO CEARÁ
            </div>
            <div style={{ fontSize: 10, color: C.g3 }}>
              AJE Fortaleza — {OBRAS.length} obras · {EIXOS.length - 1} eixos estratégicos
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={onToggleDark}
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
            title={dark ? "Modo claro" : "Modo escuro"}
            style={{
              background: "rgba(255,255,255,.12)", border: "none", borderRadius: 8,
              width: 36, height: 36, cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,.22)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,.12)"}
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <div style={{ fontSize: 10, color: C.g2, textAlign: "right" }}>
            <div>📡 {now.toLocaleDateString("pt-BR")} {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
            <div style={{ opacity: .7 }}>Fontes: Seinfra, Gov. CE, MIDR, Min. Transportes, BNDES, Sudene, Cagece</div>
          </div>
        </div>
      </div>
    </header>
  );
}
