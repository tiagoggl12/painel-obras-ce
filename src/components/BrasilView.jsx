import { OBRAS } from "../data/obras";
import { OBRAS_BR, PAC } from "../data/brasil";
import KPI from "./KPI";
import Card from "./Card";
import Bar from "./Bar";

const avg = (list) => {
  const withPct = list.filter((o) => o.pct != null);
  return withPct.length ? Math.round(withPct.reduce((s, o) => s + o.pct, 0) / withPct.length) : 0;
};

export default function BrasilView({ onSelect }) {
  const avgCE = avg(OBRAS);
  const avgBR = avg(OBRAS_BR);
  const emAndamentoBR = OBRAS_BR.filter((o) => o.st === "Em andamento").length;

  return (
    <div className="card-enter">
      {/* KPIs nacionais */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <KPI label="Grandes Obras" value={OBRAS_BR.length} sub="monitoradas no Brasil" />
        <KPI label="Em Andamento" value={emAndamentoBR} />
        <KPI label="Novo PAC Executado" value={`${PAC.execucao}%`} sub={`recursos 2023-26 · ${PAC.execucaoRef}`} />
        <KPI label="Investido (3 anos)" value={PAC.investido} sub="Novo PAC · dez/2025" />
        <KPI label="Nordeste no PAC" value={PAC.nordeste} sub="previsto no programa" />
        <KPI label="Investimento Mapeado" value="R$ 95+ bi" sub="obras desta aba" />
      </div>

      {/* Comparativo percentual CE × Brasil */}
      <div style={{
        background: "var(--card-bg, #FFF)", borderRadius: 14, padding: "20px 22px",
        border: "1.5px solid var(--border, #E0F7EA)", marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: "var(--accent, #1B6B3A)",
          textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
        }}>⚖️ Ceará × Brasil — execução física média</div>
        <div style={{ fontSize: 11, color: "var(--text-faint, #7A7A7A)", marginBottom: 14 }}>
          Média do % de execução das obras com dados divulgados: {OBRAS.filter((o) => o.pct != null).length} obras no
          painel do Ceará e {OBRAS_BR.filter((o) => o.pct != null).length} grandes obras nacionais desta aba.
        </div>
        <Bar l={`🌵 Ceará — ${OBRAS.length} obras monitoradas`} p={avgCE} />
        <Bar l={`🇧🇷 Brasil — grandes obras nacionais`} p={avgBR} />
        <div style={{
          marginTop: 12, fontSize: 12, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.55,
          background: "var(--news-bg, #F0FBF4)", padding: "10px 13px", borderRadius: 8,
          borderLeft: "3px solid var(--accent, #2EA55D)",
        }}>
          As obras do Ceará somam <strong>R$ 30+ bi</strong> — cerca de <strong>24%</strong> dos{" "}
          <strong>R$ 125+ bi</strong> mapeados neste painel (CE + grandes obras nacionais). No Novo PAC, o Nordeste
          responde por <strong>{PAC.nordeste}</strong> em obras e serviços previstos, e a Transnordestina — que
          desemboca no Porto do Pecém (CE) — é a maior obra ferroviária em execução no país.
        </div>
      </div>

      {/* Grid de obras nacionais */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
        gap: 16,
      }}>
        {OBRAS_BR.map((o, i) => (
          <Card key={o.id} o={o} onClick={onSelect} index={i} />
        ))}
      </div>

      <div style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)", marginTop: 14, fontStyle: "italic" }}>
        Fontes: {PAC.fonte} · Diário do Transporte · PPI · Infra S.A. · Eletronuclear/TCU · Agência SP · SECOM-BA ·
        Campo Grande News · O Tempo — pesquisa: jul/2026.
      </div>
    </div>
  );
}
