import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { generateReview } from "@/lib/review.functions";
import { useChat } from "@ai-sdk/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/intake/$id")({
  head: () => ({ meta: [{ title: "AI Intake — MediConnect" }] }),
  component: IntakePage,
});

function partsToText(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function IntakePage() {
  const { id } = Route.useParams();
  const { t, dir, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const generate = useServerFn(generateReview);
  const [consultationId, setConsultationId] = useState<string | null>(id === "new" ? null : id);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [input, setInput] = useState("");
  const [finishing, setFinishing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Bootstrap: create consultation if "new"
  useEffect(() => {
    if (!user) return;
    if (id !== "new") {
      setConsultationId(id);
      setBootstrapping(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("consultations")
        .insert({ patient_id: user.id, status: "intake", locale })
        .select("id")
        .single();
      if (error) {
        toast.error(error.message);
        setBootstrapping(false);
        return;
      }
      setConsultationId(data.id);
      navigate({ to: "/intake/$id", params: { id: data.id }, replace: true });
      setBootstrapping(false);
    })();
  }, [id, user, locale, navigate]);

  const initialMessage = useMemo<UIMessage>(
    () => ({
      id: "welcome",
      role: "assistant",
      parts: [{ type: "text", text: t("intake.welcome") }],
    }),
    [t],
  );

  const { messages, sendMessage, status } = useChat({
    id: consultationId ?? "pending",
    messages: [initialMessage],
    transport: new DefaultChatTransport({ api: "/api/chat", body: { locale } }),
    onError: (e) => toast.error(e.message || t("intake.errorGeneric")),
  });

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  const patientMessageCount = messages.filter((m) => m.role === "user").length;
  const progress = Math.min(100, Math.round((patientMessageCount / 6) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    await sendMessage({ text: trimmed });
    // Persist user message
    if (consultationId) {
      void supabase
        .from("intake_messages")
        .insert({ consultation_id: consultationId, role: "user", content: trimmed });
    }
  };

  const handleFinish = async () => {
    if (finishing || !consultationId) return;
    setFinishing(true);
    try {
      const transcript = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${partsToText(m)}`)
        .join("\n\n");

      const review = await generate({ data: { transcript, locale } });

      const { error: reviewErr } = await supabase.from("medical_reviews").insert({
        consultation_id: consultationId,
        chief_complaint: review.chiefComplaint,
        symptoms: review.symptoms,
        duration: review.duration,
        severity: review.severity,
        risk_level: review.riskLevel,
        risk_score: review.riskScore,
        clinical_notes: review.clinicalNotes,
        ai_summary: review.aiSummary,
        primary_specialty: review.primarySpecialty,
        secondary_specialty: review.secondarySpecialty,
        alternative_specialty: review.alternativeSpecialty,
        reasoning: review.reasoning,
        is_emergency: review.isEmergency,
        emergency_reasons: review.emergencyReasons,
      });
      if (reviewErr) throw reviewErr;

      await supabase
        .from("consultations")
        .update({ status: "review", updated_at: new Date().toISOString() })
        .eq("id", consultationId);

      navigate({ to: "/review/$id", params: { id: consultationId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("intake.errorFinish"));
      setFinishing(false);
    }
  };

  if (bootstrapping || !consultationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {t("intake.kicker")}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t("intake.title")}
            </h1>
            <p className="mt-2 text-slate-600">{t("intake.subtitle")}</p>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{t("intake.progress")}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex h-[64vh] min-h-[460px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-brand/10 text-xs font-bold italic text-brand">
                  AI
                </span>
                <div>
                  <div className="text-sm font-semibold">{t("intake.assistant")}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {t("intake.active")}
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                {patientMessageCount}{" "}
                {patientMessageCount === 1 ? t("intake.reply") : t("intake.replies")}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} youLabel={t("intake.you")} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-3 animate-bubble-in">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold italic text-brand">
                    AI
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-ss-none bg-slate-100 px-4 py-3">
                    <span className="typing-dot size-1.5 rounded-full bg-slate-400" />
                    <span className="typing-dot size-1.5 rounded-full bg-slate-400" />
                    <span className="typing-dot size-1.5 rounded-full bg-slate-400" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 border-t border-slate-100 bg-white p-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                rows={1}
                placeholder={t("intake.placeholder")}
                disabled={isStreaming || finishing}
                className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming || finishing}
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-40"
                aria-label={t("intake.send")}
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
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">{t("intake.disclaimer")}</p>
            <button
              onClick={handleFinish}
              disabled={finishing || patientMessageCount < 2}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50 sm:px-6 sm:py-3 sm:text-sm"
            >
              {finishing ? t("intake.finishing") : t("intake.finish")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Bubble({ message, youLabel }: { message: UIMessage; youLabel: string }) {
  const isUser = message.role === "user";
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  if (!text) return null;
  return (
    <div className={`flex items-start gap-3 animate-bubble-in ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
          {youLabel}
        </span>
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold italic text-brand">
          AI
        </span>
      )}
      <div
        className={
          isUser
            ? "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-se-none bg-brand px-4 py-3 text-sm leading-relaxed text-white"
            : "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-ss-none bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800"
        }
      >
        {text}
      </div>
    </div>
  );
}
