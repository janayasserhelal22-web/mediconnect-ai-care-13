import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const SearchSchema = z.object({
  role: z.enum(["patient", "doctor"]).default("patient"),
  mode: z.enum(["signin", "signup"]).default("signup"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => SearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Sign in — MediConnect" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t, locale } = useI18n();
  const { role: searchRole, mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, role: userRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && userRole) {
      navigate({ to: userRole === "doctor" ? "/doctor" : "/intake/new" });
    }
  }, [user, userRole, loading, navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [fee, setFee] = useState("150");

  const isSignUp = mode === "signup";
  const isDoctor = searchRole === "doctor";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

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
                  <Field
                    label={t("auth.bio")}
                    value={bio}
                    onChange={setBio}
                    textarea
                  />
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
                disabled={submitting}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {submitting ? t("auth.submitting") : t("auth.submit")}
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
