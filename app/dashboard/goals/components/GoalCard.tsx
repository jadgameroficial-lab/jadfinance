"use client";

import { Calendar, Clock, AlertTriangle, Pencil, PiggyBank, Archive, ArchiveRestore, Trash2, CheckCircle2 } from "lucide-react";
import type { GoalRow } from "@/services/goals.service";
import { CardMenu } from "@/components/dashboard/CardMenu";
import { GoalProgress, formatCurrency } from "./GoalProgress";
import { GOAL_ICON_MAP } from "./GoalFormModal";

export type GoalDisplayStatus = "em_andamento" | "concluida" | "atrasada";

const PRIORITY_LABEL: Record<GoalRow["priority"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const STATUS_CONFIG: Record<GoalDisplayStatus, { label: string; badgeClass: string }> = {
  em_andamento: { label: "Em andamento", badgeClass: "pending" },
  concluida: { label: "Concluída", badgeClass: "ok" },
  atrasada: { label: "Atrasada", badgeClass: "danger" },
};

/** Meta a partir da qual os "dias restantes" passam a ser destacados como urgentes. */
const URGENT_THRESHOLD_DAYS = 30;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

/**
 * O banco (financial_goals.status) só conhece "em_andamento" e "concluida"
 * — "atrasada" não é persistida de propósito (não há job para recalcular
 * isso todo dia). Por isso a UI deriva esse terceiro estado aqui, em tempo
 * de exibição, comparando deadline com a data atual. Nunca é gravado no banco.
 */
export function resolveGoalDisplayStatus(goal: GoalRow): GoalDisplayStatus {
  if (goal.status === "concluida") return "concluida";
  if (goal.deadline && goal.deadline < todayIso()) return "atrasada";
  return "em_andamento";
}

/** Diferença em dias entre hoje e o prazo (negativo quando já passou). */
export function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const today = new Date(`${todayIso()}T00:00:00`);
  const target = new Date(`${deadline}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function GoalCard({
  goal,
  busy,
  onEdit,
  onAddContribution,
  onArchiveToggle,
  onDelete,
}: {
  goal: GoalRow;
  /** true enquanto uma ação (ex.: arquivar) está em andamento para esta meta. */
  busy?: boolean;
  onEdit: (goal: GoalRow) => void;
  onAddContribution: (goal: GoalRow) => void;
  onArchiveToggle: (goal: GoalRow) => void;
  onDelete: (goal: GoalRow) => void;
}) {
  const displayStatus = resolveGoalDisplayStatus(goal);
  const statusConfig = STATUS_CONFIG[displayStatus];
  const daysLeft = daysUntilDeadline(goal.deadline);
  const accentColor = goal.color ?? "var(--gold)";
  const Icon = GOAL_ICON_MAP[goal.icon ?? ""] ?? GOAL_ICON_MAP.target;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const isConcluded = goal.status === "concluida";
  const isUrgent = displayStatus === "em_andamento" && daysLeft !== null && daysLeft >= 0 && daysLeft < URGENT_THRESHOLD_DAYS;

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
            <div className="dash-goal-card-name">{goal.name}</div>
            <div className="dash-goal-card-category">{goal.category ?? "Sem categoria"}</div>
          </div>
        </div>

        <CardMenu
          actions={[
            { label: "Editar", icon: <Pencil size={13} strokeWidth={2} />, onClick: () => onEdit(goal) },
            {
              label: goal.is_archived ? "Restaurar" : "Arquivar",
              icon: goal.is_archived ? <ArchiveRestore size={13} strokeWidth={2} /> : <Archive size={13} strokeWidth={2} />,
              onClick: () => onArchiveToggle(goal),
            },
            { label: "Excluir", icon: <Trash2 size={13} strokeWidth={2} />, onClick: () => onDelete(goal), danger: true },
          ]}
        />
      </div>

      <div className="dash-goal-badges">
        <span className={`dash-status-badge ${statusConfig.badgeClass}`}>{statusConfig.label}</span>
        <span className={`dash-priority-badge ${goal.priority}`}>{PRIORITY_LABEL[goal.priority]}</span>
        {goal.is_archived && <span className="dash-status-badge neutral">Arquivada</span>}
      </div>

      <GoalProgress current={goal.current_amount} target={goal.target_amount} color={goal.color} />

      {isConcluded ? (
        <div className="dash-goal-seal">
          <CheckCircle2 size={13} strokeWidth={2} />
          Meta concluída{goal.completed_at ? ` em ${formatDate(goal.completed_at.slice(0, 10))}` : ""}
        </div>
      ) : (
        <div className="dash-goal-meta">
          <PiggyBank size={13} strokeWidth={1.8} />
          <span>Faltam R$ {formatCurrency(remaining)}</span>
        </div>
      )}

      <div className="dash-goal-meta">
        <Calendar size={13} strokeWidth={1.8} />
        <span>{goal.deadline ? formatDate(goal.deadline) : "Sem prazo definido"}</span>
      </div>

      {goal.deadline && !isConcluded && (
        <div className={`dash-goal-meta${isUrgent || displayStatus === "atrasada" ? " dash-goal-urgent" : ""}`}>
          {displayStatus === "atrasada" ? (
            <AlertTriangle size={13} strokeWidth={1.8} />
          ) : (
            <Clock size={13} strokeWidth={1.8} />
          )}
          <span>
            {displayStatus === "atrasada"
              ? `Atrasada há ${Math.abs(daysLeft ?? 0)} dia(s)`
              : `Faltam ${daysLeft ?? 0} dia(s)`}
          </span>
        </div>
      )}

      <button type="button" className="dash-goal-add-btn" onClick={() => onAddContribution(goal)}>
        <PiggyBank size={14} strokeWidth={1.8} />
        Adicionar aporte
      </button>
    </div>
  );
}
