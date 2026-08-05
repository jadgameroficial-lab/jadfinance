"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { EmergencyFundContributionRow } from "@/services/emergencyFund.service";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { formatCurrency } from "./EmergencyFundProgress";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

/**
 * Histórico de aportes de uma reserva — mais recente primeiro (a própria
 * query do service já entrega nessa ordem). Só exibe/dispara ações; quem
 * decide o que fazer com editar/excluir é o ContributionModal, que é quem a
 * monta.
 */
export function ContributionHistory({
  contributions,
  loading,
  busyId,
  onEdit,
  onDelete,
}: {
  contributions: EmergencyFundContributionRow[];
  loading: boolean;
  /** id do aporte com uma operação em andamento (desabilita as ações dele). */
  busyId: string | null;
  onEdit: (contribution: EmergencyFundContributionRow) => void;
  onDelete: (contribution: EmergencyFundContributionRow) => void;
}) {
  if (loading && contributions.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skel-${i}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton width={32} height={32} circle />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width="40%" height={11} />
              <Skeleton width="25%" height={10} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <p style={{ fontSize: 12.5, color: "var(--text-ter)", padding: "10px 0" }}>
        Nenhum aporte registrado ainda para esta reserva.
      </p>
    );
  }

  return (
    <div>
      {contributions.map((c) => {
        const isBusy = busyId === c.id;
        return (
          <div key={c.id} className="dash-goal-contrib-item">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>
                R$ {formatCurrency(c.amount)}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-ter)", marginTop: 2 }}>
                {formatDate(c.contribution_date)}
                {c.note ? ` · ${c.note}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                className="dash-goal-contrib-action"
                onClick={() => onEdit(c)}
                disabled={isBusy}
                aria-label="Editar aporte"
              >
                <Pencil size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="dash-goal-contrib-action danger"
                onClick={() => onDelete(c)}
                disabled={isBusy}
                aria-label="Excluir aporte"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
