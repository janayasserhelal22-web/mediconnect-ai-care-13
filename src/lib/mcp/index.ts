import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listConsultations from "./tools/list-consultations";
import getConsultation from "./tools/get-consultation";
import listDoctors from "./tools/list-doctors";
import listPrescriptions from "./tools/list-prescriptions";

// The OAuth issuer must be the direct Supabase host, which survives publish.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "connect-care",
  title: "Connect Care",
  version: "0.1.0",
  instructions:
    "Tools for Tammeni Doctor (طمّني يا دكتور), an AI-first medical consultation platform. Callers act as the signed-in user: patients can read their own consultations, AI medical reviews, intake transcripts and prescriptions; doctors can read the cases assigned to them. Use `list_consultations` to find a case, `get_consultation` for the clinical review and transcript, `list_doctors` to browse specialists, and `list_prescriptions` for issued medications. These tools are read-only and never provide medical advice.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listConsultations, getConsultation, listDoctors, listPrescriptions],
});
