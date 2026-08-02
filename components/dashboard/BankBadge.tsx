export function BankBadge({
  initials,
  color,
  size = 38,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--display)",
        fontWeight: 700,
        fontSize: size * 0.36,
        letterSpacing: "-0.02em",
        flexShrink: 0,
        boxShadow: "0 1px 0 rgba(255,255,255,0.25) inset, 0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      {initials}
    </div>
  );
}
