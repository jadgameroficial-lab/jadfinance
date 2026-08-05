"use client";

import { useMemo, useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import type { GoalRow } from "@/services/goals.service";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { useToast } from "@/lib/toast";
import { GoalsHeader } from "./components/GoalsHeader";
import { GoalsStats } from "./components/GoalsStats";
import { GoalsFilters, type GoalsFilterValue, type GoalsSortValue } from "./components/GoalsFilters";
import { GoalCard, resolveGoalDisplayStatus } from "./components/GoalCard";
import { EmptyGoals } from "./components/EmptyGoals";
import { GoalFormModal } from "./components/GoalFormModal";
import { ContributionModal } from "./components/ContributionModal";
import { DeleteGoalDialog } from "./components/DeleteGoalDialog";

const GOALS_GRID_STYLE = { gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" };

function progressPct(goal: GoalRow): number {
  return goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
}

/** Compara duas datas (ou null) para ordenação por prazo — sem prazo sempre vai para o fim da lista. */
function compareDeadline(a: string | null, b: string | null, ascending: boolean): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  if (a === b) return 0;
  const result = a < b ? -1 : 1;
  return ascending ? result : -result;
}

const PRIORITY_RANK: Record<GoalRow["priority"], number> = { alta: 0, media: 1, baixa: 2 };

/**
 * Página de Metas: carrega tudo via useGoals() (incluindo arquivadas, para
 * o filtro "Arquivadas" funcionar) e organiza layout, filtros, ordenação e
 * os 3 modais do módulo (form de meta, aportes, confirmação de exclusão).
 */
export function GoalsPage() {
  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
    contributionsByGoal,
    contributionsLoading,
    loadContributions,
    addContribution,
    updateContribution,
    deleteContribution,
  } = useGoals({ includeArchived: true });

  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null);
  const [contributionGoal, setContributionGoal] = useState<GoalRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoalRow | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<GoalsFilterValue>("all");
  const [sortValue, setSortValue] = useState<GoalsSortValue>("deadline_asc");

  // Metas arquivadas ficam fora da listagem/KPIs principais por padrão —
  // só aparecem quando o filtro "Arquivadas" está ativo.
  const activeGoals = useMemo(() => goals.filter((g) => !g.is_archived), [goals]);

  const counts = useMemo(() => {
    const c: Partial<Record<GoalsFilterValue, number>> = {
      all: activeGoals.length,
      em_andamento: 0,
      concluida: 0,
      atrasada: 0,
      arquivada: goals.length - activeGoals.length,
    };
    for (const g of activeGoals) {
      const status = resolveGoalDisplayStatus(g);
      c[status] = (c[status] ?? 0) + 1;
    }
    return c;
  }, [goals, activeGoals]);

  const filteredGoals = useMemo(() => {
    if (activeFilter === "arquivada") return goals.filter((g) => g.is_archived);
    if (activeFilter === "all") return activeGoals;
    return activeGoals.filter((g) => resolveGoalDisplayStatus(g) === activeFilter);
  }, [activeFilter, goals, activeGoals]);

  const sortedGoals = useMemo(() => {
    const list = [...filteredGoals];
    switch (sortValue) {
      case "progress_desc":
        return list.sort((a, b) => progressPct(b) - progressPct(a));
      case "progress_asc":
        return list.sort((a, b) => progressPct(a) - progressPct(b));
      case "amount_desc":
        return list.sort((a, b) => b.target_amount - a.target_amount);
      case "amount_asc":
        return list.sort((a, b) => a.target_amount - b.target_amount);
      case "deadline_asc":
        return list.sort((a, b) => compareDeadline(a.deadline, b.deadline, true));
      case "deadline_desc":
        return list.sort((a, b) => compareDeadline(a.deadline, b.deadline, false));
      case "priority":
        return list.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      default:
        return list;
    }
  }, [filteredGoals, sortValue]);

  function handleNewGoal() {
    setEditingGoal(null);
    setFormOpen(true);
  }

  function handleEdit(goal: GoalRow) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  function handleOpenContributions(goal: GoalRow) {
    setContributionGoal(goal);
    loadContributions(goal.id);
  }

  async function handleArchiveToggle(goal: GoalRow) {
    if (archivingId) return;
    setArchivingId(goal.id);
    try {
      if (goal.is_archived) {
        await restoreGoal(goal.id);
        toast.success("Meta restaurada.");
      } else {
        await archiveGoal(goal.id);
        toast.success("Meta arquivada.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar a meta.");
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <>
      <GoalsHeader onNewGoal={handleNewGoal} />

      {error && (
        <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 20 }}>
          Não foi possível carregar as metas: {error}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <GoalsStats goals={activeGoals} loading={loading} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <GoalsFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortValue={sortValue}
          onSortChange={setSortValue}
          counts={counts}
        />
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

      {!loading && sortedGoals.length === 0 && <EmptyGoals onNewGoal={handleNewGoal} filtered={goals.length > 0} />}

      {sortedGoals.length > 0 && (
        <div className="dash-kpi-grid" style={GOALS_GRID_STYLE}>
          {sortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              busy={archivingId === goal.id}
              onEdit={handleEdit}
              onAddContribution={handleOpenContributions}
              onArchiveToggle={handleArchiveToggle}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <GoalFormModal
        open={formOpen}
        editing={editingGoal}
        onClose={() => setFormOpen(false)}
        createGoal={createGoal}
        updateGoal={updateGoal}
      />

      <ContributionModal
        goal={contributionGoal}
        contributions={contributionGoal ? contributionsByGoal[contributionGoal.id] ?? [] : []}
        loading={contributionGoal ? !!contributionsLoading[contributionGoal.id] : false}
        onClose={() => setContributionGoal(null)}
        addContribution={addContribution}
        updateContribution={updateContribution}
        deleteContribution={deleteContribution}
      />

      <DeleteGoalDialog goal={deleteTarget} onClose={() => setDeleteTarget(null)} deleteGoal={deleteGoal} />
    </>
  );
}
