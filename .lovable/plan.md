## MediConnect / Connect Care — AI-First Intake Rebuild

Rebuild the app around an AI-first workflow with role-based auth, gated doctor discovery, and full Arabic/English RTL support. Keep existing visual language (clinical excellence, soft blues, Cairo/Inter).

### New User Flow
Landing → Start Consultation → Role select → Auth → (Patient) AI Chat → Medical Review → Specialty Recommendation → Doctor List → Select Doctor → Doctor Chat + Prescription → History.
(Doctor) Login → Dashboard → Assigned Cases → AI Review → Chat → Prescription → Complete.

### Backend (Lovable Cloud / Supabase)
Enable Lovable Cloud. Tables (all with GRANTs + RLS):
- `profiles` (id→auth.users, full_name, phone, locale, avatar_url)
- `user_roles` (enum app_role: patient | doctor | admin) + `has_role()` SECURITY DEFINER
- `doctor_profiles` (user_id, specialty, bio, fee, rating, years_experience, photo_url, availability)
- `consultations` (id, patient_id, doctor_id nullable, status: intake|review|matching|active|completed, created_at)
- `intake_messages` (consultation_id, role, content, created_at) — chat transcript
- `medical_reviews` (consultation_id, chief_complaint, symptoms[], duration, severity, risk_level, notes, ai_summary, primary_specialty, secondary_specialty, alternative_specialty, reasoning)
- `chat_messages` (consultation_id, sender_id, content, created_at) — doctor↔patient chat
- `prescriptions` (consultation_id, doctor_id, medications jsonb, instructions, issued_at)

Seed 6–8 demo doctors across common specialties via migration.

### Auth
Email/password + Google. Signup collects role (patient/doctor) and routes to role-specific profile form. Trigger auto-creates `profiles` row + assigns role. `/auth` page handles both sign in & sign up with role pre-selected from URL param.

### Routes
```
/                              landing (no doctors shown)
/start                         role chooser → /auth?role=...
/auth                          sign in/up (role-aware)
/_authenticated/intake/$id     AI chat (patient)
/_authenticated/review/$id     medical review + specialty recs
/_authenticated/doctors/$id    doctor list filtered by specialty (consultation id)
/_authenticated/consultation/$id  patient↔doctor chat + prescription view
/_authenticated/history        patient history
/_authenticated/doctor         doctor dashboard (cases list)
/_authenticated/doctor/case/$id  case detail: AI review + chat + prescription editor
```

### AI
Reuse existing `/api/chat` for streaming intake (locale-aware). Server fn `generateReview` produces structured review + 3 specialty recommendations with reasoning. Save to `medical_reviews` and advance consultation status. All AI responses in active locale (ar/en).

### i18n
Keep existing `i18n.tsx`; default locale = `ar`. Expand translation keys for all new screens. Persist preference. Logical Tailwind classes everywhere.

### Design
Reuse clinical-excellence tokens. New components: RoleChooser, AuthForm, IntakeProgress, MedicalReviewCard, SpecialtyRecommendationCard, DoctorCard, DoctorList, DoctorDashboard, CaseDetail, PrescriptionForm, ChatThread. Mobile-first.

### Out of scope (defer)
- Payments (skipped per earlier instruction)
- Admin panel UI (DB ready, UI later)
- Real-time chat presence (use polling/refetch)
- File uploads for prescription PDFs (text-only initially)

### Confirm before build
1. Enable Lovable Cloud (required for auth + DB)?
2. Skip admin UI for this pass?
3. OK to seed demo doctors via migration?
