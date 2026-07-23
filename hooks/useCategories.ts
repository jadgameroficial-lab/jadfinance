"use client";

import { useCallback, useEffect, useState } from "react";
import {
  categoriesService,
  type CategoryRow,
  type CategoryFilters,
} from "@/services/categories.service";

export interface UseCategoriesResult {
  categories: CategoryRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Carrega as categorias do usuário autenticado através do categories.service.
 * Componentes nunca devem chamar o Supabase diretamente — sempre via hook.
 */
export function useCategories(filters?: CategoryFilters): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesService.list(filters);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
}
