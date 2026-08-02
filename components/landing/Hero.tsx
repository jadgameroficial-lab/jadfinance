import { ArrowRight, Play } from "lucide-react";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="jf-hero">
      <div className="jf-orb" style={{ width: 560, height: 560, background: "var(--gold)", top: "-220px", left: "-160px", opacity: 0.06 }} />
      <div className="jf-grid" />

      <div className="container jf-hero-grid">
        <div className="jf-hero-copy">
          <div className="eyebrow jf-hero-enter" style={{ animationDelay: "0.05s" }}>
            <span className="dot" /> Controle financeiro premium
          </div>
          <h1 className="jf-hero-title jf-hero-enter" style={{ animationDelay: "0.15s" }}>
            Clareza total<br />sobre <em>cada real.</em>
          </h1>
          <p className="jf-hero-lead jf-hero-enter" style={{ animationDelay: "0.28s" }}>
            Uma plataforma para quem trata o próprio dinheiro como um ativo sério.
            Fluxo de caixa, contas e cartões em um só lugar, sem planilha e sem ruído.
          </p>
          <div className="jf-hero-actions jf-hero-enter" style={{ animationDelay: "0.4s" }}>
            <a href="/auth?panel=signup" className="btn btn-primary btn-lg">
              Começar agora <ArrowRight size={16} strokeWidth={2} />
            </a>
            <a href="#showcase" className="btn btn-outline btn-lg">
              <Play size={14} strokeWidth={2} fill="currentColor" />
              Ver o produto
            </a>
          </div>
        </div>

        <HeroVisual />
      </div>

      <div className="jf-scroll-cue">
        <span>Role</span>
        <span className="line" />
      </div>
    </section>
  );
}
