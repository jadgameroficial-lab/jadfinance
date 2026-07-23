"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, TrendingUp, TrendingDown, LineChart as LineChartIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { useDashboardData } from "@/hooks/useDashboardData";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CashflowChart } from "@/components/dashboard/CashflowChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { useToast } from "@/lib/toast";

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function formatPct(v: number) {
  return `${Math.abs(v).toFixed(0)}%`;
}

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = useDashboardData();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = (user?.user_metadata?.full_name as string) || user?.email || "Usuário";
  const firstName = displayName.split(" ")[0];

  async function handleLogout() {
    setLoggingOut(true);
    const result = await authService.signOut();
    if (!result.ok) {
      toast.error(result.message);
      setLoggingOut(false);
      return;
    }
    router.push("/auth");
    router.refresh();
  }

  const cashflow = data?.cashflow ?? [];
  const curr = cashflow[cashflow.length - 1];
  const prev = cashflow[cashflow.length - 2];

  const incomeDelta = curr && prev ? pctChange(curr.income, prev.income) : 0;
  const expenseDelta = curr && prev ? pctChange(curr.expense, prev.expense) : 0;
  const profitDelta = curr && prev
    ? pctChange(curr.income - curr.expense, prev.income - prev.expense)
    : 0;

  const incomeSpark = cashflow.length > 1 ? cashflow.map((c) => c.income) : [0, 0];
  const expenseSpark = cashflow.length > 1 ? cashflow.map((c) => c.expense) : [0, 0];
  const profitSpark = cashflow.length > 1 ? cashflow.map((c) => c.income - c.expense) : [0, 0];

  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>Olá, {authLoading ? "..." : firstName} 👋</h1>
          <p>Resumo financeiro atualizado em tempo real.</p>
        </div>
        <div className="dash-head-meta">
          <span className="dash-chip">Plano Pro</span>
          <span className="dash-chip"><span className="dot" />Ao vivo</span>
          <button
            className="dash-chip"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ display: "flex", alignItems: "center", gap: 6, cursor: loggingOut ? "default" : "pointer" }}
          >
            <LogOut size={12} strokeWidth={2} />
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "#f16565", fontSize: 13, marginBottom: 20 }}>
          Não foi possível carregar os dados do dashboard: {error}
        </div>
      )}

      <div className="dash-kpi-grid">
        <KpiCard
          label="Saldo total" value={loading ? 0 : Math.round(data?.kpis.totalBalance ?? 0)}
          delta={formatPct(profitDelta)} direction={profitDelta >= 0 ? "up" : "down"} color="var(--gold)"
          icon={<Wallet size={18} strokeWidth={1.8} color="var(--gold)" />}
          spark={profitSpark} flagship delay={0.05} sheenDelay={0} loading={loading}
        />
        <KpiCard
          label="Receitas" value={loading ? 0 : Math.round(data?.kpis.monthIncome ?? 0)}
          delta={formatPct(incomeDelta)} direction={incomeDelta >= 0 ? "up" : "down"} color="var(--green)"
          icon={<TrendingUp size={18} strokeWidth={1.8} color="var(--green)" />}
          spark={incomeSpark} delay={0.1} sheenDelay={0.6} loading={loading}
        />
        <KpiCard
          label="Despesas" value={loading ? 0 : Math.round(data?.kpis.monthExpense ?? 0)}
          delta={formatPct(expenseDelta)} direction={expenseDelta >= 0 ? "up" : "down"} color="var(--red)"
          icon={<TrendingDown size={18} strokeWidth={1.8} color="var(--red)" />}
          spark={expenseSpark} delay={0.15} sheenDelay={1.4} loading={loading}
        />
        <KpiCard
          label="Lucro" value={loading ? 0 : Math.round(data?.kpis.monthProfit ?? 0)}
          delta={formatPct(profitDelta)} direction={profitDelta >= 0 ? "up" : "down"} color="var(--blue)"
          icon={<LineChartIcon size={18} strokeWidth={1.8} color="var(--blue)" />}
          spark={profitSpark} delay={0.2} sheenDelay={2.2} loading={loading}
        />
      </div>

      <div className="dash-charts-row">
        <div className="dash-panel dash-reveal" style={{ animationDelay: ".1s" }}>
          <div className="dash-panel-head">
            <div>
              <h3>Fluxo de caixa</h3>
              <div className="sub">Receitas vs. despesas — últimos 6 meses</div>
            </div>
          </div>
          <CashflowChart data={cashflow} loading={loading} />
        </div>

        <div className="dash-panel dash-reveal" style={{ animationDelay: ".15s" }}>
          <div className="dash-panel-head">
            <div>
              <h3>Despesas por categoria</h3>
              <div className="sub">
                {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          <CategoryDonut data={data?.categoryBreakdown ?? []} loading={loading} />
        </div>
      </div>

      <TransactionsTable limit={6} showFooterLink title="Transações recentes" />
    </>
  );
}
