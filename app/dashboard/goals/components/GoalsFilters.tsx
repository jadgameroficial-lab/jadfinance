"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";

export const GOALS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluídas" },
  { value: "atrasada", label: "Atrasadas" },
  { value: "arquivada", label: "Arquivadas" },
] as const;

export type GoalsFilterValue = (typeof GOALS_FILTERS)[number]["value"];

export const GOALS_SORT_OPTIONS = [
  { value: "progress_desc", label: "Maior progresso" },
  { value: "progress_asc", label: "Menor progresso" },
  { value: "amount_desc", label: "Maior valor" },
  { value: "amount_asc", label: "Menor valor" },
  { value: "deadline_asc", label: "Prazo mais próximo" },
  { value: "deadline_desc", label: "Prazo mais distante" },
  { value: "priority", label: "Prioridade" },
  { value: "name", label: "Nome" },
] as const;

export type GoalsSortValue = (typeof GOALS_SORT_OPTIONS)[number]["value"];

/**
 * Filtros por status (com filtragem real, ligada a GoalsPage via props) e
 * menu de ordenação da lista de metas.
 */
export function GoalsFilters({
  activeFilter,
  onFilterChange,
  sortValue,
  onSortChange,
  counts,
}: {
  activeFilter: GoalsFilterValue;
  onFilterChange: (value: GoalsFilterValue) => void;
  sortValue: GoalsSortValue;
  onSortChange: (value: GoalsSortValue) => void;
  counts?: Partial<Record<GoalsFilterValue, number>>;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onDocClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [sortOpen]);

  const currentSortLabel = GOALS_SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? "Ordenar";

  return (
    <div
      className="dash-panel dash-reveal"
      style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {GOALS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className="dash-filter-btn"
            onClick={() => onFilterChange(filter.value)}
            style={{
              borderColor: activeFilter === filter.value ? "var(--gold)" : undefined,
              color: activeFilter === filter.value ? "var(--gold)" : undefined,
            }}
          >
            {filter.label}
            {typeof counts?.[filter.value] === "number" && (
              <span style={{ opacity: 0.65, fontFamily: "var(--mono)", fontSize: 10.5 }}>{counts[filter.value]}</span>
            )}
          </button>
        ))}
      </div>

      <div ref={sortRef} className="card-menu">
        <button type="button" className="dash-filter-btn" onClick={() => setSortOpen((v) => !v)}>
          <ArrowUpDown size={14} strokeWidth={2} />
          {currentSortLabel}
        </button>

        {sortOpen && (
          <ul className="card-menu-list" role="menu">
            {GOALS_SORT_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="menuitem"
                  className="card-menu-item"
                  onClick={() => {
                    onSortChange(option.value);
                    setSortOpen(false);
                  }}
                >
                  {option.value === sortValue && <Check size={13} strokeWidth={2} />}
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
