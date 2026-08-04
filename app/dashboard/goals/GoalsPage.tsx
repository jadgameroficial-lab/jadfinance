"use client";

import { useGoals } from "@/hooks/useGoals";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { GoalsHeader } from "./components/GoalsHeader";
import { GoalsStats } from "./components/GoalsStats";
import { GoalsFilters } from "./components/GoalsFilters";
import { GoalCard } from "./components/GoalCard";
import { EmptyGoals } from "./components/EmptyGoals";

const GOALS_GRID_STYLE = { gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" };

/**
 * Página de Metas: carrega os dados via useGoals() e organiza o layout
 * (header, KPIs, filtros, lista/estado vazio). Toda a lógica de dados vive
 * no hook — este componente só orquestra o que já vem pronto dele.
 */
export function GoalsPage() {
  const { goals, loading, error } = useGoals();

  return (
    <>
      <GoalsHeader />

      {error && (
        <div style={{ color: "#D6483D", fontSize: 13, marginBottom: 20 }}>
          Não foi possível carregar as metas: {error}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <GoalsStats goals={goals} loading={loading} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <GoalsFilters />
      </div>

      {loading && goals.length === 0 && (
        <div className="dash-kpi-grid" style={GOALS_GRID_STYLE}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="dash-kpi" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton width={36} height={36} style={{ borderRadius: 11 }} />
              <Skeleton width="60%" height={12} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 100 }} />
              <Skeleton width="80%" height={12} />
            </div>
          ))}
        </div>
      )}

      {!loading && goals.length === 0 && <EmptyGoals />}

      {goals.length > 0 && (
        <div className="dash-kpi-grid" style={GOALS_GRID_STYLE}>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </>
  );
}
