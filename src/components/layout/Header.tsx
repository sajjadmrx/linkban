import React from 'react'
import { Settings2, Lock, Unlock, ArrowLeft, Inbox, History, BarChart2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { AppTab } from '@/types/link'

interface HeaderProps {
  activeCount: number
  currentTab: AppTab
  onSelectTab: (tab: AppTab) => void
  isVaultUnlocked: boolean
  isVaultViewActive: boolean
  onToggleVault: () => void
  onBackFromVault?: () => void
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  currentTab,
  onSelectTab,
  isVaultUnlocked,
  isVaultViewActive,
  onToggleVault,
  onBackFromVault,
  onOpenSettings,
}) => {
  const { t, formatNumber } = useI18n()

  const countText = activeCount === 0
    ? t.inbox.nothingWaiting
    : activeCount === 1
    ? t.inbox.waitingSingle
    : t.inbox.waitingPlural.replace('{count}', formatNumber(activeCount))

  return (
    <header className="px-4 pt-[max(2.75rem,calc(2rem+env(safe-area-inset-top,0px)))] pb-2 select-none space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {isVaultViewActive ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackFromVault}
                className="btn btn-ghost btn-circle btn-xs h-9 w-9 text-base-content/70 active:bg-base-200"
                aria-label={t.app.back}
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180 text-base-content" />
              </button>
              <span className="text-sm font-bold text-primary truncate">
                {t.secret.title}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 truncate">
              {countText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleVault}
            className={`btn btn-ghost btn-circle btn-xs h-9 w-9 transition-colors ${
              isVaultViewActive
                ? 'bg-primary/15 text-primary'
                : isVaultUnlocked
                ? 'text-primary'
                : 'text-base-content/60'
            }`}
            aria-label={t.secret.title}
          >
            {isVaultUnlocked ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="btn btn-ghost btn-circle btn-xs h-9 w-9 text-base-content/60 active:text-base-content active:bg-base-200"
            aria-label={t.settings.title}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isVaultViewActive && (
        <div className="grid grid-cols-3 gap-1 bg-base-200/60 p-1 rounded-2xl border border-base-300/40">
          <button
            type="button"
            onClick={() => onSelectTab('queue')}
            className={`btn btn-xs h-8 text-xs font-bold rounded-xl gap-1.5 transition-all ${
              currentTab === 'queue'
                ? 'btn-primary text-white shadow-xs'
                : 'btn-ghost text-base-content/70 hover:bg-base-200'
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>{t.tabs.queue}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`btn btn-xs h-8 text-xs font-bold rounded-xl gap-1.5 transition-all ${
              currentTab === 'history'
                ? 'btn-primary text-white shadow-xs'
                : 'btn-ghost text-base-content/70 hover:bg-base-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>{t.tabs.history}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('stats')}
            className={`btn btn-xs h-8 text-xs font-bold rounded-xl gap-1.5 transition-all ${
              currentTab === 'stats'
                ? 'btn-primary text-white shadow-xs'
                : 'btn-ghost text-base-content/70 hover:bg-base-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>{t.tabs.stats}</span>
          </button>
        </div>
      )}
    </header>
  )
}
