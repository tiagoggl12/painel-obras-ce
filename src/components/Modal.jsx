import { useEffect, useRef } from "react";
import { C, progressColor } from "../data/obras";
import Ring from "./Ring";
import Bar from "./Bar";

function Sec({ t, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--accent, #1B6B3A)", textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 7, paddingBottom: 3, borderBottom: "2px solid var(--border, #E0F7EA)",
      }}>{t}</div>
      {children}
    </div>
  );
}

export default function Modal({ o, onClose }) {
  const ref = useRef(null);

  // Escape to close + scroll lock
  useEffect(() => {
    if (!o) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    // Focus the modal
    setTimeout(() => ref.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [o, onClose]);

  if (!o) return null;

  return (
    <div
      onClick={onClose}
      className="modal-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "var(--modal-overlay, rgba(13,59,30,.55))",
        backdropFilter: "blur(8px)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={o.nome}
        tabIndex={-1}
        className="modal-content"
        style={{
          background: "var(--card-bg, #FFF)", borderRadius: 18, maxWidth: 680, width: "100%",
          maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,.25)",
          position: "relative", outline: "none",
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.g8}, ${C.g5})`,
          padding: "28px 28px 22px", borderRadius: "18px 18px 0 0",
        }}>
          <div style={{ fontSize: 11, color: C.g2, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            {o.icon} {o.eixo}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{o.nome}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[o.st, `📅 ${o.prev}`, `💰 ${o.inv}`, `🎯 ${o.imp}`].map((t, i) => (
              <span key={i} style={{
                background: "rgba(255,255,255,.18)", padding: "4px 11px",
                borderRadius: 20, fontSize: 11, color: "#fff", fontWeight: i === 0 ? 600 : 400,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <Ring pct={o.pct} sz={76} sw={6} />
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800, color: progressColor(o.pct),
              }}>
                {o.pct != null ? `${o.pct}%` : "N/D"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-faint, #7A7A7A)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>
                Execução Física
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted, #4A4A4A)", marginTop: 2 }}>
                Responsável: <strong>{o.resp}</strong>
              </div>
            </div>
          </div>

          <Sec t="Objetivo">
            <p style={{ fontSize: 13, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.6, margin: 0 }}>{o.obj}</p>
          </Sec>

          {o.marcos && (
            <Sec t="Marcos / Subitens">
              {o.marcos.map((m, i) => <Bar key={i} l={m.l} p={m.p} />)}
            </Sec>
          )}

          <Sec t="Última Notícia">
            <p style={{
              fontSize: 12, color: "var(--text-muted, #4A4A4A)", lineHeight: 1.6, margin: 0,
              background: "var(--news-bg, #F0FBF4)", padding: "12px 14px",
              borderRadius: 10, borderLeft: `4px solid ${C.g5}`,
            }}>{o.not}</p>
            <div style={{ fontSize: 10, color: "var(--accent, #218C48)", marginTop: 6 }}>📰 {o.src}</div>
          </Sec>
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar detalhes"
          style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%",
            width: 34, height: 34, cursor: "pointer", color: "#fff",
            fontSize: 16, fontWeight: 700, display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "background .2s",
          }}
          onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,.35)"}
          onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,.2)"}
        >✕</button>
      </div>
    </div>
  );
}
