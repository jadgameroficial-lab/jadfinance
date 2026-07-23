"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cardsService,
  type CardRow,
  type CardFilters,
} from "@/services/cards.service";

export interface UseCardsResult {
  cards: CardRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Carrega os cartões do usuário autenticado através do cards.service.
 * Componentes nunca devem chamar o Supabase diretamente — sempre via hook.
 */
export function useCards(filters?: CardFilters): UseCardsResult {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cardsService.list(filters);
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cartões.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cards, loading, error, refresh };
}
