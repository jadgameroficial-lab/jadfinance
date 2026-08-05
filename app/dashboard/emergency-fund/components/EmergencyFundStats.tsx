"use client";

import type { ReactNode } from "react";
import { ShieldCheck, PiggyBank, TrendingUp, Award } from "lucide-react";
import type { EmergencyFundRow } from "@/services/emergencyFund.service";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { formatCurrency } from "./EmergencyFundProgress";

interface StatCard {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function progressPct(fund: EmergencyFundRow): number {
  return fund.target_amount > 0 ? Math.min(100, (fund.current_amount / fund.target_amount) * 100) : 0;
}

/**
 * 4 KPIs de resumo do módulo Reserva de Emergência, todos calculados a
 * partir da lista de reservas já carregada por useEmergencyFund() — nenhuma
 * chamada própria ao Supabase.
 */
export function EmergencyFundStats({
  funds,
  loading,
}: {
  funds: EmergencyFundRow[];
  loading: boolean;
}) {
  const totalFunds = funds.length;
  const totalSaved = funds.reduce((sum, f) => sum + f.current_amount, 0);

  const closestFund = funds
    .filter((f) => f.status !== "concluida")
    .sort((a, b) => progressPct(b) - progressPct(a))[0] ?? null;

  const avgProgress =
    totalFunds > 0
      ? funds.reduce((sum, f) => sum + progressPct(f), 0) / totalFunds
      : 0;

  const cards: StatCard[] = [
    {
      key: "total",
      icon: <ShieldCheck size={17} strokeWidth={1.8} />,
      label: "Total de reservas",
      value: String(totalFunds),
    },
    {
      key: "closest",
      icon: <Award size={17} strokeWidth={1.8} />,
      label: "Reserva mais próxima da conclusão",
      value: closestFund ? closestFund.name : "—",
      sub: closestFund ? `${progressPct(closestFund).toFixed(0)}% concluída` : "Nenhuma reserva em andamento",
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

  if (loading && funds.length === 0) {
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
