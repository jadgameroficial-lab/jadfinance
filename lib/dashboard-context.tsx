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
   * Registra a função de refresh da página atualmente montada, para que a
   * drawer global consiga atualizar os dados certos após salvar, sem
   * precisar de uma store global de estado.
   */
  registerRefresh: (fn: (() => void) | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const refreshRef = useRef<(() => void) | null>(null);

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

  const registerRefresh = useCallback((fn: (() => void) | null) => {
    refreshRef.current = fn;
  }, []);

  const handleSaved = useCallback(() => {
    refreshRef.current?.();
  }, []);

  return (
    <DashboardContext.Provider value={{ openNewTransaction, openEditTransaction, registerRefresh }}>
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
