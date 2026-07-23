import {
  Wallet, CreditCard, Tags, ArrowLeftRight,
  LineChart, ShieldCheck, Smartphone, Lock,
} from "lucide-react";

const FEATURES = [
  { icon: Wallet, title: "Contas ilimitadas", text: "Corrente, poupança ou investimento. Organize quantas contas precisar, cada uma com seu próprio saldo." },
  { icon: CreditCard, title: "Cartões vinculados", text: "Associe cartões às suas contas e acompanhe limite, fechamento e vencimento em um só lugar." },
  { icon: Tags, title: "Categorias sob medida", text: "Crie categorias de receita e despesa com cor e ícone próprios, do seu jeito." },
  { icon: ArrowLeftRight, title: "Transações detalhadas", text: "Título, descrição, data e categoria formam o histórico completo de cada movimentação." },
  { icon: LineChart, title: "Fluxo de caixa real", text: "Gráficos de receita e despesa calculados a partir das suas transações, mês a mês." },
  { icon: ShieldCheck, title: "Isolamento por usuário", text: "Regras de acesso a nível de banco garantem que seus dados nunca se misturam com os de outra pessoa." },
  { icon: Lock, title: "Sessão sempre validada", text: "Cada acesso ao painel revalida sua sessão diretamente com o servidor de autenticação." },
  { icon: Smartphone, title: "Pronto para qualquer tela", text: "Desktop, tablet ou celular, o painel se adapta sem perder informação." },
];

export function Features() {
  return (
    <section className="jf-section" id="features">
      <div className="container">
        <div className="jf-section-head reveal">
          <span className="kicker">Recursos</span>
          <h2>Feito para quem leva o próprio dinheiro a sério.</h2>
        </div>

        <div className="jf-feature-grid reveal">
          {FEATURES.map((f) => (
            <div key={f.title} className="jf-feature-card">
              <div className="jf-feature-icon"><f.icon size={18} strokeWidth={1.7} /></div>
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
