import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `financial_goals` do banco.
 *
 * IMPORTANTE: `current_amount`, `status` e `completed_at` são calculados
 * automaticamente pelo banco (trigger `financial_goal_contributions_after_change`
 * a partir da soma de `financial_goal_contributions.amount`). A aplicação
 * NUNCA deve escrever nesses três campos — por isso eles não existem em
 * `GoalInsert`/`GoalUpdate`, só em `GoalRow` (leitura).
 */
export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  color: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: "em_andamento" | "concluida";
  priority: "baixa" | "media" | "alta";
  completed_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type GoalInsert = {
  name: string;
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  color?: string | null;
  target_amount: number;
  deadline?: string | null;
  priority?: GoalRow["priority"];
};

export type GoalUpdate = Partial<GoalInsert> & {
  is_archived?: boolean;
};

export interface GoalFilters {
  /** Filtra por status ("em_andamento" | "concluida"). */
  status?: GoalRow["status"];
  /** Por padrão metas arquivadas ficam de fora da listagem. */
  includeArchived?: boolean;
}

/**
 * Tipagem alinhada 1:1 com `financial_goal_contributions`.
 */
export interface GoalContributionRow {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type GoalContributionInsert = {
  goal_id: string;
  amount: number;
  contribution_date?: string;
  note?: string | null;
};

export type GoalContributionUpdate = Partial<Omit<GoalContributionInsert, "goal_id">>;

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[goals.service:${context}] ${error?.message ?? "erro desconhecido ao acessar metas"}`
  );
}

export const goalsService = {
  /** Lista as metas do usuário autenticado, com filtros opcionais. */
  async list(filters?: GoalFilters): Promise<GoalRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    let query = supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (!filters?.includeArchived) {
      query = query.eq("is_archived", false);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) fail("list", error);
    return (data ?? []) as GoalRow[];
  },

  /** Busca uma meta específica do usuário autenticado. */
  async getById(id: string): Promise<GoalRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) fail("getById", error);
    return data as GoalRow | null;
  },

  /** Cria uma nova meta para o usuário autenticado. */
  async create(input: GoalInsert): Promise<GoalRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("financial_goals")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as GoalRow;
  },

  /**
   * Atualiza uma meta existente do usuário autenticado.
   * Nunca envia current_amount/status/completed_at — esses campos são
   * responsabilidade exclusiva do banco.
   */
  async update(id: string, input: GoalUpdate): Promise<GoalRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("financial_goals")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as GoalRow;
  },

  /** Arquiva uma meta (oculta da listagem principal) sem apagar seu histórico de aportes. */
  async archive(id: string): Promise<GoalRow> {
    return goalsService.update(id, { is_archived: true });
  },

  /** Desarquiva uma meta, voltando a exibi-la na listagem principal. */
  async unarchive(id: string): Promise<GoalRow> {
    return goalsService.update(id, { is_archived: false });
  },

  /** Remove uma meta (e seus aportes, via ON DELETE CASCADE) do usuário autenticado. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("financial_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};

export const goalContributionsService = {
  /** Lista os aportes de uma meta, mais recentes primeiro. */
  async listByGoal(goalId: string): Promise<GoalContributionRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("financial_goal_contributions")
      .select("*")
      .eq("goal_id", goalId)
      .eq("user_id", userId)
      .order("contribution_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) fail("listByGoal", error);
    return (data ?? []) as GoalContributionRow[];
  },

  /**
   * Registra um novo aporte. O banco recalcula automaticamente
   * financial_goals.current_amount/status/completed_at após o insert.
   */
  async create(input: GoalContributionInsert): Promise<GoalContributionRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("financial_goal_contributions")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as GoalContributionRow;
  },

  /** Edita um aporte existente. O banco recalcula a meta automaticamente. */
  async update(id: string, input: GoalContributionUpdate): Promise<GoalContributionRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("financial_goal_contributions")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as GoalContributionRow;
  },

  /** Exclui um aporte. O banco recalcula a meta automaticamente. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("financial_goal_contributions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};
