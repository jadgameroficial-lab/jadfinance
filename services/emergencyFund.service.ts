import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `emergency_funds` do banco.
 *
 * IMPORTANTE: `target_amount`, `current_amount`, `status` e `completed_at`
 * são calculados automaticamente pelo banco (triggers
 * `calculate_emergency_fund_target_amount` e `recalculate_emergency_fund`,
 * esta última disparada a partir de `emergency_fund_contributions`). A
 * aplicação NUNCA deve escrever nesses quatro campos — por isso eles não
 * existem em `EmergencyFundInsert`/`EmergencyFundUpdate`, só em
 * `EmergencyFundRow` (leitura).
 */
export interface EmergencyFundRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  monthly_expense: number;
  months_target: number;
  target_amount: number;
  current_amount: number;
  priority: "baixa" | "media" | "alta";
  color: string | null;
  icon: string | null;
  status: "em_andamento" | "concluida";
  completed_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type EmergencyFundInsert = {
  name: string;
  description?: string | null;
  monthly_expense: number;
  months_target: number;
  priority?: EmergencyFundRow["priority"];
  color?: string | null;
  icon?: string | null;
};

export type EmergencyFundUpdate = Partial<EmergencyFundInsert> & {
  is_archived?: boolean;
};

export interface EmergencyFundFilters {
  /** Filtra por status ("em_andamento" | "concluida"). */
  status?: EmergencyFundRow["status"];
  /** Por padrão reservas arquivadas ficam de fora da listagem. */
  includeArchived?: boolean;
}

/**
 * Tipagem alinhada 1:1 com `emergency_fund_contributions`.
 */
export interface EmergencyFundContributionRow {
  id: string;
  fund_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type EmergencyFundContributionInsert = {
  fund_id: string;
  amount: number;
  contribution_date?: string;
  note?: string | null;
};

export type EmergencyFundContributionUpdate = Partial<
  Omit<EmergencyFundContributionInsert, "fund_id">
>;

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[emergencyFund.service:${context}] ${
      error?.message ?? "erro desconhecido ao acessar reservas de emergência"
    }`
  );
}

export const emergencyFundService = {
  /** Lista as reservas de emergência do usuário autenticado, com filtros opcionais. */
  async list(filters?: EmergencyFundFilters): Promise<EmergencyFundRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    let query = supabase
      .from("emergency_funds")
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
    return (data ?? []) as EmergencyFundRow[];
  },

  /** Busca uma reserva específica do usuário autenticado. */
  async get(id: string): Promise<EmergencyFundRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("emergency_funds")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) fail("get", error);
    return data as EmergencyFundRow | null;
  },

  /** Cria uma nova reserva de emergência para o usuário autenticado. */
  async create(input: EmergencyFundInsert): Promise<EmergencyFundRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("emergency_funds")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as EmergencyFundRow;
  },

  /**
   * Atualiza uma reserva existente do usuário autenticado.
   * Nunca envia target_amount/current_amount/status/completed_at — esses
   * campos são responsabilidade exclusiva do banco.
   */
  async update(id: string, input: EmergencyFundUpdate): Promise<EmergencyFundRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("emergency_funds")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("update", error);
    return data as EmergencyFundRow;
  },

  /** Arquiva uma reserva (oculta da listagem principal) sem apagar seu histórico de aportes. */
  async archive(id: string): Promise<EmergencyFundRow> {
    return emergencyFundService.update(id, { is_archived: true });
  },

  /** Desarquiva (restaura) uma reserva, voltando a exibi-la na listagem principal. */
  async restore(id: string): Promise<EmergencyFundRow> {
    return emergencyFundService.update(id, { is_archived: false });
  },

  /** Remove uma reserva (e seus aportes, via ON DELETE CASCADE) do usuário autenticado. */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("emergency_funds")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("delete", error);
  },
};

export const emergencyFundContributionsService = {
  /** Lista os aportes de uma reserva, mais recentes primeiro. */
  async listContributions(fundId: string): Promise<EmergencyFundContributionRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("emergency_fund_contributions")
      .select("*")
      .eq("fund_id", fundId)
      .eq("user_id", userId)
      .order("contribution_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) fail("listContributions", error);
    return (data ?? []) as EmergencyFundContributionRow[];
  },

  /**
   * Registra um novo aporte. O banco recalcula automaticamente
   * emergency_funds.current_amount/status/completed_at após o insert.
   */
  async addContribution(
    input: EmergencyFundContributionInsert
  ): Promise<EmergencyFundContributionRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("emergency_fund_contributions")
      .insert({ ...input, user_id: userId })
      .select("*")
      .single();

    if (error) fail("addContribution", error);
    return data as EmergencyFundContributionRow;
  },

  /** Edita um aporte existente. O banco recalcula a reserva automaticamente. */
  async updateContribution(
    id: string,
    input: EmergencyFundContributionUpdate
  ): Promise<EmergencyFundContributionRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("emergency_fund_contributions")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) fail("updateContribution", error);
    return data as EmergencyFundContributionRow;
  },

  /** Exclui um aporte. O banco recalcula a reserva automaticamente. */
  async deleteContribution(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("emergency_fund_contributions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) fail("deleteContribution", error);
  },
};
