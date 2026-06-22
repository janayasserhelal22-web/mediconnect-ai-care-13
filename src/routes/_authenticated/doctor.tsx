import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — MediConnect" }] }),
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["doctor-cases", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("consultations")
        .select("id,status,created_at,patient_id")
        .eq("doctor_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const active = data?.filter((c) => c.status !== "completed") ?? [];
  const completed = data?.filter((c) => c.status === "completed") ?? [];

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
  cases: { id: string; status: string; created_at: string }[];
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
          {cases.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {new Date(c.created_at).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">{t(`history.status.${c.status}`)}</div>
              </div>
              <Link
                to="/doctor/case/$id"
                params={{ id: c.id }}
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
              >
                {t("history.openCase")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
