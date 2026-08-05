"use client";

import { Plus } from "lucide-react";

/** Cabeçalho da página de Reserva de Emergência: título, descrição e botão de criação. */
export function EmergencyFundHeader({ onNewFund }: { onNewFund: () => void }) {
  return (
    <div className="dash-page-head dash-reveal">
      <div>
        <h1>Reserva de Emergência</h1>
        <p>Monte sua reserva financeira para imprevistos e acompanhe sua evolução.</p>
      </div>
      <div className="dash-head-meta">
        <button className="dash-btn-gold" onClick={onNewFund} type="button">
          <span className="shine" />
          <Plus size={15} strokeWidth={2.5} />
          Nova Reserva
        </button>
      </div>
    </div>
  );
}
