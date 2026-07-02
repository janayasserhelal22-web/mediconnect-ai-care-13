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

const ar: Dict = {
  "brand.name": "ميديكونكت",
  "brand.tagline": "رعاية صحية ذكية",
  "nav.features": "المميزات",
  "nav.about": "من نحن",
  "nav.howItWorks": "كيف يعمل",
  "nav.startConsultation": "ابدأ الاستشارة",
  "nav.history": "سجل الاستشارات",
  "nav.dashboard": "لوحة الطبيب",
  "nav.signIn": "تسجيل الدخول",
  "nav.signOut": "تسجيل الخروج",
  "nav.language": "English",

  "home.title": "ميديكونكت — تقييم طبي بالذكاء الاصطناعي قبل لقاء الطبيب",
  "home.metaDesc": "منصة طبية ذكية: تحدث مع المساعد الذكي، احصل على تقرير سريري، ثم اختر التخصص المناسب لك.",
  "home.badge": "منصة الذكاء الاصطناعي الطبية",
  "home.heroTitle1": "تقييم طبي ذكي",
  "home.heroTitle2": "قبل لقاء الطبيب.",
  "home.heroSubtitle":
    "صف أعراضك للمساعد الذكي، احصل على ملخص سريري احترافي، ودعنا نوصلك بالأخصائي المناسب لحالتك.",
  "home.ctaPrimary": "ابدأ الاستشارة الآن",
  "home.ctaSecondary": "كيف يعمل؟",
  "home.stat.accuracy": "دقة التوصية",
  "home.stat.wait": "متوسط الانتظار",
  "home.stat.access": "وصول للأخصائيين",
  "home.stat.wait.value": "أقل من ٥ دقائق",
  "home.stat.access.value": "٢٤/٧",

  "features.kicker": "كيف يعمل",
  "features.title": "تجربة طبية أهدأ وأكثر دقة.",
  "features.s1.title": "تحدّث مع المساعد الذكي",
  "features.s1.desc": "أجب عن أسئلة بسيطة. ينظّم الذكاء الاصطناعي كل التفاصيل السريرية.",
  "features.s2.title": "احصل على ملخّص طبي",
  "features.s2.desc": "تقرير منظم بالأعراض، المدة، الشدة، وملاحظات سريرية.",
  "features.s3.title": "توصية بالتخصص",
  "features.s3.desc": "نقترح عليك التخصص الأنسب، وثلاثة أخصائيين معتمدين للمتابعة.",

  "about.kicker": "من نحن",
  "about.title": "طب دقيق، مبسّط من أجلك.",
  "about.desc":
    "تربط ميديكونكت بين كفاءة الذكاء الاصطناعي ودفء الإنسان. الاستقبال يتم بالذكاء الاصطناعي، والعلاج يبقى مع الإنسان.",
  "about.b1": "وصول على مدار الساعة لأطباء معتمدين",
  "about.b2": "مراسلة آمنة ومتوافقة مع معايير الخصوصية",
  "about.b3": "ملفات حالة منظمة في ثوانٍ",
  "about.imageAlt": "عيادة طبية حديثة هادئة بإضاءة طبيعية",

  "footer.title": "هل أنت مستعد لتجربة أفضل؟",
  "footer.subtitle": "ابدأ استشارتك الآن — بلا انتظار وبلا أوراق.",
  "footer.cta": "ابدأ استشارتك",
  "footer.copyright": "© ٢٠٢٦ ميديكونكت للرعاية الصحية",

  // Role chooser
  "start.title": "كيف تريد المتابعة؟",
  "start.subtitle": "اختر دورك للبدء.",
  "start.patient": "متابعة كمريض",
  "start.patientDesc": "ابدأ تقييمًا طبيًا بالذكاء الاصطناعي وتواصل مع طبيب مختص.",
  "start.doctor": "متابعة كطبيب",
  "start.doctorDesc": "استقبل حالات مع ملخصات طبية ذكية وتواصل مع المرضى.",

  // Auth
  "auth.signInTitle": "تسجيل الدخول",
  "auth.signUpTitle": "إنشاء حساب جديد",
  "auth.signInAsPatient": "تسجيل دخول مريض",
  "auth.signInAsDoctor": "تسجيل دخول طبيب",
  "auth.signUpAsPatient": "حساب مريض جديد",
  "auth.signUpAsDoctor": "حساب طبيب جديد",
  "auth.fullName": "الاسم الكامل",
  "auth.email": "البريد الإلكتروني",
  "auth.password": "كلمة المرور",
  "auth.phone": "رقم الجوال (اختياري)",
  "auth.specialty": "التخصص",
  "auth.specialty.placeholder": "مثال: الطب الباطني",
  "auth.bio": "نبذة مهنية",
  "auth.fee": "رسوم الاستشارة",
  "auth.submit": "متابعة",
  "auth.submitting": "جارٍ المتابعة…",
  "auth.haveAccount": "لديك حساب؟",
  "auth.noAccount": "ليس لديك حساب؟",
  "auth.switchSignIn": "تسجيل الدخول",
  "auth.switchSignUp": "إنشاء حساب",
  "auth.google": "المتابعة بحساب جوجل",
  "auth.continueAs": "أنت تتابع كـ",
  "auth.changeRole": "تغيير الدور",
  "auth.role.patient": "مريض",
  "auth.role.doctor": "طبيب",
  "auth.errorGeneric": "حدث خطأ ما، حاول مرة أخرى.",
  "auth.errorRateLimit": "لقد أرسلت طلبات كثيرة. يرجى الانتظار {seconds} ثانية ثم المحاولة مجدداً.",
  "auth.errorInvalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth.errorEmailNotConfirmed": "لم يتم تأكيد بريدك الإلكتروني بعد. تحقق من صندوق الوارد.",
  "auth.errorUserExists": "يوجد حساب بهذا البريد بالفعل. سجّل الدخول بدلاً من ذلك.",
  "auth.errorWeakPassword": "كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.",
  "auth.checkEmailTitle": "تحقق من بريدك الإلكتروني",
  "auth.checkEmailBody": "أرسلنا رابط تأكيد إلى {email}. اضغط الرابط لتفعيل الحساب ثم سجّل الدخول.",
  "auth.backToSignIn": "العودة لتسجيل الدخول",
  "auth.cooldown": "أعد المحاولة بعد {seconds} ث",

  // Intake
  "intake.metaTitle": "تقييم بالذكاء الاصطناعي — ميديكونكت",
  "intake.kicker": "استقبال ذكي",
  "intake.title": "أخبرنا بما تشعر",
  "intake.subtitle": "ينظّم المساعد الذكي التفاصيل ليتفرّغ طبيبك لك.",
  "intake.assistant": "المساعد الطبي الذكي",
  "intake.active": "متصل",
  "intake.reply": "رد",
  "intake.replies": "ردود",
  "intake.you": "أنت",
  "intake.placeholder": "اكتب ردك…",
  "intake.send": "إرسال",
  "intake.disclaimer": "لا تقدّم ميديكونكت تشخيصات. في الطوارئ اتصل بالخدمات المحلية.",
  "intake.finish": "إنهاء وإنشاء التقرير",
  "intake.finishing": "جارٍ تجهيز التقرير…",
  "intake.welcome":
    "مرحبًا بك في ميديكونكت. سأطرح بعض الأسئلة لتجهيز حالتك للطبيب. ما هو العرض الرئيسي الذي تشعر به؟ ومتى بدأ؟",
  "intake.progress": "تقدّم التقييم",
  "intake.errorGeneric": "حدث خطأ ما.",
  "intake.errorFinish": "تعذّر إنشاء التقرير.",

  // Review
  "review.metaTitle": "التقرير الطبي — ميديكونكت",
  "review.kicker": "التقرير الطبي",
  "review.title": "ملخّص حالتك",
  "review.subtitle": "تقرير سريري احترافي مبني على محادثتك.",
  "review.chiefComplaint": "الشكوى الرئيسية",
  "review.symptoms": "الأعراض",
  "review.duration": "المدة",
  "review.severity": "الشدة",
  "review.risk": "مستوى الخطورة",
  "review.riskScore": "درجة الخطورة",
  "review.riskLevel.Low": "منخفضة",
  "review.riskLevel.Medium": "متوسطة",
  "review.riskLevel.High": "مرتفعة",
  "review.riskLevel.Critical": "حرجة",
  "review.notes": "ملاحظات سريرية",
  "review.aiSummary": "ملخّص الذكاء الاصطناعي",
  "review.specialtyTitle": "التخصص الموصى به",
  "review.primarySpecialty": "التخصص الرئيسي",
  "review.secondarySpecialty": "تخصص ثانوي",
  "review.alternativeSpecialty": "تخصص بديل",
  "review.reasoning": "سبب التوصية",
  "review.continue": "اعرض الأطباء الموصى بهم",
  "review.regenerate": "إعادة التحليل",
  "review.notReported": "غير مذكور",
  "review.loading": "جارٍ تحميل التقرير…",
  "review.notFound": "التقرير غير موجود.",
  "emergency.kicker": "تنبيه طوارئ",
  "emergency.title": "قد تكون أعراضك طارئة",
  "emergency.subtitle":
    "بناءً على المحادثة، تشير الأعراض إلى احتمال وجود حالة طبية طارئة تتطلب رعاية فورية.",
  "emergency.action": "اتصل بالطوارئ (٩٩٧ / ١١٢) أو توجّه فوراً إلى أقرب قسم طوارئ. لا تنتظر استشارة طبيب عبر التطبيق.",
  "emergency.reasonsTitle": "العلامات التي تم رصدها",
  "emergency.callButton": "اتصل بالطوارئ الآن",
  "emergency.disclaimer":
    "هذه المنصة ليست بديلاً عن خدمات الطوارئ. لا توفّر رعاية فورية أو تدخّلاً مباشراً.",
  "emergency.ackLabel": "أؤكد أنني قرأت هذا التحذير وأفهم أنه يجب طلب رعاية طارئة فورية إذا كانت حالتي تتفاقم.",
  "emergency.continueAnyway": "تابع إلى التقرير الطبي",

  // Doctors
  "doctors.metaTitle": "اختر طبيبك — ميديكونكت",
  "doctors.kicker": "الأطباء المتاحون",
  "doctors.title": "أطباء موصى بهم لحالتك",
  "doctors.subtitle": "أخصائيون يطابقون التخصص الموصى به.",
  "doctors.fee": "الرسوم",
  "doctors.experience": "سنوات الخبرة",
  "doctors.years": "سنة",
  "doctors.book": "احجز استشارة",
  "doctors.available": "متاح الآن",
  "doctors.busy": "مشغول",
  "doctors.noResults": "لا يوجد أطباء حاليًا في هذا التخصص.",
  "doctors.viewAll": "عرض الكل",
  "doctors.fallbackNotice": "لا يوجد أخصائيون في التخصصات الموصى بها حاليًا. نعرض عليك أطباء متاحين من تخصصات ذات صلة.",
  "doctors.emergencyFallback": "حالتك طارئة. إذا لم يستجب طبيب الطوارئ خلال دقائق، اتصل بالإسعاف فورًا (٩٩٧).",

  // Consultation chat
  "consult.metaTitle": "الاستشارة — ميديكونكت",
  "consult.title": "محادثة مع الطبيب",
  "consult.with": "مع",
  "consult.placeholder": "اكتب رسالتك…",
  "consult.send": "إرسال",
  "consult.empty": "ابدأ المحادثة. طبيبك سيرى ملخص حالتك تلقائيًا.",
  "consult.viewReview": "عرض التقرير الطبي",
  "consult.viewPrescription": "عرض الوصفة",
  "consult.completed": "اكتملت الاستشارة",
  "consult.markCompleted": "إنهاء الاستشارة",

  // Prescription
  "rx.title": "الوصفة الطبية",
  "rx.medications": "الأدوية",
  "rx.medication": "الدواء",
  "rx.dosage": "الجرعة",
  "rx.frequency": "التكرار",
  "rx.add": "إضافة دواء",
  "rx.instructions": "تعليمات إضافية",
  "rx.issue": "إصدار الوصفة",
  "rx.issuedAt": "صدرت في",
  "rx.none": "لا توجد وصفة بعد.",

  // History
  "history.metaTitle": "سجل الاستشارات",
  "history.title": "سجل استشاراتك",
  "history.subtitle": "كل استشاراتك السابقة في مكان واحد.",
  "history.empty": "لا توجد استشارات بعد.",
  "history.startNew": "ابدأ استشارة جديدة",
  "history.status.intake": "قيد الاستقبال",
  "history.status.review": "تقرير جاهز",
  "history.status.matching": "اختيار طبيب",
  "history.status.active": "نشطة",
  "history.status.completed": "مكتملة",
  "history.openCase": "فتح",

  // Doctor dashboard
  "doctor.dashboard.title": "لوحة الطبيب",
  "doctor.dashboard.subtitle": "الحالات المسندة إليك مع التقارير الذكية.",
  "doctor.cases.active": "حالات نشطة",
  "doctor.cases.completed": "حالات مكتملة",
  "doctor.cases.empty": "لا توجد حالات حاليًا.",
  "doctor.case.aiReview": "التقرير الذكي",
  "doctor.case.chat": "محادثة المريض",
  "doctor.case.prescription": "الوصفة الطبية",
  "doctor.case.complete": "إنهاء الحالة",
  "doctor.case.completed": "تم إنهاء الحالة",

  // Payment
  "payment.metaTitle": "تأكيد الدفع — ميديكونكت",
  "payment.title": "تأكيد الدفع",
  "payment.subtitle": "الرجاء تحويل قيمة الكشف وإرفاق إيصال التحويل لبدء الاستشارة.",
  "payment.doctor.title": "الطبيب المختار",
  "payment.doctor.fee": "قيمة الاستشارة",
  "payment.info.title": "بيانات الدفع",
  "payment.info.number": "رقم فودافون كاش",
  "payment.info.holder": "اسم صاحب الحساب",
  "payment.info.amount": "المبلغ المطلوب",
  "payment.info.copy": "نسخ الرقم",
  "payment.info.copied": "تم نسخ الرقم",
  "payment.info.qr": "امسح الكود للدفع السريع",
  "payment.steps.title": "خطوات الدفع",
  "payment.steps.1": "قم بتحويل قيمة الكشف إلى رقم فودافون كاش.",
  "payment.steps.2": "احتفظ بإيصال التحويل.",
  "payment.steps.3": "التقط صورة للإيصال.",
  "payment.steps.4": "ارفع الصورة وأدخل رقم العملية.",
  "payment.steps.5": "اضغط تأكيد الدفع.",
  "payment.upload.title": "إيصال الدفع",
  "payment.upload.button": "رفع صورة الإيصال",
  "payment.upload.replace": "استبدال الصورة",
  "payment.upload.remove": "حذف الصورة",
  "payment.upload.hint": "الأنواع المقبولة: JPG, PNG. الحد الأقصى 5 ميجا.",
  "payment.upload.tooLarge": "حجم الملف كبير جداً (الحد الأقصى 5 ميجا).",
  "payment.upload.invalidType": "الرجاء اختيار صورة صالحة.",
  "payment.reference.label": "رقم العملية",
  "payment.reference.placeholder": "مثال: 1234567890",
  "payment.reference.required": "الرجاء إدخال رقم العملية.",
  "payment.receipt.required": "الرجاء رفع صورة الإيصال.",
  "payment.confirm": "تأكيد الدفع",
  "payment.confirming": "جارٍ الإرسال…",
  "payment.status.pending.title": "قيد المراجعة",
  "payment.status.pending.body": "تم استلام طلب الدفع. سيتم مراجعته خلال وقت قصير.",
  "payment.status.pending.locked": "لا يمكنك بدء المحادثة قبل اعتماد الدفع.",
  "payment.status.approved.title": "تم اعتماد الدفع",
  "payment.status.approved.body": "شكرًا لك، يمكنك الآن بدء المحادثة مع الطبيب.",
  "payment.status.approved.cta": "ابدأ محادثة الاستشارة",
  "payment.status.rejected.title": "تم رفض الدفع",
  "payment.status.rejected.body": "لم يتم قبول إيصال الدفع. الرجاء المحاولة مرة أخرى.",
  "payment.status.rejected.reason": "سبب الرفض",
  "payment.status.rejected.retry": "رفع إيصال جديد",
  "payment.error.generic": "تعذّر إرسال الدفع، حاول مرة أخرى.",
  "payment.consult.awaiting": "بانتظار اعتماد الدفع لبدء المحادثة.",
  "payment.consult.viewStatus": "عرض حالة الدفع",
};

const en: Dict = {
  "brand.name": "MediConnect",
  "brand.tagline": "Smart healthcare",
  "nav.features": "Features",
  "nav.about": "About",
  "nav.howItWorks": "How it works",
  "nav.startConsultation": "Start Consultation",
  "nav.history": "History",
  "nav.dashboard": "Doctor Dashboard",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.language": "العربية",

  "home.title": "MediConnect — AI-powered medical assessment before you meet the doctor",
  "home.metaDesc":
    "Chat with our AI medical assistant, get a clinical case summary, then connect with the right specialist for your case.",
  "home.badge": "AI-first medical platform",
  "home.heroTitle1": "Smart medical assessment",
  "home.heroTitle2": "before you meet the doctor.",
  "home.heroSubtitle":
    "Describe your symptoms to our AI assistant, get a professional clinical summary, and we'll match you with the right specialist.",
  "home.ctaPrimary": "Start Consultation",
  "home.ctaSecondary": "How it works",
  "home.stat.accuracy": "Recommendation accuracy",
  "home.stat.wait": "Avg wait time",
  "home.stat.access": "Specialist access",
  "home.stat.wait.value": "<5 min",
  "home.stat.access.value": "24/7",

  "features.kicker": "How it works",
  "features.title": "A calmer, more accurate medical experience.",
  "features.s1.title": "Chat with our AI",
  "features.s1.desc": "Answer simple questions. Our AI organizes every clinical detail.",
  "features.s2.title": "Get a medical summary",
  "features.s2.desc": "Structured report with symptoms, duration, severity, and clinical notes.",
  "features.s3.title": "Specialty recommendation",
  "features.s3.desc": "We suggest the right specialty and three certified specialists to follow up.",

  "about.kicker": "About",
  "about.title": "Precision medicine, simplified.",
  "about.desc":
    "MediConnect blends AI efficiency with human warmth. Intake is automated; care stays human.",
  "about.b1": "24/7 access to board-certified experts",
  "about.b2": "Secure, privacy-compliant messaging",
  "about.b3": "Structured case files delivered in seconds",
  "about.imageAlt": "A calm modern doctor's office with natural light",

  "footer.title": "Ready for a better experience?",
  "footer.subtitle": "Start your consultation now — no waiting room, no paperwork.",
  "footer.cta": "Start Your Consultation",
  "footer.copyright": "© 2026 MediConnect Healthcare",

  "start.title": "How would you like to continue?",
  "start.subtitle": "Choose your role to get started.",
  "start.patient": "Continue as Patient",
  "start.patientDesc": "Start an AI medical assessment and connect with a specialist.",
  "start.doctor": "Continue as Doctor",
  "start.doctorDesc": "Receive cases with AI-generated medical summaries and chat with patients.",

  "auth.signInTitle": "Sign in",
  "auth.signUpTitle": "Create your account",
  "auth.signInAsPatient": "Patient sign in",
  "auth.signInAsDoctor": "Doctor sign in",
  "auth.signUpAsPatient": "New patient account",
  "auth.signUpAsDoctor": "New doctor account",
  "auth.fullName": "Full name",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.phone": "Phone (optional)",
  "auth.specialty": "Specialty",
  "auth.specialty.placeholder": "e.g., Internal Medicine",
  "auth.bio": "Professional bio",
  "auth.fee": "Consultation fee",
  "auth.submit": "Continue",
  "auth.submitting": "Working…",
  "auth.haveAccount": "Already have an account?",
  "auth.noAccount": "Don't have an account?",
  "auth.switchSignIn": "Sign in",
  "auth.switchSignUp": "Create account",
  "auth.google": "Continue with Google",
  "auth.continueAs": "You're continuing as",
  "auth.changeRole": "Change role",
  "auth.role.patient": "Patient",
  "auth.role.doctor": "Doctor",
  "auth.errorGeneric": "Something went wrong. Try again.",
  "auth.errorRateLimit": "Too many attempts. Please wait {seconds}s and try again.",
  "auth.errorInvalidCredentials": "Incorrect email or password.",
  "auth.errorEmailNotConfirmed": "Your email isn't confirmed yet. Check your inbox.",
  "auth.errorUserExists": "An account with this email already exists. Sign in instead.",
  "auth.errorWeakPassword": "Password is too weak. Use at least 6 characters.",
  "auth.checkEmailTitle": "Check your email",
  "auth.checkEmailBody": "We sent a confirmation link to {email}. Click it to activate your account, then sign in.",
  "auth.backToSignIn": "Back to sign in",
  "auth.cooldown": "Retry in {seconds}s",

  "intake.metaTitle": "AI Assessment — MediConnect",
  "intake.kicker": "Smart Intake",
  "intake.title": "Tell us what you're feeling",
  "intake.subtitle": "Our AI organizes the details so your doctor can focus on you.",
  "intake.assistant": "AI Medical Assistant",
  "intake.active": "Active",
  "intake.reply": "reply",
  "intake.replies": "replies",
  "intake.you": "YOU",
  "intake.placeholder": "Type your response…",
  "intake.send": "Send",
  "intake.disclaimer":
    "MediConnect never provides diagnoses. For emergencies, call your local services.",
  "intake.finish": "Finish & generate report",
  "intake.finishing": "Preparing report…",
  "intake.welcome":
    "Welcome to MediConnect. I'll ask a few questions to prepare your case. What is your main symptom, and when did it start?",
  "intake.progress": "Intake progress",
  "intake.errorGeneric": "Something went wrong.",
  "intake.errorFinish": "Failed to generate the report.",

  "review.metaTitle": "Medical Review — MediConnect",
  "review.kicker": "Medical Review",
  "review.title": "Your case summary",
  "review.subtitle": "Professional clinical summary based on your conversation.",
  "review.chiefComplaint": "Chief complaint",
  "review.symptoms": "Symptoms",
  "review.duration": "Duration",
  "review.severity": "Severity",
  "review.risk": "Risk level",
  "review.riskScore": "Risk score",
  "review.riskLevel.Low": "Low",
  "review.riskLevel.Medium": "Medium",
  "review.riskLevel.High": "High",
  "review.riskLevel.Critical": "Critical",
  "review.notes": "Clinical notes",
  "review.aiSummary": "AI summary",
  "review.specialtyTitle": "Recommended specialty",
  "review.primarySpecialty": "Primary specialty",
  "review.secondarySpecialty": "Secondary specialty",
  "review.alternativeSpecialty": "Alternative specialty",
  "review.reasoning": "Why we recommend this",
  "review.continue": "See recommended doctors",
  "review.regenerate": "Re-analyze",
  "review.notReported": "Not reported",
  "review.loading": "Loading report…",
  "review.notFound": "Report not found.",
  "emergency.kicker": "Emergency alert",
  "emergency.title": "Your symptoms may be an emergency",
  "emergency.subtitle":
    "Based on your conversation, your symptoms suggest a possible medical emergency that needs urgent care.",
  "emergency.action":
    "Call emergency services (911 / 112) or go to the nearest emergency department right now. Do not wait for an in-app doctor consultation.",
  "emergency.reasonsTitle": "Red flags detected",
  "emergency.callButton": "Call emergency services",
  "emergency.disclaimer":
    "This platform is not a substitute for emergency services. It cannot provide immediate care or intervention.",
  "emergency.ackLabel":
    "I have read this warning and understand I should seek immediate emergency care if my condition is worsening.",
  "emergency.continueAnyway": "Continue to medical report",

  "doctors.metaTitle": "Choose your doctor — MediConnect",
  "doctors.kicker": "Available doctors",
  "doctors.title": "Doctors recommended for your case",
  "doctors.subtitle": "Specialists matching the recommended specialty.",
  "doctors.fee": "Fee",
  "doctors.experience": "Experience",
  "doctors.years": "yrs",
  "doctors.book": "Book consultation",
  "doctors.available": "Available now",
  "doctors.busy": "Busy",
  "doctors.noResults": "No doctors available in this specialty right now.",
  "doctors.viewAll": "View all",
  "doctors.fallbackNotice": "No specialists available in the recommended specialties right now. Showing available doctors from related specialties.",
  "doctors.emergencyFallback": "This is an emergency case. If no emergency doctor responds within minutes, call emergency services immediately (911 / 997).",

  "consult.metaTitle": "Consultation — MediConnect",
  "consult.title": "Doctor consultation",
  "consult.with": "with",
  "consult.placeholder": "Type your message…",
  "consult.send": "Send",
  "consult.empty": "Start the conversation. Your doctor already sees your case summary.",
  "consult.viewReview": "View medical review",
  "consult.viewPrescription": "View prescription",
  "consult.completed": "Consultation completed",
  "consult.markCompleted": "End consultation",

  "rx.title": "Prescription",
  "rx.medications": "Medications",
  "rx.medication": "Medication",
  "rx.dosage": "Dosage",
  "rx.frequency": "Frequency",
  "rx.add": "Add medication",
  "rx.instructions": "Additional instructions",
  "rx.issue": "Issue prescription",
  "rx.issuedAt": "Issued at",
  "rx.none": "No prescription yet.",

  "history.metaTitle": "Consultation history",
  "history.title": "Your consultations",
  "history.subtitle": "All your past consultations in one place.",
  "history.empty": "No consultations yet.",
  "history.startNew": "Start a new consultation",
  "history.status.intake": "Intake",
  "history.status.review": "Report ready",
  "history.status.matching": "Choosing doctor",
  "history.status.active": "Active",
  "history.status.completed": "Completed",
  "history.openCase": "Open",

  "doctor.dashboard.title": "Doctor dashboard",
  "doctor.dashboard.subtitle": "Cases assigned to you with AI-generated reviews.",
  "doctor.cases.active": "Active cases",
  "doctor.cases.completed": "Completed cases",
  "doctor.cases.empty": "No cases right now.",
  "doctor.case.aiReview": "AI review",
  "doctor.case.chat": "Patient chat",
  "doctor.case.prescription": "Prescription",
  "doctor.case.complete": "Complete case",
  "doctor.case.completed": "Case completed",
};

const translations: Record<Locale, Dict> = { ar, en };

type I18nContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "mediconnect:locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "ar" || stored === "en") setLocaleState(stored);
    } catch {
      /* ignore */
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
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[locale];
    return {
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      toggle: () => setLocale(locale === "ar" ? "en" : "ar"),
      t: (key: string, vars?: Record<string, string | number>) => {
        const raw = dict[key] ?? translations.en[key] ?? key;
        if (!vars) return raw;
        return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
