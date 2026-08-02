import Image from "next/image";
import { Star } from "lucide-react";

type Persona = {
  name: string;
  role: string;
  city: string;
  time: string;
  quote: string;
  initials: string;
  tone: "gold" | "emerald" | "violet";
  /** Foto de perfil opcional. Se ausente, cai no avatar padrão (iniciais). */
  photo?: string;
};

const PERSONAS: Persona[] = [
  {
    name: "Marina Prado",
    role: "Arquiteta",
    city: "Curitiba, PR",
    time: "usando há 4 meses",
    quote: "Eu recebia por projeto e nunca sabia direito quanto tinha sobrado no mês. Separar tudo por categoria mudou completamente a forma como eu planejo o próximo contrato.",
    initials: "MP",
    tone: "gold",
  },
  {
    name: "Rafael Tenório",
    role: "Desenvolvedor autônomo",
    city: "Belo Horizonte, MG",
    time: "usando há 7 meses",
    quote: "Tinha três planilhas diferentes e nenhuma batia com a outra. Hoje eu abro o painel de manhã, vejo o saldo real e sigo o dia sem me preocupar com isso de novo.",
    initials: "RT",
    tone: "emerald",
  },
  {
    name: "Camila Duarte",
    role: "Psicóloga clínica",
    city: "Porto Alegre, RS",
    time: "usando há 2 meses",
    quote: "Cadastrar os cartões e as contas levou uns dez minutos. Depois disso o sistema faz o trabalho que eu vivia adiando: mostrar para onde o dinheiro está indo de verdade.",
    initials: "CD",
    tone: "violet",
  },
  {
    name: "Eduardo Salles",
    role: "Dentista",
    city: "Recife, PE",
    time: "usando há 5 meses",
    quote: "O consultório tem despesa fixa e despesa variável misturadas o tempo todo. Consigo filtrar por categoria e entender rapidinho onde dá para cortar sem afetar o atendimento.",
    initials: "ES",
    tone: "gold",
  },
  {
    name: "Beatriz Amaral",
    role: "Designer de produto",
    city: "Florianópolis, SC",
    time: "usando há 3 meses",
    quote: "Gosto de coisas bem feitas e isso conta muito para mim em qualquer ferramenta que uso todo dia. O painel é rápido, bonito e não me faz pensar duas vezes antes de abrir.",
    initials: "BA",
    tone: "emerald",
  },
  {
    name: "Thiago Vasconcelos",
    role: "Personal trainer",
    city: "Salvador, BA",
    time: "usando há 6 meses",
    quote: "Recebo de vários alunos em datas diferentes e por muito tempo perdi o controle disso. Agora cada recebimento entra numa categoria e eu sei exatamente o que já caiu e o que falta.",
    initials: "TV",
    tone: "violet",
  },
];

const TONE_GRADIENT: Record<Persona["tone"], string> = {
  gold: "linear-gradient(150deg, #f2d38b, #8b6b33)",
  emerald: "linear-gradient(150deg, #7fe3b4, #1f7a52)",
  violet: "linear-gradient(150deg, #c3b6ff, #6650c9)",
};

function PersonaAvatar({ initials, tone, photo, name }: { initials: string; tone: Persona["tone"]; photo?: string; name: string }) {
  if (photo) {
    return (
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Image src={photo} alt={name} fill sizes="44px" style={{ objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        borderRadius: 13,
        background: TONE_GRADIENT[tone],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        fontWeight: 600,
        color: "rgba(10,10,12,0.78)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="jf-section jf-section--tight" id="testimonials">
      <div className="container">
        <div className="jf-section-head reveal">
          <span className="kicker">Exemplos de uso</span>
          <h2>Perfis diferentes, o mesmo tipo de clareza.</h2>
          <p>
            O JAD Finance ainda está em fase inicial e esta seção mostra cenários ilustrativos
            de como o produto se encaixa no dia a dia de perfis distintos. Os avatares são
            gerados, não fotos de pessoas reais, e os textos representam exemplos de uso da
            plataforma.
          </p>
        </div>

        <div className="jf-testimonial-grid reveal">
          {PERSONAS.map((p) => (
            <div key={p.name} className="jf-testimonial-card">
              <div className="jf-testimonial-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} strokeWidth={0} fill="currentColor" />
                ))}
              </div>
              <p className="jf-testimonial-quote">{p.quote}</p>
              <div className="jf-testimonial-footer">
                <PersonaAvatar initials={p.initials} tone={p.tone} photo={p.photo} name={p.name} />
                <div>
                  <div className="jf-testimonial-name">{p.name}</div>
                  <div className="jf-testimonial-role">{p.role} · {p.city}</div>
                </div>
                <span className="jf-testimonial-time">{p.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
