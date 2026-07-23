"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { transactionsService, type TransactionRow } from "@/services/transactions.service";
import { useToast } from "@/lib/toast";

const INCOME_TYPES = new Set(["income", "receita", "entrada"]);

function isIncomeType(type: string) {
  return INCOME_TYPES.has(type.trim().toLowerCase());
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** "1234.5" ou "1.234,50" -> 1234.5 */
function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function NewTransactionDrawer({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: TransactionRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { categories, refresh: refreshCategories } = useCategories();
  const { accounts, refresh: refreshAccounts } = useAccounts();

  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // A drawer permanece montada entre uma abertura e outra (assim o
    // componente só entra no bundle na primeira vez que é aberto), então
    // categorias e contas precisam ser buscadas de novo a cada abertura,
    // não só na primeira montagem, senão uma categoria criada depois de o
    // usuário já ter aberto a drawer uma vez nunca aparece na lista.
    refreshCategories();
    refreshAccounts();
    if (editing) {
      setTab(isIncomeType(editing.type) ? "income" : "expense");
      setTitle(editing.title);
      setDescription(editing.description ?? "");
      setAmount(String(editing.amount).replace(".", ","));
      setCategoryId(editing.category_id ?? "");
      setAccountId(editing.account_id ?? "");
      setDate(editing.transaction_date);
    } else {
      setTab("expense");
      setTitle("");
      setDescription("");
      setAmount("");
      setCategoryId("");
      setAccountId("");
      setDate(todayIso());
    }
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const filteredCategories = categories.filter((c) =>
    tab === "income" ? isIncomeType(c.type) : !isIncomeType(c.type)
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    const parsedAmount = parseAmount(amount);

    if (!trimmedTitle) {
      setFormError("Informe uma descrição.");
      return;
    }
    if (parsedAmount === null || parsedAmount <= 0) {
      setFormError("Informe um valor válido.");
      return;
    }
    if (!categoryId) {
      setFormError("Selecione uma categoria. Toda transação precisa estar categorizada.");
      return;
    }
    if (!date) {
      setFormError("Informe a data.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim() || null,
        type: tab,
        amount: parsedAmount,
        transaction_date: date,
        category_id: categoryId,
        account_id: accountId || null,
      };

      if (editing) {
        await transactionsService.update(editing.id, payload);
        toast.success("Transação atualizada.");
      } else {
        await transactionsService.create(payload);
        toast.success("Transação criada.");
      }

      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar transação.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`dash-drawer-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`dash-drawer ${open ? "open" : ""}`} role="dialog" aria-hidden={!open}>
        <div className="dash-drawer-head">
          <h3>{editing ? "Editar transação" : "Nova transação"}</h3>
          <button className="dash-drawer-close" onClick={onClose} aria-label="Fechar" type="button">
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dash-d-tabs">
            <button
              type="button"
              className={tab === "expense" ? "active" : ""}
              onClick={() => { setTab("expense"); setCategoryId(""); }}
            >
              Despesa
            </button>
            <button
              type="button"
              className={tab === "income" ? "active" : ""}
              onClick={() => { setTab("income"); setCategoryId(""); }}
            >
              Receita
            </button>
          </div>

          <div className="dash-d-field">
            <label>Título</label>
            <input
              type="text"
              placeholder="Ex: Supermercado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="dash-d-field">
            <label>Descrição <span style={{ color: "var(--text-ter)", fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="text"
              placeholder="Detalhes adicionais"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="dash-d-field">
            <label>Valor</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="dash-d-field">
            <label>Categoria <span style={{ color: "var(--gold)" }}>*</span></label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="" disabled>
                {filteredCategories.length === 0 ? "Nenhuma categoria cadastrada" : "Selecione uma categoria"}
              </option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {filteredCategories.length === 0 && (
              <span style={{ fontSize: 11.5, color: "var(--text-ter)", marginTop: 6, display: "block" }}>
                Cadastre uma categoria de {tab === "income" ? "receita" : "despesa"} antes de continuar.
              </span>
            )}
          </div>
          <div className="dash-d-field">
            <label>Conta</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Selecione uma conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="dash-d-field">
            <label>Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {formError && (
            <div style={{ color: "#f16565", fontSize: 12.5, marginBottom: 12, marginTop: -6 }}>
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="dash-btn-gold"
            disabled={saving || filteredCategories.length === 0}
            style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: saving || filteredCategories.length === 0 ? 0.6 : 1 }}
          >
            <span className="shine" />
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Salvar transação"}
          </button>
        </form>
      </div>
    </>
  );
}
