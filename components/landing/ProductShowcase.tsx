"use client";

import { useEffect, useRef } from "react";
import {
  LayoutGrid, ArrowLeftRight, CreditCard, Target, FileBarChart,
} from "lucide-react";

const SIDE_ITEMS = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: ArrowLeftRight, label: "Transações" },
  { icon: CreditCard, label: "Cartões" },
  { icon: Target, label: "Metas" },
  { icon: FileBarChart, label: "Relatórios" },
];

export function ProductShowcase() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        const rotate = 6 - progress * 6; // 6deg -> 0deg as it enters view
        const translate = 30 - progress * 30;
        frame.style.transform = `perspective(1400px) rotateX(${rotate}deg) translateY(${translate}px)`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="jf-section" id="showcase">
      <div className="container">
        <div className="jf-section-head reveal">
          <span className="kicker">Produto</span>
          <h2>Um painel que parece feito sob medida.</h2>
          <p>Cada número no lugar certo, calculado a partir das suas próprias contas e transações.</p>
        </div>

        <div className="jf-showcase-stage reveal-scale">
          <div className="jf-showcase-frame" ref={frameRef}>
            <div className="jf-showcase-reflection" />
            <div className="jf-showcase-topbar">
              <span /><span /><span />
            </div>
            <div className="jf-showcase-body">
              <div className="jf-s-side">
                {SIDE_ITEMS.map((item) => (
                  <div key={item.label} className={`jf-s-item ${item.active ? "active" : ""}`}>
                    <item.icon size={15} strokeWidth={1.8} />
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="jf-s-main">
                <div className="jf-s-kpis">
                  <div className="jf-s-kpi"><div className="lbl">SALDO TOTAL</div><div className="val">R$ 84.210</div></div>
                  <div className="jf-s-kpi"><div className="lbl">RECEITAS</div><div className="val" style={{ color: "var(--emerald)" }}>R$ 22.400</div></div>
                  <div className="jf-s-kpi"><div className="lbl">DESPESAS</div><div className="val">R$ 9.860</div></div>
                  <div className="jf-s-kpi"><div className="lbl">LUCRO</div><div className="val" style={{ color: "var(--gold)" }}>R$ 12.540</div></div>
                </div>
                <div className="jf-s-panels">
                  <div className="jf-s-panel">
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>Fluxo mensal</div>
                    <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="none">
                      <polyline points="0,110 40,90 80,100 120,60 160,75 200,30 240,50 300,20" fill="none" stroke="#E8C46A" strokeWidth="2.5" />
                      <polyline points="0,110 40,90 80,100 120,60 160,75 200,30 240,50 300,20 300,140 0,140" fill="url(#showcaseGrad)" stroke="none" />
                      <defs>
                        <linearGradient id="showcaseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E8C46A" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#E8C46A" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="jf-s-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="140" height="140" viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#1b1c21" strokeWidth="6" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#9C8CFF" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="25" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#E8C46A" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="-15" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#3ECF8E" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-45" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="jf-showcase-caption">
            <p>// dados ilustrativos para fins de demonstração</p>
          </div>
        </div>
      </div>
    </section>
  );
}
