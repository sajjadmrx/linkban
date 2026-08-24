import React, { useState, useEffect } from 'react'
import {
  Check,
  Zap,
  Bookmark,
  Lock,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { notificationService } from '@/lib/notifications'
import { en } from '@/locales/en'
import { fa } from '@/locales/fa'
import type { Language } from '@/types/link'

interface OnboardingWizardProps {
  open: boolean
  onComplete: (lang: Language) => void
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  onComplete,
}) => {
  const { language, setLanguage } = useI18n()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'fa')

  useEffect(() => {
    if (open) {
      setSelectedLang(language || 'fa')
      setStep(1)
    }
  }, [open])

  if (!open) return null

  const t = selectedLang === 'fa' ? fa : en
  const isRtl = selectedLang === 'fa'

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLang(lang)
    setLanguage(lang)
  }

  const handleFinish = async () => {
    try {
      await notificationService.requestPermissions()
    } catch {}
    onComplete(selectedLang)
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex flex-col bg-base-100 text-base-content antialiased select-none overflow-y-auto"
    >
      <div className="flex items-center justify-between px-5 pt-[max(2.5rem,calc(1.5rem+env(safe-area-inset-top,0px)))] pb-2 min-h-[4rem]">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 bg-primary'
                  : s < step
                  ? 'w-2 bg-primary/40'
                  : 'w-2 bg-base-300'
              }`}
            />
          ))}
        </div>

        {step > 1 && (
          <button
            type="button"
            onClick={handleFinish}
            className="btn btn-ghost btn-sm text-xs font-bold text-base-content/60 hover:text-base-content"
          >
            {t.onboarding.skip}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-6 py-4 max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 w-full my-auto">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl overflow-hidden shadow-md border-2 border-base-300 bg-[#FFF7F2] p-1">
                <img
                  src="/mascot_waving.jpg"
                  alt="Linkban Mascot"
                  className="h-full w-full object-cover rounded-[20px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-base-content">
                {t.onboarding.selectLanguage}
              </h2>
              <p className="text-xs text-base-content/60 max-w-xs">
                {t.onboarding.selectLanguageSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 w-full pt-2">
              <button
                type="button"
                onClick={() => handleSelectLanguage('fa')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedLang === 'fa'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-base-300 bg-base-200/60 text-base-content hover:bg-base-200'
                }`}
              >
                <div className="flex items-center gap-3 text-start">
                  <span className="text-2xl">🇮🇷</span>
                  <div>
                    <p className="font-bold text-base text-base-content">فارسی</p>
                    <p className="text-xs text-base-content/50">Persian</p>
                  </div>
                </div>
                {selectedLang === 'fa' && <Check className="h-5 w-5 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedLang === 'en'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-base-300 bg-base-200/60 text-base-content hover:bg-base-200'
                }`}
              >
                <div className="flex items-center gap-3 text-start">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <p className="font-bold text-base text-base-content">English</p>
                    <p className="text-xs text-base-content/50">انگلیسی</p>
                  </div>
                </div>
                {selectedLang === 'en' && <Check className="h-5 w-5 text-primary" />}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 w-full my-auto">
            <div className="relative">
              <div className="h-36 w-36 rounded-3xl overflow-hidden shadow-lg border-2 border-base-300 bg-[#FFF7F2] p-1">
                <img
                  src="/mascot_waving.jpg"
                  alt="Linkban Mascot Waving"
                  className="h-full w-full object-cover rounded-[22px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-base-content">
                {t.onboarding.welcomeTitle}
              </h2>
              <p className="text-sm font-bold text-primary">
                {t.onboarding.welcomeSubtitle}
              </p>
              <p className="text-xs text-base-content/70 max-w-xs leading-relaxed pt-1">
                {t.onboarding.welcomeDesc}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 w-full my-auto">
            <div className="relative">
              <div className="h-28 w-28 rounded-3xl overflow-hidden shadow-md border-2 border-base-300 bg-[#FFF7F2] p-1">
                <img
                  src="/mascot_explore.jpg"
                  alt="Linkban Mascot Explore"
                  className="h-full w-full object-cover rounded-[20px]"
                />
              </div>
            </div>

            <h3 className="text-lg font-black text-base-content">
              {t.onboarding.featuresTitle}
            </h3>

            <div className="space-y-2.5 w-full text-start">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-base-200/70 border border-base-300/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5 min-w-0 flex-1">
                  <p className="font-bold text-base-content">{t.onboarding.feature1Title}</p>
                  <p className="text-base-content/60 text-[11px] leading-relaxed">{t.onboarding.feature1Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-base-200/70 border border-base-300/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-info/10 text-info shrink-0">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5 min-w-0 flex-1">
                  <p className="font-bold text-base-content">{t.onboarding.feature2Title}</p>
                  <p className="text-base-content/60 text-[11px] leading-relaxed">{t.onboarding.feature2Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-base-200/70 border border-base-300/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5 min-w-0 flex-1">
                  <p className="font-bold text-base-content">{t.onboarding.feature3Title}</p>
                  <p className="text-base-content/60 text-[11px] leading-relaxed">{t.onboarding.feature3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className="w-full pt-4 space-y-2 select-none"
          style={{ paddingBottom: 'max(1.5rem, calc(1rem + env(safe-area-inset-bottom, 0px)))' }}
        >
          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-primary w-full h-12 rounded-2xl font-bold text-white text-sm shadow-md gap-2"
            >
              <span>{t.onboarding.next}</span>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
          )}

          {step === 2 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-ghost h-12 px-4 rounded-2xl font-bold text-xs"
              >
                {t.onboarding.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn btn-primary flex-1 h-12 rounded-2xl font-bold text-white text-sm shadow-md gap-2"
              >
                <span>{t.onboarding.next}</span>
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-ghost h-12 px-4 rounded-2xl font-bold text-xs"
              >
                {t.onboarding.back}
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="btn btn-primary flex-1 h-12 rounded-2xl font-bold text-white text-sm shadow-md gap-2"
              >
                <Check className="h-4 w-4" />
                <span>{t.onboarding.getStarted}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
