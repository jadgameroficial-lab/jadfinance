"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { categoriesService, type CategoryRow } from "@/services/categories.service";
import { useToast } from "@/lib/toast";

const DEFAULT_COLOR = "#e8c46a";

export function CategoryFormDrawer({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: CategoryRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setType(editing.type.toLowerCase().includes("inc") || editing.type.toLowerCase() === "receita" ? "income" : "expense");
      setColor(editing.color ?? DEFAULT_COLOR);
    } else {
      setName("");
      setType("expense");
      setColor(DEFAULT_COLOR);
    }
    setFormError(null);
  }, [open, editing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Informe um nome para a categoria.");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: trimmed, type, color };
      if (editing) {
        await categoriesService.update(editing.id, payload);
        toast.success("Categoria atualizada.");
      } else {
        await categoriesService.create(payload);
        toast.success("Categoria criada.");
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar categoria.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`dash-drawer-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`dash-drawer ${open ? "open" : ""}`} role="dialog" aria-hidden={!open}>
        <div className="dash-drawer-head">
          <h3>{editing ? "Editar categoria" : "Nova categoria"}</h3>
          <button className="dash-drawer-close" onClick={onClose} aria-label="Fechar" type="button">
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dash-d-tabs">
            <button type="button" className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>Despesa</button>
            <button type="button" className={type === "income" ? "active" : ""} onClick={() => setType("income")}>Receita</button>
          </div>

          <div className="dash-d-field">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Ex: Alimentação"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="dash-d-field">
            <label>Cor</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 44, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", padding: 2, cursor: "pointer" }}
              />
              <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--text-ter)" }}>{color}</span>
            </div>
          </div>

          {formError && (
            <div style={{ color: "#f16565", fontSize: 12.5, marginBottom: 12, marginTop: -6 }}>
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="dash-btn-gold"
            disabled={saving}
            style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: saving ? 0.7 : 1 }}
          >
            <span className="shine" />
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar categoria"}
          </button>
        </form>
      </div>
    </>
  );
}
