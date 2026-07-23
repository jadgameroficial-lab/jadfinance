import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `transactions` do banco.
 * (id, user_id, account_id, category_id, card_id, title, description,
 *  type, amount, transaction_date, created_at, updated_at)
 *
 * Observação: `type` é `text` livre no banco (sem CHECK/enum). Ver relatório
 * final para sugestão de restringir a valores como "income" | "expense".
 */
export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  card_id: string | null;
  title: string;
  description: string | null;
  type: string;
  amount: number;
  transaction_date: string; // formato "YYYY-MM-DD"
  created_at: string | null;
  updated_at: string | null;
}

export type TransactionInsert = {
  title: string;
  type: string;
  amount: number;
  transaction_date: string;
  description?: string | null;
  account_id?: string | null;
  category_id?: string | null;
  card_id?: string | null;
};

export type TransactionUpdate = Partial<TransactionInsert>;

export interface TransactionFilters {
  type?: string;
  accountId?: string;
  categoryId?: string;
  cardId?: string;
  /** Data inicial (inclusive), formato "YYYY-MM-DD". */
  startDate?: string;
  /** Data final (inclusive), formato "YYYY-MM-DD". */
  endDate?: string;
  /** Busca textual no título da transação. */
  search?: string;
  /** Preparado para paginação futura (usado pelos hooks mais adiante). */
  limit?: number;
  offset?: number;
}

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[transactions.service:${context}] ${error?.message ?? "erro desconhecido ao acessar transactions"}`
  );
}

export const transactionsService = {
  /** Lista as transações do usuário autenticado, com filtros opcionais. */
  async list(filters?: TransactionFilters): Promise<TransactionRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });

    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.accountId) query = query.eq("account_id", filters.accountId);
    if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters?.cardId) query = query.eq("card_id", filters.cardId);
    if (filters?.startDate) query = query.gte("transaction_date", filters.startDate);
    if (filters?.endDate) query = query.lte("transaction_date", filters.endDate);
    if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

    if (typeof filters?.limit === "number") {
      const from = filters.offset ?? 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) fail("list", error);
    return (data ?? []) as TransactionRow[];
  },

  /** Busca uma transação específica do usuário autenticado. */
  async getById(id: string): Promise<TransactionRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) fail("getById", error);
    return data as TransactionRow | null;
  },

  /** Cria uma nova transação para o usuário autenticado. */
  async create(input: TransactionInsert): Promise<TransactionRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as TransactionRow;
  },

  /** Atualiza uma transação existente do usuário autenticado. */
  async update(id: string, input: TransactionUpdate): Promise<TransactionRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("transactions")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as TransactionRow;
  },

  /** Remove uma transação do usuário autenticado. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};
