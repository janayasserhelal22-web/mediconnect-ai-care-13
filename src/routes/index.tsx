import { SiteHeader } from "@/components/SiteHeader";
import { createFileRoute, Link } from "@tanstack/react-router";
import clinicImg from "@/assets/clinic.jpg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connect Care — كونكت كير" },
      {
        name: "description",
        content:
          "تواصل مع أطباء معتمدين خلال دقائق. استمارة أعراض موجّهة بالذكاء الاصطناعي توفر وقتك وترتب حالتك.",
      },
      { property: "og:title", content: "Connect Care — كونكت كير" },
      {
        property: "og:description",
        content: "استقبال طبي ذكي بالعربية والإنجليزية مع أطباء معتمدين.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <header className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--brand-soft),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 text-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand">
            <span className="me-2 size-1.5 animate-pulse rounded-full bg-brand" />
            {t("home.badge")}
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            {t("home.heroTitle1")} <span className="text-brand">{t("home.heroTitle2")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">{t("home.heroSubtitle")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/start"
              className="w-full rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-brand transition-transform hover:scale-[1.02] sm:w-auto"
            >
              {t("home.ctaPrimary")}
            </Link>
            <a
              href="#features"
              className="w-full rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              {t("home.ctaSecondary")}
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 text-start">
            {[
              { k: "98.4%", v: t("home.stat.accuracy") },
              { k: t("home.stat.wait.value"), v: t("home.stat.wait") },
              { k: t("home.stat.access.value"), v: t("home.stat.access") },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-2xl font-bold text-brand">{s.k}</div>
                <div className="mt-1 text-sm text-slate-500">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {t("features.kicker")}
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{t("features.title")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: t("features.s1.title"), d: t("features.s1.desc") },
              { n: "02", t: t("features.s2.title"), d: t("features.s2.desc") },
              { n: "03", t: t("features.s3.title"), d: t("features.s3.desc") },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="text-xs font-mono font-bold text-brand">{step.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-slate-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <img
              src={clinicImg}
              alt={t("about.imageAlt")}
              width={1280}
              height={896}
              loading="lazy"
              className="aspect-video w-full rounded-3xl object-cover ring-1 ring-slate-200"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">
                {t("about.kicker")}
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">{t("about.title")}</h2>
              <p className="mt-4 leading-relaxed text-slate-600">{t("about.desc")}</p>
              <div className="mt-8 space-y-4">
                {[t("about.b1"), t("about.b2"), t("about.b3")].map((item) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10">
                      <div className="size-1.5 rounded-full bg-brand" />
                    </div>
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-slate-900 py-20 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-3xl font-bold text-white">{t("footer.title")}</h2>
          <p className="mt-4 text-slate-400">{t("footer.subtitle")}</p>
          <Link
            to="/start"
            className="mt-10 inline-block rounded-full bg-brand px-10 py-5 text-lg font-bold text-white shadow-2xl transition-transform hover:scale-105"
          >
            {t("footer.cta")}
          </Link>
          <p className="mt-8 text-xs uppercase tracking-widest text-slate-500">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
