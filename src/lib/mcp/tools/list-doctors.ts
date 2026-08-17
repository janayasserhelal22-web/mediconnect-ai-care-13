import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_doctors",
  title: "List doctors",
  description:
    "Browse doctors available on Tammeni Doctor, optionally filtered by specialty (English or Arabic). Returns name, specialty, years of experience, rating, fee and availability.",
  inputSchema: {
    specialty: z
      .string()
      .optional()
      .describe("Optional specialty filter, matched case-insensitively, e.g. Cardiology."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ specialty, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 50);
    let query = supabaseForUser(ctx)
      .from("doctor_profiles")
      .select(
        "user_id, full_name_en, full_name_ar, specialty, specialty_en, specialty_ar, years_experience, rating, fee, languages, availability, bio",
      )
      .order("rating", { ascending: false })
      .limit(take);
    if (specialty) query = query.ilike("specialty", `%${specialty}%`);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ doctors: data ?? [] });
  },
});
