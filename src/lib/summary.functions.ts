import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
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

export const generateSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      transcript: z.string().min(1).max(20000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const { experimental_output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      experimental_output: Output.object({ schema: SummarySchema }),
      system:
        "You are a clinical scribe. Extract a precise, professional medical case summary from a patient-AI intake transcript. Use clinical phrasing. Do not invent details that are not in the transcript; use 'Not reported' when missing.",
      prompt: `Patient intake transcript:\n\n${data.transcript}\n\nProduce a structured clinical case summary.`,
    });

    return experimental_output as ConsultationSummary;
  });
