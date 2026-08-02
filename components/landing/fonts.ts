import { Fraunces } from "next/font/google";

/**
 * Fraunces é usada só na Landing Page (título editorial, cinematográfico),
 * carregada via next/font diretamente aqui — não mexe no app/layout.tsx
 * nem afeta login/dashboard, que continuam só com Inter/IBM Plex Mono.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
