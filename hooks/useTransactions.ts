"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  transactionsService,
  type TransactionRow,
  type TransactionFilters,
} from "@/services/transactions.service";

export interface UseTransactionsResult {
  transactions: TransactionRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /**
   * Busca a próxima página e concatena ao resultado atual.
   * Só tem efeito prático quando `filters.limit` é informado — serve de
   * base pronta para a paginação real da tabela de transações, que será
   * ligada à UI em uma sprint futura (Etapa 4/5).
   */
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Carrega as transações do usuário autenticado através do
 * transactions.service. Componentes nunca devem chamar o Supabase
 * diretamente — sempre via hook.
 */
export function useTransactions(filters?: TransactionFilters): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);

  const filtersKey = JSON.stringify(filters ?? {});

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const data = await transactionsService.list({ ...filters, offset });
        offsetRef.current = offset;
        setTransactions((prev) => (append ? [...prev, ...data] : data));
        setHasMore(filters?.limit ? data.length === filters.limit : false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar transações.");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey]
  );

  const refresh = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!filters?.limit) return;
    await fetchPage(offsetRef.current + filters.limit, true);
  }, [fetchPage, filters?.limit]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return { transactions, loading, error, refresh, loadMore, hasMore };
}
