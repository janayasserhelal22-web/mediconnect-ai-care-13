import { SiteHeader } from "@/components/SiteHeader";
import { generateSummary } from "@/lib/summary.functions";
import { useI18n } from "@/lib/i18n";
import { useChat } from "@ai-sdk/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: "استمارة الأعراض — Connect Care" },
      { name: "description", content: "ابدأ محادثة الاستقبال الطبي بمساعدة الذكاء الاصطناعي." },
    ],
  }),
  component: ConsultationPage,
});

function partsToText(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function ConsultationPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const generate = useServerFn(generateSummary);
  const [input, setInput] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initialMessage = useMemo<UIMessage>(
    () => ({
      id: "welcome",
      role: "assistant",
      parts: [{ type: "text", text: t("consultation.welcome") }],
    }),
    [t],
  );

  const { locale } = useI18n();
  const { messages, sendMessage, status } = useChat({
    id: "connectcare-intake",
    messages: [initialMessage],
    transport: new DefaultChatTransport({ api: "/api/chat", body: { locale } }),
    onError: (e) => setError(e.message || t("consultation.errorGeneric")),
  });


  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    setError(null);
    await sendMessage({ text: trimmed });
  };

  const handleFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    setError(null);
    try {
      const transcript = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${partsToText(m)}`)
        .join("\n\n");

      const summary = await generate({ data: { transcript } });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "connectcare:lastSummary",
          JSON.stringify({ summary, createdAt: new Date().toISOString() }),
        );
      }
      navigate({ to: "/summary" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("consultation.errorFinish"));
      setFinishing(false);
    }
  };

  const patientMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center animate-fade-in-up">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {t("consultation.kicker")}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t("consultation.title")}
            </h1>
            <p className="mt-2 text-slate-600">{t("consultation.subtitle")}</p>
          </div>

          <div className="flex h-[68vh] min-h-[480px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-brand/10 text-xs font-bold italic text-brand">
                  AI
                </span>
                <div>
                  <div className="text-sm font-semibold">{t("consultation.assistant")}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <span className="size-1.5 rounded-full bg-emerald-500" />{" "}
                    {t("consultation.active")}
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                {patientMessageCount}{" "}
                {patientMessageCount === 1
                  ? t("consultation.reply")
                  : t("consultation.replies")}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} youLabel={t("consultation.you")} />
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

            {error && (
              <div className="border-t border-rose-100 bg-rose-50 px-5 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}

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
                placeholder={t("consultation.placeholder")}
                disabled={isStreaming || finishing}
                className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming || finishing}
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t("consultation.send")}
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

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">{t("consultation.disclaimer")}</p>
            <button
              onClick={handleFinish}
              disabled={finishing || patientMessageCount === 0}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {finishing ? t("consultation.finishing") : t("consultation.finish")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message, youLabel }: { message: UIMessage; youLabel: string }) {
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
