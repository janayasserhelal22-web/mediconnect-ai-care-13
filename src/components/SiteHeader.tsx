import { Link } from "@tanstack/react-router";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand">
            <span className="size-3 rounded-full bg-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">{t("brand.name")}</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="/#features" className="hover:text-brand">{t("nav.features")}</a>
          <a href="/#about" className="hover:text-brand">{t("nav.about")}</a>
          <Link to="/summary" className="hover:text-brand">{t("nav.doctorView")}</Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            to="/consultation"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark"
          >
            {t("nav.startConsultation")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
