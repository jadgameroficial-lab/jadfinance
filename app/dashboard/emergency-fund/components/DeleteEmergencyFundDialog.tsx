"use client";

import { useState } from "react";
import type { EmergencyFundRow } from "@/services/emergencyFund.service";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/lib/toast";

/**
 * Confirmação de exclusão de uma reserva de emergência. Reaproveita o
 * ConfirmDialog genérico já usado em outras partes do dashboard — só
 * adiciona o texto e a chamada a deleteFund() específicos do módulo
 * Reserva de Emergência.
 */
export function DeleteEmergencyFundDialog({
  fund,
  onClose,
  deleteFund,
}: {
  /** Reserva a ser excluída; null = dialog fechado. */
  fund: EmergencyFundRow | null;
  onClose: () => void;
  deleteFund: (id: string) => Promise<void>;
}) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (!fund) return;
    setDeleting(true);
    try {
      await deleteFund(fund.id);
      toast.success("Reserva excluída.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir reserva.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open={fund !== null}
      title="Excluir reserva?"
      message="Tem certeza que deseja excluir esta reserva de emergência? Esta ação não poderá ser desfeita."
      confirmLabel="Excluir"
      danger
      loading={deleting}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
