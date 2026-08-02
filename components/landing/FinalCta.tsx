import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="jf-section jf-section--tight">
      <div className="container">
        <div className="jf-final-cta reveal-scale">
          <div className="jf-final-cta-glow" />
          <h2>Comece a controlar suas finanças hoje.</h2>
          <p>Sem cartão de crédito. Cancele quando quiser.</p>
          <div className="jf-final-cta-actions">
            <a href="/auth?panel=signup" className="btn btn-primary btn-lg">
              Criar conta grátis <ArrowRight size={16} strokeWidth={2} />
            </a>
            <a href="/auth" className="btn btn-outline btn-lg">Já tenho conta</a>
          </div>
          <div className="jf-final-cta-note">// leva menos de um minuto para começar</div>
        </div>
      </div>
    </section>
  );
}
