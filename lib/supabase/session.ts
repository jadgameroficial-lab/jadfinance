import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Retorna o id do usuário autenticado a partir do client Supabase informado.
 * Lança erro caso não exista sessão válida.
 *
 * Usado por todos os services de dados para garantir que nenhuma consulta,
 * inserção, atualização ou exclusão seja feita sem um usuário autenticado —
 * e para filtrar todas as queries por user_id, reforçando o que já é
 * garantido pelo RLS no banco (defesa em profundidade).
 */
export async function getAuthenticatedUserId(
  supabase: SupabaseClient
): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuário não autenticado.");
  }

  return user.id;
}
