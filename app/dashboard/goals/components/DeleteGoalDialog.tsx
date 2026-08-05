"use client";

import { useState } from "react";
import type { GoalRow } from "@/services/goals.service";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/lib/toast";

/**
 * Confirmação de exclusão de uma meta. Reaproveita o ConfirmDialog
 * genérico já usado em outras partes do dashboard — só adiciona o texto e
 * a chamada a deleteGoal() específicos do módulo Metas.
 */
export function DeleteGoalDialog({
  goal,
  onClose,
  deleteGoal,
}: {
  /** Meta a ser excluída; null = dialog fechado. */
  goal: GoalRow | null;
  onClose: () => void;
  deleteGoal: (id: string) => Promise<void>;
}) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (!goal) return;
    setDeleting(true);
    try {
      await deleteGoal(goal.id);
      toast.success("Meta excluída.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir meta.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open={goal !== null}
      title="Excluir meta?"
      message="Tem certeza que deseja excluir esta meta? Esta ação não poderá ser desfeita."
      confirmLabel="Excluir"
      danger
      loading={deleting}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
