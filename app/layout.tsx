import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAD FINANCE — Controle Financeiro Premium",
  description:
    "Controle suas finanças com uma plataforma premium: fluxo de caixa em tempo real, metas, orçamentos e relatórios inteligentes. Comece grátis, sem cartão de crédito.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
