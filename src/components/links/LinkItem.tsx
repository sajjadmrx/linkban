import React, { useState, useRef } from 'react'
import { MoreVertical, Pause, Clock, FileText } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { SavedLink } from '@/types/link'

interface LinkItemProps {
  link: SavedLink
  onTap: (link: SavedLink) => void
  onOpenActions: (link: SavedLink) => void
}

export const LinkItem: React.FC<LinkItemProps> = ({
  link,
  onTap,
  onOpenActions,
}) => {
  const { t, formatNextReminder } = useI18n()
  const [imgError, setImgError] = useState(false)
  const timerRef = useRef<number | null>(null)

  const isDue = !link.isPaused && !link.isDone && link.nextReminderAt <= Date.now()
  const initial = (link.domain.charAt(0) || 'L').toUpperCase()

  const handleTouchStart = () => {
    timerRef.current = window.setTimeout(() => {
      onOpenActions(link)
    }, 450)
  }

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <div
      className={`relative flex items-start gap-3.5 px-4 py-3.5 border-b border-base-200 select-none transition-colors active:bg-base-200/50 cursor-pointer ${
        isDue ? 'bg-primary/5' : ''
      }`}
      onClick={() => onTap(link)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault()
        onOpenActions(link)
      }}
    >
      <div className="shrink-0 pt-0.5">
        <div className="flex h-7 w-7 items-center justify-center">
          {!imgError && link.faviconUrl ? (
            <img
              src={link.faviconUrl}
              alt=""
              className="h-6 w-6 object-contain rounded-md"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-bold text-base-content/60">{initial}</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={`text-[15px] line-clamp-2 leading-tight tracking-tight ${
            isDue ? 'font-bold text-base-content' : 'font-medium text-base-content'
          }`}
        >
          {link.title || link.url}
        </h3>

        {link.notes && (
          <p className="text-xs text-base-content/75 mt-1 line-clamp-1 italic flex items-center gap-1">
            <FileText className="h-3 w-3 text-primary/70 shrink-0 inline" />
            <span>{link.notes}</span>
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs mt-1 truncate">
          <span className="font-medium text-[#8C8885] dark:text-[#9E9792] truncate max-w-[140px]">
            {link.domain}
          </span>
          <span className="text-base-content/20">•</span>
          {link.isPaused ? (
            <span className="flex items-center text-warning font-medium">
              <Pause className="h-3 w-3 me-1" />
              {t.inbox.pausedSection}
            </span>
          ) : (
            <span
              className={`flex items-center font-medium ${
                isDue ? 'text-primary font-bold' : 'text-[#8C8885] dark:text-[#9E9792]'
              }`}
            >
              <Clock className="h-3 w-3 me-1" />
              {formatNextReminder(link.nextReminderAt)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenActions(link)
        }}
        className="flex h-10 w-10 items-center justify-center -me-2 -mt-1 rounded-full text-base-content/40 active:text-base-content active:bg-base-200 shrink-0"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  )
}
