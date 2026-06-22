import { Link, useNavigate } from "@tanstack/react-router";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { t } = useI18n();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand">
            <span className="size-3 rounded-full bg-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">{t("brand.name")}</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="/#features" className="hover:text-brand">{t("nav.features")}</a>
          <a href="/#about" className="hover:text-brand">{t("nav.about")}</a>
          {user && role === "patient" && (
            <Link to="/history" className="hover:text-brand">{t("nav.history")}</Link>
          )}
          {user && role === "doctor" && (
            <Link to="/doctor" className="hover:text-brand">{t("nav.dashboard")}</Link>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("nav.signOut")}
            </button>
          ) : (
            <Link
              to="/start"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark sm:px-5"
            >
              {t("nav.startConsultation")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
