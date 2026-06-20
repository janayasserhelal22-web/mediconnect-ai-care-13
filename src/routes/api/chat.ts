import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are the Connect Care AI Clinical Intake Assistant.

Your job is to gather a focused, structured medical intake from a patient before they speak with a doctor. Behave like a calm, professional triage nurse — warm but precise.

Conduct the interview by asking ONE question at a time. Cover, in this rough order:
1. Primary symptom and when it started (duration/onset)
2. Severity (1-10) and how it has changed over time
3. Location and any radiation of pain or symptoms
4. Triggers, what makes it better or worse
5. Associated symptoms (fever, nausea, breathing, etc.)
6. Relevant medical history, current medications, allergies

Keep responses short (1-3 sentences). Never diagnose, never prescribe, never speculate on conditions. If the user reports anything potentially life-threatening (chest pain with radiation, stroke signs, severe bleeding, suicidal ideation), gently advise them to seek emergency care immediately.

After 6-8 exchanges, offer to wrap up: "I have enough to prepare your case for the doctor. You can finish the consultation whenever you're ready."`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) => {
            console.error("chat stream error", error);
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("429")) return "Rate limit reached. Please wait a moment and try again.";
            if (message.includes("402")) return "AI credits exhausted. Please add credits to continue.";
            return "Something went wrong generating a response.";
          },
        });
      },
    },
  },
});
