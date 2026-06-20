import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SummarySchema = z.object({
  chiefComplaint: z.string(),
  symptoms: z.array(z.string()),
  duration: z.string(),
  severity: z.string(),
  recommendedSpecialty: z.string(),
  riskLevel: z.enum(["Low", "Moderate", "High"]),
  clinicalNotes: z.string(),
});

export type ConsultationSummary = z.infer<typeof SummarySchema>;

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  // Strip ```json ... ``` fences if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const body = fenced ? fenced[1] : trimmed;
  // Find the first balanced JSON object.
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model response");
  return JSON.parse(body.slice(start, end + 1));
}

export const generateSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        transcript: z.string().min(1).max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system:
        "You are a clinical scribe. Extract a precise, professional medical case summary from a patient-AI intake transcript. Use clinical phrasing. Do not invent details that are not in the transcript; use 'Not reported' when missing. Respond ONLY with a single JSON object — no prose, no markdown fences.",
      prompt: `Patient intake transcript:\n\n${data.transcript}\n\nReturn JSON matching this exact shape (no extra keys):\n{\n  "chiefComplaint": string,\n  "symptoms": string[],\n  "duration": string,\n  "severity": string,\n  "recommendedSpecialty": string,\n  "riskLevel": "Low" | "Moderate" | "High",\n  "clinicalNotes": string\n}`,
    });

    const parsed = SummarySchema.parse(extractJson(text));
    return parsed;
  });

