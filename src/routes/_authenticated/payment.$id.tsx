import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Copy,
  ImageUp,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/payment/$id")({
  head: () => ({ meta: [{ title: "Payment Verification — MediConnect" }] }),
  component: PaymentPage,
});

const MAX_BYTES = 5 * 1024 * 1024;

function PaymentPage() {
  const { id } = Route.useParams();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: consult, isLoading: loadingConsult } = useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("consultations")
        .select("id,patient_id,doctor_id,status")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile", consult?.doctor_id],
    enabled: !!consult?.doctor_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("doctor_profiles")
        .select(
          "user_id,full_name_ar,full_name_en,specialty_ar,specialty_en,photo_url,fee,vodafone_number,vodafone_holder",
        )
        .eq("user_id", consult!.doctor_id!)
        .maybeSingle();
      return data;
    },
  });

  const { data: payment, isLoading: loadingPayment } = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("consultation_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 5000,
  });

  if (loadingConsult || loadingPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!consult || !doctor) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <main className="mx-auto max-w-md p-6 text-center text-slate-600">
          {t("review.notFound")}
        </main>
      </div>
    );
  }

  const showForm = !payment || payment.status === "rejected";
  const doctorName =
    (locale === "ar" ? doctor.full_name_ar : doctor.full_name_en) ?? "";
  const doctorSpec =
    (locale === "ar" ? doctor.specialty_ar : doctor.specialty_en) ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-2xl space-y-5">
          <header className="text-center sm:text-start">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand">
              {t("payment.title")}
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t("payment.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{t("payment.subtitle")}</p>
          </header>

          {/* Doctor card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t("payment.doctor.title")}
            </div>
            <div className="flex items-center gap-4">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand/10 text-lg font-bold text-brand">
                {doctor.photo_url ? (
                  <img
                    src={doctor.photo_url}
                    alt={doctorName}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{doctorName.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  {doctorName}
                </h2>
                <p className="mt-0.5 truncate text-xs font-medium text-brand">
                  {doctorSpec}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {t("payment.doctor.fee")}:{" "}
                  <span className="font-bold text-slate-900">
                    {Number(doctor.fee).toFixed(0)} EGP
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Payment info */}
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t("payment.info.title")}
            </div>
            <PaymentInfoRow
              label={t("payment.info.number")}
              value={doctor.vodafone_number ?? "—"}
              copyable
              copiedLabel={t("payment.info.copied")}
              copyAria={t("payment.info.copy")}
            />
            <div className="my-3 h-px bg-slate-100" />
            <PaymentInfoRow
              label={t("payment.info.holder")}
              value={doctor.vodafone_holder ?? "—"}
            />
            <div className="my-3 h-px bg-slate-100" />
            <PaymentInfoRow
              label={t("payment.info.amount")}
              value={`${Number(doctor.fee).toFixed(0)} EGP`}
              emphasize
            />
          </section>

          {/* Instructions */}
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t("payment.steps.title")}
            </div>
            <ol className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                    {n}
                  </span>
                  <span className="leading-relaxed">
                    {t(`payment.steps.${n}`)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Status card OR upload form */}
          {payment && !showForm && (
            <PaymentStatusCard
              status={payment.status}
              rejectionReason={payment.rejection_reason}
              onStart={() => navigate({ to: "/consultation/$id", params: { id } })}
            />
          )}
          {payment && payment.status === "rejected" && (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-bold">{t("payment.status.rejected.title")}</p>
              {payment.rejection_reason && (
                <p className="mt-1">
                  <span className="font-semibold">
                    {t("payment.status.rejected.reason")}:
                  </span>{" "}
                  {payment.rejection_reason}
                </p>
              )}
              <p className="mt-2">{t("payment.status.rejected.body")}</p>
            </div>
          )}

          {showForm && user && (
            <UploadForm
              consultationId={id}
              patientId={consult.patient_id}
              doctorId={consult.doctor_id!}
              amount={Number(doctor.fee)}
              previousPaymentId={payment?.id ?? null}
              onSuccess={() => qc.invalidateQueries({ queryKey: ["payment", id] })}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PaymentInfoRow({
  label,
  value,
  copyable = false,
  emphasize = false,
  copiedLabel,
  copyAria,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  emphasize?: boolean;
  copiedLabel?: string;
  copyAria?: string;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(copiedLabel ?? "Copied");
    } catch {
      toast.error("Copy failed");
    }
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`truncate ${
            emphasize
              ? "text-base font-black text-brand"
              : "text-sm font-bold text-slate-900"
          }`}
          dir="ltr"
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            aria-label={copyAria}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand"
          >
            <Copy className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentStatusCard({
  status,
  rejectionReason,
  onStart,
}: {
  status: string;
  rejectionReason: string | null;
  onStart: () => void;
}) {
  const { t } = useI18n();

  if (status === "approved") {
    return (
      <section className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <h3 className="mt-2 text-lg font-bold text-emerald-900">
          🟢 {t("payment.status.approved.title")}
        </h3>
        <p className="mt-1 text-sm text-emerald-800">
          {t("payment.status.approved.body")}
        </p>
        <button
          onClick={onStart}
          className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 sm:w-auto sm:px-8"
        >
          {t("payment.status.approved.cta")}
        </button>
      </section>
    );
  }

  if (status === "pending") {
    return (
      <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 text-center shadow-sm">
        <Clock className="mx-auto size-10 text-amber-500" />
        <h3 className="mt-2 text-lg font-bold text-amber-900">
          🟡 {t("payment.status.pending.title")}
        </h3>
        <p className="mt-1 text-sm text-amber-800">
          {t("payment.status.pending.body")}
        </p>
        <p className="mt-2 text-xs text-amber-700">
          {t("payment.status.pending.locked")}
        </p>
      </section>
    );
  }

  if (status === "rejected") {
    return (
      <section className="rounded-3xl border-2 border-rose-300 bg-rose-50 p-5 text-center shadow-sm">
        <XCircle className="mx-auto size-10 text-rose-500" />
        <h3 className="mt-2 text-lg font-bold text-rose-900">
          🔴 {t("payment.status.rejected.title")}
        </h3>
        {rejectionReason && (
          <p className="mt-1 text-sm text-rose-800">
            <span className="font-semibold">
              {t("payment.status.rejected.reason")}:
            </span>{" "}
            {rejectionReason}
          </p>
        )}
      </section>
    );
  }

  return null;
}

function UploadForm({
  consultationId,
  patientId,
  doctorId,
  amount,
  previousPaymentId,
  onSuccess,
}: {
  consultationId: string;
  patientId: string;
  doctorId: string;
  amount: number;
  previousPaymentId: string | null;
  onSuccess: () => void;
}) {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error(t("payment.upload.invalidType"));
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error(t("payment.upload.tooLarge"));
      return;
    }
    setFile(f);
  }

  function removeFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!file) {
      toast.error(t("payment.receipt.required"));
      return;
    }
    const ref = reference.trim();
    if (!ref) {
      toast.error(t("payment.reference.required"));
      return;
    }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${patientId}/${consultationId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("payment-receipts")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage
        .from("payment-receipts")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      const receiptUrl = signed?.signedUrl ?? path;

      if (previousPaymentId) {
        const { error } = await supabase
          .from("payments")
          .update({
            transaction_reference: ref,
            receipt_image_url: receiptUrl,
            status: "pending",
            rejection_reason: null,
            reviewed_at: null,
            reviewed_by: null,
          })
          .eq("id", previousPaymentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("payments").insert({
          consultation_id: consultationId,
          patient_id: patientId,
          doctor_id: doctorId,
          amount,
          payment_method: "Vodafone Cash",
          transaction_reference: ref,
          receipt_image_url: receiptUrl,
          status: "pending",
        });
        if (error) throw error;
      }

      onSuccess();
      setFile(null);
      setReference("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("payment.error.generic"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      {/* Upload */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {t("payment.upload.title")}
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm font-medium text-slate-600 hover:border-brand hover:bg-brand/5 hover:text-brand"
          >
            <ImageUp className="size-6" />
            {t("payment.upload.button")}
            <span className="text-[11px] font-normal text-slate-500">
              {t("payment.upload.hint")}
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-72 w-full object-contain"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("payment.upload.replace")}
              </button>
              <button
                type="button"
                onClick={removeFile}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="size-3.5" />
                {t("payment.upload.remove")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction reference */}
      <div>
        <label
          htmlFor="txref"
          className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500"
        >
          {t("payment.reference.label")}
        </label>
        <input
          id="txref"
          type="text"
          inputMode="numeric"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder={t("payment.reference.placeholder")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
          required
          maxLength={64}
          dir="ltr"
        />
      </div>

      {/* Confirm */}
      <button
        type="submit"
        disabled={submitting || !file || !reference.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? t("payment.confirming") : t("payment.confirm")}
      </button>
    </form>
  );
}
