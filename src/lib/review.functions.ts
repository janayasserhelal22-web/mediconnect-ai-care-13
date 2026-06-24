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
  isEmergency: z.boolean(),
  emergencyReasons: z.array(z.string()),
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
        "You are a clinical scribe, medical triage specialist, and emergency screener. From a patient-AI intake transcript, produce a precise medical case summary, screen for emergency red-flag symptoms, AND recommend three medical specialties (primary, secondary, alternative). Use clinical phrasing. Do NOT diagnose. Use 'Not reported' (or 'غير مذكور' in Arabic) when missing. Respond with ONLY a JSON object — no prose, no markdown fences.",
      prompt: `Patient intake transcript:\n\n${data.transcript}\n\n${langInstruction}\n\nReturn JSON exactly matching:\n{\n  "chiefComplaint": string,\n  "symptoms": string[],\n  "duration": string,\n  "severity": string,\n  "riskLevel": "Low" | "Moderate" | "High",\n  "clinicalNotes": string,\n  "aiSummary": string,\n  "primarySpecialty": string,\n  "secondarySpecialty": string,\n  "alternativeSpecialty": string,\n  "reasoning": string,\n  "isEmergency": boolean,\n  "emergencyReasons": string[]\n}\n\nEMERGENCY SCREENING — Set "isEmergency" to true if the transcript suggests ANY of: severe chest pain or pressure; difficulty breathing / shortness of breath at rest; stroke-like symptoms (facial droop, one-sided weakness, slurred speech, sudden severe headache, sudden vision loss); loss of consciousness, fainting, or unresponsiveness; severe / uncontrolled bleeding; suicidal thoughts, self-harm, or intent to harm others; severe allergic reaction / anaphylaxis; signs of sepsis or severe dehydration in infants. When true, list short human-readable reasons in "emergencyReasons" (e.g. "Severe chest pain", "Suicidal ideation"). When false, return an empty array. Also set "riskLevel" to "High" whenever "isEmergency" is true.\n\nSpecialty names should be one of common specialties: Internal Medicine, Pediatrics, Dermatology, Cardiology, Psychiatry, ENT, Orthopedics, Family Medicine, Neurology, Gastroenterology, Endocrinology, Pulmonology, Urology, Ophthalmology, Gynecology, Emergency Medicine. For emergency cases use "Emergency Medicine" as the primarySpecialty. Note: riskLevel MUST stay in English as "Low" | "Moderate" | "High". Specialty names MUST stay in English. emergencyReasons SHOULD be in the requested locale.`,
    });

    return ReviewSchema.parse(extractJson(text));
  });
