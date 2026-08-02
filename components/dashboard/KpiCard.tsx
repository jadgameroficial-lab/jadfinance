"use client";

import { useEffect, useRef, useState, memo } from "react";
import { Skeleton } from "@/components/dashboard/Skeleton";

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 220;
  const height = 34;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return [x, y] as const;
  });

  // Catmull-Rom -> smooth cubic bezier path
  function smoothPath(pts: readonly (readonly [number, number])[]) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const mx = (x0 + x1) / 2;
      d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return d;
  }

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const duration = 1400;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [active, target]);
  return value;
}

function KpiCardBase({
  label,
  value,
  delta,
  direction,
  color,
  icon,
  spark,
  flagship,
  delay,
  sheenDelay,
  loading,
}: {
  label: string;
  value: number;
  delta: string;
  direction: "up" | "down";
  color: string;
  icon: React.ReactNode;
  spark: number[];
  flagship?: boolean;
  delay?: number;
  sheenDelay?: number;
  loading?: boolean;
}) {
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

  const displayValue = useCountUp(value, visible && !loading);

  return (
    <div
      ref={ref}
      className={`dash-kpi dash-reveal ${flagship ? "dash-kpi--flagship" : ""}`}
      style={{ animationDelay: `${delay ?? 0}s` }}
    >
      <div className={`dash-metal-sheen ${flagship ? "gold" : ""}`} style={{ animationDelay: `${sheenDelay ?? 0}s` } as React.CSSProperties}>
        <div className="sweep" style={{ animationDelay: `${sheenDelay ?? 0}s` }} />
      </div>
      <div className="dash-kpi-top">
        <div className="dash-kpi-icon" style={{ background: `${color}22` }}>
          {icon}
        </div>
        {loading ? (
          <Skeleton width={52} height={18} style={{ borderRadius: 100 }} />
        ) : (
          <span className={`dash-kpi-delta ${direction}`}>{direction === "up" ? "↑" : "↓"} {delta}</span>
        )}
      </div>
      <div className="dash-kpi-label">{label}</div>
      {loading ? (
        <div style={{ margin: "6px 0 12px" }}>
          <Skeleton width={110} height={22} />
        </div>
      ) : (
        <div className="dash-kpi-value">R$ {displayValue.toLocaleString("pt-BR")}</div>
      )}
      <div className="dash-kpi-spark">
        {loading ? <Skeleton width="100%" height={34} /> : <Sparkline values={spark} color={color} />}
      </div>
    </div>
  );
}

export const KpiCard = memo(KpiCardBase);
