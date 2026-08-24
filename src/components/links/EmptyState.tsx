import React from 'react'
import { Plus } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface EmptyStateProps {
  onAddClick: () => void
  isVault?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick, isVault }) => {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center select-none space-y-4">
      <div className="relative">
        <img
          src="/mascot.jpg"
          alt="Linkban Mascot"
          className="h-28 w-28 object-contain rounded-3xl shadow-sm"
        />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-base-content">
          {isVault ? t.secret.title : t.inbox.nothingWaiting}
        </p>
        <p className="text-xs text-[#8C8885] dark:text-[#9E9792] max-w-xs leading-relaxed">
          {isVault ? t.secret.emptySecret : t.inbox.emptyHint}
        </p>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="btn btn-primary btn-sm h-11 px-5 rounded-xl font-bold gap-2 text-white shadow-xs mt-2"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>{t.add.title}</span>
      </button>
    </div>
  )
}
