"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Pencil, Trash2, Landmark } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { accountsService, type AccountRow } from "@/services/accounts.service";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { BankLogo } from "@/components/dashboard/BankLogo";
import { useToast } from "@/lib/toast";

const AccountFormDrawer = dynamic(
  () => import("@/components/dashboard/AccountFormDrawer").then((m) => m.AccountFormDrawer),
  { ssr: false }
);

const INCOME_TYPES = new Set(["income", "receita", "entrada"]);
function isIncomeType(type: string) {
  return INCOME_TYPES.has(type.trim().toLowerCase());
}

function currency(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AccountsPage() {
  const toast = useToast();
  const { accounts, loading, error, refresh } = useAccounts();
  const { transactions } = useTransactions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [editing, setEditing] = useState<AccountRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccountRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const balanceByAccount = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (!t.account_id) continue;
      const delta = isIncomeType(t.type) ? Number(t.amount) : -Number(t.amount);
      map.set(t.account_id, (map.get(t.account_id) ?? 0) + delta);
    }
    return map;
  }, [transactions]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await accountsService.delete(deleteTarget.id);
      toast.success("Conta excluída.");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir conta. Verifique se não há transações ou cartões vinculados a ela.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>Contas</h1>
          <p>Suas contas bancárias e carteiras, ligadas ao Supabase.</p>
        </div>
        <div className="dash-head-meta">
          <button className="dash-btn-gold" onClick={() => { setEditing(null); setEverOpened(true); setDrawerOpen(true); }} type="button">
            <span className="shine" />
            <Plus size={15} strokeWidth={2.5} />
            Nova conta
          </button>
        </div>
      </div>

      {error && <div style={{ color: "#f16565", fontSize: 13, marginBottom: 20 }}>Não foi possível carregar as contas: {error}</div>}

      <div className="dash-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {loading && accounts.length === 0 && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="dash-kpi" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton width={36} height={36} style={{ borderRadius: 11 }} />
              <Skeleton width="50%" height={11} />
              <Skeleton width="70%" height={16} />
              <Skeleton width="60%" height={20} />
            </div>
          ))
        )}
        {!loading && accounts.length === 0 && (
          <div className="dash-panel" style={{ gridColumn: "1 / -1" }}>
            <div className="dash-empty">
              <div className="dash-empty-icon"><Landmark size={20} strokeWidth={1.6} /></div>
              <div className="dash-empty-title">Nenhuma conta por aqui ainda</div>
              <div className="dash-empty-sub">Clique em &quot;Nova conta&quot; para cadastrar sua primeira conta ou carteira.</div>
            </div>
          </div>
        )}
        {accounts.map((acc, i) => {
          return (
          <div key={acc.id} className="dash-kpi dash-reveal" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
            <div className="dash-kpi-top">
              <BankLogo bankId={acc.icon} size={36} />
              <div className="dash-row-actions">
                <button aria-label="Editar" type="button" onClick={() => { setEditing(acc); setEverOpened(true); setDrawerOpen(true); }}>
                  <Pencil size={13} strokeWidth={2} />
                </button>
                <button aria-label="Excluir" type="button" onClick={() => setDeleteTarget(acc)}>
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="dash-kpi-label">{acc.type}</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{acc.name}</div>
            <div className="dash-kpi-value">R$ {currency(balanceByAccount.get(acc.id) ?? 0)}</div>
          </div>
          );
        })}
      </div>

      {everOpened && (
        <AccountFormDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} onSaved={refresh} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir conta"
        message={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.name}"? Essa ação não pode ser desfeita.` : ""}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
