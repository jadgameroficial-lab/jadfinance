import { Check } from "lucide-react";

const PLAN = {
  name: "Assinatura Anual",
  price: "R$ 65,49",
  period: "/mês",
  desc: "Um único plano, com tudo que você precisa para levar suas finanças a sério.",
  feats: [
    "Contas e cartões ilimitados",
    "Categorias ilimitadas",
    "Relatórios em PDF e Excel",
    "Alertas inteligentes",
    "Múltiplas contas e patrimônio",
    "Relatórios avançados e exportação completa",
  ],
  cta: "Assinar agora",
};

export function Pricing() {
  return (
    <section className="jf-section" id="pricing">
      <div className="container">
        <div className="jf-section-head center reveal" style={{ marginLeft: "auto", marginRight: "auto" }}>
          <span className="kicker">Plano</span>
          <h2>Um único plano, sem complicação.</h2>
        </div>

        <div className="jf-pricing-grid reveal">
          <div className="jf-price-card jf-price-card--featured jf-shimmer">
            <span className="jf-price-badge">Plano único</span>
            <div className="jf-price-name">{PLAN.name}</div>
            <div className="jf-price-val">{PLAN.price}<span>{PLAN.period}</span></div>
            <div className="jf-price-desc">{PLAN.desc}</div>
            <ul className="jf-price-feats">
              {PLAN.feats.map((f) => (
                <li key={f}><Check size={14} strokeWidth={2.5} />{f}</li>
              ))}
            </ul>
            <a href="/auth?panel=signup" className="btn btn-primary" style={{ width: "100%" }}>
              {PLAN.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
