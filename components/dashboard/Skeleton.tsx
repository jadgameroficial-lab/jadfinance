import type { CSSProperties } from "react";

export function Skeleton({
  width = "100%",
  height = 14,
  circle = false,
  style,
}: {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`dash-skel ${circle ? "dash-skel-circle" : ""}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
