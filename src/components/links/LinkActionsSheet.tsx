import React, { useState, useEffect } from 'react'
import {
  ExternalLink,
  Clock,
  Pause,
  Play,
  CheckCircle2,
  Trash2,
  Share2,
  Copy,
  FileText,
  Lock,
  RotateCcw,
  Eye,
  Bookmark,
  Calendar,
} from 'lucide-react'
import { CustomReminderSheet } from './CustomReminderSheet'
import { useI18n } from '@/lib/i18n'
import type { SavedLink } from '@/types/link'
import { toast } from 'sonner'

interface LinkActionsSheetProps {
  link: SavedLink | null
  open: boolean
  onClose: () => void
  onOpenInBrowser: (url: string) => void
  onChangeReminder: (link: SavedLink, newInterval: number) => void
  onUpdateNote: (link: SavedLink, note: string) => void
  onTogglePause: (link: SavedLink) => void
  onMarkDone: (link: SavedLink) => void
  onRestore?: (link: SavedLink) => void
  onSnooze: (link: SavedLink, minutes: number) => void
  onShare: (link: SavedLink) => void
  onDelete: (linkId: string) => void
  onToggleSecret?: (link: SavedLink) => void
}

export const LinkActionsSheet: React.FC<LinkActionsSheetProps> = ({
  link,
  open,
  onClose,
  onOpenInBrowser,
  onChangeReminder,
  onUpdateNote,
  onTogglePause,
  onMarkDone,
  onRestore,
  onSnooze,
  onShare,
  onDelete,
  onToggleSecret,
}) => {
  const { t, formatNumber, formatInterval, formatNextReminder, formatDateTime } = useI18n()
  const [changeReminderOpen, setChangeReminderOpen] = useState(false)
  const [snoozePickerOpen, setSnoozePickerOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (link) {
      setNoteText(link.notes || '')
    }
  }, [link])

  if (!open || !link) return null

  const hasReminder = link.reminderInterval > 0 && link.nextReminderAt > 0

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.url)
    toast.success(t.actions.copied)
    onClose()
  }

  const handleSaveNote = () => {
    onUpdateNote(link, noteText.trim())
    setNoteEditorOpen(false)
    toast.success(t.toasts.noteSaved)
  }

  return (
    <>
      <div className="bottom-sheet-backdrop" onClick={onClose}>
        <div
          className="bottom-sheet-content max-w-md mx-auto p-4 space-y-3 text-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto -mt-1 h-1 w-10 rounded-full bg-base-300" />

          <div className="flex items-center gap-3 px-2 pt-1 pb-2 border-b border-base-200">
            <div className="flex h-7 w-7 items-center justify-center shrink-0">
              {link.faviconUrl ? (
                <img
                  src={link.faviconUrl}
                  alt=""
                  className="h-5 w-5 object-contain rounded-md"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-base-content/60">
                  {link.domain.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-base-content truncate">
                {link.title || link.domain}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-base-content/50">
                <span>{link.domain}</span>
                <span>•</span>
                <span>{formatInterval(link.reminderInterval)}</span>
                {hasReminder && !link.isPaused && !link.isDone && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">
                      {formatNextReminder(link.nextReminderAt)}
                    </span>
                  </>
                )}
                {typeof link.openCount === 'number' && link.openCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-base-content/70 font-semibold">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(link.openCount)}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {link.createdAt > 0 && (
            <div className="mx-2 px-3 py-2 rounded-xl bg-base-200/50 border border-base-300/40 flex items-center justify-between text-xs text-base-content/70">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <Calendar className="h-3.5 w-3.5 text-primary/80" />
                <span>{t.actions.savedAt}:</span>
              </span>
              <span className="font-bold text-xs text-base-content">
                {formatDateTime(link.createdAt)}
              </span>
            </div>
          )}

          {link.notes && (
            <div className="mx-2 p-2.5 rounded-xl bg-base-200/50 border border-base-300/40 text-xs text-base-content/80">
              <p className="font-semibold text-[11px] text-base-content/50 mb-0.5">{t.actions.note}:</p>
              <p className="whitespace-pre-wrap">{link.notes}</p>
            </div>
          )}

          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenInBrowser(link.url)
              }}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-primary shrink-0" />
              <span className="flex-1">{t.actions.open}</span>
            </button>

            <button
              type="button"
              onClick={() => setNoteEditorOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <FileText className="h-5 w-5 text-base-content/70 shrink-0" />
              <span className="flex-1">
                {link.notes ? t.actions.editNote : t.actions.addNote}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setChangeReminderOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <Clock className="h-5 w-5 text-base-content/70 shrink-0" />
              <span className="flex-1">{t.actions.changeReminder}</span>
            </button>

            {hasReminder && (
              <button
                type="button"
                onClick={() => setSnoozePickerOpen(true)}
                className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
              >
                <Clock className="h-5 w-5 text-base-content/70 shrink-0" />
                <span className="flex-1">{t.actions.snooze}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onToggleSecret) onToggleSecret(link)
              }}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <Lock className="h-5 w-5 text-base-content/70 shrink-0" />
              <span className="flex-1">
                {link.isSecret ? t.actions.moveToQueue : t.actions.moveToSecret}
              </span>
            </button>

            {hasReminder && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onTogglePause(link)
                }}
                className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
              >
                {link.isPaused ? (
                  <Play className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <Pause className="h-5 w-5 text-warning shrink-0" />
                )}
                <span className="flex-1">
                  {link.isPaused ? t.actions.resume : t.actions.pause}
                </span>
              </button>
            )}

            {link.isDone ? (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  if (onRestore) onRestore(link)
                }}
                className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-primary active:bg-primary/10 transition-colors"
              >
                <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                <span className="flex-1 font-bold text-primary">
                  {t.actions.restore}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onMarkDone(link)
                }}
                className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="flex-1 font-bold text-success">
                  {t.actions.done}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose()
                onShare(link)
              }}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <Share2 className="h-5 w-5 text-base-content/70 shrink-0" />
              <span className="flex-1">{t.actions.share}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <Copy className="h-5 w-5 text-base-content/70 shrink-0" />
              <span className="flex-1">{t.actions.copy}</span>
            </button>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-error active:bg-error/10 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-error shrink-0" />
                <span className="flex-1">{t.actions.delete}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {noteEditorOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setNoteEditorOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-5 space-y-3.5 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto -mt-2 h-1 w-10 rounded-full bg-base-300" />
            <h3 className="text-base font-bold text-base-content">
              {link.notes ? t.actions.editNote : t.actions.addNote}
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t.add.notePlaceholder}
              rows={3}
              className="textarea textarea-bordered w-full rounded-xl bg-base-200 text-xs font-medium"
              autoFocus
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNoteEditorOpen(false)}
                className="btn btn-ghost flex-1 font-semibold"
              >
                {t.add.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="btn btn-primary flex-1 font-bold text-white"
              >
                {t.actions.saveNote}
              </button>
            </div>
          </div>
        </div>
      )}

      {changeReminderOpen && (
        <CustomReminderSheet
          open={changeReminderOpen}
          currentMinutes={link.reminderInterval}
          onClose={() => setChangeReminderOpen(false)}
          onApply={(minutes: number) => {
            onChangeReminder(link, minutes)
            setChangeReminderOpen(false)
            onClose()
          }}
        />
      )}

      {snoozePickerOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setSnoozePickerOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-5 space-y-3 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto -mt-2 h-1 w-10 rounded-full bg-base-300" />
            <h3 className="text-base font-bold text-base-content">
              {t.actions.snooze}
            </h3>
            <div className="space-y-1.5 pt-1">
              {[
                { minutes: 60, label: t.actions.snooze1h },
                { minutes: 180, label: t.actions.snooze3h },
                { minutes: 1440, label: t.actions.snoozeTomorrow },
              ].map((item) => (
                <button
                  key={item.minutes}
                  type="button"
                  onClick={() => {
                    onSnooze(link, item.minutes)
                    setSnoozePickerOpen(false)
                    onClose()
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-base-200/70 hover:bg-base-200 font-semibold text-xs text-base-content"
                >
                  <span>{item.label}</span>
                  <Clock className="h-4 w-4 text-base-content/50" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setConfirmDeleteOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-5 space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-error">
              {t.actions.delete}
            </h3>
            <p className="text-xs text-base-content/75 truncate">
              {link.title || link.url}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="btn btn-ghost flex-1 font-semibold"
              >
                {t.add.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(link.id)
                  setConfirmDeleteOpen(false)
                  onClose()
                }}
                className="btn btn-error flex-1 font-bold"
              >
                {t.actions.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
