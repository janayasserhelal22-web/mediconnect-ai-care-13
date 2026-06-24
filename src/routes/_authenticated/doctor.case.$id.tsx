import { RiskMeter } from "@/components/RiskScore";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/doctor/case/$id")({
  head: () => ({ meta: [{ title: "Case — MediConnect" }] }),
  component: DoctorCasePage,
});

type Med = { name: string; dosage: string; frequency: string };

function DoctorCasePage() {
  const { id } = Route.useParams();
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: consult } = useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data } = await supabase.from("consultations").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: review } = useQuery({
    queryKey: ["review", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("medical_reviews")
        .select("*")
        .eq("consultation_id", id)
        .maybeSingle();
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
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const [meds, setMeds] = useState<Med[]>([{ name: "", dosage: "", frequency: "" }]);
  const [instructions, setInstructions] = useState("");

  const isCompleted = consult?.status === "completed";

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const { error } = await supabase
      .from("chat_messages")
      .insert({ consultation_id: id, sender_id: user.id, content: input.trim() });
    if (error) return toast.error(error.message);
    setInput("");
    qc.invalidateQueries({ queryKey: ["chat", id] });
  }

  async function issuePrescription() {
    if (!user) return;
    const cleaned = meds.filter((m) => m.name.trim());
    if (cleaned.length === 0) return toast.error("Add at least one medication");
    const { error } = await supabase.from("prescriptions").insert({
      consultation_id: id,
      doctor_id: user.id,
      medications: cleaned,
      instructions: instructions || null,
    });
    if (error) return toast.error(error.message);
    toast.success(t("rx.issue"));
    setMeds([{ name: "", dosage: "", frequency: "" }]);
    setInstructions("");
    qc.invalidateQueries({ queryKey: ["prescription", id] });
  }

  async function complete() {
    const { error } = await supabase
      .from("consultations")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["consultation", id] });
    toast.success(t("doctor.case.completed"));
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
          {/* Sidebar: AI review */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-brand">
                {t("doctor.case.aiReview")}
              </div>
              {review ? (
                <dl className="space-y-3 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      {t("review.riskScore")}
                    </dt>
                    <RiskMeter level={review.risk_level} score={review.risk_score} />
                  </div>
                  <Row label={t("review.chiefComplaint")} value={review.chief_complaint} />
                  <Row label={t("review.duration")} value={review.duration} />
                  <Row label={t("review.severity")} value={review.severity} />
                  {review.symptoms && review.symptoms.length > 0 && (
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">
                        {t("review.symptoms")}
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {review.symptoms.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand"
                          >
                            {s}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {review.ai_summary && (
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">
                        {t("review.aiSummary")}
                      </dt>
                      <dd className="mt-1 text-xs leading-relaxed text-slate-700">
                        {review.ai_summary}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-slate-500">{t("review.loading")}</p>
              )}
            </div>

            {!isCompleted ? (
              <button
                onClick={complete}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                {t("doctor.case.complete")}
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                {t("doctor.case.completed")}
              </div>
            )}
          </aside>

          {/* Right column: chat + prescription editor */}
          <div className="space-y-6">
            <div className="flex h-[60vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3 text-sm font-bold">
                {t("doctor.case.chat")}
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
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
              {!isCompleted && (
                <form
                  onSubmit={sendMessage}
                  className="flex items-end gap-2 border-t border-slate-100 p-3"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder={t("consult.placeholder")}
                    className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white disabled:opacity-40"
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-bold">{t("doctor.case.prescription")}</div>
              {prescription && (
                <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  {t("rx.issuedAt")}: {new Date(prescription.issued_at).toLocaleString()}
                </div>
              )}
              {!isCompleted && (
                <>
                  <div className="space-y-2">
                    {meds.map((m, i) => (
                      <div key={i} className="grid gap-2 sm:grid-cols-3">
                        <input
                          value={m.name}
                          onChange={(e) => {
                            const copy = [...meds];
                            copy[i] = { ...copy[i], name: e.target.value };
                            setMeds(copy);
                          }}
                          placeholder={t("rx.medication")}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white"
                        />
                        <input
                          value={m.dosage}
                          onChange={(e) => {
                            const copy = [...meds];
                            copy[i] = { ...copy[i], dosage: e.target.value };
                            setMeds(copy);
                          }}
                          placeholder={t("rx.dosage")}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white"
                        />
                        <input
                          value={m.frequency}
                          onChange={(e) => {
                            const copy = [...meds];
                            copy[i] = { ...copy[i], frequency: e.target.value };
                            setMeds(copy);
                          }}
                          placeholder={t("rx.frequency")}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMeds([...meds, { name: "", dosage: "", frequency: "" }])
                    }
                    className="mt-2 text-xs font-semibold text-brand hover:underline"
                  >
                    + {t("rx.add")}
                  </button>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t("rx.instructions")}
                    rows={2}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white"
                  />
                  <button
                    onClick={issuePrescription}
                    className="mt-3 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
                  >
                    {t("rx.issue")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</dd>
    </div>
  );
}
