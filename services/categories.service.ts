import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `categories` do banco.
 * (id, user_id, name, type, color, icon, created_at)
 *
 * Observação: `type` é `text` livre no banco (sem CHECK/enum). Ver relatório
 * final para sugestão de restringir a valores como "income" | "expense".
 */
export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
  created_at: string | null;
}

export type CategoryInsert = {
  name: string;
  type: string;
  color?: string | null;
  icon?: string | null;
};

export type CategoryUpdate = Partial<CategoryInsert>;

export interface CategoryFilters {
  /** Filtra categorias por tipo (ex.: "income", "expense"). */
  type?: string;
}

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[categories.service:${context}] ${error?.message ?? "erro desconhecido ao acessar categories"}`
  );
}

export const categoriesService = {
  /** Lista as categorias do usuário autenticado, com filtros opcionais. */
  async list(filters?: CategoryFilters): Promise<CategoryRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    let query = supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query;
    if (error) fail("list", error);
    return (data ?? []) as CategoryRow[];
  },

  /** Busca uma categoria específica do usuário autenticado. */
  async getById(id: string): Promise<CategoryRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) fail("getById", error);
    return data as CategoryRow | null;
  },

  /** Cria uma nova categoria para o usuário autenticado. */
  async create(input: CategoryInsert): Promise<CategoryRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("categories")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as CategoryRow;
  },

  /** Atualiza uma categoria existente do usuário autenticado. */
  async update(id: string, input: CategoryUpdate): Promise<CategoryRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as CategoryRow;
  },

  /** Remove uma categoria do usuário autenticado. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};
