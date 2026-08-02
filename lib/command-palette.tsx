"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid, ArrowLeftRight, TrendingUp, TrendingDown, Tag,
  Landmark, CreditCard, Settings, Plus, LogOut, Search,
} from "lucide-react";
import { useDashboardContext } from "@/lib/dashboard-context";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/toast";

type Command = {
  id: string;
  label: string;
  group: "Navegar" | "Ações";
  icon: ReactNode;
  keywords?: string;
  run: () => void;
};

const CommandPaletteContext = createContext<{ open: () => void } | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const { openNewTransaction } = useDashboardContext();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => setIsOpen(true), []);

  const commands: Command[] = useMemo(
    () => [
      { id: "dashboard", label: "Ir para Dashboard", group: "Navegar", icon: <LayoutGrid size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard") },
      { id: "transactions", label: "Ir para Transações", group: "Navegar", icon: <ArrowLeftRight size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard/transactions") },
      { id: "income", label: "Ir para Receitas", group: "Navegar", icon: <TrendingUp size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard/transactions?type=income") },
      { id: "expense", label: "Ir para Despesas", group: "Navegar", icon: <TrendingDown size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard/transactions?type=expense") },
      { id: "categories", label: "Ir para Categorias", group: "Navegar", icon: <Tag size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard/categories") },
      { id: "accounts", label: "Ir para Contas", group: "Navegar", icon: <Landmark size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard/accounts") },
      { id: "cards", label: "Ir para Cartões", group: "Navegar", icon: <CreditCard size={15} strokeWidth={1.8} />, run: () => router.push("/dashboard/cards") },
      { id: "settings", label: "Ir para Configurações", group: "Navegar", icon: <Settings size={15} strokeWidth={1.8} />, keywords: "perfil conta", run: () => router.push("/dashboard/settings") },
      { id: "new-transaction", label: "Nova transação", group: "Ações", icon: <Plus size={15} strokeWidth={2} />, keywords: "criar adicionar", run: () => openNewTransaction() },
      {
        id: "logout",
        label: "Sair da conta",
        group: "Ações",
        icon: <LogOut size={15} strokeWidth={1.8} />,
        keywords: "logout encerrar sessão",
        run: async () => {
          const result = await authService.signOut();
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          router.push("/auth");
          router.refresh();
        },
      },
    ],
    [router, openNewTransaction, toast]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || c.keywords?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) {
        cmd.run();
        close();
      }
    }
  }

  let lastGroup: string | null = null;

  return (
    <CommandPaletteContext.Provider value={{ open: openPalette }}>
      {children}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(6,6,8,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "14vh 20px 20px",
            animation: "dashConfirmFade .15s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 560, background: "rgba(21,21,25,0.92)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border-strong)", borderRadius: 16,
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)", overflow: "hidden",
              animation: "dashConfirmPop .2s var(--ease-spring)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
              <Search size={16} strokeWidth={2} color="var(--text-ter)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar uma página ou ação..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "var(--white)", fontSize: 14.5, fontFamily: "var(--body)",
                }}
              />
              <kbd style={{
                fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-ter)",
                border: "1px solid var(--border)", borderRadius: 6, padding: "3px 6px",
              }}>
                esc
              </kbd>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
              {filtered.length === 0 && (
                <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-ter)", fontSize: 13 }}>
                  Nenhum resultado para &quot;{query}&quot;.
                </div>
              )}
              {filtered.map((cmd, i) => {
                const showGroupLabel = cmd.group !== lastGroup;
                lastGroup = cmd.group;
                return (
                  <div key={cmd.id}>
                    {showGroupLabel && (
                      <div style={{
                        padding: "10px 12px 6px", fontSize: 10.5, fontWeight: 600,
                        letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-ter)",
                      }}>
                        {cmd.group}
                      </div>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => { cmd.run(); close(); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 11,
                        padding: "10px 12px", borderRadius: 10, fontSize: 13.5, textAlign: "left",
                        color: i === activeIndex ? "var(--white)" : "var(--text-sec)",
                        background: i === activeIndex ? "var(--surface-3)" : "transparent",
                        transition: "background .15s var(--ease)",
                      }}
                    >
                      <span style={{ color: i === activeIndex ? "var(--gold)" : "var(--text-ter)", display: "flex" }}>
                        {cmd.icon}
                      </span>
                      {cmd.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette precisa ser usado dentro de um CommandPaletteProvider.");
  return ctx;
}
