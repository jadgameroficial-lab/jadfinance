"use client";

import { Plus } from "lucide-react";

/**
 * Cabeçalho da página de Metas: título, descrição e botão de criação.
 * O botão ainda não abre nenhum modal — isso entra em uma etapa futura.
 */
export function GoalsHeader() {
  // TODO: abrir modal/drawer de criação de meta (próxima etapa)
  function handleNewGoal() {}

  return (
    <div className="dash-page-head dash-reveal">
      <div>
        <h1>Metas</h1>
        <p>Acompanhe seus objetivos financeiros e a evolução das suas metas.</p>
      </div>
      <div className="dash-head-meta">
        <button className="dash-btn-gold" onClick={handleNewGoal} type="button">
          <span className="shine" />
          <Plus size={15} strokeWidth={2.5} />
          Nova Meta
        </button>
      </div>
    </div>
  );
}
