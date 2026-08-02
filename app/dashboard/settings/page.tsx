"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/lib/toast";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, refresh: refreshAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingProfile(true);
      try {
        const profile = await profileService.getCurrent();
        if (!cancelled) {
          setFullName(profile?.full_name ?? (user?.user_metadata?.full_name as string) ?? "");
        }
      } catch {
        if (!cancelled) setFullName((user?.user_metadata?.full_name as string) ?? "");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    if (user) load();
    return () => { cancelled = true; };
  }, [user]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.update({ full_name: fullName.trim() || null });
      await refreshAuth();
      toast.success("Perfil atualizado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    const result = await authService.signOut();
    if (!result.ok) {
      toast.error(result.message);
      setLoggingOut(false);
      return;
    }
    router.push("/auth");
    router.refresh();
  }

  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>Configurações</h1>
          <p>Gerencie seu perfil e sua conta.</p>
        </div>
      </div>

      <div className="dash-panel dash-reveal" style={{ maxWidth: 480, marginBottom: 20 }}>
        <div className="dash-panel-head">
          <div>
            <h3>Perfil</h3>
            <div className="sub">Como seu nome aparece no dashboard</div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="dash-d-field">
            <label>Email</label>
            <input type="email" value={user?.email ?? ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
          </div>
          <div className="dash-d-field">
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loadingProfile}
            />
          </div>
          <button
            type="submit"
            className="dash-btn-gold"
            disabled={saving || loadingProfile}
            style={{ marginTop: 8, opacity: saving ? 0.7 : 1 }}
          >
            <span className="shine" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>

      <div className="dash-panel dash-reveal" style={{ maxWidth: 480 }}>
        <div className="dash-panel-head">
          <div>
            <h3>Sessão</h3>
            <div className="sub">Encerrar o acesso neste dispositivo</div>
          </div>
        </div>
        <button
          className="dash-chip"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: loggingOut ? "default" : "pointer" }}
        >
          <LogOut size={12} strokeWidth={2} />
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </>
  );
}
