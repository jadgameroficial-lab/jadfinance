"use client";

import type { ReactNode } from "react";

export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="dash-panel dash-reveal" style={{ textAlign: "center", padding: "64px 24px" }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
            background: "var(--gold-dim)", color: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <h3 style={{ fontFamily: "var(--display)", fontSize: 17, marginBottom: 8 }}>Em construção</h3>
        <p style={{ fontSize: 13.5, color: "var(--text-ter)", maxWidth: 380, margin: "0 auto" }}>
          Esta área ainda não tem uma tabela dedicada no banco de dados. Assim que a modelagem for definida,
          ela será conectada ao Supabase como o resto do app — sem dados fictícios.
        </p>
      </div>
    </>
  );
}
