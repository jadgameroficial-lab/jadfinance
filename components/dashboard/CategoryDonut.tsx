"use client";

import { useEffect, useRef, useState, memo } from "react";
import type { CategorySlice } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/dashboard/Skeleton";

const FALLBACK_PALETTE = [
  "var(--gold)", "var(--green)", "var(--blue)", "var(--purple)", "var(--red)",
];

function CategoryDonutBase({ data, loading }: { data: CategorySlice[]; loading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="dash-donut-wrap" ref={ref}>
        <Skeleton width={150} height={150} circle />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={`${90 - i * 8}%`} height={13} />
          ))}
        </div>
      </div>
    );
  }

  const total = data.reduce((s, c) => s + c.value, 0);

  if (total <= 0) {
    return (
      <div ref={ref} style={{ padding: "40px 0", textAlign: "center", color: "var(--text-ter)", fontSize: 13 }}>
        Nenhuma despesa registrada neste mês ainda.
      </div>
    );
  }

  const radius = 54;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  const slices = data.map((c, i) => ({ ...c, color: c.color ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length] }));

  return (
    <div className="dash-donut-wrap" ref={ref}>
      <div className="dash-donut-svg-wrap" style={{ position: "relative", width: 150, height: 150 }}>
        <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="75" cy="75" r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
          {slices.map((cat, i) => {
            const fraction = cat.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const dashoffset = visible ? -offsetAcc : circumference * 0.25;
            offsetAcc += dash;
            return (
              <circle
                key={cat.categoryId ?? `slice-${i}`}
                cx="75" cy="75" r={radius} fill="none"
                stroke={cat.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
                style={{ transition: `stroke-dashoffset 1s ${i * 0.08}s var(--ease), stroke-dasharray 1s ${i * 0.08}s var(--ease)` }}
                opacity={visible ? 1 : 0}
              />
            );
          })}
        </svg>
        <div className="dash-donut-center">
          <span className="val">R$ {total.toLocaleString("pt-BR")}</span>
          <span className="lbl">TOTAL DO MÊS</span>
        </div>
      </div>

      <ul className="dash-donut-legend">
        {slices.map((cat, i) => (
          <li key={cat.categoryId ?? `legend-${i}`}>
            <span className="dot" style={{ background: cat.color }} />
            {cat.label}
            <b>{Math.round((cat.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CategoryDonut = memo(CategoryDonutBase);
