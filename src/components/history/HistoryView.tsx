import React, { useState } from 'react'
import {
  RotateCcw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  Eye,
  FileText,
  Lock,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { SavedLink } from '@/types/link'

interface HistoryViewProps {
  links: SavedLink[]
  onTapLink: (link: SavedLink) => void
  onRestoreLink: (link: SavedLink) => void
  onDeleteLink: (linkId: string) => void
  onClearHistory: () => void
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  links,
  onTapLink,
  onRestoreLink,
  onDeleteLink,
  onClearHistory,
}) => {
  const { t, formatNumber, formatDateTime, formatTimeAgo } = useI18n()
  const [clearModalOpen, setClearModalOpen] = useState(false)

  const completedLinks = links
    .filter((l) => l.isDone)
    .sort((a, b) => (b.doneAt || b.createdAt) - (a.doneAt || a.createdAt))

  if (completedLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-24 text-center select-none space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-base-200 border border-base-300 text-base-content/40 shadow-xs">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-base-content">
            {t.history.empty}
          </p>
          <p className="text-xs text-[#8C8885] dark:text-[#9E9792] max-w-xs leading-relaxed">
            {t.history.emptyDesc}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ paddingBottom: 'max(6rem, calc(5rem + env(safe-area-inset-bottom, 0px)))' }}
    >
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-base-200 bg-base-200/30">
        <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-semibold">
          <span>{t.history.totalCompleted}:</span>
          <span className="text-primary font-bold">{formatNumber(completedLinks.length)}</span>
        </div>

        <button
          type="button"
          onClick={() => setClearModalOpen(true)}
          className="btn btn-ghost btn-xs text-[11px] text-error hover:bg-error/10 rounded-lg gap-1 font-semibold"
        >
          <Trash2 className="h-3 w-3" />
          <span>{t.history.clearAll}</span>
        </button>
      </div>

      <div className="divide-y divide-base-200">
        {completedLinks.map((link) => {
          const doneTimestamp = link.doneAt || link.createdAt
          return (
            <div
              key={link.id}
              className="flex items-start gap-3.5 px-4 py-3.5 select-none transition-colors active:bg-base-200/50 cursor-pointer"
              onClick={() => onTapLink(link)}
            >
              <div className="shrink-0 pt-0.5">
                <div className="flex h-7 w-7 items-center justify-center">
                  {link.faviconUrl ? (
                    <img
                      src={link.faviconUrl}
                      alt=""
                      className="h-6 w-6 object-contain rounded-md opacity-80"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs font-bold text-base-content/60">
                      {link.domain.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-medium text-base-content line-clamp-1 flex-1">
                    {link.title || link.url}
                  </h3>
                  {link.isSecret && (
                    <span className="flex items-center text-primary font-bold text-[10px] bg-primary/10 px-1 py-0.5 rounded gap-0.5 shrink-0">
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                {link.notes && (
                  <p className="text-xs text-base-content/70 mt-0.5 line-clamp-1 italic flex items-center gap-1">
                    <FileText className="h-3 w-3 text-primary/60 shrink-0 inline" />
                    <span>{link.notes}</span>
                  </p>
                )}

                <div className="flex items-center gap-2 text-[11px] text-base-content/50 mt-1 truncate">
                  <span className="font-medium">{link.domain}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-success font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{formatTimeAgo(doneTimestamp)}</span>
                  </span>
                  {typeof link.openCount === 'number' && link.openCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-base-content/60 font-semibold">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(link.openCount)}</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[10px] text-base-content/40 mt-0.5">
                  {formatDateTime(doneTimestamp)}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 -me-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onRestoreLink(link)}
                  className="btn btn-ghost btn-circle btn-xs h-8 w-8 text-primary hover:bg-primary/10"
                  aria-label={t.history.restore}
                  title={t.history.restore}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteLink(link.id)}
                  className="btn btn-ghost btn-circle btn-xs h-8 w-8 text-error/70 hover:text-error hover:bg-error/10"
                  aria-label={t.history.delete}
                  title={t.history.delete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {clearModalOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setClearModalOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-5 space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-error">
              {t.history.clearAllConfirmTitle}
            </h3>
            <p className="text-xs text-base-content/75">
              {t.history.clearAllConfirmDesc}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="btn btn-ghost flex-1 font-semibold"
              >
                {t.add.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory()
                  setClearModalOpen(false)
                }}
                className="btn btn-error flex-1 font-bold"
              >
                {t.history.clearAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
