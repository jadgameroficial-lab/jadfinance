"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import type { AccountRow } from "@/services/accounts.service";
import { BankLogo } from "@/components/dashboard/BankLogo";

/**
 * Select de conta com o logo do banco correspondente — usado no formulário
 * de cartão para deixar claro a qual banco o cartão está vinculado
 * (em vez de depender só da bandeira, que é Visa/Mastercard/etc, não o banco).
 */
export function AccountSelect({
  accounts,
  value,
  onChange,
  placeholder = "Nenhuma",
}: {
  accounts: AccountRow[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = accounts.find((a) => a.id === value);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div className="bank-select" ref={rootRef}>
      <button
        type="button"
        className={`bank-select-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <BankLogo bankId={selected.icon} size={30} />
        ) : (
          <div className="bank-logo" style={{ width: 30, height: 30, borderRadius: 9, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={15} strokeWidth={1.8} color="var(--text-ter)" />
          </div>
        )}
        <span className={`bank-select-value${selected ? "" : " placeholder"}`}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown size={15} strokeWidth={2} className="bank-select-chevron" />
      </button>

      {open && (
        <ul className="bank-select-menu" role="listbox">
          <li>
            <button
              type="button"
              className={`bank-select-option${!value ? " active" : ""}`}
              onClick={() => pick("")}
            >
              <span className="bank-select-option-empty" />
              <span>Nenhuma</span>
            </button>
          </li>
          {accounts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={`bank-select-option${value === a.id ? " active" : ""}`}
                onClick={() => pick(a.id)}
                role="option"
                aria-selected={value === a.id}
              >
                <BankLogo bankId={a.icon} size={26} />
                <span>{a.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
