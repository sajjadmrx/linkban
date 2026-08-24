import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { CustomReminderSheet } from './CustomReminderSheet'
import { useI18n } from '@/lib/i18n'

interface ReminderPickerProps {
  value: number
  onChange: (minutes: number) => void
}

const PRESETS = [
  { minutes: 0, labelKey: 'none' as const },
  { minutes: 30, labelKey: 'm30' as const },
  { minutes: 60, labelKey: 'h1' as const },
  { minutes: 120, labelKey: 'h2' as const },
  { minutes: 180, labelKey: 'h3' as const },
  { minutes: 360, labelKey: 'h6' as const },
  { minutes: 1440, labelKey: 'd1' as const },
]

export const ReminderPicker: React.FC<ReminderPickerProps> = ({
  value,
  onChange,
}) => {
  const { t, formatNumber } = useI18n()
  const [customOpen, setCustomOpen] = useState(false)

  const isPreset = PRESETS.some((p) => p.minutes === value)

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/70">
        <Clock className="h-3.5 w-3.5" />
        <span>{t.add.remindMe}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {PRESETS.map((p) => {
          const isSelected = value === p.minutes
          return (
            <button
              key={p.minutes}
              type="button"
              onClick={() => onChange(p.minutes)}
              className={`btn btn-sm h-10 text-xs font-semibold rounded-xl transition-all ${
                isSelected
                  ? 'btn-primary shadow-xs font-bold'
                  : 'btn-outline border-base-300 bg-base-100 text-base-content hover:bg-base-200'
              }`}
            >
              {t.intervals[p.labelKey]}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className={`btn btn-sm h-10 text-xs font-semibold rounded-xl transition-all ${
            !isPreset
              ? 'btn-primary shadow-xs font-bold'
              : 'btn-outline border-base-300 bg-base-100 text-base-content hover:bg-base-200'
          }`}
        >
          {!isPreset
            ? value >= 1440
              ? `${formatNumber(Math.round(value / 1440))}d`
              : value >= 60
              ? `${formatNumber(Math.round(value / 60))}h`
              : `${formatNumber(value)}m`
            : t.intervals.custom}
        </button>
      </div>

      <CustomReminderSheet
        open={customOpen}
        currentMinutes={value}
        onClose={() => setCustomOpen(false)}
        onApply={(minutes) => onChange(minutes)}
      />
    </div>
  )
}
