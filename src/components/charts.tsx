import { SPEND_SPLIT } from "@/lib/mock";
import { formatNaira } from "@/lib/format";

const W = 520;
const H = 220;
const PAD = { top: 16, right: 8, bottom: 34, left: 56 };

export interface SpendPoint {
  month: string;
  amount: number;
}

// Rounds the top of the scale up to a clean ₦20K step.
const niceMax = (value: number) => Math.max(20000, Math.ceil((value * 1.1) / 20000) * 20000);

export function SpendBars({ data }: { data: SpendPoint[] }) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.amount)));
  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.46, 56);
  const ticks = [0, 1, 2, 3].map((i) => (max * i) / 3);
  const last = data.length - 1;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Bill payments: ${data.map((m) => `${m.month} ${formatNaira(m.amount)}`).join(", ")}`}
      >
        {ticks.map((t) => {
          const y = PAD.top + innerH - (t / max) * innerH;
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(167,243,208,0.08)" />
              <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="fill-[var(--muted)] text-[11px]">
                {t === 0 ? "₦0" : `₦${Math.round(t / 1000)}K`}
              </text>
            </g>
          );
        })}
        {data.map((m, i) => {
          const h = (m.amount / max) * innerH;
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const y = PAD.top + innerH - h;
          return (
            <g key={m.month}>
              <rect x={x} y={y} width={barW} height={h} rx={8} fill={i === last ? "var(--accent)" : "rgba(61,235,160,0.22)"} />
              <text
                x={x + barW / 2}
                y={H - 10}
                textAnchor="middle"
                className={`text-[12px] ${i === last ? "fill-[var(--fg)] font-semibold" : "fill-[var(--muted)]"}`}
              >
                {m.month}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function SpendDonut({ total }: { total: string }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative h-40 w-40 flex-shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(167,243,208,0.08)" strokeWidth="14" />
        {SPEND_SPLIT.map((s) => {
          const len = (s.share / 100) * c;
          const el = (
            <circle
              key={s.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${Math.max(len - 3, 0)} ${c}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-base font-semibold tabular-nums">{total}</span>
        <span className="text-[11px] text-muted">Total spent</span>
        <span className="text-[11px] text-muted">Oct 2026</span>
      </div>
    </div>
  );
}
