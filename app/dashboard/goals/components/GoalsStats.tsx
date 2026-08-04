"use client";

import type { ReactNode } from "react";
import { Target, PiggyBank, TrendingUp, CalendarClock } from "lucide-react";
import type { GoalRow } from "@/services/goals.service";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { formatCurrency } from "./GoalProgress";
import { daysUntilDeadline, resolveGoalDisplayStatus } from "./GoalCard";

interface StatCard {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}

/**
 * 4 KPIs de resumo do módulo Metas, todos calculados a partir da lista de
 * metas já carregada por useGoals() — nenhuma chamada própria ao Supabase.
 */
export function GoalsStats({ goals, loading }: { goals: GoalRow[]; loading: boolean }) {
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  const closestGoal = goals
    .filter((g) => g.status !== "concluida" && g.deadline)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))[0] ?? null;
  const closestDays = closestGoal ? daysUntilDeadline(closestGoal.deadline) : null;

  const avgProgress =
    totalGoals > 0
      ? goals.reduce((sum, g) => {
          const pct = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0;
          return sum + pct;
        }, 0) / totalGoals
      : 0;

  const cards: StatCard[] = [
    {
      key: "total",
      icon: <Target size={17} strokeWidth={1.8} />,
      label: "Total de metas",
      value: String(totalGoals),
    },
    {
      key: "closest",
      icon: <CalendarClock size={17} strokeWidth={1.8} />,
      label: "Meta mais próxima do prazo",
      value: closestGoal ? closestGoal.name : "—",
      sub: closestGoal
        ? resolveGoalDisplayStatus(closestGoal) === "atrasada"
          ? `Atrasada há ${Math.abs(closestDays ?? 0)} dia(s)`
          : `Faltam ${closestDays ?? 0} dia(s)`
        : "Nenhuma meta com prazo definido",
    },
    {
      key: "saved",
      icon: <PiggyBank size={17} strokeWidth={1.8} />,
      label: "Valor acumulado",
      value: `R$ ${formatCurrency(totalSaved)}`,
    },
    {
      key: "progress",
      icon: <TrendingUp size={17} strokeWidth={1.8} />,
      label: "Progresso médio",
      value: `${avgProgress.toFixed(0)}%`,
    },
  ];

  if (loading && goals.length === 0) {
    return (
      <div className="dash-kpi-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`skel-${i}`} className="dash-kpi" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Skeleton width={36} height={36} style={{ borderRadius: 11 }} />
            <Skeleton width="50%" height={11} />
            <Skeleton width="70%" height={16} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dash-kpi-grid">
      {cards.map((card) => (
        <div key={card.key} className="dash-kpi dash-reveal">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon" style={{ background: "var(--gold-dim)", color: "var(--gold-deep)" }}>
              {card.icon}
            </div>
          </div>
          <div className="dash-kpi-label">{card.label}</div>
          <div
            className="dash-kpi-value"
            style={{ fontSize: card.key === "closest" ? 15 : 23, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            title={card.value}
          >
            {card.value}
          </div>
          {card.sub && <div style={{ fontSize: 11, color: "var(--text-ter)", marginTop: -8 }}>{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
