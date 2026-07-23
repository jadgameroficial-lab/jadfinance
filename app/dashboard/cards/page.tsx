"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { useCards } from "@/hooks/useCards";
import { useAccounts } from "@/hooks/useAccounts";
import { cardsService, type CardRow } from "@/services/cards.service";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { BankBadge } from "@/components/dashboard/BankBadge";
import { getCardBrandByName } from "@/lib/bank-logos";
import { useToast } from "@/lib/toast";

const CardFormDrawer = dynamic(
  () => import("@/components/dashboard/CardFormDrawer").then((m) => m.CardFormDrawer),
  { ssr: false }
);

function currency(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CardsPage() {
  const toast = useToast();
  const { cards, loading, error, refresh } = useCards();
  const { accounts } = useAccounts();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [editing, setEditing] = useState<CardRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CardRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const accountById = new Map(accounts.map((a) => [a.id, a]));

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cardsService.delete(deleteTarget.id);
      toast.success("Cartão excluído.");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir cartão. Verifique se não há transações vinculadas a ele.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>Cartões</h1>
          <p>Seus cartões de crédito, ligados ao Supabase.</p>
        </div>
        <div className="dash-head-meta">
          <button className="dash-btn-gold" onClick={() => { setEditing(null); setEverOpened(true); setDrawerOpen(true); }} type="button">
            <span className="shine" />
            <Plus size={15} strokeWidth={2.5} />
            Novo cartão
          </button>
        </div>
      </div>

      {error && <div style={{ color: "#f16565", fontSize: 13, marginBottom: 20 }}>Não foi possível carregar os cartões: {error}</div>}

      <div className="dash-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {loading && cards.length === 0 && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="dash-kpi" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton width={36} height={36} style={{ borderRadius: 11 }} />
              <Skeleton width="50%" height={11} />
              <Skeleton width="70%" height={16} />
              <Skeleton width="60%" height={20} />
            </div>
          ))
        )}
        {!loading && cards.length === 0 && (
          <div className="dash-panel" style={{ gridColumn: "1 / -1" }}>
            <div className="dash-empty">
              <div className="dash-empty-icon"><CreditCard size={20} strokeWidth={1.6} /></div>
              <div className="dash-empty-title">Nenhum cartão por aqui ainda</div>
              <div className="dash-empty-sub">Clique em &quot;Novo cartão&quot; para cadastrar seu primeiro cartão de crédito.</div>
            </div>
          </div>
        )}
        {cards.map((card, i) => (
          <div key={card.id} className="dash-kpi dash-reveal" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
            <div className="dash-kpi-top">
              <div className="dash-kpi-icon" style={{ background: "var(--blue-dim)" }}>
                <CreditCard size={18} strokeWidth={1.8} color="var(--blue)" />
              </div>
              <div className="dash-row-actions">
                <button aria-label="Editar" type="button" onClick={() => { setEditing(card); setEverOpened(true); setDrawerOpen(true); }}>
                  <Pencil size={13} strokeWidth={2} />
                </button>
                <button aria-label="Excluir" type="button" onClick={() => setDeleteTarget(card)}>
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="dash-kpi-label">{card.brand ?? "Cartão de crédito"}</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{card.name}</div>
            <div className="dash-kpi-value">
              {card.limit_value != null ? `R$ ${currency(Number(card.limit_value))}` : "Sem limite definido"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-ter)", marginTop: 6 }}>
              {card.account_id && accountById.get(card.account_id) ? `Conta: ${accountById.get(card.account_id)!.name} · ` : ""}
              Fecha dia {card.closing_day ?? "—"}, vence dia {card.due_day ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {everOpened && (
        <CardFormDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} onSaved={refresh} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir cartão"
        message={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.name}"? Essa ação não pode ser desfeita.` : ""}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
