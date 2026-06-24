import { useI18n } from "@/lib/i18n";

export type RiskLevel = "Low" | "Medium" | "Moderate" | "High" | "Critical" | string;

export function riskBand(score: number | null | undefined): "Low" | "Medium" | "High" | "Critical" {
  const s = typeof score === "number" ? score : 0;
  if (s >= 75) return "Critical";
  if (s >= 50) return "High";
  if (s >= 25) return "Medium";
  return "Low";
}

export function normalizeLevel(level: RiskLevel | null | undefined, score?: number | null) {
  if (level === "Moderate") return "Medium";
  if (level && ["Low", "Medium", "High", "Critical"].includes(level)) return level;
  return riskBand(score);
}

export function riskClasses(level: string) {
  switch (level) {
    case "Critical":
      return {
        chip: "bg-rose-100 text-rose-800 border-rose-300",
        bar: "bg-rose-500",
        track: "bg-rose-100",
      };
    case "High":
      return {
        chip: "bg-orange-50 text-orange-700 border-orange-200",
        bar: "bg-orange-500",
        track: "bg-orange-100",
      };
    case "Medium":
      return {
        chip: "bg-amber-50 text-amber-700 border-amber-200",
        bar: "bg-amber-400",
        track: "bg-amber-100",
      };
    default:
      return {
        chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
        bar: "bg-emerald-500",
        track: "bg-emerald-100",
      };
  }
}

export function RiskBadge({
  level,
  score,
  className = "",
}: {
  level: RiskLevel | null | undefined;
  score?: number | null;
  className?: string;
}) {
  const { t } = useI18n();
  const normalized = normalizeLevel(level, score);
  const c = riskClasses(normalized);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${c.chip} ${className}`}
    >
      {t(`review.riskLevel.${normalized}`)}
      {typeof score === "number" && <span className="opacity-80">· {score}</span>}
    </span>
  );
}

export function RiskMeter({
  level,
  score,
}: {
  level: RiskLevel | null | undefined;
  score: number | null | undefined;
}) {
  const { t } = useI18n();
  const normalized = normalizeLevel(level, score);
  const c = riskClasses(normalized);
  const value = Math.max(0, Math.min(100, typeof score === "number" ? score : 0));
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {typeof score === "number" ? value : "—"}
          <span className="ms-1 text-xs font-medium text-slate-500">/100</span>
        </span>
        <RiskBadge level={normalized} />
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${c.track}`}>
        <div
          className={`h-full rounded-full ${c.bar} transition-all`}
          style={{ width: `${value}%` }}
          aria-label={t("review.riskScore")}
        />
      </div>
    </div>
  );
}
