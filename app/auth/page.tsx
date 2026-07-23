"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import "./auth.css";
import { authService } from "@/services/auth.service";

type PanelName = "login" | "signup" | "forgot";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Cria o efeito de ripple ao clicar em botões primary/oauth, igual ao HTML original. */
function useRipple() {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  };
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ripple = useRipple();

  const initialPanel = (searchParams.get("panel") as PanelName) ?? "login";
  const [panel, setPanel] = useState<PanelName>(
    ["login", "signup", "forgot"].includes(initialPanel) ? initialPanel : "login"
  );

  // ---------- atmosphere: mesh parallax + blurred dashboard preview ----------
  const meshRef = useRef<HTMLDivElement>(null);
  const dashPreviewRef = useRef<HTMLDivElement>(null);
  const dpShimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      if (meshRef.current) {
        meshRef.current.style.transform = `translate(${x * 24}px, ${y * 24}px)`;
      }
      if (dashPreviewRef.current) {
        dashPreviewRef.current.style.transform = `translate(calc(-50% + ${x * 10}px), calc(-50% + ${y * 10}px)) perspective(1200px) rotateX(${9 - y * 4}deg) rotateY(${x * 4}deg) scale(1.12)`;
      }
    }
    window.addEventListener("mousemove", onMove);

    const t1 = setTimeout(() => {
      dashPreviewRef.current?.classList.add("show");
      const t2 = setTimeout(() => {
        if (dpShimmerRef.current) dpShimmerRef.current.style.opacity = "0";
      }, 900);
      return () => clearTimeout(t2);
    }, 300);

    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(t1);
    };
  }, []);

  // ---------- LOGIN ----------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginPassVisible, setLoginPassVisible] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; pass?: string }>({});
  const [loginStatus, setLoginStatus] = useState<"idle" | "loading" | "success">("idle");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const emailOk = EMAIL_RE.test(loginEmail.trim());
    const passOk = loginPass.length >= 6;

    setLoginErrors({
      email: emailOk ? undefined : "Informe um email válido",
      pass: passOk ? undefined : "A senha deve ter pelo menos 6 caracteres",
    });
    if (!emailOk || !passOk) return;

    setLoginStatus("loading");
    const result = await authService.signIn(loginEmail.trim(), loginPass);

    if (!result.ok) {
      setLoginStatus("idle");
      // credenciais inválidas: não dá pra saber qual campo está errado,
      // então sinalizamos os dois, reaproveitando o mesmo componente visual.
      setLoginErrors({ email: result.message, pass: result.message });
      return;
    }

    setLoginStatus("success");
    router.push("/dashboard");
    router.refresh();
  }

  // ---------- SIGNUP ----------
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupPassVisible, setSignupPassVisible] = useState(false);
  const [signupConfirmVisible, setSignupConfirmVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string; email?: string; pass?: string; confirm?: string; terms?: string;
  }>({});
  const [signupStatus, setSignupStatus] = useState<"idle" | "loading" | "success">("idle");
  const [signupDone, setSignupDone] = useState(false);

  function passwordStrength(val: string) {
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    const nameOk = signupName.trim().length > 0;
    const emailOk = EMAIL_RE.test(signupEmail.trim());
    const passOk = signupPass.length >= 6;
    const confirmOk = signupConfirm === signupPass && signupConfirm.length > 0;

    setSignupErrors({
      name: nameOk ? undefined : "Informe seu nome completo",
      email: emailOk ? undefined : "Informe um email válido",
      pass: passOk ? undefined : "A senha deve ter pelo menos 6 caracteres",
      confirm: confirmOk ? undefined : "As senhas não coincidem",
      terms: acceptTerms ? undefined : "É preciso aceitar os termos de uso",
    });
    if (!nameOk || !emailOk || !passOk || !confirmOk || !acceptTerms) return;

    setSignupStatus("loading");
    const result = await authService.signUp(signupName.trim(), signupEmail.trim(), signupPass);

    if (!result.ok) {
      setSignupStatus("idle");
      setSignupErrors((prev) => ({ ...prev, email: result.message }));
      return;
    }

    setSignupStatus("success");
    setSignupDone(true);
    // Se a confirmação de email estiver desativada no projeto Supabase,
    // o signUp já retorna uma sessão válida e o middleware deixa passar direto.
    // Caso contrário mostramos o estado de sucesso pedindo a confirmação por email.
    setTimeout(() => router.push("/dashboard"), 400);
  }

  // ---------- FORGOT PASSWORD ----------
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading">("idle");
  const [forgotSent, setForgotSent] = useState(false);

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(forgotEmail.trim())) return;
    setForgotStatus("loading");
    await authService.requestPasswordReset(forgotEmail.trim());
    setForgotStatus("idle");
    setForgotSent(true);
  }

  function switchPanel(name: PanelName) {
    setPanel(name);
    setForgotSent(false);
  }

  return (
    <>
      <div className="bg-layer">
        <div className="mesh" ref={meshRef}>
          <div className="orb orb-gold" />
          <div className="orb orb-purple" />
          <div className="orb orb-soft" />
        </div>
      </div>
      <div className="grid-overlay" />
      <svg className="noise" width="100%" height="100%">
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>

      <div className="dash-preview" ref={dashPreviewRef}>
        <div className="dp-inner" style={{ position: "relative" }}>
          <div className="skeleton-shimmer" ref={dpShimmerRef} />
          <div className="dp-side">
            <div style={{ height: 20, width: "50%" }} />
            <div /><div /><div /><div /><div />
          </div>
          <div className="dp-main">
            <div className="dp-kpis">
              <div className="dp-kpi"><div /><span /></div>
              <div className="dp-kpi"><div /><span /></div>
              <div className="dp-kpi"><div /><span /></div>
              <div className="dp-kpi"><div /><span /></div>
            </div>
            <div className="dp-chart">
              {[40, 65, 45, 80, 55, 90, 70, 50].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

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

          {/* LOGIN */}
          <div className={`panel ${panel === "login" ? "active" : ""}`}>
            <div className="card-brand">
              <div className="logo-mark"><Image src="/logo.png" alt="JAD Finance" width={46} height={46} /></div>
              <h1>Bem-vindo de volta</h1>
              <p>Entre para continuar organizando suas finanças.</p>
            </div>

            <form onSubmit={handleLogin} noValidate>
              <div className={`field ${loginErrors.email ? "has-error" : ""}`}>
                <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 7l-10 6L2 7" /></svg></span>
                <input
                  type="email" placeholder=" " aria-label="Email"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginErrors((p) => ({ ...p, email: undefined })); }}
                />
                <label>Email</label>
                <div className="field-error" role="alert">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{loginErrors.email}</span>
                </div>
              </div>
              <div className={`field ${loginErrors.pass ? "has-error" : ""}`}>
                <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg></span>
                <input
                  type={loginPassVisible ? "text" : "password"} placeholder=" " aria-label="Senha"
                  value={loginPass}
                  onChange={(e) => { setLoginPass(e.target.value); setLoginErrors((p) => ({ ...p, pass: undefined })); }}
                />
                <label>Senha</label>
                <button type="button" className="field-toggle" aria-label={loginPassVisible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setLoginPassVisible((v) => !v)}>
                  {loginPassVisible ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-3.22 4.36M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
                <div className="field-error" role="alert">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{loginErrors.pass}</span>
                </div>
              </div>

              <div className="row-between">
                <label className="checkbox-wrap">
                  <input type="checkbox" />
                  <span className="checkbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                  Lembrar de mim
                </label>
                <button type="button" className="link-muted" onClick={() => switchPanel("forgot")}>Esqueci minha senha</button>
              </div>

              <button type="submit" className={`btn btn-primary ${loginStatus === "loading" ? "loading" : ""} ${loginStatus === "success" ? "success" : ""}`} onClick={ripple}>
                <span className="shine" />
                <span className="btn-label">{loginStatus === "success" ? "Login realizado" : loginStatus === "loading" ? "Entrando..." : "Entrar"}</span>
                <span className="spinner" />
              </button>
            </form>

            <div className="divider">ou continue com</div>
            <div className="oauth-row">
              <button className="btn-oauth" onClick={ripple} type="button">
                <svg viewBox="0 0 24 24"><path fill="#FFC107" d="M21.6 12.23c0-.71-.06-1.42-.19-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.2c1.9-1.75 3-4.32 3-7.42z" /><path fill="#4CAF50" d="M12 22c2.7 0 4.96-.9 6.6-2.42l-3.2-2.5c-.9.6-2.05.96-3.4.96-2.62 0-4.84-1.77-5.63-4.15H3.06v2.6A10 10 0 0 0 12 22z" /><path fill="#2196F3" d="M6.37 13.9a5.96 5.96 0 0 1 0-3.8v-2.6H3.06a10 10 0 0 0 0 9l3.3-2.6z" /><path fill="#FF3D00" d="M12 6.14c1.47 0 2.8.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.3 2.6C7.16 7.9 9.38 6.14 12 6.14z" /></svg>
                Google
              </button>
              <button className="btn-oauth" onClick={ripple} type="button">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.83 2.83 1.3 3.52 1 .1-.79.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5z" /></svg>
                GitHub
              </button>
            </div>

            <div className="switch-line">Não tem conta? <button type="button" onClick={() => switchPanel("signup")}>Criar conta</button></div>
          </div>

          {/* CADASTRO */}
          <div className={`panel ${panel === "signup" ? "active" : ""}`}>
            {!signupDone ? (
              <>
                <div className="card-brand">
                  <div className="logo-mark"><Image src="/logo.png" alt="JAD Finance" width={46} height={46} /></div>
                  <h1>Crie sua conta</h1>
                  <p>Comece a organizar seu patrimônio em minutos.</p>
                </div>

                <form onSubmit={handleSignup}>
                  <div className={`field ${signupErrors.name ? "has-error" : ""}`}>
                    <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg></span>
                    <input type="text" placeholder=" " aria-label="Nome completo" value={signupName} onChange={(e) => { setSignupName(e.target.value); setSignupErrors((p) => ({ ...p, name: undefined })); }} />
                    <label>Nome completo</label>
                    <div className="field-error" role="alert"><span>{signupErrors.name}</span></div>
                  </div>
                  <div className={`field ${signupErrors.email ? "has-error" : ""}`}>
                    <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 7l-10 6L2 7" /></svg></span>
                    <input type="email" placeholder=" " aria-label="Email" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); setSignupErrors((p) => ({ ...p, email: undefined })); }} />
                    <label>Email</label>
                    <div className="field-error" role="alert"><span>{signupErrors.email}</span></div>
                  </div>
                  <div className="field">
                    <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.65 2.65a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.43-1.27a2 2 0 0 1 2.11-.45c.86.31 1.75.53 2.65.65A2 2 0 0 1 22 16.92z" /></svg></span>
                    <input type="tel" placeholder=" " aria-label="Telefone" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} />
                    <label>Telefone</label>
                  </div>
                  <div className={`field ${signupErrors.pass ? "has-error" : ""}`}>
                    <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg></span>
                    <input
                      type={signupPassVisible ? "text" : "password"} placeholder=" " aria-label="Senha"
                      value={signupPass}
                      onChange={(e) => { setSignupPass(e.target.value); setSignupErrors((p) => ({ ...p, pass: undefined })); }}
                    />
                    <label>Senha</label>
                    <button type="button" className="field-toggle" aria-label={signupPassVisible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setSignupPassVisible((v) => !v)}>
                      {signupPassVisible ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-3.22 4.36M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                    <div className="field-error" role="alert"><span>{signupErrors.pass}</span></div>
                  </div>
                  <div className="strength">
                    {[0, 1, 2, 3].map((i) => {
                      const score = passwordStrength(signupPass);
                      const colors = ["var(--error)", "var(--error)", "var(--primary)", "var(--success)"];
                      const active = i < score;
                      return <div key={i} style={{ background: active ? colors[score - 1] : "var(--border)" }} />;
                    })}
                  </div>

                  <div className={`field ${signupErrors.confirm ? "has-error" : ""}`}>
                    <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /><path d="M9.5 15l1.7 1.7L15 13" /></svg></span>
                    <input
                      type={signupConfirmVisible ? "text" : "password"} placeholder=" " aria-label="Confirmar senha"
                      value={signupConfirm}
                      onChange={(e) => { setSignupConfirm(e.target.value); setSignupErrors((p) => ({ ...p, confirm: undefined })); }}
                    />
                    <label>Confirmar senha</label>
                    <button type="button" className="field-toggle" aria-label={signupConfirmVisible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setSignupConfirmVisible((v) => !v)}>
                      {signupConfirmVisible ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-3.22 4.36M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                    <div className="field-error" role="alert"><span>{signupErrors.confirm}</span></div>
                  </div>

                  <div className="row-between" style={{ marginBottom: 20 }}>
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={acceptTerms} onChange={(e) => { setAcceptTerms(e.target.checked); setSignupErrors((p) => ({ ...p, terms: undefined })); }} />
                      <span className="checkbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                      Aceito os <a href="#" className="link-muted" style={{ textDecoration: "underline", display: "inline" }}>termos de uso</a>
                    </label>
                  </div>
                  {signupErrors.terms && (
                    <div className="field-error" role="alert" style={{ display: "flex", marginTop: -12, marginBottom: 14 }}>
                      <span>{signupErrors.terms}</span>
                    </div>
                  )}

                  <button type="submit" className={`btn btn-primary ${signupStatus === "loading" ? "loading" : ""} ${signupStatus === "success" ? "success" : ""}`} onClick={ripple}>
                    <span className="shine" />
                    <span className="btn-label">{signupStatus === "success" ? "Conta criada" : signupStatus === "loading" ? "Criando conta..." : "Criar conta"}</span>
                    <span className="spinner" />
                  </button>
                </form>

                <div className="divider">ou continue com</div>
                <div className="oauth-row">
                  <button className="btn-oauth" onClick={ripple} type="button">
                    <svg viewBox="0 0 24 24"><path fill="#FFC107" d="M21.6 12.23c0-.71-.06-1.42-.19-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.2c1.9-1.75 3-4.32 3-7.42z" /><path fill="#4CAF50" d="M12 22c2.7 0 4.96-.9 6.6-2.42l-3.2-2.5c-.9.6-2.05.96-3.4.96-2.62 0-4.84-1.77-5.63-4.15H3.06v2.6A10 10 0 0 0 12 22z" /><path fill="#2196F3" d="M6.37 13.9a5.96 5.96 0 0 1 0-3.8v-2.6H3.06a10 10 0 0 0 0 9l3.3-2.6z" /><path fill="#FF3D00" d="M12 6.14c1.47 0 2.8.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.3 2.6C7.16 7.9 9.38 6.14 12 6.14z" /></svg>
                    Google
                  </button>
                  <button className="btn-oauth" onClick={ripple} type="button">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.83 2.83 1.3 3.52 1 .1-.79.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5z" /></svg>
                    GitHub
                  </button>
                </div>

                <div className="switch-line">Já tem conta? <button type="button" onClick={() => switchPanel("login")}>Entrar</button></div>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 7l-10 6L2 7" /></svg>
                </div>
                <h2>Conta criada</h2>
                <p>Se a confirmação por email estiver ativa no projeto, verifique sua caixa de entrada para ativar a conta. Caso contrário, você já será redirecionado.</p>
                <button type="button" className="btn btn-outline" onClick={() => switchPanel("login")}>Voltar para o login</button>
              </div>
            )}
          </div>

          {/* ESQUECI SENHA */}
          <div className={`panel ${panel === "forgot" ? "active" : ""}`}>
            {!forgotSent ? (
              <div>
                <div className="card-brand">
                  <div className="logo-mark"><Image src="/logo.png" alt="JAD Finance" width={46} height={46} /></div>
                  <h1>Recuperar senha</h1>
                  <p>Enviaremos um link de recuperação para o seu email.</p>
                </div>
                <form onSubmit={handleForgot}>
                  <div className="field">
                    <span className="field-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 7l-10 6L2 7" /></svg></span>
                    <input type="email" placeholder=" " aria-label="Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                    <label>Email</label>
                  </div>
                  <button type="submit" className={`btn btn-primary ${forgotStatus === "loading" ? "loading" : ""}`} onClick={ripple}>
                    <span className="shine" />
                    <span className="btn-label">{forgotStatus === "loading" ? "Enviando..." : "Enviar link de recuperação"}</span>
                    <span className="spinner" />
                  </button>
                </form>
                <div className="switch-line">Lembrou a senha? <button type="button" onClick={() => switchPanel("login")}>Entrar</button></div>
              </div>
            ) : (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 7l-10 6L2 7" /></svg>
                </div>
                <h2>Verifique seu email</h2>
                <p>Se existir uma conta com esse endereço, enviamos um link para redefinir sua senha.</p>
                <button type="button" className="btn btn-outline" onClick={() => switchPanel("login")}>Voltar para o login</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}
