"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cardsService, type CardRow } from "@/services/cards.service";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/lib/toast";
import { CARD_BRANDS, getCardBrandByName } from "@/lib/bank-logos";
import { BankBadge } from "@/components/dashboard/BankBadge";

export function CardFormDrawer({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: CardRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { accounts } = useAccounts();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [limitValue, setLimitValue] = useState("");
  const [closingDay, setClosingDay] = useState("1");
  const [dueDay, setDueDay] = useState("10");
  const [accountId, setAccountId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedBrand = getCardBrandByName(brand);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setBrand(editing.brand ?? "");
      setLimitValue(editing.limit_value != null ? String(editing.limit_value).replace(".", ",") : "");
      setClosingDay(String(editing.closing_day ?? 1));
      setDueDay(String(editing.due_day ?? 10));
      setAccountId(editing.account_id ?? "");
    } else {
      setName("");
      setBrand("");
      setLimitValue("");
      setClosingDay("1");
      setDueDay("10");
      setAccountId("");
    }
    setFormError(null);
  }, [open, editing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Informe um nome para o cartão.");
      return;
    }
    const parsedLimit = limitValue.trim()
      ? Number(limitValue.replace(/\./g, "").replace(",", "."))
      : null;
    const parsedClosing = Number(closingDay);
    const parsedDue = Number(dueDay);
    if (parsedLimit !== null && !Number.isFinite(parsedLimit)) {
      setFormError("Informe um limite válido.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmed,
        brand: brand.trim() || null,
        limit_value: parsedLimit,
        closing_day: Number.isFinite(parsedClosing) ? parsedClosing : null,
        due_day: Number.isFinite(parsedDue) ? parsedDue : null,
        account_id: accountId || null,
      };
      if (editing) {
        await cardsService.update(editing.id, payload);
        toast.success("Cartão atualizado.");
      } else {
        await cardsService.create(payload);
        toast.success("Cartão criado.");
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar cartão.";
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
          <h3>{editing ? "Editar cartão" : "Novo cartão"}</h3>
          <button className="dash-drawer-close" onClick={onClose} aria-label="Fechar" type="button">
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dash-d-field">
            <label>Nome</label>
            <input type="text" placeholder="Ex: Cartão Nubank" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="dash-d-field">
            <label>Bandeira</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {selectedBrand && <BankBadge initials={selectedBrand.initials} color={selectedBrand.color} size={40} />}
              <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ flex: 1 }}>
                <option value="">Selecione a bandeira (opcional)</option>
                {CARD_BRANDS.map((b) => (
                  <option key={b.slug} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="dash-d-field">
            <label>Limite</label>
            <input type="text" inputMode="decimal" placeholder="R$ 0,00" value={limitValue} onChange={(e) => setLimitValue(e.target.value)} />
          </div>
          <div className="dash-d-field">
            <label>Dia de fechamento</label>
            <input type="number" min={1} max={31} value={closingDay} onChange={(e) => setClosingDay(e.target.value)} />
          </div>
          <div className="dash-d-field">
            <label>Dia de vencimento</label>
            <input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          </div>
          <div className="dash-d-field">
            <label>Conta vinculada</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Nenhuma</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {formError && (
            <div style={{ color: "#f16565", fontSize: 12.5, marginBottom: 12, marginTop: -6 }}>{formError}</div>
          )}

          <button type="submit" className="dash-btn-gold" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: saving ? 0.7 : 1 }}>
            <span className="shine" />
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar cartão"}
          </button>
        </form>
      </div>
    </>
  );
}
