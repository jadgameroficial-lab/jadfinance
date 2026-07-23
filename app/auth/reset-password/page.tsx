"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../auth.css";
import { authService } from "@/services/auth.service";

/**
 * Página acessada a partir do link enviado por email pelo Supabase
 * (resetPasswordForEmail -> redirectTo: /auth/reset-password).
 * Nesse ponto o Supabase já trocou o token da URL por uma sessão válida,
 * então basta chamar updateUser({ password }).
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ pass?: string; confirm?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formError, setFormError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const passOk = password.length >= 6;
    const confirmOk = confirm === password && confirm.length > 0;

    setErrors({
      pass: passOk ? undefined : "A senha deve ter pelo menos 6 caracteres",
      confirm: confirmOk ? undefined : "As senhas não coincidem",
    });
    if (!passOk || !confirmOk) return;

    setStatus("loading");
    setFormError(undefined);
    const result = await authService.updatePassword(password);

    if (!result.ok) {
      setStatus("idle");
      setFormError(result.message);
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <>
      <div className="bg-layer">
        <div className="mesh">
          <div className="orb orb-gold" />
          <div className="orb orb-purple" />
          <div className="orb orb-soft" />
        </div>
      </div>
      <div className="grid-overlay" />

      <a href="/" className="back-link">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Voltar ao site
      </a>
      <div className="top-logo">
        <div className="logo-mark"><Image src="/logo.png" alt="JAD Finance" width={30} height={30} /></div>
        JAD FINANCE
      </div>

      <div className="page">
        <div className="auth-card">
          <div className="panel active">
            <div className="card-brand">
              <div className="logo-mark"><Image src="/logo.png" alt="JAD Finance" width={46} height={46} /></div>
              <h1>Nova senha</h1>
              <p>Escolha uma nova senha para sua conta.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className={`field ${errors.pass ? "has-error" : ""}`}>
                <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg></span>
                <input type="password" placeholder=" " aria-label="Nova senha" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, pass: undefined })); }} />
                <label>Nova senha</label>
                <div className="field-error" role="alert"><span>{errors.pass}</span></div>
              </div>
              <div className={`field ${errors.confirm ? "has-error" : ""}`}>
                <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /><path d="M9.5 15l1.7 1.7L15 13" /></svg></span>
                <input type="password" placeholder=" " aria-label="Confirmar nova senha" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }} />
                <label>Confirmar senha</label>
                <div className="field-error" role="alert"><span>{errors.confirm}</span></div>
              </div>

              {formError && (
                <div className="field-error" role="alert" style={{ display: "flex", marginTop: -10, marginBottom: 16 }}>
                  <span>{formError}</span>
                </div>
              )}

              <button type="submit" className={`btn btn-primary ${status === "loading" ? "loading" : ""} ${status === "success" ? "success" : ""}`}>
                <span className="shine" />
                <span className="btn-label">{status === "success" ? "Senha atualizada" : status === "loading" ? "Salvando..." : "Salvar nova senha"}</span>
                <span className="spinner" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
