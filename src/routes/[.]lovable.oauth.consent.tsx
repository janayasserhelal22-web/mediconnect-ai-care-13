import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};
type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase session lives in localStorage.
  ssr: false,
  head: () => ({ meta: [{ title: "Authorize app — Tammeni Doctor" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: {
          role: "patient" as const,
          mode: "signin" as const,
          next: location.pathname + location.searchStr,
        },
      });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.searchStr).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Authorization request failed</h1>
          <p className="mt-3 text-sm text-slate-600">
            {String((error as Error)?.message ?? error)}
          </p>
        </div>
      </main>
    </div>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName =
    details?.client?.name ?? details?.client?.client_name ?? t("oauth.unknownClient");
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError(t("oauth.noRedirect"));
      return;
    }
    window.location.href = target;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand">
            {t("oauth.kicker")}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {t("oauth.title", { client: clientName })}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {t("oauth.body", { client: clientName })}
          </p>

          {details?.client?.redirect_uri && (
            <p className="mt-3 break-all text-xs text-slate-500">
              {t("oauth.redirect")}: {details.client.redirect_uri}
            </p>
          )}

          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            {scopes.includes("profile") && <li>• {t("oauth.scopeProfile")}</li>}
            {scopes.includes("email") && <li>• {t("oauth.scopeEmail")}</li>}
            <li>• {t("oauth.scopeTools")}</li>
          </ul>

          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {t("oauth.boundary")}
          </p>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              disabled={busy}
              onClick={() => decide(true)}
              className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {t("oauth.approve")}
            </button>
            <button
              disabled={busy}
              onClick={() => decide(false)}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {t("oauth.deny")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
