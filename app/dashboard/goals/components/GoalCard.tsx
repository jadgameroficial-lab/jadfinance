"use client";

import { Calendar, Clock, AlertTriangle, Pencil, PiggyBank, Archive, Trash2, Target } from "lucide-react";
import type { GoalRow } from "@/services/goals.service";
import { CardMenu } from "@/components/dashboard/CardMenu";
import { GoalProgress } from "./GoalProgress";

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

export function GoalCard({ goal }: { goal: GoalRow }) {
  const displayStatus = resolveGoalDisplayStatus(goal);
  const statusConfig = STATUS_CONFIG[displayStatus];
  const daysLeft = daysUntilDeadline(goal.deadline);
  const accentColor = goal.color ?? "var(--gold)";

  // As ações abaixo ainda não têm implementação nesta etapa — só a
  // estrutura visual. Serão conectadas a modais/drawers e às ações de
  // useGoals() (updateGoal, archiveGoal/restoreGoal, deleteGoal,
  // addContribution) em uma etapa futura.
  // TODO: abrir modal/drawer de edição da meta
  function handleEdit() {}
  // TODO: abrir modal/drawer de novo aporte
  function handleAddContribution() {}
  // TODO: chamar archiveGoal()/restoreGoal() de useGoals()
  function handleArchive() {}
  // TODO: abrir confirmação e chamar deleteGoal() de useGoals()
  function handleDelete() {}

  return (
    <div className="dash-kpi dash-goal-card dash-reveal">
      <div className="dash-goal-card-top">
        <div className="dash-goal-card-id">
          <div className="dash-tx-icon" style={{ background: `${accentColor}22`, color: accentColor }}>
            <Target size={17} strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="dash-goal-card-name">{goal.name}</div>
            <div className="dash-goal-card-category">{goal.category ?? "Sem categoria"}</div>
          </div>
        </div>

        <CardMenu
          actions={[
            { label: "Editar", icon: <Pencil size={13} strokeWidth={2} />, onClick: handleEdit },
            {
              label: goal.is_archived ? "Desarquivar" : "Arquivar",
              icon: <Archive size={13} strokeWidth={2} />,
              onClick: handleArchive,
            },
            { label: "Excluir", icon: <Trash2 size={13} strokeWidth={2} />, onClick: handleDelete, danger: true },
          ]}
        />
      </div>

      <div className="dash-goal-badges">
        <span className={`dash-status-badge ${statusConfig.badgeClass}`}>{statusConfig.label}</span>
        <span className={`dash-priority-badge ${goal.priority}`}>{PRIORITY_LABEL[goal.priority]}</span>
      </div>

      <GoalProgress current={goal.current_amount} target={goal.target_amount} color={goal.color} />

      <div className="dash-goal-meta">
        <Calendar size={13} strokeWidth={1.8} />
        <span>{goal.deadline ? formatDate(goal.deadline) : "Sem prazo definido"}</span>
      </div>

      {goal.deadline && goal.status !== "concluida" && (
        <div className="dash-goal-meta">
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

      <button type="button" className="dash-goal-add-btn" onClick={handleAddContribution}>
        <PiggyBank size={14} strokeWidth={1.8} />
        Adicionar aporte
      </button>
    </div>
  );
}
