/**
 * Configuração central de bancos.
 *
 * Fonte única de verdade para: nome exibido, caminho do logo (SVG em
 * /public/banks) e cor de marca (usada em detalhes de UI como o fundo
 * atrás do logo, bordas de destaque, etc).
 *
 * Toda a aplicação (cards de conta, select "Nova conta", badges, etc.)
 * deve importar BANKS / getBankById a partir daqui — nunca duplicar essa
 * lista em outro arquivo.
 *
 * ---------------------------------------------------------------------
 * SOBRE OS ARQUIVOS SVG (leia antes de trocar os logos)
 * ---------------------------------------------------------------------
 * Os arquivos em /public/banks/*.svg que acompanham este setup são
 * ilustrações genéricas (monograma + cor da marca), não os logotipos
 * oficiais dos bancos — não temos permissão para reproduzir marcas
 * registradas de terceiros automaticamente. A estrutura, porém, já está
 * 100% pronta para os logos reais:
 *
 *   1. Obtenha o SVG oficial do banco (normalmente disponível na página
 *      de imprensa/brandbook do próprio banco, ex: "nubank brand assets").
 *   2. Salve o arquivo em /public/banks/<svg> usando exatamente o nome
 *      já referenciado no campo `svg` abaixo (ex: nubank.svg).
 *   3. Pronto — o componente <BankLogo /> carrega o arquivo automaticamente,
 *      sem nenhuma mudança de código.
 *
 * Se um arquivo não existir ou falhar ao carregar, <BankLogo /> cai
 * automaticamente para o ícone Landmark (lucide-react).
 */

export interface BankConfig {
  /** Identificador estável, salvo em accounts.icon. */
  id: string;
  /** Nome exibido ao usuário. */
  name: string;
  /** Caminho público do SVG (em /public). */
  svg: string;
  /** Cor principal da marca, usada em detalhes de UI. */
  color: string;
}

export const BANKS: BankConfig[] = [
  { id: "nubank", name: "Nubank", svg: "/banks/nubank.svg", color: "#820AD1" },
  { id: "itau", name: "Itaú", svg: "/banks/itau.svg", color: "#EC7000" },
  { id: "banco-do-brasil", name: "Banco do Brasil", svg: "/banks/banco-do-brasil.svg", color: "#F8DE00" },
  { id: "bradesco", name: "Bradesco", svg: "/banks/bradesco.svg", color: "#CC092F" },
  { id: "santander", name: "Santander", svg: "/banks/santander.svg", color: "#EC0000" },
  { id: "caixa", name: "Caixa Econômica Federal", svg: "/banks/caixa.svg", color: "#0070AE" },
  { id: "inter", name: "Inter", svg: "/banks/inter.svg", color: "#FF7A00" },
  { id: "c6", name: "C6 Bank", svg: "/banks/c6.svg", color: "#1B1B1B" },
  { id: "picpay", name: "PicPay", svg: "/banks/picpay.svg", color: "#21C25E" },
  { id: "mercado-pago", name: "Mercado Pago", svg: "/banks/mercado-pago.svg", color: "#00A9E0" },
  { id: "neon", name: "Neon", svg: "/banks/neon.svg", color: "#00F5C4" },
  { id: "btg", name: "BTG Pactual", svg: "/banks/btg.svg", color: "#0B2033" },
  { id: "xp", name: "XP Investimentos", svg: "/banks/xp.svg", color: "#000000" },
  { id: "sicredi", name: "Sicredi", svg: "/banks/sicredi.svg", color: "#6DB33F" },
  { id: "sicoob", name: "Sicoob", svg: "/banks/sicoob.svg", color: "#00A651" },
  { id: "pagbank", name: "PagBank", svg: "/banks/pagbank.svg", color: "#00C650" },
  { id: "next", name: "Next", svg: "/banks/next.svg", color: "#00FF9B" },
  { id: "original", name: "Banco Original", svg: "/banks/original.svg", color: "#00524C" },
  { id: "outro", name: "Outro", svg: "/banks/outro.svg", color: "#E8C46A" },
];

/**
 * Compatibilidade com registros já salvos antes desta refatoração
 * (a versão anterior usava slugs abreviados para alguns bancos).
 */
const LEGACY_ID_ALIASES: Record<string, string> = {
  bb: "banco-do-brasil",
  mercadopago: "mercado-pago",
};

export function getBankById(id: string | null | undefined): BankConfig | undefined {
  if (!id) return undefined;
  const normalized = LEGACY_ID_ALIASES[id] ?? id;
  return BANKS.find((b) => b.id === normalized);
}

/** Alias mantido para compatibilidade com o código existente. */
export const getBankBySlug = getBankById;
