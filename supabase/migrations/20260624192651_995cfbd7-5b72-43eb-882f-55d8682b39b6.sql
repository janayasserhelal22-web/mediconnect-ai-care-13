ALTER TABLE public.medical_reviews
  ADD COLUMN IF NOT EXISTS risk_score INTEGER
  CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100));