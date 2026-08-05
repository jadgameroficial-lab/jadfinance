"use client";

import { ShieldCheck, SearchX, Plus } from "lucide-react";

/**
 * Estado vazio da lista de reservas. Dois cenários:
 * - o usuário realmente não tem nenhuma reserva ainda (texto/CTA pedidos);
 * - o usuário tem reservas, mas o filtro atual não retornou nenhuma (texto
 *   diferente, sem repetir "Nova Reserva" como se fosse a primeira vez).
 */
export function EmptyEmergencyFund({
  onNewFund,
  filtered = false,
}: {
  onNewFund: () => void;
  /** true quando já existem reservas, mas o filtro/ordenação atual não retornou nenhuma. */
  filtered?: boolean;
}) {
  if (filtered) {
    return (
      <div className="dash-panel dash-reveal">
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <SearchX size={20} strokeWidth={1.6} />
          </div>
          <div className="dash-empty-title">Nenhuma reserva encontrada para esse filtro.</div>
          <div className="dash-empty-sub">Tente selecionar outro filtro para ver suas reservas.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-panel dash-reveal">
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <ShieldCheck size={20} strokeWidth={1.6} />
        </div>
        <div className="dash-empty-title">Você ainda não possui uma reserva de emergência.</div>
        <div className="dash-empty-sub">Crie sua primeira reserva para proteger seu futuro financeiro.</div>
        <button className="dash-btn-gold" onClick={onNewFund} type="button" style={{ marginTop: 6 }}>
          <span className="shine" />
          <Plus size={15} strokeWidth={2.5} />
          Nova Reserva
        </button>
      </div>
    </div>
  );
}
