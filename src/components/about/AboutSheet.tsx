import React from 'react'
import {
  Coffee,
  ShieldCheck,
  Zap,
  HardDrive,
  Heart,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { notificationService } from '@/lib/notifications'

interface AboutSheetProps {
  open: boolean
  onClose: () => void
}

export const AboutSheet: React.FC<AboutSheetProps> = ({ open, onClose }) => {
  const { t, formatNumber } = useI18n()

  if (!open) return null

  const handleOpenLink = (url: string) => {
    notificationService.openLinkInBrowser(url)
  }

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet-content max-w-md mx-auto p-5 space-y-5 text-start max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto -mt-2 h-1 w-10 rounded-full bg-base-300" />

        <div className="flex flex-col items-center text-center space-y-3 pt-1 select-none">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl overflow-hidden shadow-md border-2 border-base-300 bg-[#FFF7F2] p-0.5">
              <img
                src="/mascot.jpg"
                alt="Linkban Mascot"
                className="h-full w-full object-cover rounded-[22px]"
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-base-content">
              {t.app.name}
            </h2>
            <p className="text-xs font-semibold text-primary">
              {t.about.tagline}
            </p>
            <span className="inline-block mt-1 text-[11px] font-bold text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
              {t.about.version.replace('{version}', formatNumber('1.0.0'))}
            </span>
          </div>

          <p className="text-xs text-base-content/75 leading-relaxed max-w-xs">
            {t.about.description}
          </p>
        </div>

        <div className="space-y-2 select-none">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-base-200/60 border border-base-300/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <HardDrive className="h-4 w-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-base-content">{t.about.offlineFeature}</p>
              <p className="text-base-content/60 text-[11px]">{t.about.offlineFeatureDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-base-200/60 border border-base-300/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-base-content">{t.about.noAccountFeature}</p>
              <p className="text-base-content/60 text-[11px]">{t.about.noAccountFeatureDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-base-200/60 border border-base-300/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning/10 text-warning shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-base-content">{t.about.batteryFeature}</p>
              <p className="text-base-content/60 text-[11px]">{t.about.batteryFeatureDesc}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/50 px-1">
            {t.about.supportDeveloper}
          </div>

          <button
            type="button"
            onClick={() => handleOpenLink('https://coffeete.ir/sajjadmrx')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#FFEDD5] dark:bg-[#7C2D12]/30 text-[#C2410C] dark:text-[#FDBA74] border border-[#FDBA74]/50 active:scale-[0.98] transition-transform cursor-pointer font-bold text-xs shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Coffee className="h-5 w-5 shrink-0" />
              <span>{t.about.buyCoffee}</span>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenLink('https://x.com/sajjadmrx')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-base-200 hover:bg-base-300/70 border border-base-300 text-base-content active:scale-[0.98] transition-transform cursor-pointer font-bold text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center text-sm font-black">𝕏</span>
              <span>{t.about.developerTwitter}</span>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost w-full font-bold text-xs h-11 rounded-2xl"
          >
            {t.app.back}
          </button>
        </div>
      </div>
    </div>
  )
}
