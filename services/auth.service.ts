import { createClient } from "@/lib/supabase/client";
import type { AuthError } from "@supabase/supabase-js";

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Traduz os erros do Supabase Auth para mensagens elegantes em pt-BR.
 * Mantém o texto técnico fora da UI.
 */
function translateAuthError(error: AuthError | null): string {
  if (!error) return "Erro interno. Tente novamente em instantes.";

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Email ou senha incorretos.";
  }
  if (msg.includes("email not confirmed")) {
    return "Sua conta ainda não foi confirmada. Verifique seu email.";
  }
  if (msg.includes("user already registered")) {
    return "Já existe uma conta com este email.";
  }
  if (msg.includes("password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (msg.includes("rate limit")) {
    return "Muitas tentativas. Aguarde um instante e tente novamente.";
  }
  if (msg.includes("network")) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }
  return "Erro interno. Tente novamente em instantes.";
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  },

  async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // fica disponível em auth.users.user_metadata e é usado pela trigger
        // handle_new_user() (ver README) para popular a tabela profiles.
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth?panel=login`,
      },
    });
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  },

  async requestPasswordReset(email: string): Promise<AuthResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  },

  async updatePassword(newPassword: string): Promise<AuthResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  },

  async signOut(): Promise<AuthResult> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  },
};
