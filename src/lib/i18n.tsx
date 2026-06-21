import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ar" | "en";

type Dict = Record<string, string>;

const translations: Record<Locale, Dict> = {
  ar: {
    "brand.name": "كونكت كير",
    "nav.features": "المميزات",
    "nav.about": "من نحن",
    "nav.doctorView": "واجهة الطبيب",
    "nav.startConsultation": "ابدأ الاستشارة",
    "nav.language": "English",

    "home.title": "كونكت كير — رعاية طبية متخصصة بتصميم ذكي",
    "home.metaDesc":
      "تواصل مع أطباء معتمدين خلال دقائق. استمارة أعراض موجّهة بالذكاء الاصطناعي توفر وقتك وترتب حالتك.",
    "home.badge": "الجيل القادم من الرعاية الطبية",
    "home.heroTitle1": "رعاية صحية متخصصة، تصلك عبر",
    "home.heroTitle2": "تصميم ذكي.",
    "home.heroSubtitle":
      "تواصل مع أطباء معتمدين خلال دقائق. تجربة سلسة موجّهة بالذكاء الاصطناعي ترتّب أعراضك وتوفر وقتك.",
    "home.ctaPrimary": "ابدأ فحص الأعراض",
    "home.ctaSecondary": "كيف يعمل؟",
    "home.stat.accuracy": "دقة سريرية",
    "home.stat.wait": "متوسط الانتظار",
    "home.stat.access": "وصول للأخصائيين",
    "home.stat.wait.value": "أقل من ٥ دقائق",
    "home.stat.access.value": "٢٤/٧",

    "features.kicker": "كيف يعمل",
    "features.title": "طريق أهدأ نحو وضوح سريري.",
    "features.s1.title": "صف أعراضك",
    "features.s1.desc": "شارك ما تشعر به بكلمات بسيطة. يطرح الذكاء الاصطناعي أسئلة دقيقة، واحدة تلو الأخرى.",
    "features.s2.title": "احصل على ملخص منظم",
    "features.s2.desc": "تتحوّل محادثتك إلى ملف حالة سريري — الأعراض، المدة، الشدة، الملاحظات.",
    "features.s3.title": "قابل طبيبك",
    "features.s3.desc": "أخصائي معتمد يطّلع على حالتك ويكمل المحادثة معك.",

    "about.kicker": "من نحن",
    "about.title": "طب دقيق، مبسّط من أجلك.",
    "about.desc":
      "تربط كونكت كير بين كفاءة الذكاء الاصطناعي ودفء الإنسان. بأتمتة الاستقبال، يركّز الأطباء أكثر على خطة علاجك.",
    "about.b1": "وصول على مدار الساعة لأطباء معتمدين",
    "about.b2": "مراسلة آمنة ومتوافقة مع معايير الخصوصية",
    "about.b3": "ملفات حالة منظمة في ثوانٍ",
    "about.imageAlt": "عيادة طبية حديثة هادئة بإضاءة طبيعية",

    "footer.title": "هل أنت مستعد لتجربة أفضل؟",
    "footer.subtitle": "ابدأ استشارتك الآن — بلا انتظار وبلا أوراق.",
    "footer.cta": "ابدأ استشارتك",
    "footer.copyright": "© ٢٠٢٦ مجموعة كونكت كير الطبية",

    "consultation.metaTitle": "استمارة الأعراض — كونكت كير",
    "consultation.metaDesc": "ابدأ محادثة الاستقبال الطبي بمساعدة الذكاء الاصطناعي.",
    "consultation.kicker": "استقبال ذكي",
    "consultation.title": "أخبرنا بما تشعر",
    "consultation.subtitle": "ينظّم الذكاء الاصطناعي التفاصيل ليتفرّغ طبيبك لك.",
    "consultation.assistant": "مساعد الاستقبال السريري",
    "consultation.active": "متصل",
    "consultation.reply": "رد",
    "consultation.replies": "ردود",
    "consultation.you": "أنت",
    "consultation.placeholder": "اكتب ردك...",
    "consultation.send": "إرسال",
    "consultation.disclaimer": "لا تقدّم كونكت كير تشخيصات. في الطوارئ اتصل بالخدمات المحلية.",
    "consultation.finish": "إنهاء الاستشارة",
    "consultation.finishing": "جارٍ تجهيز الحالة…",
    "consultation.welcome":
      "مرحبًا بك في كونكت كير. سأساعدك في تجهيز حالتك للطبيب. هل يمكنك وصف العرض الرئيسي ومتى بدأ؟",
    "consultation.errorGeneric": "حدث خطأ ما.",
    "consultation.errorFinish": "تعذّر إنهاء الاستشارة.",

    "summary.metaTitle": "ملخّص الاستشارة — كونكت كير",
    "summary.metaDesc": "ملخّص حالة سريري منظّم لمراجعة الطبيب.",
    "summary.emptyTitle": "لا توجد استشارة بعد",
    "summary.emptyDesc": "ابدأ استمارة أعراض لترى كيف تحوّل كونكت كير محادثتك إلى ملخّص حالة سريري.",
    "summary.emptyCta": "ابدأ استشارة",
    "summary.kicker": "واجهة الطبيب",
    "summary.title": "ملخّص الاستشارة",
    "summary.caseLabel": "حالة",
    "summary.submitted": "أُرسلت",
    "summary.ready": "جاهزة للمراجعة",
    "summary.chiefComplaint": "الشكوى الرئيسية",
    "summary.narrative": "السرد السريري",
    "summary.duration": "المدة",
    "summary.durationHint": "بداية الأعراض",
    "summary.severity": "الشدة",
    "summary.severityHint": "حسب المريض",
    "summary.flagged": "الأعراض المسجّلة",
    "summary.notReported": "غير مذكورة",
    "summary.specialty": "التخصّص الموصى به",
    "summary.risk": "مستوى الخطورة",
    "summary.approve": "اعتماد والتواصل مع المريض",
    "summary.newIntake": "بدء استمارة جديدة",
  },
  en: {
    "brand.name": "Connect Care",
    "nav.features": "Features",
    "nav.about": "About",
    "nav.doctorView": "Doctor view",
    "nav.startConsultation": "Start Consultation",
    "nav.language": "العربية",

    "home.title": "Connect Care — Expert healthcare, delivered through intelligent design",
    "home.metaDesc":
      "Connect with board-certified physicians in minutes. AI-guided symptom intake that prioritizes your case and saves you time.",
    "home.badge": "Next-Generation Medical Care",
    "home.heroTitle1": "Expert healthcare, delivered through",
    "home.heroTitle2": "intelligent design.",
    "home.heroSubtitle":
      "Connect with board-certified physicians in minutes. Experience a seamless AI-guided intake that prioritizes your symptoms and saves you time.",
    "home.ctaPrimary": "Begin Symptom Check",
    "home.ctaSecondary": "How it works",
    "home.stat.accuracy": "Clinical accuracy",
    "home.stat.wait": "Avg wait time",
    "home.stat.access": "Specialist access",
    "home.stat.wait.value": "<5 min",
    "home.stat.access.value": "24/7",

    "features.kicker": "How it works",
    "features.title": "A calmer path to clinical clarity.",
    "features.s1.title": "Describe your symptoms",
    "features.s1.desc":
      "Share what you're feeling in plain words. Our AI asks precise follow-ups, one at a time.",
    "features.s2.title": "Get a structured summary",
    "features.s2.desc":
      "Your conversation is organized into a clinical case file — symptoms, duration, severity, notes.",
    "features.s3.title": "Meet your physician",
    "features.s3.desc":
      "A matched, board-certified specialist reviews your case and continues the conversation.",

    "about.kicker": "About",
    "about.title": "Precision medicine, simplified for you.",
    "about.desc":
      "Connect Care bridges the gap between AI efficiency and human empathy. By automating intake, our doctors spend more time on your recovery plan.",
    "about.b1": "24/7 access to board-certified experts",
    "about.b2": "Secure, HIPAA-compliant messaging",
    "about.b3": "Structured case files delivered in seconds",
    "about.imageAlt": "A calm modern doctor's office with natural light",

    "footer.title": "Ready for a better experience?",
    "footer.subtitle": "Start your consultation now — no waiting room, no paperwork.",
    "footer.cta": "Start Your Consultation",
    "footer.copyright": "© 2026 Connect Care Medical Group",

    "consultation.metaTitle": "Symptom Intake — Connect Care",
    "consultation.metaDesc": "Begin your AI-guided medical intake conversation.",
    "consultation.kicker": "Smart Intake",
    "consultation.title": "Tell us what you're feeling",
    "consultation.subtitle": "Our AI organizes the details so your doctor can focus on you.",
    "consultation.assistant": "Clinical Intake Assistant",
    "consultation.active": "Active",
    "consultation.reply": "reply",
    "consultation.replies": "replies",
    "consultation.you": "YOU",
    "consultation.placeholder": "Type your response...",
    "consultation.send": "Send",
    "consultation.disclaimer":
      "Connect Care never provides diagnoses. For emergencies, call your local services.",
    "consultation.finish": "Finish Consultation",
    "consultation.finishing": "Preparing case…",
    "consultation.welcome":
      "Welcome to Connect Care. I'll help prepare your case for the doctor. Could you describe your primary symptom and when it started?",
    "consultation.errorGeneric": "Something went wrong.",
    "consultation.errorFinish": "Failed to finalize the consultation.",

    "summary.metaTitle": "Consultation Summary — Connect Care",
    "summary.metaDesc": "Structured clinical case summary for physician review.",
    "summary.emptyTitle": "No consultation yet",
    "summary.emptyDesc":
      "Start a symptom intake to see how Connect Care turns your conversation into a clinical case summary.",
    "summary.emptyCta": "Start a Consultation",
    "summary.kicker": "Clinician View",
    "summary.title": "Consultation Summary",
    "summary.caseLabel": "Case",
    "summary.submitted": "Submitted",
    "summary.ready": "Ready for review",
    "summary.chiefComplaint": "Chief Complaint",
    "summary.narrative": "Clinical Narrative",
    "summary.duration": "Duration",
    "summary.durationHint": "Reported onset",
    "summary.severity": "Severity",
    "summary.severityHint": "Patient-reported",
    "summary.flagged": "Flagged Symptoms",
    "summary.notReported": "Not reported",
    "summary.specialty": "Recommended Specialty",
    "summary.risk": "Risk Level",
    "summary.approve": "Approve & Contact Patient",
    "summary.newIntake": "Start New Intake",
  },
};

type I18nContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: keyof (typeof translations)["ar"]) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "connectcare:locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "ar" || stored === "en") setLocaleState(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[locale];
    return {
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      toggle: () => setLocale(locale === "ar" ? "en" : "ar"),
      t: (key) => dict[key] ?? translations.en[key] ?? String(key),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
