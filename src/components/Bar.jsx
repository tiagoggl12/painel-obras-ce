import { progressColor, C } from "../data/obras";

export default function Bar({ l, p }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted, #4A4A4A)", marginBottom: 2 }}>
        <span>{l}</span>
        <span style={{ fontWeight: 700, color: progressColor(p) }}>{p}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--ring-track, #E0F7EA)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3,
          background: `linear-gradient(90deg, ${C.g5}, ${progressColor(p)})`,
          width: `${p}%`, transition: "width 1s ease",
        }} />
      </div>
    </div>
  );
}
