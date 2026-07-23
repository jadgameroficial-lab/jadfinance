/**
 * @deprecated Bancos: use `lib/banks.ts` (BANKS / getBankById).
 *
 * Este arquivo agora só existe para:
 *  1. Manter compatibilidade com imports antigos de BANKS/getBankBySlug
 *     (reexportados a partir de lib/banks.ts, fonte única de verdade).
 *  2. Guardar CARD_BRANDS (bandeiras de cartão: Visa, Mastercard, etc.),
 *     que é um domínio diferente de "bancos" e não faz parte deste pedido.
 */

export { BANKS, getBankById, getBankBySlug, type BankConfig } from "@/lib/banks";

export interface CardBrandConfig {
  name: string;
  slug: string;
  color: string;
  initials: string;
}

export const CARD_BRANDS: CardBrandConfig[] = [
  { name: "Visa", slug: "visa", color: "#1A1F71", initials: "VI" },
  { name: "Mastercard", slug: "mastercard", color: "#EB001B", initials: "MC" },
  { name: "Elo", slug: "elo", color: "#000000", initials: "EL" },
  { name: "American Express", slug: "amex", color: "#2E77BC", initials: "AX" },
  { name: "Hipercard", slug: "hipercard", color: "#B3131B", initials: "HC" },
  { name: "Outra", slug: "outra", color: "#5B9DF9", initials: "$" },
];

export function getCardBrandByName(name: string | null | undefined): CardBrandConfig | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return CARD_BRANDS.find((b) => b.slug === normalized || b.name.toLowerCase() === normalized);
}
