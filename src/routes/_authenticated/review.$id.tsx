import { EmergencyAlert } from "@/components/EmergencyAlert";
import { RiskMeter } from "@/components/RiskScore";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertCircle, AlertTriangle, ArrowLeft, Clock, FileText, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/review/$id")({
  head: () => ({ meta: [{ title: "Medical Review — MediConnect" }] }),
  component: ReviewPage,
});

function ReviewPage() {
  const { id } = Route.useParams();
  const { t, dir } = useI18n();
  const ackKey = `emergency-ack:${id}`;
  const [emergencyAcked, setEmergencyAcked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem(ackKey) === "1") {
      setEmergencyAcked(true);
    }
  }, [ackKey]);

  const { data, isLoading } = useQuery({
    queryKey: ["review", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_reviews")
        .select("*")
        .eq("consultation_id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleAcknowledge = () => {
    if (typeof window !== "undefined") window.localStorage.setItem(ackKey, "1");
    setEmergencyAcked(true);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">{t("review.loading")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center p-6 text-slate-500">
          {t("review.notFound")}
        </div>
      </div>
    );
  }

  const isEmergency = Boolean(data.is_emergency);
  const emergencyReasons = (data.emergency_reasons as string[] | null) ?? [];
  const showEmergencyDialog = isEmergency && !emergencyAcked;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      {showEmergencyDialog && (
        <EmergencyAlert reasons={emergencyReasons} onAcknowledge={handleAcknowledge} />
      )}
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">
          {isEmergency && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 sm:p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden />
              <div className="space-y-1">
                <div className="text-sm font-bold text-rose-800">{t("emergency.title")}</div>
                <p className="text-xs leading-relaxed text-rose-700 sm:text-sm">
                  {t("emergency.action")}
                </p>
              </div>
            </div>
          )}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {t("review.kicker")}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("review.title")}
            </h1>
            <p className="mt-2 text-slate-600">{t("review.subtitle")}</p>
          </div>


          <div className="space-y-5">
            <Card icon={<FileText className="size-4" />} title={t("review.chiefComplaint")}>
              <p className="text-base font-semibold text-slate-900">
                {data.chief_complaint || t("review.notReported")}
              </p>
            </Card>

            <div className="grid gap-5 sm:grid-cols-3">
              <Card icon={<Clock className="size-4" />} title={t("review.duration")}>
                <p className="text-sm font-semibold text-slate-900">
                  {data.duration || t("review.notReported")}
                </p>
              </Card>
              <Card icon={<Activity className="size-4" />} title={t("review.severity")}>
                <p className="text-sm font-semibold text-slate-900">
                  {data.severity || t("review.notReported")}
                </p>
              </Card>
              <Card icon={<AlertCircle className="size-4" />} title={t("review.riskScore")}>
                <RiskMeter level={data.risk_level} score={data.risk_score} />
              </Card>
            </div>

            {data.symptoms && data.symptoms.length > 0 && (
              <Card icon={<Stethoscope className="size-4" />} title={t("review.symptoms")}>
                <div className="flex flex-wrap gap-2">
                  {data.symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {data.ai_summary && (
              <Card title={t("review.aiSummary")}>
                <p className="text-sm leading-relaxed text-slate-700">{data.ai_summary}</p>
              </Card>
            )}

            {data.clinical_notes && (
              <Card title={t("review.notes")}>
                <p className="text-sm leading-relaxed text-slate-700">{data.clinical_notes}</p>
              </Card>
            )}

            <Card title={t("review.specialtyTitle")}>
              <dl className="grid gap-3 sm:grid-cols-3">
                <SpecialtyBox label={t("review.primarySpecialty")} value={data.primary_specialty} highlight />
                <SpecialtyBox label={t("review.secondarySpecialty")} value={data.secondary_specialty} />
                <SpecialtyBox label={t("review.alternativeSpecialty")} value={data.alternative_specialty} />
              </dl>
              {data.reasoning && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t("review.reasoning")}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{data.reasoning}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand"
            >
              <ArrowLeft className={`size-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
              {t("nav.history")}
            </Link>
            <Link
              to="/doctors/$id"
              params={{ id }}
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
            >
              {t("review.continue")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function SpecialtyBox({ label, value, highlight }: { label: string; value: string | null; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 ${highlight ? "border-brand/40 bg-brand/5" : "border-slate-200 bg-white"}`}
    >
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${highlight ? "text-brand" : "text-slate-900"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
