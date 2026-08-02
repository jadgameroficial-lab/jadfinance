import DashboardLayoutClient from "./DashboardLayoutClient";

/**
 * Todas as páginas de /dashboard/* são autenticadas e buscam os próprios
 * dados no client via Supabase, então nunca fez sentido pré-renderizá-las
 * estaticamente. Forçar renderização dinâmica aqui remove qualquer
 * dependência de regras de prerender estático do Next.js (como o erro de
 * useSearchParams fora de Suspense) para toda a área logada de uma vez.
 *
 * Importante: essa configuração só é respeitada pelo Next.js quando
 * declarada em um Server Component. Por isso este arquivo não tem
 * "use client" no topo, e toda a lógica interativa (hooks, estado, sidebar,
 * providers) foi movida para DashboardLayoutClient.tsx.
 */
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
