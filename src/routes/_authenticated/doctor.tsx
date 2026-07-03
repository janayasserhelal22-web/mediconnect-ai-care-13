import { RiskBadge, normalizeLevel } from "@/components/RiskScore";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — Tammeni Doctor" }] }),
  component: DoctorDashboard,
});

type Case = {
  id: string;
  status: string;
  created_at: string;
  patient_id: string;
  risk_score: number | null;
  risk_level: string | null;
  chief_complaint: string | null;
  is_emergency: boolean | null;
};

function DoctorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["doctor-cases", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Case[]> => {
      const { data } = await supabase
        .from("consultations")
        .select(
          "id,status,created_at,patient_id,medical_reviews(risk_score,risk_level,chief_complaint,is_emergency)",
        )
        .eq("doctor_id", user!.id)
        .order("created_at", { ascending: false });
      return (data ?? []).map((c) => {
        const r = Array.isArray(c.medical_reviews) ? c.medical_reviews[0] : c.medical_reviews;
        return {
          id: c.id,
          status: c.status,
          created_at: c.created_at,
          patient_id: c.patient_id,
          risk_score: r?.risk_score ?? null,
          risk_level: r?.risk_level ?? null,
          chief_complaint: r?.chief_complaint ?? null,
          is_emergency: r?.is_emergency ?? null,
        };
      });
    },
    refetchInterval: 10000,
  });

  const byRisk = (a: Case, b: Case) => (b.risk_score ?? -1) - (a.risk_score ?? -1);
  const active = (data?.filter((c) => c.status !== "completed") ?? []).slice().sort(byRisk);
  const completed = (data?.filter((c) => c.status === "completed") ?? []).slice().sort(byRisk);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("doctor.dashboard.title")}
            </h1>
            <p className="mt-2 text-slate-600">{t("doctor.dashboard.subtitle")}</p>
          </div>

          <Section title={t("doctor.cases.active")} cases={active} empty={t("doctor.cases.empty")} />
          <div className="h-8" />
          <Section title={t("doctor.cases.completed")} cases={completed} empty={t("doctor.cases.empty")} />
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  cases,
  empty,
}: {
  title: string;
  cases: Case[];
  empty: string;
}) {
  const { t } = useI18n();
  return (
    <div>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      {cases.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          {empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {cases.map((c) => {
            const level = normalizeLevel(c.risk_level, c.risk_score);
            const accent =
              level === "Critical"
                ? "border-s-4 border-s-rose-500"
                : level === "High"
                  ? "border-s-4 border-s-orange-500"
                  : level === "Medium"
                    ? "border-s-4 border-s-amber-400"
                    : "border-s-4 border-s-emerald-400";
            return (
              <li
                key={c.id}
                className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 ${accent} bg-white p-4 shadow-sm`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <RiskBadge level={c.risk_level} score={c.risk_score} />
                    {c.is_emergency && (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {t("emergency.title")}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {c.chief_complaint || new Date(c.created_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString()} · {t(`history.status.${c.status}`)}
                  </div>
                </div>
                <Link
                  to="/doctor/case/$id"
                  params={{ id: c.id }}
                  className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
                >
                  {t("history.openCase")}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
