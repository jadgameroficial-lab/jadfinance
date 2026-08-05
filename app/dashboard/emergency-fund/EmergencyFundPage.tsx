"use client";

import { useMemo, useState } from "react";
import { useEmergencyFund } from "@/hooks/useEmergencyFund";
import type { EmergencyFundRow } from "@/services/emergencyFund.service";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { useToast } from "@/lib/toast";
import { EmergencyFundHeader } from "./components/EmergencyFundHeader";
import { EmergencyFundStats } from "./components/EmergencyFundStats";
import {
  EmergencyFundFilters,
  type EmergencyFundFilterValue,
  type EmergencyFundSortValue,
} from "./components/EmergencyFundFilters";
import { EmergencyFundCard } from "./components/EmergencyFundCard";
import { EmptyEmergencyFund } from "./components/EmptyEmergencyFund";
import { EmergencyFundFormModal } from "./components/EmergencyFundFormModal";
import { ContributionModal } from "./components/ContributionModal";
import { DeleteEmergencyFundDialog } from "./components/DeleteEmergencyFundDialog";

const EMERGENCY_FUND_GRID_STYLE = { gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" };

function progressPct(fund: EmergencyFundRow): number {
  return fund.target_amount > 0 ? Math.min(100, (fund.current_amount / fund.target_amount) * 100) : 0;
}

const PRIORITY_RANK: Record<EmergencyFundRow["priority"], number> = { alta: 0, media: 1, baixa: 2 };

/**
 * Página de Reserva de Emergência: carrega tudo via useEmergencyFund()
 * (incluindo arquivadas, para o filtro "Arquivadas" funcionar) e organiza
 * layout, filtros, ordenação e os 3 modais do módulo (form de reserva,
 * aportes, confirmação de exclusão).
 */
export function EmergencyFundPage() {
  const {
    funds,
    loading,
    error,
    createFund,
    updateFund,
    deleteFund,
    archiveFund,
    restoreFund,
    contributionsByFund,
    contributionsLoading,
    loadContributions,
    addContribution,
    updateContribution,
    deleteContribution,
  } = useEmergencyFund({ includeArchived: true });

  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<EmergencyFundRow | null>(null);
  const [contributionFund, setContributionFund] = useState<EmergencyFundRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmergencyFundRow | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EmergencyFundFilterValue>("all");
  const [sortValue, setSortValue] = useState<EmergencyFundSortValue>("created_desc");

  // Reservas arquivadas ficam fora da listagem/KPIs principais por padrão —
  // só aparecem quando o filtro "Arquivadas" está ativo.
  const activeFunds = useMemo(() => funds.filter((f) => !f.is_archived), [funds]);

  const counts = useMemo(() => {
    const c: Partial<Record<EmergencyFundFilterValue, number>> = {
      all: activeFunds.length,
      em_andamento: 0,
      concluida: 0,
      arquivada: funds.length - activeFunds.length,
    };
    for (const f of activeFunds) {
      c[f.status] = (c[f.status] ?? 0) + 1;
    }
    return c;
  }, [funds, activeFunds]);

  const filteredFunds = useMemo(() => {
    if (activeFilter === "arquivada") return funds.filter((f) => f.is_archived);
    if (activeFilter === "all") return activeFunds;
    return activeFunds.filter((f) => f.status === activeFilter);
  }, [activeFilter, funds, activeFunds]);

  const sortedFunds = useMemo(() => {
    const list = [...filteredFunds];
    switch (sortValue) {
      case "progress_desc":
        return list.sort((a, b) => progressPct(b) - progressPct(a));
      case "progress_asc":
        return list.sort((a, b) => progressPct(a) - progressPct(b));
      case "amount_desc":
        return list.sort((a, b) => b.target_amount - a.target_amount);
      case "amount_asc":
        return list.sort((a, b) => a.target_amount - b.target_amount);
      case "priority":
        return list.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
      case "created_desc":
        return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      case "created_asc":
        return list.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
      default:
        return list;
    }
  }, [filteredFunds, sortValue]);

  function handleNewFund() {
    setEditingFund(null);
    setFormOpen(true);
  }

  function handleEdit(fund: EmergencyFundRow) {
    setEditingFund(fund);
    setFormOpen(true);
  }

  function handleOpenContributions(fund: EmergencyFundRow) {
    setContributionFund(fund);
    loadContributions(fund.id);
  }

  async function handleArchiveToggle(fund: EmergencyFundRow) {
    if (archivingId) return;
    setArchivingId(fund.id);
    try {
      if (fund.is_archived) {
        await restoreFund(fund.id);
        toast.success("Reserva restaurada.");
      } else {
        await archiveFund(fund.id);
        toast.success("Reserva arquivada.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar a reserva.");
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <>
      <EmergencyFundHeader onNewFund={handleNewFund} />

      {error && (
        <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 20 }}>
          Não foi possível carregar as reservas: {error}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <EmergencyFundStats funds={activeFunds} loading={loading} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <EmergencyFundFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortValue={sortValue}
          onSortChange={setSortValue}
          counts={counts}
        />
      </div>

      {loading && funds.length === 0 && (
        <div className="dash-kpi-grid" style={EMERGENCY_FUND_GRID_STYLE}>
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

      {!loading && sortedFunds.length === 0 && (
        <EmptyEmergencyFund onNewFund={handleNewFund} filtered={funds.length > 0} />
      )}

      {sortedFunds.length > 0 && (
        <div className="dash-kpi-grid" style={EMERGENCY_FUND_GRID_STYLE}>
          {sortedFunds.map((fund) => (
            <EmergencyFundCard
              key={fund.id}
              fund={fund}
              busy={archivingId === fund.id}
              onEdit={handleEdit}
              onAddContribution={handleOpenContributions}
              onArchiveToggle={handleArchiveToggle}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <EmergencyFundFormModal
        open={formOpen}
        editing={editingFund}
        onClose={() => setFormOpen(false)}
        createFund={createFund}
        updateFund={updateFund}
      />

      <ContributionModal
        fund={contributionFund}
        contributions={contributionFund ? contributionsByFund[contributionFund.id] ?? [] : []}
        loading={contributionFund ? !!contributionsLoading[contributionFund.id] : false}
        onClose={() => setContributionFund(null)}
        addContribution={addContribution}
        updateContribution={updateContribution}
        deleteContribution={deleteContribution}
      />

      <DeleteEmergencyFundDialog fund={deleteTarget} onClose={() => setDeleteTarget(null)} deleteFund={deleteFund} />
    </>
  );
}
