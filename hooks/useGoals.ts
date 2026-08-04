"use client";

import { useCallback, useEffect, useState } from "react";
import {
  goalsService,
  goalContributionsService,
  type GoalRow,
  type GoalInsert,
  type GoalUpdate,
  type GoalFilters,
  type GoalContributionRow,
  type GoalContributionInsert,
  type GoalContributionUpdate,
} from "@/services/goals.service";

export interface UseGoalsResult {
  // ---- metas ----
  goals: GoalRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGoal: (input: GoalInsert) => Promise<GoalRow>;
  updateGoal: (id: string, input: GoalUpdate) => Promise<GoalRow>;
  deleteGoal: (id: string) => Promise<void>;
  archiveGoal: (id: string) => Promise<GoalRow>;
  restoreGoal: (id: string) => Promise<GoalRow>;

  // ---- aportes ----
  /** Aportes já carregados, indexados por goal_id. */
  contributionsByGoal: Record<string, GoalContributionRow[]>;
  /** Estado de carregamento por goal_id (útil para spinners individuais). */
  contributionsLoading: Record<string, boolean>;
  contributionsError: string | null;
  /** Carrega (ou recarrega) os aportes de uma meta específica. */
  loadContributions: (goalId: string) => Promise<void>;
  addContribution: (input: GoalContributionInsert) => Promise<GoalContributionRow>;
  updateContribution: (
    id: string,
    goalId: string,
    input: GoalContributionUpdate
  ) => Promise<GoalContributionRow>;
  deleteContribution: (id: string, goalId: string) => Promise<void>;
}

/**
 * Hook central do módulo Metas. Concentra estado + ações de
 * financial_goals e financial_goal_contributions; toda comunicação com o
 * Supabase passa por goals.service.ts — o hook nunca chama o Supabase
 * diretamente.
 *
 * current_amount / status / completed_at nunca são enviados em nenhuma
 * chamada daqui: são recalculados pelo banco a partir dos aportes.
 */
export function useGoals(filters?: GoalFilters): UseGoalsResult {
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contributionsByGoal, setContributionsByGoal] = useState<
    Record<string, GoalContributionRow[]>
  >({});
  const [contributionsLoading, setContributionsLoading] = useState<
    Record<string, boolean>
  >({});
  const [contributionsError, setContributionsError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalsService.list(filters);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar metas.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---- metas: ações de escrita ----
  // Erros são relançados (não engolidos) para quem chamar decidir como
  // exibi-los (ex.: toast), seguindo o mesmo padrão dos demais módulos.

  const createGoal = useCallback(
    async (input: GoalInsert) => {
      const created = await goalsService.create(input);
      await refresh();
      return created;
    },
    [refresh]
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalUpdate) => {
      const updated = await goalsService.update(id, input);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      await goalsService.delete(id);
      await refresh();
    },
    [refresh]
  );

  const archiveGoal = useCallback(
    async (id: string) => {
      const updated = await goalsService.archive(id);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const restoreGoal = useCallback(
    async (id: string) => {
      const updated = await goalsService.unarchive(id);
      await refresh();
      return updated;
    },
    [refresh]
  );

  // ---- aportes ----

  const loadContributions = useCallback(async (goalId: string) => {
    setContributionsLoading((prev) => ({ ...prev, [goalId]: true }));
    setContributionsError(null);
    try {
      const data = await goalContributionsService.listByGoal(goalId);
      setContributionsByGoal((prev) => ({ ...prev, [goalId]: data }));
    } catch (err) {
      setContributionsError(
        err instanceof Error ? err.message : "Erro ao carregar aportes."
      );
    } finally {
      setContributionsLoading((prev) => ({ ...prev, [goalId]: false }));
    }
  }, []);

  const addContribution = useCallback(
    async (input: GoalContributionInsert) => {
      const created = await goalContributionsService.create(input);
      // O banco recalcula current_amount/status/completed_at da meta ao
      // inserir o aporte — por isso recarregamos tanto a lista de metas
      // quanto o histórico de aportes daquela meta.
      await Promise.all([refresh(), loadContributions(input.goal_id)]);
      return created;
    },
    [refresh, loadContributions]
  );

  const updateContribution = useCallback(
    async (id: string, goalId: string, input: GoalContributionUpdate) => {
      const updated = await goalContributionsService.update(id, input);
      await Promise.all([refresh(), loadContributions(goalId)]);
      return updated;
    },
    [refresh, loadContributions]
  );

  const deleteContribution = useCallback(
    async (id: string, goalId: string) => {
      await goalContributionsService.delete(id);
      await Promise.all([refresh(), loadContributions(goalId)]);
    },
    [refresh, loadContributions]
  );

  return {
    goals,
    loading,
    error,
    refresh,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,

    contributionsByGoal,
    contributionsLoading,
    contributionsError,
    loadContributions,
    addContribution,
    updateContribution,
    deleteContribution,
  };
}
