import { ShieldCheck, KeyRound, Fingerprint, DatabaseZap } from "lucide-react";

const BADGES = [
  { icon: DatabaseZap, title: "Row Level Security", text: "Cada consulta ao banco é filtrada pelo seu usuário, diretamente no servidor, não só na tela." },
  { icon: Fingerprint, title: "Sessão sempre revalidada", text: "O painel confirma sua identidade com o servidor a cada carregamento, não só com um cookie local." },
  { icon: KeyRound, title: "Chaves com escopo mínimo", text: "O app usa apenas a chave pública do Supabase. Nenhuma credencial sensível fica no navegador." },
  { icon: ShieldCheck, title: "Rotas protegidas por middleware", text: "Quem não está autenticado nunca chega ao painel; o redirecionamento acontece antes da página carregar." },
];

export function Security() {
  return (
    <section className="jf-section jf-section--tight" id="security">
      <div className="container">
        <div className="jf-security-wrap reveal">
          <div>
            <span className="kicker" style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
              Segurança
            </span>
            <h2 style={{ fontSize: "clamp(28px, 3.2vw, 40px)", marginBottom: 16 }}>Seus dados protegidos por padrão, não por promessa.</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15.5, lineHeight: 1.7, maxWidth: 420 }}>
              Segurança não é uma seção do rodapé. É como o JAD Finance foi construído desde a primeira linha de código.
            </p>
          </div>

          <div className="jf-security-badges">
            {BADGES.map((b) => (
              <div key={b.title} className="jf-security-badge">
                <div className="jf-security-icon"><b.icon size={16} strokeWidth={1.8} /></div>
                <div>
                  <h5>{b.title}</h5>
                  <p>{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
