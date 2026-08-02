const WORDS = ["Segurança", "Clareza", "Privacidade", "Performance", "Simplicidade", "Confiabilidade", "Precisão", "Transparência"];

export function TrustBar() {
  return (
    <section className="jf-trust">
      <div className="container">
        <div className="jf-trust-head reveal">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-tertiary)", letterSpacing: "0.04em" }}>
            Construído sobre uma base de segurança de nível bancário, com dados isolados por usuário e sessão validada em cada requisição.
          </p>
        </div>
      </div>

      <div className="jf-marquee">
        <div className="jf-marquee-track">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={`${w}-${i}`} className="jf-marquee-item">{w}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
