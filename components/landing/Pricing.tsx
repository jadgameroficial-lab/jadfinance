import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter", price: "Grátis", period: "",
    desc: "Para quem está começando a organizar as finanças.",
    feats: ["1 conta bancária", "Categorização básica", "1 meta financeira"],
    cta: "Começar grátis", featured: false,
  },
  {
    name: "Pro", price: "R$ 29", period: "/mês",
    desc: "Para quem já leva o próprio dinheiro a sério.",
    feats: ["Contas e cartões ilimitados", "Categorias ilimitadas", "Relatórios em PDF e Excel", "Alertas inteligentes"],
    cta: "Assinar Pro", featured: true,
  },
  {
    name: "Premium", price: "R$ 79", period: "/mês",
    desc: "Para quem quer controle total: várias contas, metas e relatórios avançados.",
    feats: ["Tudo do Pro", "Múltiplas contas e patrimônio", "Relatórios avançados e exportação completa"],
    cta: "Assinar Premium", featured: false,
  },
];

export function Pricing() {
  return (
    <section className="jf-section" id="pricing">
      <div className="container">
        <div className="jf-section-head center reveal" style={{ marginLeft: "auto", marginRight: "auto" }}>
          <span className="kicker">Planos</span>
          <h2>Um plano para cada momento da sua vida financeira.</h2>
        </div>

        <div className="jf-pricing-grid reveal">
          {PLANS.map((p) => (
            <div key={p.name} className={`jf-price-card ${p.featured ? "jf-price-card--featured jf-shimmer" : ""}`}>
              {p.featured && <span className="jf-price-badge">Mais popular</span>}
              <div className="jf-price-name">{p.name}</div>
              <div className="jf-price-val">{p.price}<span>{p.period}</span></div>
              <div className="jf-price-desc">{p.desc}</div>
              <ul className="jf-price-feats">
                {p.feats.map((f) => (
                  <li key={f}><Check size={14} strokeWidth={2.5} />{f}</li>
                ))}
              </ul>
              <a href="/auth?panel=signup" className={`btn ${p.featured ? "btn-primary" : "btn-outline"}`} style={{ width: "100%" }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
