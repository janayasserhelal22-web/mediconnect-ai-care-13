import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/consultation/$id")({
  head: () => ({ meta: [{ title: "Consultation — Tammeni Doctor" }] }),
  component: ConsultationPage,
});

function ConsultationPage() {
  const { id } = Route.useParams();
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: consult } = useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data } = await supabase.from("consultations").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("consultation_id", id)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    refetchInterval: 4000,
  });

  const { data: prescription } = useQuery({
    queryKey: ["prescription", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("consultation_id", id)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 8000,
  });

  const { data: payment } = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("id,status,rejection_reason")
        .eq("consultation_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 6000,
  });

  const isPatient = !!user && user.id === consult?.patient_id;
  const paymentBlocked = isPatient && payment?.status !== "approved";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !user) return;
    setInput("");
    const { error } = await supabase
      .from("chat_messages")
      .insert({ consultation_id: id, sender_id: user.id, content: trimmed });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["chat", id] });
  }

  const isCompleted = consult?.status === "completed";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex h-[70vh] min-h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <div className="text-sm font-bold text-slate-900">{t("consult.title")}</div>
              <div className="text-xs text-slate-500">
                {isCompleted ? t("consult.completed") : "•"}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
              {(messages?.length ?? 0) === 0 && (
                <p className="text-center text-sm text-slate-500">{t("consult.empty")}</p>
              )}
              {messages?.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                        mine
                          ? "rounded-se-none bg-brand text-white"
                          : "rounded-ss-none bg-slate-100 text-slate-800"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {!isCompleted && paymentBlocked && (
              <div className="border-t border-slate-100 bg-amber-50 p-4 text-center text-sm text-amber-900">
                <p className="font-semibold">{t("payment.consult.awaiting")}</p>
                <Link
                  to="/payment/$id"
                  params={{ id }}
                  className="mt-2 inline-block rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
                >
                  {t("payment.consult.viewStatus")}
                </Link>
              </div>
            )}

            {!isCompleted && !paymentBlocked && (
              <form
                onSubmit={send}
                className="flex items-end gap-2 border-t border-slate-100 p-3"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={1}
                  placeholder={t("consult.placeholder")}
                  className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white disabled:opacity-40"
                  aria-label={t("consult.send")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`size-4 ${dir === "rtl" ? "-scale-x-100" : ""}`}
                  >
                    <path d="M3.105 3.105a.75.75 0 01.815-.163l13.5 5.625a.75.75 0 010 1.366l-13.5 5.625a.75.75 0 01-1.024-.91l1.7-5.227H10a.75.75 0 000-1.5H4.596l-1.7-5.227a.75.75 0 01.21-.789z" />
                  </svg>
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <Link
              to="/review/$id"
              params={{ id }}
              className="block rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-brand hover:bg-slate-50"
            >
              📋 {t("consult.viewReview")}
            </Link>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("rx.title")}
              </div>
              {prescription ? (
                <PrescriptionView rx={prescription} />
              ) : (
                <p className="text-xs text-slate-500">{t("rx.none")}</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

type Med = { name: string; dosage?: string; frequency?: string };

function PrescriptionView({
  rx,
}: {
  rx: { medications: unknown; instructions: string | null; issued_at: string };
}) {
  const { t } = useI18n();
  const meds = (Array.isArray(rx.medications) ? rx.medications : []) as Med[];
  return (
    <div className="space-y-2">
      <ul className="space-y-1.5 text-sm">
        {meds.map((m, i) => (
          <li key={i} className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="font-semibold text-slate-900">{m.name}</div>
            {(m.dosage || m.frequency) && (
              <div className="text-xs text-slate-600">
                {[m.dosage, m.frequency].filter(Boolean).join(" · ")}
              </div>
            )}
          </li>
        ))}
      </ul>
      {rx.instructions && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {rx.instructions}
        </p>
      )}
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        {t("rx.issuedAt")} {new Date(rx.issued_at).toLocaleString()}
      </p>
    </div>
  );
}
