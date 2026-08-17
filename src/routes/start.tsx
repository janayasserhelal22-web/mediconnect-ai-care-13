import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, UserRound } from "lucide-react";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [{ title: "Start — Tammeni Doctor" }],
  }),
  component: StartPage,
});

function StartPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-3xl">
          <div className="mb-10 text-center animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("start.title")}</h1>
            <p className="mt-3 text-slate-600">{t("start.subtitle")}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <RoleCard
              to="/auth"
              params={{ role: "patient" }}
              icon={<UserRound className="size-7" />}
              label={t("start.patient")}
              desc={t("start.patientDesc")}
            />
            <RoleCard
              to="/auth"
              params={{ role: "doctor" }}
              icon={<Stethoscope className="size-7" />}
              label={t("start.doctor")}
              desc={t("start.doctorDesc")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function RoleCard({
  to,
  params,
  icon,
  label,
  desc,
}: {
  to: "/auth";
  params: { role: "patient" | "doctor" };
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      search={{ ...params, mode: "signup" as const }}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{label}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
    </Link>
  );
}
