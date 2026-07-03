
-- Add approved_by/approved_at columns and doctor approval policy for payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

CREATE INDEX IF NOT EXISTS payments_consultation_id_idx ON public.payments(consultation_id);
CREATE INDEX IF NOT EXISTS payments_patient_id_idx ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS payments_doctor_id_idx ON public.payments(doctor_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- Allow the assigned doctor to approve/reject a payment
DROP POLICY IF EXISTS "doctor reviews assigned payment" ON public.payments;
CREATE POLICY "doctor reviews assigned payment"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);
