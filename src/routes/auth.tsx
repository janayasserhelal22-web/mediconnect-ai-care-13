import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const SearchSchema = z.object({
  role: z.enum(["patient", "doctor"]).default("patient"),
  mode: z.enum(["signin", "signup"]).default("signup"),
  // Same-origin relative path to return to after auth (used by the OAuth consent flow).
  next: z.string().optional(),
});

/** Only allow same-origin relative paths as post-auth redirect targets. */
function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => SearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Sign in — Tammeni Doctor" }] }),
  component: AuthPage,
});

type AuthErrorShape = { message?: string; code?: string; status?: number };

function mapAuthError(
  err: unknown,
  t: (k: string, v?: Record<string, string | number>) => string,
): { message: string; cooldown: number } {
  const e = (err ?? {}) as AuthErrorShape;
  const msg = e.message ?? "";
  const code = e.code ?? "";
  const status = e.status ?? 0;

  // Rate limit (Supabase: 429 + "after N seconds")
  if (status === 429 || code === "over_email_send_rate_limit" || /rate limit/i.test(msg)) {
    const match = /(\d+)\s*second/i.exec(msg);
    const seconds = match ? Number(match[1]) : 60;
    return { message: t("auth.errorRateLimit", { seconds }), cooldown: seconds };
  }
  if (code === "invalid_credentials" || /invalid login/i.test(msg)) {
    return { message: t("auth.errorInvalidCredentials"), cooldown: 0 };
  }
  if (code === "email_not_confirmed" || /not confirmed/i.test(msg)) {
    return { message: t("auth.errorEmailNotConfirmed"), cooldown: 0 };
  }
  if (code === "user_already_exists" || /already registered|already exists/i.test(msg)) {
    return { message: t("auth.errorUserExists"), cooldown: 0 };
  }
  if (code === "weak_password" || /password/i.test(msg) && /weak|short|6 char/i.test(msg)) {
    return { message: t("auth.errorWeakPassword"), cooldown: 0 };
  }
  return { message: msg || t("auth.errorGeneric"), cooldown: 0 };
}

function AuthPage() {
  const { t, locale } = useI18n();
  const { role: searchRole, mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, role: userRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && userRole) {
      navigate({
        to: userRole === "doctor" ? "/doctor" : "/intake/$id",
        params: userRole === "doctor" ? undefined : { id: "new" },
        replace: true,
      });
    }
  }, [user, userRole, loading, navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [fee, setFee] = useState("150");

  const isSignUp = mode === "signup";
  const isDoctor = searchRole === "doctor";

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || cooldown > 0) return;
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              role: searchRole,
              locale,
              phone,
              specialty: isDoctor ? specialty : undefined,
              bio: isDoctor ? bio : undefined,
              fee: isDoctor ? Number(fee) : undefined,
            },
          },
        });
        if (error) throw error;
        // If email confirmation is required, no session is returned.
        if (!data.session) {
          setSentToEmail(email);
          // Soft cooldown to prevent immediate re-submit (Supabase 60s limit).
          startCooldown(60);
        }
        // If session exists, useEffect above will redirect after role loads.
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const { message, cooldown: cd } = mapAuthError(err, t);
      toast.error(message);
      if (cd > 0) startCooldown(cd);
    } finally {
      setSubmitting(false);
    }
  }

  if (sentToEmail) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
              ✉
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("auth.checkEmailTitle")}</h1>
            <p className="mt-3 text-sm text-slate-600">
              {t("auth.checkEmailBody", { email: sentToEmail })}
            </p>
            <Link
              to="/auth"
              search={{ role: searchRole, mode: "signin" }}
              onClick={() => setSentToEmail(null)}
              className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
            >
              {t("auth.backToSignIn")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const disabled = submitting || cooldown > 0;
  const submitLabel = submitting
    ? t("auth.submitting")
    : cooldown > 0
      ? t("auth.cooldown", { seconds: cooldown })
      : t("auth.submit");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
              {t("auth.continueAs")}: {isDoctor ? t("auth.role.doctor") : t("auth.role.patient")}
              <Link
                to="/start"
                className="ms-2 font-medium text-slate-500 underline-offset-2 hover:underline"
              >
                ({t("auth.changeRole")})
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isSignUp
                ? isDoctor
                  ? t("auth.signUpAsDoctor")
                  : t("auth.signUpAsPatient")
                : isDoctor
                  ? t("auth.signInAsDoctor")
                  : t("auth.signInAsPatient")}
            </h1>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isSignUp && (
                <Field
                  label={t("auth.fullName")}
                  value={fullName}
                  onChange={setFullName}
                  required
                />
              )}
              <Field
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label={t("auth.password")}
                type="password"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
              />
              {isSignUp && (
                <Field
                  label={t("auth.phone")}
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                />
              )}
              {isSignUp && isDoctor && (
                <>
                  <Field
                    label={t("auth.specialty")}
                    placeholder={t("auth.specialty.placeholder")}
                    value={specialty}
                    onChange={setSpecialty}
                    required
                  />
                  <Field label={t("auth.bio")} value={bio} onChange={setBio} textarea />
                  <Field
                    label={t("auth.fee")}
                    type="number"
                    value={fee}
                    onChange={setFee}
                    required
                  />
                </>
              )}

              <button
                type="submit"
                disabled={disabled}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {submitLabel}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              {isSignUp ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
              <Link
                to="/auth"
                search={{ role: searchRole, mode: isSignUp ? "signin" : "signup" }}
                className="font-semibold text-brand hover:underline"
              >
                {isSignUp ? t("auth.switchSignIn") : t("auth.switchSignUp")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  minLength,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          minLength={minLength}
          className={cls}
        />
      )}
    </label>
  );
}
