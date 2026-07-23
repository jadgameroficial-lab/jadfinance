"use client";

import { useState, memo } from "react";
import type { CashflowPoint } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/dashboard/Skeleton";

function buildSmoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

function CashflowChartBase({ data, loading }: { data: CashflowPoint[]; loading?: boolean }) {
  const width = 640;
  const height = 220;
  const padTop = 16;
  const padBottom = 28;
  const [hover, setHover] = useState<number | null>(null);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 220, padding: "0 4px 28px" }}>
        {[62, 40, 78, 52, 90, 68].map((h, i) => (
          <Skeleton key={i} width="100%" height={`${h}%`} style={{ borderRadius: "8px 8px 2px 2px" }} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-ter)", fontSize: 13 }}>
        Sem dados suficientes para exibir o fluxo de caixa ainda.
      </div>
    );
  }

  const all = data.flatMap((d) => [d.income, d.expense]);
  const max = Math.max(1, ...all);
  const min = 0;
  const range = max - min || 1;

  function toY(v: number) {
    return height - padBottom - ((v - min) / range) * (height - padTop - padBottom);
  }
  function toX(i: number) {
    return data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
  }

  const incomePts: [number, number][] = data.map((d, i) => [toX(i), toY(d.income)]);
  const expensePts: [number, number][] = data.map((d, i) => [toX(i), toY(d.expense)]);

  const incomeLine = buildSmoothPath(incomePts);
  const expenseLine = buildSmoothPath(expensePts);
  const incomeArea = `${incomeLine} L ${width},${height - padBottom} L 0,${height - padBottom} Z`;

  const active = hover !== null ? data[hover] : data[data.length - 1];

  return (
    <div>
      <div style={{ position: "relative" }} onMouseLeave={() => setHover(null)}>
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ overflow: "visible" }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const idx = Math.round((relX / width) * (data.length - 1));
            setHover(Math.max(0, Math.min(data.length - 1, idx)));
          }}
        >
          <defs>
            <linearGradient id="cashflowIncomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0} x2={width}
              y1={height - padBottom - f * (height - padTop - padBottom)}
              y2={height - padBottom - f * (height - padTop - padBottom)}
              stroke="var(--border)" strokeWidth="1"
            />
          ))}

          <path d={incomeArea} fill="url(#cashflowIncomeFill)" stroke="none" />
          <path d={incomeLine} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
          <path d={expenseLine} fill="none" stroke="var(--text-ter)" strokeWidth="1.75" strokeDasharray="3 4" strokeLinecap="round" />

          {hover !== null && (
            <line x1={toX(hover)} x2={toX(hover)} y1={padTop} y2={height - padBottom} stroke="var(--border-strong)" strokeWidth="1" />
          )}
          {incomePts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={hover === i ? 4.5 : 3} fill="var(--gold)"
              style={{ transition: "r .2s var(--ease)" }} />
          ))}

          {data.map((d, i) => (
            <text key={d.monthKey} x={toX(i)} y={height - 6} textAnchor="middle" fontSize="10.5" fill="var(--text-ter)" fontFamily="var(--mono)">
              {d.label}
            </text>
          ))}
        </svg>

        <div
          style={{
            position: "absolute", top: 0, pointerEvents: "none",
            left: `${(toX(hover ?? data.length - 1) / width) * 100}%`,
            transform: hover !== null && hover > data.length - 2 ? "translateX(-100%)" : "translateX(8px)",
            background: "var(--surface-3)", border: "1px solid var(--border-strong)", borderRadius: 10,
            padding: "7px 11px", fontSize: 11.5, fontFamily: "var(--mono)", boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ color: "var(--text-ter)", fontSize: 9.5, marginBottom: 2 }}>{active.label} · Receitas</div>
          <div style={{ color: "var(--gold)", fontWeight: 600 }}>R$ {active.income.toLocaleString("pt-BR")}</div>
        </div>
      </div>

      <div className="dash-legend" style={{ marginTop: 18 }}>
        <span><i style={{ background: "var(--gold)" }} />Receitas <b>R$ {active.income.toLocaleString("pt-BR")}</b></span>
        <span><i style={{ background: "var(--text-ter)" }} />Despesas <b>R$ {active.expense.toLocaleString("pt-BR")}</b></span>
      </div>
    </div>
  );
}

export const CashflowChart = memo(CashflowChartBase);
