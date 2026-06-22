import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — MediConnect" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("consultations")
        .select("id,status,created_at,doctor_id")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("history.title")}</h1>
              <p className="mt-2 text-slate-600">{t("history.subtitle")}</p>
            </div>
            <Link
              to="/intake/$id"
              params={{ id: "new" }}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
            >
              {t("history.startNew")}
            </Link>
          </div>

          {!data || data.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              {t("history.empty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {data.map((c) => {
                const target =
                  c.status === "intake"
                    ? { to: "/intake/$id" as const, params: { id: c.id } }
                    : c.status === "review"
                      ? { to: "/review/$id" as const, params: { id: c.id } }
                      : c.status === "matching"
                        ? { to: "/doctors/$id" as const, params: { id: c.id } }
                        : { to: "/consultation/$id" as const, params: { id: c.id } };
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t(`history.status.${c.status}`)}
                      </div>
                    </div>
                    <Link
                      {...target}
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t("history.openCase")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
