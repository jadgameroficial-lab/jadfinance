"use client";

import { useCallback, useEffect, useState } from "react";
import {
  emergencyFundService,
  emergencyFundContributionsService,
  type EmergencyFundRow,
  type EmergencyFundInsert,
  type EmergencyFundUpdate,
  type EmergencyFundFilters,
  type EmergencyFundContributionRow,
  type EmergencyFundContributionInsert,
  type EmergencyFundContributionUpdate,
} from "@/services/emergencyFund.service";

export interface UseEmergencyFundResult {
  // ---- reservas ----
  funds: EmergencyFundRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createFund: (input: EmergencyFundInsert) => Promise<EmergencyFundRow>;
  updateFund: (id: string, input: EmergencyFundUpdate) => Promise<EmergencyFundRow>;
  deleteFund: (id: string) => Promise<void>;
  archiveFund: (id: string) => Promise<EmergencyFundRow>;
  restoreFund: (id: string) => Promise<EmergencyFundRow>;

  // ---- aportes ----
  /** Aportes já carregados, indexados por fund_id. */
  contributionsByFund: Record<string, EmergencyFundContributionRow[]>;
  /** Estado de carregamento por fund_id (útil para spinners individuais). */
  contributionsLoading: Record<string, boolean>;
  contributionsError: string | null;
  /** Carrega (ou recarrega) os aportes de uma reserva específica. */
  loadContributions: (fundId: string) => Promise<void>;
  addContribution: (
    input: EmergencyFundContributionInsert
  ) => Promise<EmergencyFundContributionRow>;
  updateContribution: (
    id: string,
    fundId: string,
    input: EmergencyFundContributionUpdate
  ) => Promise<EmergencyFundContributionRow>;
  deleteContribution: (id: string, fundId: string) => Promise<void>;
}

/**
 * Hook central do módulo Reserva de Emergência. Concentra estado + ações de
 * emergency_funds e emergency_fund_contributions; toda comunicação com o
 * Supabase passa por emergencyFund.service.ts — o hook nunca chama o
 * Supabase diretamente.
 *
 * target_amount / current_amount / status / completed_at nunca são
 * enviados em nenhuma chamada daqui: são recalculados pelo banco a partir
 * de monthly_expense/months_target e dos aportes.
 */
export function useEmergencyFund(
  filters?: EmergencyFundFilters
): UseEmergencyFundResult {
  const [funds, setFunds] = useState<EmergencyFundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contributionsByFund, setContributionsByFund] = useState<
    Record<string, EmergencyFundContributionRow[]>
  >({});
  const [contributionsLoading, setContributionsLoading] = useState<
    Record<string, boolean>
  >({});
  const [contributionsError, setContributionsError] = useState<string | null>(
    null
  );

  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await emergencyFundService.list(filters);
      setFunds(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar reservas de emergência."
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---- reservas: ações de escrita ----
  // Erros são relançados (não engolidos) para quem chamar decidir como
  // exibi-los (ex.: toast), seguindo o mesmo padrão dos demais módulos.

  const createFund = useCallback(
    async (input: EmergencyFundInsert) => {
      const created = await emergencyFundService.create(input);
      await refresh();
      return created;
    },
    [refresh]
  );

  const updateFund = useCallback(
    async (id: string, input: EmergencyFundUpdate) => {
      const updated = await emergencyFundService.update(id, input);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const deleteFund = useCallback(
    async (id: string) => {
      await emergencyFundService.delete(id);
      await refresh();
    },
    [refresh]
  );

  const archiveFund = useCallback(
    async (id: string) => {
      const updated = await emergencyFundService.archive(id);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const restoreFund = useCallback(
    async (id: string) => {
      const updated = await emergencyFundService.restore(id);
      await refresh();
      return updated;
    },
    [refresh]
  );

  // ---- aportes ----

  const loadContributions = useCallback(async (fundId: string) => {
    setContributionsLoading((prev) => ({ ...prev, [fundId]: true }));
    setContributionsError(null);
    try {
      const data = await emergencyFundContributionsService.listContributions(
        fundId
      );
      setContributionsByFund((prev) => ({ ...prev, [fundId]: data }));
    } catch (err) {
      setContributionsError(
        err instanceof Error ? err.message : "Erro ao carregar aportes."
      );
    } finally {
      setContributionsLoading((prev) => ({ ...prev, [fundId]: false }));
    }
  }, []);

  const addContribution = useCallback(
    async (input: EmergencyFundContributionInsert) => {
      const created = await emergencyFundContributionsService.addContribution(
        input
      );
      // O banco recalcula current_amount/status/completed_at da reserva ao
      // inserir o aporte — por isso recarregamos tanto a lista de reservas
      // quanto o histórico de aportes daquela reserva.
      await Promise.all([refresh(), loadContributions(input.fund_id)]);
      return created;
    },
    [refresh, loadContributions]
  );

  const updateContribution = useCallback(
    async (
      id: string,
      fundId: string,
      input: EmergencyFundContributionUpdate
    ) => {
      const updated = await emergencyFundContributionsService.updateContribution(
        id,
        input
      );
      await Promise.all([refresh(), loadContributions(fundId)]);
      return updated;
    },
    [refresh, loadContributions]
  );

  const deleteContribution = useCallback(
    async (id: string, fundId: string) => {
      await emergencyFundContributionsService.deleteContribution(id);
      await Promise.all([refresh(), loadContributions(fundId)]);
    },
    [refresh, loadContributions]
  );

  return {
    funds,
    loading,
    error,
    refresh,
    createFund,
    updateFund,
    deleteFund,
    archiveFund,
    restoreFund,

    contributionsByFund,
    contributionsLoading,
    contributionsError,
    loadContributions,
    addContribution,
    updateContribution,
    deleteContribution,
  };
}
