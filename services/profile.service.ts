import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/session";

/**
 * Tipagem alinhada 1:1 com a tabela `profiles` do banco.
 * (id, full_name, avatar_url, created_at, updated_at)
 *
 * IMPORTANTE — diferença estrutural em relação aos demais services:
 * `profiles` não tem coluna `user_id`. O próprio `id` da linha É o
 * `auth.users.id` (ver comentário em services/auth.service.ts sobre a
 * trigger `handle_new_user()`). Ou seja: é uma tabela de 1 linha por
 * usuário, e "o dono" é o próprio `id`.
 *
 * Por isso os métodos `getById`/`update`/`delete` abaixo ignoram
 * deliberadamente o `id` recebido como parâmetro externo e sempre operam
 * sobre o id do usuário autenticado — isso evita qualquer possibilidade de
 * um componente, por engano, tentar ler/alterar o perfil de outro usuário
 * (o RLS já bloquearia no banco, mas aqui é bloqueado antes mesmo da
 * requisição sair do client).
 */
export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type ProfileUpdate = {
  full_name?: string | null;
  avatar_url?: string | null;
};

function fail(context: string, error: PostgrestError | null): never {
  throw new Error(
    `[profile.service:${context}] ${error?.message ?? "erro desconhecido ao acessar profiles"}`
  );
}

export const profileService = {
  /**
   * Retorna sempre um array com 0 ou 1 item (o próprio perfil), mantendo a
   * assinatura `list()` pedida para todos os services. Na prática, prefira
   * `getCurrent()` nos hooks/componentes.
   */
  async list(): Promise<ProfileRow[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);

    if (error) fail("list", error);
    return (data ?? []) as ProfileRow[];
  },

  /**
   * Mantido por consistência de API com os demais services.
   * O `id` informado é ignorado: sempre retorna o perfil do usuário
   * autenticado (ver nota da interface acima). Use `getCurrent()`.
   */
  async getById(_id: string): Promise<ProfileRow | null> {
    return profileService.getCurrent();
  },

  /** Retorna o perfil do usuário autenticado (ou null se ainda não existir). */
  async getCurrent(): Promise<ProfileRow | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) fail("getCurrent", error);
    return data as ProfileRow | null;
  },

  /**
   * Cria a linha de perfil do usuário autenticado.
   * Normalmente desnecessário: a trigger `handle_new_user()` já cria o
   * perfil automaticamente no signup. Existe aqui apenas como fallback
   * (ex.: perfis antigos sem trigger, ou correção manual).
   */
  async create(input: ProfileUpdate = {}): Promise<ProfileRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, ...input })
      .select("*")
      .single();

    if (error) fail("create", error);
    return data as ProfileRow;
  },

  /**
   * Atualiza o perfil do usuário autenticado (nome, avatar).
   *
   * Além de gravar na tabela `profiles`, também sincroniza `full_name` com
   * o `user_metadata` do Supabase Auth. Isso é necessário porque o
   * navbar/sidebar/avatar do dashboard exibem o nome a partir de
   * `user.user_metadata.full_name` (via useAuth), não a partir da tabela
   * `profiles`. Sem essa sincronização, salvar o nome na tela de
   * Configurações não refletia em nenhum outro lugar da interface.
   */
  async update(input: ProfileUpdate): Promise<ProfileRow> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("*")
      .maybeSingle();

    if (error) fail("update", error);

    // Se a trigger handle_new_user() não tiver criado a linha de perfil
    // para este usuário (contas antigas, ou falha pontual da trigger), o
    // UPDATE acima não encontra nenhuma linha para alterar e `data` volta
    // null em vez de dar erro. Nesse caso, criamos o perfil agora em vez
    // de deixar a alteração se perder silenciosamente.
    const profile = data ?? (await profileService.create(input));

    if (typeof input.full_name !== "undefined") {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: input.full_name },
      });
      if (authError) {
        throw new Error(`[profile.service:update:auth-metadata] ${authError.message}`);
      }
    }

    return profile as ProfileRow;
  },

  /**
   * Remove o perfil do usuário autenticado.
   * ⚠️ Método de alto risco: normalmente não deve ser exposto na UI
   * separadamente de um fluxo real de exclusão de conta. Incluído apenas
   * para manter a assinatura padrão (create/update/delete/getById/list)
   * pedida para todos os services.
   */
  async delete(): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) fail("delete", error);
  },
};
