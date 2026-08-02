"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LINKS = [
  { href: "#showcase", label: "Produto" },
  { href: "#features", label: "Recursos" },
  { href: "#pricing", label: "Planos" },
  { href: "#security", label: "Segurança" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [open]);

  return (
    <>
      <div className="jf-nav-wrap">
        <nav className={`jf-nav ${scrolled ? "scrolled" : ""}`}>
          <div className="jf-logo">
            <div className="jf-logo-mark">
              <Image src="/logo.png" alt="JAD Finance" width={28} height={28} />
            </div>
            <span className="jf-logo-word">JAD Finance</span>
          </div>

          <div className="jf-nav-links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </div>

          <div className="jf-nav-actions">
            <a href="/auth" className="btn btn-ghost">Entrar</a>
            <a href="/auth?panel=signup" className="btn btn-primary">Começar grátis</a>
          </div>

          <button
            className={`jf-nav-burger ${open ? "open" : ""}`}
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </nav>
      </div>

      <div className={`jf-nav-scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      {open && (
        <div
          style={{
            position: "fixed", top: 84, left: 20, right: 20, zIndex: 99,
            background: "rgba(12,12,14,0.96)", border: "1px solid var(--border-strong)",
            borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 4,
            backdropFilter: "blur(20px)",
          }}
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ padding: "12px 8px", fontSize: 15, color: "var(--text-secondary)" }}>
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <a href="/auth" className="btn btn-outline" style={{ flex: 1 }}>Entrar</a>
            <a href="/auth?panel=signup" className="btn btn-primary" style={{ flex: 1 }}>Criar conta</a>
          </div>
        </div>
      )}
    </>
  );
}
