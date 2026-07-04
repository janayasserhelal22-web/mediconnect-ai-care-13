
-- 1) profiles: read only own row
DROP POLICY IF EXISTS "read all profiles" ON public.profiles;
CREATE POLICY "read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- 2) doctor_profiles: require doctor role on insert
DROP POLICY IF EXISTS "doctor inserts own" ON public.doctor_profiles;
CREATE POLICY "doctor inserts own" ON public.doctor_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'doctor'));

-- 3) doctor_profiles: restrict SELECT to authenticated
DROP POLICY IF EXISTS "anyone reads doctors" ON public.doctor_profiles;
CREATE POLICY "authenticated reads doctors" ON public.doctor_profiles
  FOR SELECT TO authenticated USING (true);

-- 4) Move vodafone_* to a private table with strict access
CREATE TABLE IF NOT EXISTS public.doctor_payment_details (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vodafone_number text,
  vodafone_holder text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_payment_details TO authenticated;
GRANT ALL ON public.doctor_payment_details TO service_role;

ALTER TABLE public.doctor_payment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor manages own payment details"
  ON public.doctor_payment_details
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'doctor'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "assigned patient reads payment details"
  ON public.doctor_payment_details
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.doctor_id = doctor_payment_details.user_id
      AND c.patient_id = auth.uid()
  ));

INSERT INTO public.doctor_payment_details (user_id, vodafone_number, vodafone_holder)
SELECT user_id, vodafone_number, vodafone_holder
FROM public.doctor_profiles
WHERE vodafone_number IS NOT NULL OR vodafone_holder IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.doctor_profiles
  DROP COLUMN IF EXISTS vodafone_number,
  DROP COLUMN IF EXISTS vodafone_holder;

-- 5) payments: remove doctor direct UPDATE, add SECURITY DEFINER RPCs for review
DROP POLICY IF EXISTS "doctor reviews assigned payment" ON public.payments;

CREATE OR REPLACE FUNCTION public.approve_payment(p_payment_id uuid)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.payments;
BEGIN
  UPDATE public.payments
  SET status = 'approved',
      approved_by = auth.uid(),
      approved_at = now(),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      rejection_reason = NULL,
      updated_at = now()
  WHERE id = p_payment_id
    AND doctor_id = auth.uid()
    AND status = 'pending'
  RETURNING * INTO r;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or not permitted';
  END IF;
  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_payment(p_payment_id uuid, p_reason text)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.payments;
BEGIN
  IF p_reason IS NULL OR length(btrim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason required';
  END IF;
  UPDATE public.payments
  SET status = 'rejected',
      rejection_reason = btrim(p_reason),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      approved_by = auth.uid(),
      approved_at = now(),
      updated_at = now()
  WHERE id = p_payment_id
    AND doctor_id = auth.uid()
    AND status = 'pending'
  RETURNING * INTO r;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or not permitted';
  END IF;
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_payment(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid, text) TO authenticated;

-- 6) Revoke execute on internal trigger SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
