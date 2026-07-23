"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { categoriesService, type CategoryRow } from "@/services/categories.service";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { useToast } from "@/lib/toast";

const CategoryFormDrawer = dynamic(
  () => import("@/components/dashboard/CategoryFormDrawer").then((m) => m.CategoryFormDrawer),
  { ssr: false }
);

const INCOME_TYPES = new Set(["income", "receita", "entrada"]);
function isIncomeType(type: string) {
  return INCOME_TYPES.has(type.trim().toLowerCase());
}

export default function CategoriesPage() {
  const toast = useToast();
  const { categories, loading, error, refresh } = useCategories();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setEverOpened(true);
    setDrawerOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    setEverOpened(true);
    setDrawerOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoriesService.delete(deleteTarget.id);
      toast.success("Categoria excluída.");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir categoria. Verifique se não há transações vinculadas a ela.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>Categorias</h1>
          <p>Organize suas receitas e despesas por categoria.</p>
        </div>
        <div className="dash-head-meta">
          <button className="dash-btn-gold" onClick={openCreate} type="button">
            <span className="shine" />
            <Plus size={15} strokeWidth={2.5} />
            Nova categoria
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "#f16565", fontSize: 13, marginBottom: 20 }}>
          Não foi possível carregar as categorias: {error}
        </div>
      )}

      <div className="dash-panel dash-reveal" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && categories.length === 0 && (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`}>
                    <td colSpan={3}>
                      <div className="dash-skel-row">
                        <Skeleton width={36} height={36} circle />
                        <Skeleton width="30%" height={12} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="dash-empty">
                      <div className="dash-empty-icon"><Tag size={20} strokeWidth={1.6} /></div>
                      <div className="dash-empty-title">Nenhuma categoria por aqui ainda</div>
                      <div className="dash-empty-sub">Clique em &quot;Nova categoria&quot; para organizar suas receitas e despesas.</div>
                    </div>
                  </td>
                </tr>
              )}
              {categories.map((cat, i) => (
                <tr key={cat.id} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                  <td>
                    <div className="dash-tx-desc">
                      <div className="dash-tx-icon" style={{ background: `${cat.color ?? "#999"}22`, color: cat.color ?? "var(--text-ter)" }}>
                        <Tag size={16} strokeWidth={1.8} />
                      </div>
                      <div className="dash-tx-desc-text"><b>{cat.name}</b></div>
                    </div>
                  </td>
                  <td>
                    <span className={`dash-status-badge ${isIncomeType(cat.type) ? "ok" : "pending"}`}>
                      {isIncomeType(cat.type) ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-row-actions">
                      <button aria-label="Editar" type="button" onClick={() => openEdit(cat)}>
                        <Pencil size={13} strokeWidth={2} />
                      </button>
                      <button aria-label="Excluir" type="button" onClick={() => setDeleteTarget(cat)}>
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {everOpened && (
        <CategoryFormDrawer
          open={drawerOpen}
          editing={editing}
          onClose={() => setDrawerOpen(false)}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir categoria"
        message={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.name}"? Transações que usam essa categoria ficarão sem categoria.` : ""}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
