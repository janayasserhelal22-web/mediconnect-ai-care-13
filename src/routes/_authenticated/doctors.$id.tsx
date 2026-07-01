import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/doctors/$id")({
  head: () => ({ meta: [{ title: "Doctors — MediConnect" }] }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const { id } = Route.useParams();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: review } = useQuery({
    queryKey: ["review", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("medical_reviews")
        .select("primary_specialty,secondary_specialty,alternative_specialty,is_emergency,risk_level")
        .eq("consultation_id", id)
        .maybeSingle();
      return data;
    },
  });

  const specialties = [
    review?.primary_specialty,
    review?.secondary_specialty,
    review?.alternative_specialty,
  ].filter(Boolean) as string[];

  const isEmergency =
    !!review?.is_emergency ||
    review?.risk_level === "Critical" ||
    specialties.includes("Emergency Medicine");

  const { data: doctorsResult, isLoading } = useQuery({
    queryKey: ["doctors", specialties.join("|"), isEmergency],
    enabled: !!review,
    queryFn: async () => {
      // 1. Try recommended specialties, available only.
      if (specialties.length > 0) {
        const { data, error } = await supabase
          .from("doctor_profiles")
          .select("*")
          .in("specialty", specialties)
          .eq("availability", "available")
          .limit(20);
        if (error) throw error;
        if (data && data.length > 0) return { doctors: data, fallback: false as const };
      }

      // 2. Emergency fallback: always show Emergency Medicine doctors first.
      if (isEmergency) {
        const { data } = await supabase
          .from("doctor_profiles")
          .select("*")
          .eq("specialty", "Emergency Medicine")
          .limit(20);
        if (data && data.length > 0) return { doctors: data, fallback: true as const };
      }

      // 3. Fallback: any available doctor (broadest general → specialist).
      const { data } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("availability", "available")
        .limit(20);
      return { doctors: data ?? [], fallback: true as const };
    },
  });

  const doctors = doctorsResult?.doctors;
  const isFallback = doctorsResult?.fallback ?? false;

  async function book(doctorUserId: string) {
    if (!user) return;
    const { error } = await supabase
      .from("consultations")
      .update({ doctor_id: doctorUserId, status: "active", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("patient_id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/consultation/$id", params: { id } });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {t("doctors.kicker")}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("doctors.title")}
            </h1>
            <p className="mt-2 text-slate-600">{t("doctors.subtitle")}</p>
            {specialties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <p className="text-slate-500">…</p>
          ) : doctors && doctors.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => {
                const name = locale === "ar" ? d.full_name_ar : d.full_name_en;
                const spec = locale === "ar" ? d.specialty_ar : d.specialty_en;
                const available = d.availability === "available";
                return (
                  <div
                    key={d.user_id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-40 bg-slate-100">
                      {d.photo_url && (
                        <img
                          src={d.photo_url}
                          alt={name ?? ""}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <span
                        className={`absolute top-3 end-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          available
                            ? "bg-emerald-500/90 text-white"
                            : "bg-slate-500/90 text-white"
                        }`}
                      >
                        {available ? t("doctors.available") : t("doctors.busy")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-slate-900">{name}</h3>
                      <p className="mt-0.5 text-xs font-medium text-brand">{spec}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {Number(d.rating).toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>
                          {d.years_experience} {t("doctors.years")}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {t("doctors.fee")}:{" "}
                        <span className="font-bold text-slate-900">
                          {Number(d.fee).toFixed(0)}
                        </span>
                      </div>
                      <button
                        onClick={() => book(d.user_id)}
                        disabled={!available}
                        className="mt-4 w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        {t("doctors.book")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              {t("doctors.noResults")}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
