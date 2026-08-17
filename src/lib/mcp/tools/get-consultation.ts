import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_consultation",
  title: "Get consultation details",
  description:
    "Get one consultation with its AI medical review (chief complaint, symptoms, duration, severity, risk score/level, emergency flags, recommended specialties) and, optionally, the AI intake transcript. Only consultations the signed-in user may access are returned.",
  inputSchema: {
    consultation_id: z.string().describe("The consultation id (uuid)."),
    include_transcript: z
      .boolean()
      .optional()
      .describe("Include the AI intake transcript messages (default false)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ consultation_id, include_transcript }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);

    const { data: consultation, error } = await supabase
      .from("consultations")
      .select("id, status, locale, patient_id, doctor_id, created_at, updated_at")
      .eq("id", consultation_id)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!consultation) return errorResult("Consultation not found or not accessible.");

    const { data: review } = await supabase
      .from("medical_reviews")
      .select("*")
      .eq("consultation_id", consultation_id)
      .maybeSingle();

    let transcript: { role: string; content: string; created_at: string }[] | undefined;
    if (include_transcript) {
      const { data: rows } = await supabase
        .from("intake_messages")
        .select("role, content, created_at")
        .eq("consultation_id", consultation_id)
        .order("created_at", { ascending: true });
      transcript = rows ?? [];
    }

    return jsonResult({ consultation, review: review ?? null, transcript });
  },
});
