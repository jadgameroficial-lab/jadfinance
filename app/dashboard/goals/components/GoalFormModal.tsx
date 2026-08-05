"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  X,
  Target,
  PiggyBank,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  ShieldCheck,
  Briefcase,
  Gift,
  Smartphone,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import type { GoalRow, GoalInsert, GoalUpdate } from "@/services/goals.service";
import { useToast } from "@/lib/toast";

const DEFAULT_COLOR = "#AD7C24";
const DEFAULT_ICON = "target";

/**
 * Ícones disponíveis para uma meta. Chave é o que fica salvo em
 * financial_goals.icon (texto livre no banco); o mapa serve tanto para o
 * seletor aqui quanto para o GoalCard resolver o ícone de volta a um
 * componente visual.
 */
export const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  target: Target,
  "piggy-bank": PiggyBank,
  home: Home,
  car: Car,
  plane: Plane,
  "graduation-cap": GraduationCap,
  heart: Heart,
  "shield-check": ShieldCheck,
  briefcase: Briefcase,
  gift: Gift,
  smartphone: Smartphone,
  umbrella: Umbrella,
};

const PRIORITIES: { value: GoalRow["priority"]; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

/** "1234.5" ou "1.234,50" -> 1234.5 */
function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Shell centralizado (backdrop + painel) compartilhado pelos modais do
 * módulo Metas (GoalFormModal e ContributionModal), para não duplicar essa
 * estrutura entre os dois.
 */
export function ModalShell({
  open,
  title,
  onClose,
  maxWidth = 560,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dash-modal-backdrop open" role="presentation" onClick={onClose}>
      <div
        className="dash-modal"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-head">
          <h3>{title}</h3>
          <button className="dash-modal-close" onClick={onClose} aria-label="Fechar" type="button">
            <X size={15} strokeWidth={2} />
          </button>
        </div>
        <div className="dash-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function GoalFormModal({
  open,
  editing,
  onClose,
  createGoal,
  updateGoal,
}: {
  open: boolean;
  editing: GoalRow | null;
  onClose: () => void;
  createGoal: (input: GoalInsert) => Promise<GoalRow>;
  updateGoal: (id: string, input: GoalUpdate) => Promise<GoalRow>;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [priority, setPriority] = useState<GoalRow["priority"]>("media");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? "");
      setCategory(editing.category ?? "");
      setIcon(editing.icon ?? DEFAULT_ICON);
      setColor(editing.color ?? DEFAULT_COLOR);
      setPriority(editing.priority);
      setTargetAmount(String(editing.target_amount).replace(".", ","));
      setDeadline(editing.deadline ?? "");
    } else {
      setName("");
      setDescription("");
      setCategory("");
      setIcon(DEFAULT_ICON);
      setColor(DEFAULT_COLOR);
      setPriority("media");
      setTargetAmount("");
      setDeadline("");
    }
    setFormError(null);
  }, [open, editing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Informe um nome para a meta.");
      return;
    }

    const parsedTarget = parseAmount(targetAmount);
    if (parsedTarget === null || parsedTarget <= 0) {
      setFormError("Informe um valor objetivo válido, maior que zero.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        description: description.trim() || null,
        category: category.trim() || null,
        icon,
        color,
        priority,
        target_amount: parsedTarget,
        deadline: deadline || null,
      };

      if (editing) {
        await updateGoal(editing.id, payload);
        toast.success("Meta atualizada.");
      } else {
        await createGoal(payload);
        toast.success("Meta criada.");
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar meta.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell open={open} title={editing ? "Editar meta" : "Nova meta"} onClose={saving ? () => {} : onClose}>
      <form onSubmit={handleSubmit}>
        <div className="dash-d-field">
          <label>Nome</label>
          <input
            type="text"
            placeholder="Ex: Reserva de emergência"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="dash-d-field">
          <label>Descrição (opcional)</label>
          <input
            type="text"
            placeholder="Ex: 6 meses de custo de vida"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="dash-d-field">
            <label>Valor objetivo (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
          <div className="dash-d-field">
            <label>Prazo (opcional)</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>

        <div className="dash-d-field">
          <label>Prioridade</label>
          <div className="dash-d-tabs">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                className={priority === p.value ? "active" : ""}
                onClick={() => setPriority(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-d-field">
          <label>Categoria (opcional)</label>
          <input
            type="text"
            placeholder="Ex: Viagem, Casa própria, Reserva de emergência..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="dash-d-field">
          <label>Ícone</label>
          <div className="dash-icon-picker">
            {Object.entries(GOAL_ICON_MAP).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                className={icon === key ? "active" : ""}
                onClick={() => setIcon(key)}
                aria-label={key}
                aria-pressed={icon === key}
              >
                <Icon size={16} strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </div>

        <div className="dash-d-field">
          <label>Cor</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: 44,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                padding: 2,
                cursor: "pointer",
              }}
            />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--text-ter)" }}>{color}</span>
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: "var(--text-ter)", margin: "-6px 0 18px", lineHeight: 1.5 }}>
          O valor guardado é calculado automaticamente pelo banco a partir dos aportes
          registrados nesta meta — use &quot;Adicionar aporte&quot; no card para lançar valores.
        </p>

        {formError && (
          <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 12, marginTop: -6 }}>{formError}</div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="dash-filter-btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            type="submit"
            className="dash-btn-gold"
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            <span className="shine" />
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar meta"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
