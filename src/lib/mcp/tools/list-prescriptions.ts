import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_prescriptions",
  title: "List prescriptions",
  description:
    "List prescriptions the signed-in user can access on Tammeni Doctor, optionally scoped to one consultation. Returns medications, instructions and issue date.",
  inputSchema: {
    consultation_id: z.string().optional().describe("Optional consultation id (uuid) to filter by."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ consultation_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 50);
    let query = supabaseForUser(ctx)
      .from("prescriptions")
      .select("id, consultation_id, doctor_id, medications, instructions, issued_at")
      .order("issued_at", { ascending: false })
      .limit(take);
    if (consultation_id) query = query.eq("consultation_id", consultation_id);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ prescriptions: data ?? [] });
  },
});
