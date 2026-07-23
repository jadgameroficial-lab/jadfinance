"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { accountsService, type AccountRow } from "@/services/accounts.service";
import { useToast } from "@/lib/toast";
import { getBankById } from "@/lib/banks";
import { BankSelect } from "@/components/dashboard/BankSelect";

const ACCOUNT_TYPES = [
  { value: "corrente", label: "Conta corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "investimento", label: "Investimento" },
  { value: "carteira", label: "Carteira / Dinheiro" },
];

export function AccountFormDrawer({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: AccountRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState(ACCOUNT_TYPES[0].value);
  const [bankSlug, setBankSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedBank = getBankById(bankSlug);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setType(editing.type);
      setBankSlug(editing.icon ?? "");
    } else {
      setName("");
      setType(ACCOUNT_TYPES[0].value);
      setBankSlug("");
    }
    setFormError(null);
  }, [open, editing]);

  function handleBankChange(slug: string) {
    setBankSlug(slug);
    // Se o nome ainda estiver vazio ou for o valor automático anterior,
    // sugerimos o nome do banco escolhido — o usuário pode editar livremente.
    const bank = getBankById(slug);
    if (bank && !name.trim()) {
      setName(bank.name);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Informe um nome para a conta.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmed,
        type,
        icon: bankSlug || null,
        color: selectedBank?.color ?? null,
      };
      if (editing) {
        await accountsService.update(editing.id, payload);
        toast.success("Conta atualizada.");
      } else {
        await accountsService.create(payload);
        toast.success("Conta criada.");
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar conta.";
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
          <h3>{editing ? "Editar conta" : "Nova conta"}</h3>
          <button className="dash-drawer-close" onClick={onClose} aria-label="Fechar" type="button">
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dash-d-field">
            <label>Banco</label>
            <BankSelect value={bankSlug} onChange={handleBankChange} />
            <p style={{ fontSize: 11, color: "var(--text-ter)", marginTop: 6 }}>
              Logo e cor são aplicados automaticamente ao escolher o banco.
            </p>
          </div>
          <div className="dash-d-field">
            <label>Nome</label>
            <input type="text" placeholder="Ex: Conta Corrente Nubank" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="dash-d-field">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <p style={{ fontSize: 11.5, color: "var(--text-ter)", margin: "-6px 0 18px", lineHeight: 1.5 }}>
            O saldo desta conta é calculado automaticamente a partir das transações que você
            registrar nela. Não existe saldo inicial para cadastrar.
          </p>

          {formError && (
            <div style={{ color: "#f16565", fontSize: 12.5, marginBottom: 12, marginTop: -6 }}>{formError}</div>
          )}

          <button type="submit" className="dash-btn-gold" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: saving ? 0.7 : 1 }}>
            <span className="shine" />
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar conta"}
          </button>
        </form>
      </div>
    </>
  );
}
