import { SiteHeader } from "@/components/SiteHeader";
import { createFileRoute, Link } from "@tanstack/react-router";
import clinicImg from "@/assets/clinic.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connect Care — Expert healthcare, delivered through intelligent design" },
      {
        name: "description",
        content:
          "Connect with board-certified physicians in minutes. AI-guided symptom intake that prioritizes your case and saves you time.",
      },
      { property: "og:title", content: "Connect Care — Modern medical consultations" },
      {
        property: "og:description",
        content: "AI-guided intake, board-certified specialists, all in one calm clinical experience.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <header className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--brand-soft),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 text-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand">
            <span className="mr-2 size-1.5 animate-pulse rounded-full bg-brand" />
            Next-Generation Medical Care
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Expert healthcare, delivered through{" "}
            <span className="text-brand">intelligent design.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            Connect with board-certified physicians in minutes. Experience a seamless AI-guided
            intake that prioritizes your symptoms and saves you time.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/consultation"
              className="w-full rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-brand transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Begin Symptom Check
            </Link>
            <a
              href="#features"
              className="w-full rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              How it works
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 text-left">
            {[
              { k: "98.4%", v: "Clinical accuracy" },
              { k: "<5 min", v: "Avg wait time" },
              { k: "24/7", v: "Specialist access" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-5">
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
            <span className="text-xs font-bold uppercase tracking-widest text-brand">How it works</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">A calmer path to clinical clarity.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Describe your symptoms",
                d: "Share what you're feeling in plain words. Our AI asks precise follow-ups, one at a time.",
              },
              {
                n: "02",
                t: "Get a structured summary",
                d: "Your conversation is organized into a clinical case file — symptoms, duration, severity, notes.",
              },
              {
                n: "03",
                t: "Meet your physician",
                d: "A matched, board-certified specialist reviews your case and continues the conversation.",
              },
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
              alt="A calm modern doctor's office with natural light"
              width={1280}
              height={896}
              loading="lazy"
              className="aspect-video w-full rounded-3xl object-cover ring-1 ring-slate-200"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">About</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Precision medicine, simplified for you.
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Connect Care bridges the gap between AI efficiency and human empathy. By automating
                the intake process, our doctors spend less time on paperwork and more time focused
                on your recovery plan.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "24/7 access to board-certified experts",
                  "Secure, HIPAA-compliant messaging",
                  "Structured case files delivered in seconds",
                ].map((item) => (
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
          <h2 className="text-3xl font-bold text-white">Ready for a better experience?</h2>
          <p className="mt-4 text-slate-400">
            Start your consultation now — no waiting room, no paperwork.
          </p>
          <Link
            to="/consultation"
            className="mt-10 inline-block rounded-full bg-brand px-10 py-5 text-lg font-bold text-white shadow-2xl transition-transform hover:scale-105"
          >
            Start Your Consultation
          </Link>
          <p className="mt-8 text-xs uppercase tracking-widest text-slate-500">
            © 2026 Connect Care Medical Group
          </p>
        </div>
      </footer>
    </div>
  );
}
