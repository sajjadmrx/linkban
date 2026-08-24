import React, { useState } from 'react'
import { useI18n } from '@/lib/i18n'

interface CustomReminderSheetProps {
  open: boolean
  currentMinutes: number
  onClose: () => void
  onApply: (minutes: number) => void
}

export const CustomReminderSheet: React.FC<CustomReminderSheetProps> = ({
  open,
  currentMinutes,
  onClose,
  onApply,
}) => {
  const { t } = useI18n()
  const [unit, setUnit] = useState<'minutes' | 'hours' | 'days'>(() => {
    if (currentMinutes % 1440 === 0) return 'days'
    if (currentMinutes % 60 === 0) return 'hours'
    return 'minutes'
  })
  const [amount, setAmount] = useState<string>(() => {
    if (currentMinutes % 1440 === 0) return String(currentMinutes / 1440)
    if (currentMinutes % 60 === 0) return String(currentMinutes / 60)
    return String(currentMinutes)
  })

  if (!open) return null

  const handleSave = () => {
    const parsed = parseInt(amount, 10)
    if (isNaN(parsed) || parsed <= 0) return

    let total = parsed
    if (unit === 'hours') total = parsed * 60
    if (unit === 'days') total = parsed * 1440

    onApply(total)
    onClose()
  }

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet-content p-5 space-y-4 max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto -mt-2 h-1 w-10 rounded-full bg-base-300" />

        <div className="space-y-1 text-start">
          <h3 className="text-base font-bold text-base-content">
            {t.add.customPickerTitle}
          </h3>
          <p className="text-xs text-base-content/65">
            {t.add.customInterval}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-base-content/70">
              {t.add.every}
            </span>
            <input
              type="number"
              min="1"
              max="365"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input input-bordered w-full text-center text-lg font-bold bg-base-200"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['minutes', 'hours', 'days'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`btn btn-sm h-10 ${
                  unit === u
                    ? 'btn-primary font-bold text-white shadow-xs'
                    : 'border border-base-300 bg-base-200/60 text-base-content hover:bg-base-200'
                }`}
              >
                {t.add[u]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost flex-1 font-semibold"
          >
            {t.add.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary flex-1 font-bold"
          >
            {t.add.apply}
          </button>
        </div>
      </div>
    </div>
  )
}
