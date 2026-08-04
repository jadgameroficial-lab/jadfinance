"use client";

import { useState } from "react";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluídas" },
  { value: "atrasada", label: "Atrasadas" },
  { value: "arquivada", label: "Arquivadas" },
] as const;

export type GoalsFilterValue = (typeof FILTERS)[number]["value"];

/**
 * Apenas a interface dos filtros por enquanto: mantém o estado do chip
 * selecionado só para feedback visual. A lógica de filtragem real — ligar
 * essa seleção à lista de metas de useGoals() — entra numa etapa futura.
 */
export function GoalsFilters() {
  const [active, setActive] = useState<GoalsFilterValue>("all");

  return (
    <div className="dash-panel dash-reveal" style={{ padding: "14px 18px", display: "flex", gap: 8, flexWrap: "wrap" }}>
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className="dash-filter-btn"
          onClick={() => setActive(filter.value)}
          style={{
            borderColor: active === filter.value ? "var(--gold)" : undefined,
            color: active === filter.value ? "var(--gold)" : undefined,
          }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
