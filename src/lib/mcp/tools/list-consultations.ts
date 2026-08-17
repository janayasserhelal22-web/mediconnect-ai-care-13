import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_consultations",
  title: "List consultations",
  description:
    "List the signed-in user's consultations on Tammeni Doctor. Patients see their own consultations; doctors see the cases assigned to them. Returns id, status, locale and timestamps, newest first.",
  inputSchema: {
    status: z
      .string()
      .optional()
      .describe("Optional status filter, e.g. intake, review, awaiting_payment, active, completed."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("consultations")
      .select("id, status, locale, patient_id, doctor_id, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(take);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ consultations: data ?? [] });
  },
});
