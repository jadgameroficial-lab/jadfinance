"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "Preciso conectar minha conta bancária automaticamente?",
    a: "Não. Você cadastra suas contas e cartões manualmente, no seu ritmo, e registra as transações à medida que elas acontecem. Não exigimos nenhuma integração bancária para você começar a usar o produto.",
  },
  {
    q: "Meus dados financeiros ficam visíveis para outras pessoas?",
    a: "Não. Cada conta, cartão, categoria e transação pertence exclusivamente ao usuário que a criou. As regras de acesso são aplicadas diretamente no banco de dados, então nem mesmo uma falha na interface exporia informações de outra pessoa.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não existe fidelidade nem multa de cancelamento. Você pode encerrar a assinatura a qualquer momento diretamente nas configurações da conta.",
  },
  {
    q: "O plano gratuito tem prazo de validade?",
    a: "Não. O plano Starter é gratuito por tempo indeterminado, com os limites descritos na seção de planos. Você faz upgrade quando sentir necessidade, não porque um período de teste está acabando.",
  },
  {
    q: "Consigo exportar meus dados?",
    a: "Sim. Os planos pagos incluem exportação de relatórios em PDF e Excel, para você usar seus próprios dados fora da plataforma sempre que precisar.",
  },
  {
    q: "O sistema funciona bem no celular?",
    a: "Sim. O painel foi construído para se adaptar a qualquer tamanho de tela, do desktop ao celular, mantendo os mesmos recursos e a mesma qualidade de leitura dos números.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="jf-section jf-section--tight" id="faq">
      <div className="container">
        <div className="jf-section-head reveal">
          <span className="kicker">Perguntas frequentes</span>
          <h2>O que costumam perguntar antes de começar.</h2>
        </div>

        <div className="jf-faq-list reveal">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q} className={`jf-faq-item ${open ? "open" : ""}`}>
                <button
                  type="button"
                  className="jf-faq-question"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                >
                  <span>{item.q}</span>
                  <Plus size={16} strokeWidth={2} className="jf-faq-icon" />
                </button>
                <div className="jf-faq-answer" style={{ maxHeight: open ? 240 : 0 }}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
