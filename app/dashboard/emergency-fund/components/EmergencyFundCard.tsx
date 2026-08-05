"use client";

import {
  Wallet,
  Pencil,
  PiggyBank,
  Archive,
  ArchiveRestore,
  Trash2,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import type { EmergencyFundRow } from "@/services/emergencyFund.service";
import { CardMenu } from "@/components/dashboard/CardMenu";
import { EmergencyFundProgress, formatCurrency } from "./EmergencyFundProgress";
import { EMERGENCY_FUND_ICON_MAP } from "./EmergencyFundFormModal";

const PRIORITY_LABEL: Record<EmergencyFundRow["priority"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const STATUS_CONFIG: Record<
  EmergencyFundRow["status"],
  { label: string; badgeClass: string }
> = {
  em_andamento: { label: "Em andamento", badgeClass: "pending" },
  concluida: { label: "Concluída", badgeClass: "ok" },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** Dias desde a criação da reserva (created_at), usado como metadado do card. */
function daysSinceCreation(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / 86_400_000));
}

export function EmergencyFundCard({
  fund,
  busy,
  onEdit,
  onAddContribution,
  onArchiveToggle,
  onDelete,
}: {
  fund: EmergencyFundRow;
  /** true enquanto uma ação (ex.: arquivar) está em andamento para esta reserva. */
  busy?: boolean;
  onEdit: (fund: EmergencyFundRow) => void;
  onAddContribution: (fund: EmergencyFundRow) => void;
  onArchiveToggle: (fund: EmergencyFundRow) => void;
  onDelete: (fund: EmergencyFundRow) => void;
}) {
  const statusConfig = STATUS_CONFIG[fund.status];
  const accentColor = fund.color ?? "var(--gold)";
  const Icon = EMERGENCY_FUND_ICON_MAP[fund.icon ?? ""] ?? EMERGENCY_FUND_ICON_MAP["shield-check"];
  const remaining = Math.max(0, fund.target_amount - fund.current_amount);
  const isConcluded = fund.status === "concluida";

  return (
    <div
      className="dash-kpi dash-goal-card dash-reveal"
      style={busy ? { opacity: 0.55, pointerEvents: "none" } : undefined}
    >
      <div className="dash-goal-card-top">
        <div className="dash-goal-card-id">
          <div className="dash-tx-icon" style={{ background: `${accentColor}22`, color: accentColor }}>
            <Icon size={17} strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="dash-goal-card-name">{fund.name}</div>
            <div className="dash-goal-card-category">{fund.description ?? "Sem descrição"}</div>
          </div>
        </div>

        <CardMenu
          actions={[
            { label: "Editar", icon: <Pencil size={13} strokeWidth={2} />, onClick: () => onEdit(fund) },
            {
              label: fund.is_archived ? "Restaurar" : "Arquivar",
              icon: fund.is_archived ? <ArchiveRestore size={13} strokeWidth={2} /> : <Archive size={13} strokeWidth={2} />,
              onClick: () => onArchiveToggle(fund),
            },
            { label: "Excluir", icon: <Trash2 size={13} strokeWidth={2} />, onClick: () => onDelete(fund), danger: true },
          ]}
        />
      </div>

      <div className="dash-goal-badges">
        <span className={`dash-status-badge ${statusConfig.badgeClass}`}>{statusConfig.label}</span>
        <span className={`dash-priority-badge ${fund.priority}`}>{PRIORITY_LABEL[fund.priority]}</span>
        {fund.is_archived && <span className="dash-status-badge neutral">Arquivada</span>}
      </div>

      <EmergencyFundProgress current={fund.current_amount} target={fund.target_amount} color={fund.color} />

      {isConcluded ? (
        <div className="dash-goal-seal">
          <CheckCircle2 size={13} strokeWidth={2} />
          Reserva concluída{fund.completed_at ? ` em ${formatDate(fund.completed_at.slice(0, 10))}` : ""}
        </div>
      ) : (
        <div className="dash-goal-meta">
          <PiggyBank size={13} strokeWidth={1.8} />
          <span>Faltam R$ {formatCurrency(remaining)}</span>
        </div>
      )}

      <div className="dash-goal-meta">
        <Wallet size={13} strokeWidth={1.8} />
        <span>
          Despesa mensal R$ {formatCurrency(fund.monthly_expense)} · {fund.months_target}{" "}
          {fund.months_target === 1 ? "mês" : "meses"}
        </span>
      </div>

      <div className="dash-goal-meta">
        <CalendarDays size={13} strokeWidth={1.8} />
        <span>Criada há {daysSinceCreation(fund.created_at)} dia(s)</span>
      </div>

      <button type="button" className="dash-goal-add-btn" onClick={() => onAddContribution(fund)}>
        <PiggyBank size={14} strokeWidth={1.8} />
        Adicionar aporte
      </button>
    </div>
  );
}
