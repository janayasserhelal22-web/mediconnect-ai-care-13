import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Payment = Tables<"payments">;
export type PaymentStatus = "pending" | "approved" | "rejected";

const RECEIPTS_BUCKET = "payment-receipts";

/** Latest payment record for a consultation (patient or doctor scope, RLS enforced). */
export function useConsultationPayment(consultationId: string | undefined) {
  return useQuery({
    queryKey: ["payment", consultationId],
    enabled: !!consultationId,
    refetchInterval: 6000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("consultation_id", consultationId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Payment | null;
    },
  });
}

/** All payments assigned to the currently signed-in doctor. */
export function useDoctorPayments(doctorId: string | undefined) {
  return useQuery({
    queryKey: ["doctor-payments", doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("doctor_id", doctorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });
}

/**
 * Upload a receipt image to the private `payment-receipts` bucket.
 * Path shape: `${patientId}/${consultationId}/${timestamp}-${name}`.
 */
export async function uploadReceipt(params: {
  file: File;
  patientId: string;
  consultationId: string;
}) {
  const { file, patientId, consultationId } = params;
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${patientId}/${consultationId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

/** Signed URL for a receipt image stored in the private bucket. */
export async function getReceiptSignedUrl(path: string, expiresInSec = 3600) {
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(path, expiresInSec);
  if (error) throw error;
  return data.signedUrl;
}

/** Create a pending payment row after uploading the receipt. */
export function useSubmitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      consultationId: string;
      patientId: string;
      doctorId: string;
      amount: number;
      transactionReference: string;
      receiptImagePath: string;
      paymentMethod?: string;
    }) => {
      const row: TablesInsert<"payments"> = {
        consultation_id: input.consultationId,
        patient_id: input.patientId,
        doctor_id: input.doctorId,
        amount: input.amount,
        transaction_reference: input.transactionReference.trim(),
        receipt_image_url: input.receiptImagePath,
        payment_method: input.paymentMethod ?? "vodafone_cash",
        status: "pending",
      };
      const { data, error } = await supabase
        .from("payments")
        .insert(row)
        .select("*")
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["payment", p.consultation_id] });
      qc.invalidateQueries({ queryKey: ["doctor-payments", p.doctor_id] });
    },
  });
}

/** Doctor approves the pending payment for a consultation they own. */
export function useApprovePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { paymentId: string; reviewerId: string }) => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("payments")
        .update({
          status: "approved",
          approved_by: input.reviewerId,
          approved_at: nowIso,
          reviewed_by: input.reviewerId,
          reviewed_at: nowIso,
          rejection_reason: null,
        })
        .eq("id", input.paymentId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["payment", p.consultation_id] });
      qc.invalidateQueries({ queryKey: ["doctor-payments", p.doctor_id] });
    },
  });
}

/** Doctor rejects the pending payment with a reason. */
export function useRejectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      paymentId: string;
      reviewerId: string;
      reason: string;
    }) => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("payments")
        .update({
          status: "rejected",
          rejection_reason: input.reason.trim(),
          approved_by: input.reviewerId,
          approved_at: nowIso,
          reviewed_by: input.reviewerId,
          reviewed_at: nowIso,
        })
        .eq("id", input.paymentId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["payment", p.consultation_id] });
      qc.invalidateQueries({ queryKey: ["doctor-payments", p.doctor_id] });
    },
  });
}
