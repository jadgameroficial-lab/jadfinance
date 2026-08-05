"use client";

import { Target, SearchX, Plus } from "lucide-react";

/**
 * Estado vazio da lista de metas. Dois cenários:
 * - o usuário realmente não tem nenhuma meta ainda (texto/CTA pedidos);
 * - o usuário tem metas, mas o filtro atual não retornou nenhuma (texto
 *   diferente, sem repetir "Nova Meta" como se fosse a primeira vez).
 */
export function EmptyGoals({
  onNewGoal,
  filtered = false,
}: {
  onNewGoal: () => void;
  /** true quando já existem metas, mas o filtro/ordenação atual não retornou nenhuma. */
  filtered?: boolean;
}) {
  if (filtered) {
    return (
      <div className="dash-panel dash-reveal">
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <SearchX size={20} strokeWidth={1.6} />
          </div>
          <div className="dash-empty-title">Nenhuma meta encontrada para esse filtro.</div>
          <div className="dash-empty-sub">Tente selecionar outro filtro para ver suas metas.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-panel dash-reveal">
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <Target size={20} strokeWidth={1.6} />
        </div>
        <div className="dash-empty-title">Você ainda não possui metas financeiras.</div>
        <div className="dash-empty-sub">Comece criando sua primeira meta.</div>
        <button className="dash-btn-gold" onClick={onNewGoal} type="button" style={{ marginTop: 6 }}>
          <span className="shine" />
          <Plus size={15} strokeWidth={2.5} />
          Nova Meta
        </button>
      </div>
    </div>
  );
}
