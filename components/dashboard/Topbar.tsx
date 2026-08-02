"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, Plus } from "lucide-react";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useCommandPalette } from "@/lib/command-palette";
import { useToast } from "@/lib/toast";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function useClock() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    function tick() {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setLabel(`${dd} ${MONTHS[now.getMonth()]} · ${hh}:${mm}`);
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function Topbar({
  onToggleMobileSidebar,
  userInitials,
}: {
  onToggleMobileSidebar: () => void;
  userInitials: string;
}) {
  const clock = useClock();
  const router = useRouter();
  const { openNewTransaction } = useDashboardContext();
  const commandPalette = useCommandPalette();
  const toast = useToast();
  const [query, setQuery] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/dashboard/transactions?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="dash-topbar">
      <button className="dash-icon-btn mobile-only" onClick={onToggleMobileSidebar} aria-label="Abrir menu">
        <Menu size={17} strokeWidth={2} />
      </button>

      <div className="dash-search">
        <Search size={15} strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar transações, contas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <kbd>⏎</kbd>
      </div>

      <button
        className="dash-chip mobile-hide-cmdk"
        type="button"
        onClick={commandPalette.open}
        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        aria-label="Abrir busca rápida"
        title="Busca rápida"
      >
        <kbd style={{ fontFamily: "var(--mono)", fontSize: 10 }}>⌘K</kbd>
      </button>

      <div className="dash-status-cluster">
        <span className="dash-chip">{clock}</span>
        <span className="dash-chip"><span className="dot" />Sincronizado</span>
      </div>

      <div className="dash-topbar-actions">
        <button
          className="dash-icon-btn"
          aria-label="Notificações"
          type="button"
          onClick={() => toast.info("Central de notificações chegando em breve.")}
        >
          <span className="ping" />
          <Bell size={17} strokeWidth={1.8} />
        </button>
        <button className="dash-btn-gold" onClick={openNewTransaction} type="button">
          <span className="shine" />
          <Plus size={15} strokeWidth={2.5} />
          Nova transação
        </button>
        <div className="dash-topbar-avatar">{userInitials}</div>
      </div>
    </header>
  );
}
