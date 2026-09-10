import {
  AlertTriangle,
  CircleCheck,
  Clock3,
  Package,
  CircleX,
} from "lucide-react";
import { getDashboardMetrics } from "../../lib/metrics";
import type { Medication, MedicationStatus } from "../../types";

export interface DashboardStatsProps {
  medications: Medication[];
  activeFilter?: MedicationStatus | "all" | "attention";
  onFilter?: (filter: MedicationStatus | "all") => void;
}

export function DashboardStats({
  medications,
  activeFilter = "all",
  onFilter,
}: DashboardStatsProps) {
  const metrics = getDashboardMetrics(medications);
  const cards = [
    {
      label: "Total medications",
      value: metrics.total,
      icon: Package,
      filter: "all" as const,
      tone: "total",
      hint: "All registered batches",
    },
    {
      label: "Healthy",
      value: metrics.healthy,
      icon: CircleCheck,
      filter: "healthy" as const,
      tone: "healthy",
      hint: "Stock and expiry in range",
    },
    {
      label: "Low stock",
      value: metrics["low stock"],
      icon: AlertTriangle,
      filter: "low stock" as const,
      tone: "low",
      hint: "At or below minimum",
    },
    {
      label: "Expiring soon",
      value: metrics["expiring soon"],
      icon: Clock3,
      filter: "expiring soon" as const,
      tone: "expiring",
      hint: "Within 30 days",
    },
    {
      label: "Expired",
      value: metrics.expired,
      icon: CircleX,
      filter: "expired" as const,
      tone: "expired",
      hint: "Past expiration date",
    },
  ];

  return (
    <div
      className="stats-grid"
      role="group"
      aria-label="Inventory metrics filter"
    >
      {cards.map(({ label, value, icon: Icon, filter, tone, hint }) => (
        <button
          type="button"
          key={label}
          className={`stat-card stat-${tone}`}
          aria-pressed={activeFilter === filter}
          title={`Filter inventory by ${label.toLowerCase()}`}
          onClick={() => onFilter?.(filter)}
        >
          <span className="stat-label">
            <span className="stat-icon">
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            {label}
          </span>
          <span className="stat-value">{value.toLocaleString("en-US")}</span>
          <span className="stat-hint">{hint}</span>
        </button>
      ))}
    </div>
  );
}
