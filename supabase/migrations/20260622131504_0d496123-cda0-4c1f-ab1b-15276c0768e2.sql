
-- Roles
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  locale TEXT NOT NULL DEFAULT 'ar',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Doctor profiles
CREATE TABLE public.doctor_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  bio TEXT,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  years_experience INT NOT NULL DEFAULT 0,
  photo_url TEXT,
  availability TEXT NOT NULL DEFAULT 'available',
  languages TEXT[] NOT NULL DEFAULT ARRAY['ar','en'],
  full_name_ar TEXT,
  full_name_en TEXT,
  specialty_ar TEXT,
  specialty_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctor_profiles TO authenticated, anon;
GRANT INSERT, UPDATE ON public.doctor_profiles TO authenticated;
GRANT ALL ON public.doctor_profiles TO service_role;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads doctors" ON public.doctor_profiles FOR SELECT USING (true);
CREATE POLICY "doctor updates own" ON public.doctor_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "doctor inserts own" ON public.doctor_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Consultations
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'intake',
  locale TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patient sees own consults" ON public.consultations FOR SELECT TO authenticated USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "patient creates consult" ON public.consultations FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "patient or doctor updates consult" ON public.consultations FOR UPDATE TO authenticated USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Intake messages
CREATE TABLE public.intake_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.intake_messages TO authenticated;
GRANT ALL ON public.intake_messages TO service_role;
ALTER TABLE public.intake_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view intake for own consult" ON public.intake_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())));
CREATE POLICY "insert intake for own consult" ON public.intake_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND c.patient_id = auth.uid()));

-- Medical reviews
CREATE TABLE public.medical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES public.consultations(id) ON DELETE CASCADE,
  chief_complaint TEXT,
  symptoms TEXT[],
  duration TEXT,
  severity TEXT,
  risk_level TEXT,
  clinical_notes TEXT,
  ai_summary TEXT,
  primary_specialty TEXT,
  secondary_specialty TEXT,
  alternative_specialty TEXT,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.medical_reviews TO authenticated;
GRANT ALL ON public.medical_reviews TO service_role;
ALTER TABLE public.medical_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view review for own consult" ON public.medical_reviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())));
CREATE POLICY "insert review for own consult" ON public.medical_reviews FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND c.patient_id = auth.uid()));

-- Chat messages (doctor <-> patient)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view chat for own consult" ON public.chat_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())));
CREATE POLICY "send chat for own consult" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())));

-- Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view prescription for own consult" ON public.prescriptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())));
CREATE POLICY "doctor inserts prescription" ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (doctor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id AND c.doctor_id = auth.uid()));

-- Auto profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role app_role;
  v_locale TEXT;
  v_name TEXT;
BEGIN
  v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'patient')::app_role;
  v_locale := COALESCE(NULLIF(NEW.raw_user_meta_data->>'locale',''), 'ar');
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1));

  INSERT INTO public.profiles (id, full_name, locale) VALUES (NEW.id, v_name, v_locale);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);

  IF v_role = 'doctor' THEN
    INSERT INTO public.doctor_profiles (user_id, specialty, full_name_ar, full_name_en, specialty_ar, specialty_en, bio, fee)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'specialty', 'General Practice'),
      v_name, v_name,
      COALESCE(NEW.raw_user_meta_data->>'specialty_ar', 'طب عام'),
      COALESCE(NEW.raw_user_meta_data->>'specialty', 'General Practice'),
      COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      COALESCE((NEW.raw_user_meta_data->>'fee')::numeric, 100)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
