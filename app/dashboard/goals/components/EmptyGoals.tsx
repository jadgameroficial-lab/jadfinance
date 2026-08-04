"use client";

import { Target, Plus } from "lucide-react";

/**
 * Estado vazio exibido quando o usuário ainda não tem nenhuma meta
 * cadastrada. O botão ainda não tem ação — ver TODO em GoalsHeader.
 */
export function EmptyGoals() {
  // TODO: abrir modal/drawer de criação de meta (próxima etapa)
  function handleNewGoal() {}

  return (
    <div className="dash-panel dash-reveal">
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <Target size={20} strokeWidth={1.6} />
        </div>
        <div className="dash-empty-title">Você ainda não possui metas financeiras.</div>
        <div className="dash-empty-sub">Crie sua primeira meta e acompanhe sua evolução.</div>
        <button className="dash-btn-gold" onClick={handleNewGoal} type="button" style={{ marginTop: 6 }}>
          <span className="shine" />
          <Plus size={15} strokeWidth={2.5} />
          Nova Meta
        </button>
      </div>
    </div>
  );
}
