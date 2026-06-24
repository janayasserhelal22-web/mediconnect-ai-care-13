import { useI18n } from "@/lib/i18n";
import { AlertTriangle, Phone } from "lucide-react";
import { useState } from "react";

interface EmergencyAlertProps {
  reasons: string[];
  onAcknowledge: () => void;
}

export function EmergencyAlert({ reasons, onAcknowledge }: EmergencyAlertProps) {
  const { t } = useI18n();
  const [acked, setAcked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/60 px-4 py-8 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-labelledby="emergency-title"
        aria-describedby="emergency-desc"
        className="w-full max-w-xl overflow-hidden rounded-3xl border-2 border-rose-300 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 bg-rose-600 px-6 py-4 text-white">
          <AlertTriangle className="size-6 shrink-0" aria-hidden />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-rose-100">
              {t("emergency.kicker")}
            </div>
            <h2 id="emergency-title" className="text-lg font-bold sm:text-xl">
              {t("emergency.title")}
            </h2>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          <p id="emergency-desc" className="text-sm leading-relaxed text-slate-700 sm:text-base">
            {t("emergency.subtitle")}
          </p>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-800">
            {t("emergency.action")}
          </div>

          {reasons.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("emergency.reasonsTitle")}
              </div>
              <ul className="space-y-1.5">
                {reasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-800"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-500" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <a
            href="tel:911"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
          >
            <Phone className="size-4" aria-hidden />
            {t("emergency.callButton")}
          </a>

          <p className="text-xs leading-relaxed text-slate-500">
            {t("emergency.disclaimer")}
          </p>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={acked}
              onChange={(e) => setAcked(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-rose-600"
            />
            <span>{t("emergency.ackLabel")}</span>
          </label>

          <button
            type="button"
            disabled={!acked}
            onClick={onAcknowledge}
            className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("emergency.continueAnyway")}
          </button>
        </div>
      </div>
    </div>
  );
}
