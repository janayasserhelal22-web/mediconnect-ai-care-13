import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, toggle, t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className={`rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${className}`}
    >
      {t("nav.language")}
      <span className="ms-1 text-slate-400">· {locale.toUpperCase()}</span>
    </button>
  );
}
