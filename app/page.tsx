"use client";

import { useEffect } from "react";
import "./landing.css";
import { fraunces } from "@/components/landing/fonts";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Benefits } from "@/components/landing/Benefits";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Security } from "@/components/landing/Security";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

/**
 * Landing page pública ("/"), com o redesign completo da Etapa 1.
 * Login, Dashboard, Supabase e demais telas não são afetados: este arquivo
 * e `components/landing/*` são a única superfície alterada.
 */
export default function LandingPage() {
  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll(".reveal, .reveal-scale"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={`jf ${fraunces.variable}`}>
      <svg className="jf-noise" width="100%" height="100%">
        <filter id="jfNoiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#jfNoiseFilter)" />
      </svg>
      <div className="jf-grid" />

      <Nav />
      <Hero />
      <TrustBar />
      <Benefits />
      <ProductShowcase />
      <Features />
      <HowItWorks />
      <Security />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCta />
      <Footer />
    </div>
  );
}
