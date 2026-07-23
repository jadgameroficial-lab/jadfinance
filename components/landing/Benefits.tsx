import { Layers, ShieldCheck, Gauge } from "lucide-react";

const BENEFITS = [
  {
    icon: Layers,
    title: "Tudo em uma tela",
    text: "Contas, cartões, categorias e transações organizados em um único painel, sem alternar entre planilhas ou apps soltos.",
  },
  {
    icon: Gauge,
    title: "Leitura instantânea",
    text: "Saldo, receitas, despesas e lucro calculados em tempo real, sempre a partir dos seus dados reais, nunca de médias genéricas.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados, só seus",
    text: "Cada informação é isolada por usuário no banco. Ninguém, além de você, acessa suas contas e transações.",
  },
];

export function Benefits() {
  return (
    <section className="jf-section jf-section--tight">
      <div className="container">
        <div className="jf-section-head reveal">
          <span className="kicker">Por que o JAD Finance</span>
          <h2>Menos telas, mais controle.</h2>
        </div>

        <div className="jf-benefit-grid reveal">
          {BENEFITS.map((b) => (
            <div key={b.title} className="jf-benefit-card">
              <div className="jf-benefit-icon"><b.icon size={20} strokeWidth={1.7} /></div>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
