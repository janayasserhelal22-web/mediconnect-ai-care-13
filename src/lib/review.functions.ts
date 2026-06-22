import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ReviewSchema = z.object({
  chiefComplaint: z.string(),
  symptoms: z.array(z.string()),
  duration: z.string(),
  severity: z.string(),
  riskLevel: z.enum(["Low", "Moderate", "High"]),
  clinicalNotes: z.string(),
  aiSummary: z.string(),
  primarySpecialty: z.string(),
  secondarySpecialty: z.string(),
  alternativeSpecialty: z.string(),
  reasoning: z.string(),
});

export type MedicalReview = z.infer<typeof ReviewSchema>;

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const body = fenced ? fenced[1] : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  return JSON.parse(body.slice(start, end + 1));
}

export const generateReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        transcript: z.string().min(1).max(20000),
        locale: z.enum(["ar", "en"]).default("ar"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const langInstruction =
      data.locale === "ar"
        ? "All string values in the JSON MUST be written in Modern Standard Arabic (العربية الفصحى)."
        : "All string values in the JSON MUST be written in English.";

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system:
        "You are a clinical scribe and medical triage specialist. From a patient-AI intake transcript, produce a precise medical case summary AND recommend three medical specialties (primary, secondary, alternative) that should review this case. Use clinical phrasing. Do NOT diagnose. Use 'Not reported' (or 'غير مذكور' in Arabic) when missing. Respond with ONLY a JSON object — no prose, no markdown fences.",
      prompt: `Patient intake transcript:\n\n${data.transcript}\n\n${langInstruction}\n\nReturn JSON exactly matching:\n{\n  "chiefComplaint": string,\n  "symptoms": string[],\n  "duration": string,\n  "severity": string,\n  "riskLevel": "Low" | "Moderate" | "High",\n  "clinicalNotes": string,\n  "aiSummary": string,\n  "primarySpecialty": string,\n  "secondarySpecialty": string,\n  "alternativeSpecialty": string,\n  "reasoning": string\n}\n\nSpecialty names should be one of common specialties: Internal Medicine, Pediatrics, Dermatology, Cardiology, Psychiatry, ENT, Orthopedics, Family Medicine, Neurology, Gastroenterology, Endocrinology, Pulmonology, Urology, Ophthalmology, Gynecology. Note: riskLevel MUST stay in English as "Low" | "Moderate" | "High". Specialty names MUST stay in English.`,
    });

    return ReviewSchema.parse(extractJson(text));
  });
