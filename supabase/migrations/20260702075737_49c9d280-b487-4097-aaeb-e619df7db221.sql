
-- Payments: Vodafone Cash proof-of-payment for consultations
ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS vodafone_number TEXT,
  ADD COLUMN IF NOT EXISTS vodafone_holder TEXT;

-- Seed a demo payment number on doctors that don't have one yet
UPDATE public.doctor_profiles
   SET vodafone_number = COALESCE(vodafone_number, '+201000000000'),
       vodafone_holder = COALESCE(vodafone_holder, COALESCE(full_name_en, 'ConnectCare Clinic'))
 WHERE vodafone_number IS NULL OR vodafone_holder IS NULL;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Vodafone Cash',
  transaction_reference TEXT NOT NULL,
  receipt_image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_consultation_id_idx ON public.payments(consultation_id);
CREATE INDEX IF NOT EXISTS payments_patient_id_idx ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS payments_doctor_id_idx ON public.payments(doctor_id);

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Patient sees own payments; doctor sees payments for their consultations
CREATE POLICY "payment select own" ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Patient creates payment for own consultation
CREATE POLICY "patient inserts payment" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Patient can re-upload receipt if rejected (only updates their own row while pending/rejected)
CREATE POLICY "patient updates own pending payment" ON public.payments FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id AND status <> 'approved')
  WITH CHECK (auth.uid() = patient_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for payment-receipts bucket (private).
-- Path convention: {patient_id}/{consultation_id}/{filename}
CREATE POLICY "patient uploads own receipt" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "patient reads own receipt" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "patient updates own receipt" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "patient deletes own receipt" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Doctor can read receipts for their own consultations
CREATE POLICY "doctor reads receipt for own consult" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.doctor_id = auth.uid()
        AND storage.objects.name LIKE p.patient_id::text || '/' || p.consultation_id::text || '/%'
    )
  );
