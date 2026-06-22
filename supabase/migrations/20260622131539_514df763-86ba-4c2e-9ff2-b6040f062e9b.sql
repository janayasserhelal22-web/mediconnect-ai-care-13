
ALTER TABLE public.doctor_profiles DROP CONSTRAINT doctor_profiles_user_id_fkey;
ALTER TABLE public.doctor_profiles ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
