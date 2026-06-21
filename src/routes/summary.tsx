import { SiteHeader } from "@/components/SiteHeader";
import type { ConsultationSummary } from "@/lib/summary.functions";
import { useI18n } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "ملخّص الاستشارة — Connect Care" },
      { name: "description", content: "ملخّص حالة سريري منظّم لمراجعة الطبيب." },
    ],
  }),
  component: SummaryPage,
});

type StoredSummary = { summary: ConsultationSummary; createdAt: string };

function SummaryPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<StoredSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("connectcare:lastSummary");
      if (raw) setData(JSON.parse(raw) as StoredSummary);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("summary.emptyTitle")}</h1>
          <p className="mt-4 text-slate-600">{t("summary.emptyDesc")}</p>
          <Link
            to="/consultation"
            className="mt-8 inline-block rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-brand transition-transform hover:scale-[1.02]"
          >
            {t("summary.emptyCta")}
          </Link>
        </main>
      </div>
    );
  }

  const { summary, createdAt } = data;
  const created = new Date(createdAt);
  const caseId = `CC-${created.getTime().toString().slice(-6)}`;

  const riskColor =
    summary.riskLevel === "High"
      ? "text-rose-600"
      : summary.riskLevel === "Moderate"
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16 animate-fade-in-up">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {t("summary.kicker")}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("summary.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {t("summary.caseLabel")} {caseId} · {t("summary.submitted")}{" "}
              {created.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
            </p>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-700/10">
            {t("summary.ready")}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardLabel>{t("summary.chiefComplaint")}</CardLabel>
              <p className="mt-2 text-lg font-semibold text-slate-900">{summary.chiefComplaint}</p>
            </Card>

            <Card>
              <CardLabel>{t("summary.narrative")}</CardLabel>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-800">
                {summary.clinicalNotes}
              </p>
            </Card>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card subtle>
                <CardLabel>{t("summary.duration")}</CardLabel>
                <div className="mt-2 text-2xl font-bold text-slate-900">{summary.duration}</div>
                <p className="mt-1 text-xs text-slate-500">{t("summary.durationHint")}</p>
              </Card>
              <Card subtle>
                <CardLabel>{t("summary.severity")}</CardLabel>
                <div className="mt-2 text-2xl font-bold text-brand">{summary.severity}</div>
                <p className="mt-1 text-xs text-slate-500">{t("summary.severityHint")}</p>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardLabel>{t("summary.flagged")}</CardLabel>
              <ul className="mt-4 space-y-3">
                {summary.symptoms.length === 0 && (
                  <li className="text-sm text-slate-500">{t("summary.notReported")}</li>
                )}
                {summary.symptoms.map((s, i) => (
                  <li key={`${s}-${i}`} className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-brand" />
                    <span className="text-sm font-medium text-slate-800">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardLabel>{t("summary.specialty")}</CardLabel>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {summary.recommendedSpecialty}
              </p>
            </Card>

            <Card>
              <CardLabel>{t("summary.risk")}</CardLabel>
              <p className={`mt-2 text-2xl font-bold ${riskColor}`}>{summary.riskLevel}</p>
            </Card>

            <div className="space-y-3">
              <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                {t("summary.approve")}
              </button>
              <Link
                to="/consultation"
                className="block w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {t("summary.newIntake")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ children, subtle = false }: { children: React.ReactNode; subtle?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 p-6 ${subtle ? "bg-slate-50" : "bg-white"}`}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{children}</h3>
  );
}
