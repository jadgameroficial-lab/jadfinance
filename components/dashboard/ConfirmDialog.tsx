"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  danger = true,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,6,8,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "dashConfirmFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#151519",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 26,
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          animation: "dashConfirmPop .25s var(--ease-spring)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: danger ? "rgba(241,101,101,0.14)" : "rgba(232,196,106,0.14)",
            color: danger ? "#f16565" : "#e8c46a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={19} strokeWidth={2} />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#f4f2ee" }}>{title}</h3>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#9b9ba3", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="dash-filter-btn"
            style={{ cursor: loading ? "default" : "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: danger ? "#e05252" : "var(--gold)",
              color: danger ? "#fff" : "#1a1408",
              border: "none",
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
