import React, { useState, useEffect, useRef } from 'react'
import { Plus, Clipboard, AlertCircle, Sparkles, ExternalLink, FileText, X } from 'lucide-react'
import { ReminderPicker } from './ReminderPicker'
import { useI18n } from '@/lib/i18n'
import { isValidUrl, extractMetadata, normalizeUrl, extractDomain } from '@/lib/metadata'
import type { SavedLink, AppSettings } from '@/types/link'

interface AddLinkSheetProps {
  open: boolean
  initialUrl?: string
  onClose: () => void
  onSave: (linkData: {
    url: string
    title: string
    domain: string
    faviconUrl: string
    reminderInterval: number
    notes?: string
  }) => Promise<void>
  existingLinks: SavedLink[]
  defaultInterval: number
  settings: AppSettings
  onOpenExisting: (link: SavedLink) => void
}

export const AddLinkSheet: React.FC<AddLinkSheetProps> = ({
  open,
  initialUrl,
  onClose,
  onSave,
  existingLinks,
  defaultInterval,
  onOpenExisting,
}) => {
  const { t } = useI18n()
  const [urlInput, setUrlInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [interval, setInterval] = useState(defaultInterval)
  const [detectedTitle, setDetectedTitle] = useState('')
  const [detectedDomain, setDetectedDomain] = useState('')
  const [detectedFavicon, setDetectedFavicon] = useState('')
  const [fallbackInitial, setFallbackInitial] = useState('')
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState<SavedLink | null>(null)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setInterval(defaultInterval)
      setIsDuplicate(null)
      setErrorMessage('')
      setNotesInput('')
      setShowNotes(false)
      const startUrl = initialUrl || ''
      setUrlInput(startUrl)

      if (startUrl) {
        processUrl(startUrl)
      } else {
        setDetectedTitle('')
        setDetectedDomain('')
        setDetectedFavicon('')
        setTimeout(() => {
          inputRef.current?.focus()
        }, 150)
      }
    }
  }, [open, defaultInterval, initialUrl])

  const processUrl = async (value: string) => {
    if (!value.trim()) {
      setDetectedDomain('')
      setDetectedTitle('')
      setIsDuplicate(null)
      return
    }

    if (isValidUrl(value)) {
      const normalized = normalizeUrl(value)
      const domain = extractDomain(normalized)
      setDetectedDomain(domain)
      setFallbackInitial((domain.charAt(0) || 'L').toUpperCase())

      const duplicate = existingLinks.find(
        (item) => !item.isDone && normalizeUrl(item.url) === normalized
      )
      setIsDuplicate(duplicate || null)

      setLoadingMetadata(true)
      try {
        const meta = await extractMetadata(value)
        setDetectedTitle(meta.title)
        setDetectedFavicon(meta.faviconUrl)
        setDetectedDomain(meta.domain)
      } catch {
        setDetectedTitle(domain)
      } finally {
        setLoadingMetadata(false)
      }
    } else {
      setIsDuplicate(null)
    }
  }

  const handleUrlChange = (value: string) => {
    setUrlInput(value)
    setErrorMessage('')
    processUrl(value)
  }

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        handleUrlChange(text)
      }
    } catch {}
  }

  const handleSave = async (forceAnyway = false) => {
    if (!isValidUrl(urlInput)) {
      setErrorMessage(t.add.invalidUrl)
      return
    }

    if (isDuplicate && !forceAnyway) {
      return
    }

    setSaving(true)
    try {
      const normalized = normalizeUrl(urlInput)
      const domain = detectedDomain || extractDomain(normalized)
      const title = detectedTitle || domain
      const favicon = detectedFavicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

      await onSave({
        url: normalized,
        title,
        domain,
        faviconUrl: favicon,
        reminderInterval: interval,
        notes: notesInput.trim() || undefined,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet-content p-5 space-y-3.5 max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto -mt-2 h-1 w-10 rounded-full bg-base-300" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="url"
              placeholder={t.add.pastePlaceholder}
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="input input-bordered flex-1 h-12 text-sm rounded-xl bg-base-200 border-base-300/80 px-3.5"
              autoCapitalize="none"
              autoCorrect="off"
            />
            {!urlInput ? (
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="btn btn-outline border-base-300 bg-base-100 btn-sm h-12 px-3.5 rounded-xl font-bold gap-1.5 shrink-0 text-primary"
              >
                <Clipboard className="h-4 w-4" />
                <span>{t.add.pasteClipboard}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUrlChange('')}
                className="btn btn-ghost btn-circle btn-sm h-12 w-12 shrink-0 text-base-content/50"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {errorMessage && (
            <p className="text-xs text-error flex items-center gap-1 font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          {detectedDomain && (
            <div className="rounded-xl bg-base-200/60 p-2.5 space-y-1 text-start border border-base-300/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center shrink-0">
                  {detectedFavicon ? (
                    <img
                      src={detectedFavicon}
                      alt=""
                      className="h-5 w-5 object-contain rounded-md"
                      onError={() => setDetectedFavicon('')}
                    />
                  ) : (
                    <span className="text-xs font-bold text-base-content/60">{fallbackInitial}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-base-content truncate">
                    {detectedTitle || detectedDomain}
                  </p>
                  <p className="text-[11px] text-base-content/50 truncate">
                    {detectedDomain}
                  </p>
                </div>
                {loadingMetadata && (
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                )}
              </div>
            </div>
          )}

          {isDuplicate && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-start space-y-2">
              <div className="flex items-center gap-1.5 text-warning font-bold text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{t.add.duplicateTitle}</span>
              </div>
              <p className="text-xs text-base-content/75">
                {t.add.duplicateDesc}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenExisting(isDuplicate)
                  }}
                  className="btn btn-xs btn-outline bg-base-100 rounded-lg font-semibold gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t.add.openExisting}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="btn btn-xs btn-neutral rounded-lg font-semibold"
                >
                  {t.add.saveAnyway}
                </button>
              </div>
            </div>
          )}

          {showNotes ? (
            <div className="space-y-1 text-start">
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder={t.add.notePlaceholder}
                className="input input-bordered input-sm w-full h-10 text-xs rounded-xl bg-base-200 border-base-300/80"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="btn btn-ghost btn-xs text-xs text-base-content/60 font-semibold gap-1 px-1 h-7"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>+ {t.add.note}</span>
              </button>
            </div>
          )}

          <ReminderPicker value={interval} onChange={setInterval} />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || !urlInput.trim()}
            className="btn btn-primary w-full h-12 rounded-xl text-base font-bold shadow-md cursor-pointer gap-1.5 text-white"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
            {saving ? t.add.saving : t.add.save}
          </button>
        </div>
      </div>
    </div>
  )
}
