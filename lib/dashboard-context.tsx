"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { TransactionRow } from "@/services/transactions.service";

// Carregada sob demanda: a drawer só entra no bundle quando alguém realmente
// abre o formulário de transação, não no carregamento inicial do dashboard.
const NewTransactionDrawer = dynamic(
  () => import("@/components/dashboard/NewTransactionDrawer").then((m) => m.NewTransactionDrawer),
  { ssr: false }
);

interface DashboardContextValue {
  /** Abre a drawer para criar uma nova transação. */
  openNewTransaction: () => void;
  /** Abre a drawer já preenchida para editar a transação informada. */
  openEditTransaction: (tx: TransactionRow) => void;
  /**
   * Registra uma função de refresh de um painel atualmente montado (tabela
   * de transações, KPIs do dashboard, gráfico de categorias etc.), para que
   * a drawer global consiga atualizar todos os dados certos após salvar,
   * sem precisar de uma store global de estado.
   *
   * Vários painéis podem estar montados ao mesmo tempo (ex.: a página do
   * Dashboard tem KPIs + gráficos + tabela, todos derivados de fontes de
   * dados diferentes), então cada chamada é somada às demais em vez de
   * substituir a anterior. Retorna uma função para cancelar o registro
   * (usar no cleanup do useEffect).
   */
  registerRefresh: (fn: () => void) => () => void;
  /**
   * Dispara todos os painéis registrados (KPIs, gráficos, tabela) a se
   * atualizarem. Usado após qualquer criação, edição ou exclusão de
   * transação, inclusive as que não passam pela drawer (ex.: exclusão
   * direta na tabela).
   */
  refreshAll: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const refreshFnsRef = useRef<Set<() => void>>(new Set());

  const openNewTransaction = useCallback(() => {
    setEditing(null);
    setEverOpened(true);
    setOpen(true);
  }, []);

  const openEditTransaction = useCallback((tx: TransactionRow) => {
    setEditing(tx);
    setEverOpened(true);
    setOpen(true);
  }, []);

  const registerRefresh = useCallback((fn: () => void) => {
    refreshFnsRef.current.add(fn);
    return () => {
      refreshFnsRef.current.delete(fn);
    };
  }, []);

  const handleSaved = useCallback(() => {
    refreshFnsRef.current.forEach((fn) => fn());
  }, []);

  return (
    <DashboardContext.Provider
      value={{ openNewTransaction, openEditTransaction, registerRefresh, refreshAll: handleSaved }}
    >
      {children}
      {everOpened && (
        <NewTransactionDrawer
          open={open}
          editing={editing}
          onClose={() => setOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext precisa ser usado dentro de um DashboardProvider.");
  return ctx;
}
