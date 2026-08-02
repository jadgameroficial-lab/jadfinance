"use client";

import { useCallback, useEffect, useState } from "react";
import {
  accountsService,
  type AccountRow,
  type AccountFilters,
} from "@/services/accounts.service";

export interface UseAccountsResult {
  accounts: AccountRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Carrega as contas do usuário autenticado através do accounts.service.
 * Componentes nunca devem chamar o Supabase diretamente — sempre via hook.
 */
export function useAccounts(filters?: AccountFilters): UseAccountsResult {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serializa os filtros para servir de dependência estável do efeito,
  // já que objetos literais passados inline são recriados a cada render.
  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountsService.list(filters);
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { accounts, loading, error, refresh };
}
