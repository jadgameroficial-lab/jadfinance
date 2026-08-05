"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  GoalRow,
  GoalContributionRow,
  GoalContributionInsert,
  GoalContributionUpdate,
} from "@/services/goals.service";
import { useToast } from "@/lib/toast";
import { ModalShell } from "./GoalFormModal";
import { ContributionHistory } from "./ContributionHistory";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** "1234.5" ou "1.234,50" -> 1234.5 */
function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function ContributionModal({
  goal,
  contributions,
  loading,
  onClose,
  addContribution,
  updateContribution,
  deleteContribution,
}: {
  /** Meta para a qual o modal está aberto; null = modal fechado. */
  goal: GoalRow | null;
  contributions: GoalContributionRow[];
  loading: boolean;
  onClose: () => void;
  addContribution: (input: GoalContributionInsert) => Promise<GoalContributionRow>;
  updateContribution: (
    id: string,
    goalId: string,
    input: GoalContributionUpdate
  ) => Promise<GoalContributionRow>;
  deleteContribution: (id: string, goalId: string) => Promise<void>;
}) {
  const toast = useToast();
  const [editingContribution, setEditingContribution] = useState<GoalContributionRow | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GoalContributionRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const open = goal !== null;

  useEffect(() => {
    if (!open) return;
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal?.id]);

  function resetForm() {
    setEditingContribution(null);
    setAmount("");
    setDate(todayIso());
    setNote("");
    setFormError(null);
  }

  function startEdit(contribution: GoalContributionRow) {
    setEditingContribution(contribution);
    setAmount(String(contribution.amount).replace(".", ","));
    setDate(contribution.contribution_date);
    setNote(contribution.note ?? "");
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!goal) return;
    setFormError(null);

    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null || parsedAmount <= 0) {
      setFormError("Informe um valor válido, maior que zero.");
      return;
    }
    if (!date) {
      setFormError("Informe a data do aporte.");
      return;
    }

    setSaving(true);
    try {
      if (editingContribution) {
        await updateContribution(editingContribution.id, goal.id, {
          amount: parsedAmount,
          contribution_date: date,
          note: note.trim() || null,
        });
        toast.success("Aporte atualizado.");
      } else {
        await addContribution({
          goal_id: goal.id,
          amount: parsedAmount,
          contribution_date: date,
          note: note.trim() || null,
        });
        toast.success("Aporte registrado.");
      }
      resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar aporte.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !goal) return;
    setDeleting(true);
    try {
      await deleteContribution(pendingDelete.id, goal.id);
      toast.success("Aporte excluído.");
      if (editingContribution?.id === pendingDelete.id) resetForm();
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir aporte.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ModalShell
        open={open}
        title={goal ? `Aportes — ${goal.name}` : "Aportes"}
        onClose={saving ? () => {} : onClose}
        maxWidth={480}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="dash-d-field">
              <label>Valor (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="dash-d-field">
              <label>Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>

          <div className="dash-d-field">
            <label>Observação (opcional)</label>
            <input
              type="text"
              placeholder="Ex: 13º salário, bônus, economia do mês..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {formError && (
            <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 12, marginTop: -6 }}>{formError}</div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 4 }}>
            {editingContribution && (
              <button type="button" className="dash-filter-btn" onClick={resetForm} disabled={saving}>
                Cancelar edição
              </button>
            )}
            <button type="submit" className="dash-btn-gold" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
              <span className="shine" />
              {saving ? "Salvando..." : editingContribution ? "Salvar alterações" : "Registrar aporte"}
            </button>
          </div>
        </form>

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-sec)", marginBottom: 8 }}>
            Histórico de aportes
          </label>
          <ContributionHistory
            contributions={contributions}
            loading={loading}
            busyId={deleting ? pendingDelete?.id ?? null : null}
            onEdit={startEdit}
            onDelete={setPendingDelete}
          />
        </div>
      </ModalShell>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir aporte?"
        message="Tem certeza que deseja excluir este aporte? O valor da meta será recalculado automaticamente. Esta ação não poderá ser desfeita."
        confirmLabel="Excluir"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
