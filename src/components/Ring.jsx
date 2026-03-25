import { progressColor } from "../data/obras";

export default function Ring({ pct, sz = 56, sw = 5 }) {
  const r = (sz - sw) / 2;
  const ci = 2 * Math.PI * r;
  const v = pct != null ? pct : 0;
  const off = ci - (v / 100) * ci;

  return (
    <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
      <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke="var(--ring-track, #E0F7EA)" strokeWidth={sw} />
      <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={progressColor(pct)} strokeWidth={sw}
        strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}
