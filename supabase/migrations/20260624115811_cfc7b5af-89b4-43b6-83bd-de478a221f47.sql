ALTER TABLE public.medical_reviews
  ADD COLUMN IF NOT EXISTS is_emergency boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency_reasons text[] NOT NULL DEFAULT '{}'::text[];