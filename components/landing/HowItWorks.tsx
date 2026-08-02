const STEPS = [
  { num: "01", title: "Crie sua conta", text: "Cadastro em menos de um minuto, com sessão protegida desde o primeiro acesso." },
  { num: "02", title: "Adicione contas e cartões", text: "Registre suas contas e cartões reais para começar a organizar o dinheiro do jeito certo." },
  { num: "03", title: "Categorize", text: "Crie categorias com cor e ícone próprios para receitas e despesas." },
  { num: "04", title: "Acompanhe", text: "Veja saldo, fluxo de caixa e despesas por categoria atualizados a cada transação." },
];

export function HowItWorks() {
  return (
    <section className="jf-section jf-section--tight">
      <div className="container">
        <div className="jf-section-head reveal">
          <span className="kicker">Como funciona</span>
          <h2>Do cadastro ao controle total, em quatro passos.</h2>
        </div>

        <div className="jf-how-steps reveal">
          {STEPS.map((s) => (
            <div key={s.num} className="jf-how-step">
              <div className="jf-how-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
