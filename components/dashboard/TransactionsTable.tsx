"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Receipt,
} from "lucide-react";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { transactionsService, type TransactionRow, type TransactionFilters } from "@/services/transactions.service";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useToast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

const INCOME_TYPES = new Set(["income", "receita", "entrada"]);
function isIncomeType(type: string) {
  return INCOME_TYPES.has(type.trim().toLowerCase());
}

function currency(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d} ${MONTHS[Number(m) - 1]}`;
}

function TransactionsTableBase({
  limit,
  showFooterLink = false,
  title = "Transações recentes",
  typeFilter,
  initialSearch,
}: {
  /** Se informado, limita a quantidade exibida (usado no preview do dashboard). */
  limit?: number;
  /** Mostra o link "Ver todas" no rodapé (usado no preview do dashboard). */
  showFooterLink?: boolean;
  title?: string;
  /** Fixa o filtro de tipo (usado nas páginas de Receitas/Despesas). */
  typeFilter?: "income" | "expense";
  /** Busca inicial vinda da URL (ex: pesquisa feita na topbar). */
  initialSearch?: string;
}) {
  const toast = useToast();
  const { openEditTransaction, registerRefresh } = useDashboardContext();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [typeOption, setTypeOption] = useState<"all" | "income" | "expense">(typeFilter ?? "all");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransactionRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // debounce da busca
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filters: TransactionFilters = useMemo(() => {
    const f: TransactionFilters = {};
    if (search) f.search = search;
    if (typeOption !== "all") f.type = typeOption;
    if (limit) f.limit = limit;
    return f;
  }, [search, typeOption, limit]);

  const { transactions, loading, error, refresh, loadMore, hasMore } = useTransactions(filters);

  useEffect(() => {
    registerRefresh(refresh);
    return () => registerRefresh(null);
  }, [registerRefresh, refresh]);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await transactionsService.delete(deleteTarget.id);
      toast.success("Transação excluída.");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir transação.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dash-panel dash-reveal" style={{ padding: 0 }}>
      <div className="dash-table-head">
        <div className="dash-table-head-left">
          <h3>{title}</h3>
          <p>{loading ? "Carregando..." : `${transactions.length} transação(ões)${limit ? " neste recorte" : ""}`}</p>
        </div>
        <div className="dash-table-tools">
          <div className="dash-table-search">
            <Search size={14} strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar por descrição"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button className="dash-filter-btn" onClick={() => setShowFilters((v) => !v)} type="button">
            <SlidersHorizontal size={14} strokeWidth={2} />
            Filtros
          </button>
        </div>
      </div>

      {showFilters && !typeFilter && (
        <div style={{ display: "flex", gap: 8, padding: "0 24px 18px" }}>
          {(["all", "income", "expense"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTypeOption(opt)}
              className="dash-filter-btn"
              style={{
                borderColor: typeOption === opt ? "var(--gold)" : undefined,
                color: typeOption === opt ? "var(--gold)" : undefined,
              }}
            >
              {opt === "all" ? "Todas" : opt === "income" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: "0 24px 18px", color: "#f16565", fontSize: 13 }}>
          Não foi possível carregar as transações: {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Data</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  <td colSpan={6}>
                    <div className="dash-skel-row">
                      <Skeleton width={36} height={36} circle />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <Skeleton width="35%" height={12} />
                        <Skeleton width="20%" height={10} />
                      </div>
                      <Skeleton width={70} height={12} />
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="dash-empty">
                    <div className="dash-empty-icon"><Receipt size={20} strokeWidth={1.6} /></div>
                    <div className="dash-empty-title">
                      {search || typeOption !== "all" ? "Nenhuma transação encontrada" : "Nenhuma transação por aqui ainda"}
                    </div>
                    <div className="dash-empty-sub">
                      {search || typeOption !== "all"
                        ? "Tente ajustar a busca ou os filtros aplicados."
                        : "Clique em \"Nova transação\" para registrar a primeira movimentação."}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {transactions.map((tx, i) => {
              const income = isIncomeType(tx.type);
              const category = tx.category_id ? categoryById.get(tx.category_id) : null;
              const account = tx.account_id ? accountById.get(tx.account_id) : null;
              return (
                <tr key={tx.id} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                  <td>
                    <div className="dash-tx-desc">
                      <div
                        className="dash-tx-icon"
                        style={{
                          background: income ? "var(--green-dim)" : "var(--red-dim)",
                          color: income ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {income ? <ArrowUpRight size={16} strokeWidth={1.8} /> : <ArrowDownRight size={16} strokeWidth={1.8} />}
                      </div>
                      <div className="dash-tx-desc-text">
                        <b>{tx.title}</b>
                        {tx.description && <span>{tx.description}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {category ? (
                      <span className="dash-cat-tag">
                        <i style={{ background: category.color ?? "var(--text-ter)" }} />
                        {category.name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-ter)" }}>Sem categoria</span>
                    )}
                  </td>
                  <td>{account?.name ?? "—"}</td>
                  <td style={{ fontFamily: "var(--mono)" }}>{formatDate(tx.transaction_date)}</td>
                  <td className={`dash-tx-value ${income ? "up" : "down"}`}>
                    {income ? "+" : "-"}R$ {currency(Number(tx.amount))}
                  </td>
                  <td>
                    <div className="dash-row-actions">
                      <button aria-label="Editar" type="button" onClick={() => openEditTransaction(tx)}>
                        <Pencil size={13} strokeWidth={2} />
                      </button>
                      <button aria-label="Excluir" type="button" onClick={() => setDeleteTarget(tx)}>
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="dash-table-foot">
        <span>
          {loading
            ? "Carregando transações..."
            : `Mostrando ${transactions.length} transação(ões)`}
        </span>
        {showFooterLink ? (
          <Link href="/dashboard/transactions">Ver todas →</Link>
        ) : hasMore ? (
          <button type="button" className="dash-filter-btn" onClick={loadMore}>Carregar mais</button>
        ) : null}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir transação"
        message={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.title}"? Essa ação não pode ser desfeita.` : ""}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export const TransactionsTable = memo(TransactionsTableBase);
