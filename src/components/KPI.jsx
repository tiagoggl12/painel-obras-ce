import { useState, useEffect, useRef } from "react";

export default function KPI({ label, value, sub }) {
  const numVal = typeof value === "number" ? value : null;
  const [display, setDisplay] = useState(numVal != null ? 0 : value);
  const ref = useRef(null);

  useEffect(() => {
    if (numVal == null) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * numVal);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numVal]);

  return (
    <div ref={ref} className="kpi-card" style={{
      background: "var(--kpi-bg, #FFF)", borderRadius: 12, padding: "14px 18px",
      border: "1px solid var(--border, #E0F7EA)", flex: "1 1 130px", minWidth: 130,
      transition: "all .3s ease",
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--kpi-value, #1B6B3A)", lineHeight: 1 }}>
        {display}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted, #4A4A4A)", marginTop: 3, fontWeight: 600 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 10, color: "var(--text-faint, #7A7A7A)", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}
