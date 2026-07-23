import { Skeleton } from "@/components/dashboard/Skeleton";

export default function DashboardRouteLoading() {
  return (
    <>
      <div className="dash-page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width={180} height={22} />
          <Skeleton width={260} height={13} />
        </div>
      </div>

      <div className="dash-panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={16} />
          ))}
        </div>
      </div>
    </>
  );
}
