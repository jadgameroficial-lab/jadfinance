"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import "./dashboard.css";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { ToastProvider } from "@/lib/toast";
import { DashboardProvider } from "@/lib/dashboard-context";
import { CommandPaletteProvider } from "@/lib/command-palette";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * useSearchParams() precisa estar isolado num componente próprio dentro de
 * um <Suspense>, senão o Next.js força toda a árvore (inclusive páginas
 * estáticas como /dashboard/accounts) a sair do prerender no build.
 */
function SidebarWithSearchParams(props: Omit<Parameters<typeof Sidebar>[0], "currentSearch">) {
  const searchParams = useSearchParams();
  return <Sidebar {...props} currentSearch={searchParams.toString()} />;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="dash">
        <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-ter)" }}>
          Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    // A guarda acima já dispara o redirecionamento para /auth.
    return null;
  }

  const displayName = (user.user_metadata?.full_name as string) || user.email || "Usuário";
  const initials = getInitials(displayName);

  return (
    <div className="dash">
      <div className="dash-bg-glow" />
      <div className="dash-grid-overlay" />

      <div className={`dash-shell ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="dash-mobile-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />

        <Suspense fallback={null}>
          <SidebarWithSearchParams
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            userName={displayName}
            userInitials={initials}
            mobileOpen={mobileOpen}
            currentPath={pathname}
          />
        </Suspense>

        <div className="dash-main">
          <Topbar
            onToggleMobileSidebar={() => setMobileOpen((v) => !v)}
            userInitials={initials}
          />

          <div className="dash-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DashboardProvider>
        <CommandPaletteProvider>
          <DashboardShell>{children}</DashboardShell>
        </CommandPaletteProvider>
      </DashboardProvider>
    </ToastProvider>
  );
}
