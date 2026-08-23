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
  onSnooze: (link: SavedLink, minutes: number) => void
  onShare: (link: SavedLink) => void
  onDelete: (linkId: string) => void
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
  onSnooze,
  onShare,
  onDelete,
}) => {
  const { t, formatInterval, formatNextReminder } = useI18n()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [snoozePickerOpen, setSnoozePickerOpen] = useState(false)
  const [changeReminderOpen, setChangeReminderOpen] = useState(false)
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (link) {
      setNoteText(link.notes || '')
    }
  }, [link])

  if (!open || !link) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url)
      toast.success(t.actions.copied)
      onClose()
    } catch {}
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
          className="bottom-sheet-content max-w-md mx-auto p-0 pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-base-300" />

          <div className="px-5 pt-3 pb-3 border-b border-base-200 text-start space-y-1">
            <p className="text-xs font-bold text-[#8C8885] dark:text-[#9E9792] truncate">
              {link.domain} • {formatInterval(link.reminderInterval)}
            </p>
            <h3 className="text-base font-bold text-base-content line-clamp-2 mt-0.5">
              {link.title || link.url}
            </h3>

            {link.notes && (
              <div className="p-2.5 rounded-xl bg-base-200/50 border border-base-300/40 text-xs text-base-content font-medium flex items-start gap-1.5 mt-1">
                <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="break-words">{link.notes}</span>
              </div>
            )}

            <p className="text-xs text-primary font-bold pt-0.5">
              {link.isPaused ? t.inbox.pausedSection : formatNextReminder(link.nextReminderAt)}
            </p>
          </div>

          <div className="px-2 pt-2 space-y-0.5 select-none">
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

            <button
              type="button"
              onClick={() => setSnoozePickerOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl text-start text-sm font-semibold text-base-content active:bg-base-200/60 transition-colors"
            >
              <Clock className="h-5 w-5 text-base-content/70 shrink-0" />
              <span className="flex-1">{t.actions.snooze}</span>
            </button>

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
              className="textarea textarea-bordered w-full rounded-xl bg-base-200 text-sm font-medium border-base-300/80 resize-none"
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
                {t.add.apply}
              </button>
            </div>
          </div>
        </div>
      )}

      {snoozePickerOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setSnoozePickerOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-base-content pb-1 text-start">
              {t.actions.snooze}
            </h3>
            <div className="space-y-1">
              {[
                { label: t.actions.snooze1h, minutes: 60 },
                { label: t.actions.snooze3h, minutes: 180 },
                { label: t.actions.snoozeTomorrow, minutes: 1440 },
              ].map((option) => (
                <button
                  key={option.minutes}
                  type="button"
                  onClick={() => {
                    setSnoozePickerOpen(false)
                    onClose()
                    onSnooze(link, option.minutes)
                  }}
                  className="w-full flex items-center h-12 px-4 rounded-xl text-sm font-semibold text-base-content active:bg-base-200"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {changeReminderOpen && (
        <CustomReminderSheet
          open={changeReminderOpen}
          currentMinutes={link.reminderInterval}
          onClose={() => setChangeReminderOpen(false)}
          onApply={(newMinutes) => {
            setChangeReminderOpen(false)
            onClose()
            onChangeReminder(link, newMinutes)
          }}
        />
      )}

      {confirmDeleteOpen && (
        <div className="bottom-sheet-backdrop z-60" onClick={() => setConfirmDeleteOpen(false)}>
          <div
            className="bottom-sheet-content max-w-sm mx-auto p-5 space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-error">
              {t.settings.clearDataConfirmTitle}
            </h3>
            <p className="text-xs text-base-content/75">
              {t.settings.clearDataConfirmDesc}
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
                  setConfirmDeleteOpen(false)
                  onClose()
                  onDelete(link.id)
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
