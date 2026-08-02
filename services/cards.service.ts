import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `cards` do banco.
 * (id, user_id, account_id, name, brand, limit_value, closing_day, due_day, created_at)
 *
 * Observação: a tabela `cards` não possui coluna `updated_at` no schema atual
 * (diferente de accounts/transactions). Ver relatório final.
 */
export interface CardRow {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  brand: string | null;
  limit_value: number | null;
  closing_day: number | null;
  due_day: number | null;
  created_at: string | null;
}

export type CardInsert = {
  name: string;
  account_id?: string | null;
  brand?: string | null;
  limit_value?: number | null;
  closing_day?: number | null;
  due_day?: number | null;
};

export type CardUpdate = Partial<CardInsert>;

export interface CardFilters {
  /** Filtra os cartões vinculados a uma conta específica. */
  accountId?: string;
}

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[cards.service:${context}] ${error?.message ?? "erro desconhecido ao acessar cards"}`
  );
}

export const cardsService = {
  /** Lista os cartões do usuário autenticado, com filtros opcionais. */
  async list(filters?: CardFilters): Promise<CardRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    let query = supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.accountId) {
      query = query.eq("account_id", filters.accountId);
    }

    const { data, error } = await query;
    if (error) fail("list", error);
    return (data ?? []) as CardRow[];
  },

  /** Busca um cartão específico do usuário autenticado. */
  async getById(id: string): Promise<CardRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) fail("getById", error);
    return data as CardRow | null;
  },

  /** Cria um novo cartão para o usuário autenticado. */
  async create(input: CardInsert): Promise<CardRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("cards")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as CardRow;
  },

  /** Atualiza um cartão existente do usuário autenticado. */
  async update(id: string, input: CardUpdate): Promise<CardRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("cards")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as CardRow;
  },

  /** Remove um cartão do usuário autenticado. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};
