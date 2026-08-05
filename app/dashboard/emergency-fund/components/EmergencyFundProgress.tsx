"use client";

/**
 * Formata um valor numérico como moeda pt-BR (sem o prefixo "R$").
 * Único ponto de formatação de valores do módulo Reserva de Emergência —
 * reutilizado por EmergencyFundCard e EmergencyFundStats para não duplicar
 * essa lógica pelo módulo.
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Barra de progresso de uma reserva: percentual, barra visual e os valores
 * atual/objetivo. Não decide nada sobre a reserva — apenas exibe os números
 * que recebe via props.
 */
export function EmergencyFundProgress({
  current,
  target,
  color,
}: {
  current: number;
  target: number;
  color?: string | null;
}) {
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const barColor = color ?? "var(--gold)";

  return (
    <div className="dash-goal-progress">
      <div className="dash-goal-progress-head">
        <span className="dash-goal-progress-pct">{percent.toFixed(0)}%</span>
      </div>

      <div className="dash-goal-progress-track">
        <div
          className="dash-goal-progress-fill"
          style={{ width: `${percent}%`, background: barColor }}
        />
      </div>

      <div className="dash-goal-progress-values">
        <span>
          R$ <b>{formatCurrency(current)}</b>
        </span>
        <span>de R$ {formatCurrency(target)}</span>
      </div>
    </div>
  );
}
