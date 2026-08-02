import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `accounts` do banco.
 * (id, user_id, name, type, balance, color, icon, created_at, updated_at)
 */
export interface AccountRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number | null;
  color: string | null;
  icon: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Campos que o próprio usuário pode enviar ao criar uma conta. */
export type AccountInsert = {
  name: string;
  type: string;
  balance?: number;
  color?: string | null;
  icon?: string | null;
};

export type AccountUpdate = Partial<AccountInsert>;

export interface AccountFilters {
  /** Filtra por tipo de conta (ex.: "corrente", "poupanca", "investimento"). */
  type?: string;
}

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[accounts.service:${context}] ${error?.message ?? "erro desconhecido ao acessar accounts"}`
  );
}

export const accountsService = {
  /** Lista as contas do usuário autenticado, com filtros opcionais. */
  async list(filters?: AccountFilters): Promise<AccountRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    let query = supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query;
    if (error) fail("list", error);
    return (data ?? []) as AccountRow[];
  },

  /** Busca uma conta específica do usuário autenticado. */
  async getById(id: string): Promise<AccountRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) fail("getById", error);
    return data as AccountRow | null;
  },

  /** Cria uma nova conta para o usuário autenticado. */
  async create(input: AccountInsert): Promise<AccountRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("accounts")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as AccountRow;
  },

  /** Atualiza uma conta existente do usuário autenticado. */
  async update(id: string, input: AccountUpdate): Promise<AccountRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("accounts")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as AccountRow;
  },

  /** Remove uma conta do usuário autenticado. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};
