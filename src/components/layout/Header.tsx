import React from 'react'
import { Settings2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface HeaderProps {
  activeCount: number
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  onOpenSettings,
}) => {
  const { t, formatNumber } = useI18n()

  const countText =
    activeCount === 0
      ? t.inbox.nothingWaiting
      : activeCount === 1
      ? t.inbox.waitingSingle
      : t.inbox.waitingPlural.replace('{count}', formatNumber(activeCount))

  return (
    <header className="flex items-center justify-between px-4 pt-[max(2.75rem,calc(2rem+env(safe-area-inset-top,0px)))] pb-2 select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
          {countText}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="btn btn-ghost btn-circle btn-xs h-9 w-9 text-base-content/60 active:text-base-content active:bg-base-200"
        aria-label={t.settings.title}
      >
        <Settings2 className="h-4 w-4" />
      </button>
    </header>
  )
}
