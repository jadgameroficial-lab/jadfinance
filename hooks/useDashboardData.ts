"use client";

import { useCallback, useEffect, useState } from "react";
import { categoriesService, type CategoryRow } from "@/services/categories.service";
import { transactionsService, type TransactionRow } from "@/services/transactions.service";

export interface DashboardKpis {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthProfit: number;
}

export interface CashflowPoint {
  /** "YYYY-MM" */
  monthKey: string;
  /** Rótulo curto para o eixo do gráfico, ex.: "Jul" */
  label: string;
  income: number;
  expense: number;
}

export interface CategorySlice {
  categoryId: string | null;
  label: string;
  value: number;
  color: string | null;
}

export interface DashboardData {
  kpis: DashboardKpis;
  cashflow: CashflowPoint[];
  categoryBreakdown: CategorySlice[];
  recentTransactions: TransactionRow[];
}

export interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MONTHS_BACK = 6;
const RECENT_TRANSACTIONS_LIMIT = 8;

/**
 * Valores aceitos como "receita" no campo `type` (que é `text` livre no
 * banco, sem CHECK/enum). AJUSTE esta lista se o restante do app padronizar
 * os valores de forma diferente (ex.: só "income"/"expense", ou só
 * "receita"/"despesa") — ver observação no relatório da Etapa 3.
 */
const INCOME_TYPES = new Set(["income", "receita", "entrada"]);

function isIncome(type: string): boolean {
  return INCOME_TYPES.has(type.trim().toLowerCase());
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const raw = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Agrega dados de accounts, categories e transactions em um único objeto
 * pronto para alimentar KPIs, gráfico de fluxo de caixa e donut de
 * categorias do dashboard. Toda a comunicação com o Supabase acontece
 * através dos services — este hook só compõe e calcula.
 */
export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const rangeStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Todas as transações do usuário, sem filtro de data: o saldo total
      // é sempre "todas as receitas menos todas as despesas", nunca um
      // valor cadastrado manualmente em uma conta.
      const [categories, transactions] = await Promise.all([
        categoriesService.list(),
        transactionsService.list(),
      ]);

      const categoryById = new Map<string, CategoryRow>(categories.map((c) => [c.id, c]));

      const totalIncome = transactions
        .filter((t) => isIncome(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = transactions
        .filter((t) => !isIncome(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalBalance = totalIncome - totalExpense;

      const monthStartIso = isoDate(monthStart);
      const monthEndIso = isoDate(monthEnd);
      const monthTx = transactions.filter(
        (t) => t.transaction_date >= monthStartIso && t.transaction_date <= monthEndIso
      );

      const monthIncome = monthTx
        .filter((t) => isIncome(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const monthExpense = monthTx
        .filter((t) => !isIncome(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const kpis: DashboardKpis = {
        totalBalance,
        monthIncome,
        monthExpense,
        monthProfit: monthIncome - monthExpense,
      };

      // Fluxo de caixa dos últimos MONTHS_BACK meses (incluindo os que não
      // têm nenhuma transação, para o gráfico não "pular" meses).
      const cashflowMap = new Map<string, { income: number; expense: number }>();
      for (let i = 0; i < MONTHS_BACK; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1) + i, 1);
        cashflowMap.set(toMonthKey(isoDate(d)), { income: 0, expense: 0 });
      }
      const rangeStartIso = isoDate(rangeStart);
      for (const t of transactions) {
        if (t.transaction_date < rangeStartIso || t.transaction_date > monthEndIso) continue;
        const bucket = cashflowMap.get(toMonthKey(t.transaction_date));
        if (!bucket) continue;
        if (isIncome(t.type)) bucket.income += Number(t.amount);
        else bucket.expense += Number(t.amount);
      }
      const cashflow: CashflowPoint[] = Array.from(cashflowMap.entries()).map(
        ([monthKey, v]) => ({
          monthKey,
          label: monthLabel(monthKey),
          income: v.income,
          expense: v.expense,
        })
      );

      // Despesas por categoria, apenas do mês atual.
      const categoryTotals = new Map<string, number>();
      for (const t of monthTx) {
        if (isIncome(t.type)) continue;
        const key = t.category_id ?? "uncategorized";
        categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + Number(t.amount));
      }
      const categoryBreakdown: CategorySlice[] = Array.from(categoryTotals.entries())
        .map(([key, value]) => {
          const cat = key === "uncategorized" ? null : categoryById.get(key) ?? null;
          return {
            categoryId: cat?.id ?? null,
            label: cat?.name ?? "Sem categoria",
            value,
            color: cat?.color ?? null,
          };
        })
        .sort((a, b) => b.value - a.value);

      const recentTransactions = [...transactions]
        .sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1))
        .slice(0, RECENT_TRANSACTIONS_LIMIT);

      setData({ kpis, cashflow, categoryBreakdown, recentTransactions });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar os dados do dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
