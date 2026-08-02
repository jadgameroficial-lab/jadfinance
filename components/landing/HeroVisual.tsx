"use client";

import { useEffect, useRef } from "react";
import { Wallet } from "lucide-react";

/**
 * Cartão suspenso com borda de luz dourada. Reaparece na seção de
 * demonstração do produto e no plano em destaque, como fio condutor visual.
 */
export function HeroVisual() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    function onMouseMove(e: MouseEvent) {
      const { innerWidth, innerHeight } = window;
      const px = (e.clientX / innerWidth - 0.5) * 2; // -1..1
      const py = (e.clientY / innerHeight - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        stage?.style.setProperty("--mx", `${px * 14}px`);
        stage?.style.setProperty("--my", `${py * 10}px`);
      });
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="jf-hero-visual">
      <div className="jf-hero-glow" />
      <div className="jf-hero-dash-ghost" />
      <div
        ref={stageRef}
        className="jf-hero-stage"
        style={{ transform: "translate(var(--mx, 0), var(--my, 0))", transition: "transform 0.3s var(--ease)" }}
      >
        <div className="jf-hcard jf-hcard--main jf-float jf-shimmer">
          <div className="jf-hcard-label">Saldo total</div>
          <div className="jf-hcard-value gold">R$ 84.210</div>
          <svg className="jf-hcard-spark" width="100%" height="36" viewBox="0 0 240 36" preserveAspectRatio="none">
            <polyline points="0,28 30,22 60,26 90,14 120,18 150,7 180,12 210,4 240,9" fill="none" stroke="#E8C46A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="jf-hcard jf-hcard--mini jf-float" style={{ animationDelay: "1.2s" }}>
          <div className="jf-hcard-label">Receitas</div>
          <div className="jf-hcard-value">R$ 22.400</div>
          <div className="jf-hcard-sub">↑ 12% este mês</div>
        </div>

        <div className="jf-hcard jf-hcard--chip jf-float" style={{ animationDelay: "2.4s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wallet size={22} strokeWidth={1.5} color="#E8C46A" />
        </div>
      </div>
    </div>
  );
}
